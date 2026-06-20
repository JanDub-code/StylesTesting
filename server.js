const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");
const { AGE_RANGES, DESIGNS, validateSubmission, csvEscape } = require("./lib/survey");

const app = express();
const port = Number(process.env.PORT || 3000);
const listenHost = (process.env.HOST || "").trim();
const nodeEnv = (process.env.NODE_ENV || "").trim().toLowerCase();
const adminToken = (process.env.ADMIN_TOKEN || "").trim();
const surveyCookieSecret = (process.env.SURVEY_COOKIE_SECRET || "").trim() || adminToken || crypto.randomBytes(32).toString("hex");
const databaseUrl = process.env.DATABASE_URL || "";
const rootDir = __dirname;
const enforceHttpsEnabled = isEnabled(process.env.ENFORCE_HTTPS);
const allowedHosts = parseList(process.env.ALLOWED_HOSTS).map((allowedHost) => allowedHost.toLowerCase());
const adminSessionTtlSeconds = parsePositiveInteger(process.env.ADMIN_SESSION_TTL_SECONDS, 8 * 60 * 60);
const adminSessionCookieName = "styles_admin_session";
const surveyClientCookieName = "styles_survey_client";

configureTrustProxy(app, process.env.TRUST_PROXY);

let pool = null;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: buildPgSslConfig()
  });
}

const submissionRateLimit = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: parseNonNegativeInteger(process.env.SUBMISSION_RATE_LIMIT, 30),
  message: "Prilis mnoho odeslani z jedne IP adresy. Zkuste to prosim pozdeji."
});
const adminRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseNonNegativeInteger(process.env.ADMIN_RATE_LIMIT, 60),
  message: "Prilis mnoho admin pozadavku. Zkuste to prosim pozdeji."
});
const adminLoginRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: parseNonNegativeInteger(process.env.ADMIN_LOGIN_RATE_LIMIT, 10),
  message: "Prilis mnoho pokusu o prihlaseni. Zkuste to prosim pozdeji."
});

app.disable("x-powered-by");
app.use(validateHost);
app.use(enforceHttps);
app.use(securityHeaders);
app.use("/api/submissions", submissionRateLimit);
app.use("/api/admin/session", adminLoginRateLimit);
app.use(["/api/results", "/api/export.csv"], adminRateLimit);
app.use(express.json({ limit: "80kb", type: isJsonContentType }));
app.use(express.static(path.join(rootDir, "public"), {
  extensions: ["html"],
  dotfiles: "deny",
  index: "index.html"
}));

for (const design of DESIGNS) {
  app.use(`/designs/${design.folder}`, express.static(path.join(rootDir, design.folder), {
    extensions: ["html"],
    dotfiles: "deny",
    index: "index.html"
  }));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/designs", (_req, res) => {
  res.json({
    ageRanges: AGE_RANGES,
    designs: DESIGNS.map((design) => ({
      id: design.id,
      iteration: design.iteration,
      title: design.title,
      subtitle: design.subtitle,
      previewPath: design.previewPath,
      evaluationFocus: design.evaluationFocus
    }))
  });
});

app.post("/api/admin/session", requireJson, (req, res) => {
  res.setHeader("cache-control", "no-store");

  if (!adminToken) {
    res.status(503).json({ error: "Admin pristup neni nakonfigurovan." });
    return;
  }

  const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
  if (!safeTokenEquals(token, adminToken)) {
    res.status(401).json({ error: "Neplatne prihlasovaci udaje." });
    return;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + adminSessionTtlSeconds;
  const payload = `${expiresAt}.${crypto.randomBytes(18).toString("base64url")}`;
  const session = signCookiePayload(payload, adminToken);
  setCookie(res, adminSessionCookieName, session, {
    httpOnly: true,
    maxAge: adminSessionTtlSeconds,
    path: "/api",
    sameSite: "Strict",
    secure: shouldUseSecureCookies(req)
  });
  res.json({ ok: true, expiresAt: new Date(expiresAt * 1000).toISOString() });
});

app.delete("/api/admin/session", (req, res) => {
  res.setHeader("cache-control", "no-store");
  clearCookie(res, adminSessionCookieName, {
    path: "/api",
    sameSite: "Strict",
    secure: shouldUseSecureCookies(req)
  });
  res.status(204).end();
});

app.post("/api/submissions", requireJson, async (req, res, next) => {
  if (!pool) {
    res.status(503).json({
      error: "Hodnoceni se ted nepodarilo ulozit. Zkuste to prosim pozdeji."
    });
    return;
  }

  const clientId = getOrCreateSurveyClientId(req, res);
  const input = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const validation = validateSubmission({ ...input, clientId });
  if (!validation.valid) {
    res.status(400).json({
      error: "Hodnoceni neni kompletni. Zkontrolujte vekovou kategorii a skore u vsech navrhu."
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("begin");

    const submissionResult = await client.query(
      `insert into submissions (client_id, age_range, display_order)
       values ($1, $2, $3::jsonb)
       on conflict (client_id)
       do update set
         age_range = excluded.age_range,
         display_order = excluded.display_order,
         updated_at = now()
       returning id, created_at, updated_at`,
      [
        validation.value.clientId,
        validation.value.ageRange,
        JSON.stringify(validation.value.displayOrder)
      ]
    );

    const submission = submissionResult.rows[0];
    await client.query("delete from scores where submission_id = $1", [submission.id]);

    for (const score of validation.value.scores) {
      await client.query(
        `insert into scores (submission_id, design_id, score, note)
         values ($1, $2, $3, $4)`,
        [submission.id, score.designId, score.score, score.note]
      );
    }

    await client.query("commit");
    res.status(201).json({
      ok: true,
      submissionId: submission.id,
      updatedAt: submission.updated_at
    });
  } catch (error) {
    await client.query("rollback");
    next(error);
  } finally {
    client.release();
  }
});

app.get("/api/results", requireAdmin, async (_req, res, next) => {
  if (!pool) {
    res.status(503).json({ error: "DATABASE_URL neni nastaveno." });
    return;
  }

  try {
    const [summary, ageBreakdown, totals, feedback] = await Promise.all([
      pool.query(
        `select design_id, count(*)::int as vote_count, round(avg(score)::numeric, 2)::float as average_score,
                min(score)::int as min_score, max(score)::int as max_score
         from scores
         group by design_id
         order by average_score desc, vote_count desc, design_id asc`
      ),
      pool.query(
        `select s.design_id, sub.age_range, count(*)::int as vote_count,
                round(avg(s.score)::numeric, 2)::float as average_score
         from scores s
         join submissions sub on sub.id = s.submission_id
         group by s.design_id, sub.age_range
         order by s.design_id asc, sub.age_range asc`
      ),
      pool.query(
        `select
           (select count(*)::int from submissions) as submission_count,
           coalesce((
             select jsonb_object_agg(age_range, count_per_age order by age_range)
             from (
               select age_range, count(*)::int as count_per_age
               from submissions
               group by age_range
             ) age_totals
           ), '{}'::jsonb) as age_counts`
      ),
      pool.query(
        `select sub.id as submission_id, sub.age_range, sub.created_at, sub.updated_at,
                s.design_id, s.score, s.note
         from submissions sub
         join scores s on s.submission_id = sub.id
         order by sub.created_at desc, sub.id desc, s.design_id asc`
      )
    ]);

    const designMap = new Map(DESIGNS.map((design) => [design.id, design]));
    res.json({
      generatedAt: new Date().toISOString(),
      submissionCount: totals.rows[0]?.submission_count || 0,
      ageCounts: totals.rows[0]?.age_counts || {},
      summary: summary.rows.map((row) => ({
        ...row,
        title: designMap.get(row.design_id)?.title || row.design_id,
        iteration: designMap.get(row.design_id)?.iteration || ""
      })),
      ageBreakdown: ageBreakdown.rows.map((row) => ({
        ...row,
        title: designMap.get(row.design_id)?.title || row.design_id,
        iteration: designMap.get(row.design_id)?.iteration || ""
      })),
      feedback: feedback.rows.map((row) => ({
        ...row,
        title: designMap.get(row.design_id)?.title || row.design_id,
        iteration: designMap.get(row.design_id)?.iteration || ""
      }))
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/export.csv", requireAdmin, async (_req, res, next) => {
  if (!pool) {
    res.status(503).type("text/plain").send("DATABASE_URL neni nastaveno.\n");
    return;
  }

  try {
    const result = await pool.query(
      `select sub.id as submission_id, sub.client_id, sub.age_range, sub.display_order,
              sub.created_at, sub.updated_at, s.design_id, s.score, s.note
       from submissions sub
       join scores s on s.submission_id = sub.id
       order by sub.created_at asc, sub.id asc, s.design_id asc`
    );

    const header = [
      "submission_id",
      "client_id",
      "age_range",
      "display_order",
      "created_at",
      "updated_at",
      "design_id",
      "score",
      "note"
    ];
    const rows = result.rows.map((row) => header.map((key) => {
      const value = key === "display_order" ? JSON.stringify(row[key]) : row[key];
      return csvEscape(value);
    }).join(","));
    const csv = `${header.join(",")}\n${rows.join("\n")}\n`;

    res.setHeader("content-type", "text/csv; charset=utf-8");
    res.setHeader("content-disposition", 'attachment; filename="design-hodnoceni.csv"');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(rootDir, "public", "admin.html"));
});

function requireAdmin(req, res, next) {
  res.setHeader("cache-control", "no-store");
  res.vary("x-admin-token");
  res.vary("cookie");

  if (!adminToken) {
    res.status(503).json({ error: "Admin pristup neni nakonfigurovan." });
    return;
  }

  const token = req.get("x-admin-token") || "";
  if (token && safeTokenEquals(token, adminToken)) {
    next();
    return;
  }

  const cookies = parseCookies(req.get("cookie"));
  const sessionPayload = verifySignedCookie(cookies[adminSessionCookieName], adminToken);
  const expiresAt = Number(sessionPayload?.split(".", 1)[0]);
  const fetchSite = (req.get("sec-fetch-site") || "").toLowerCase();
  const trustedFetchContext = !fetchSite || fetchSite === "same-origin" || fetchSite === "none";

  if (!sessionPayload || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !trustedFetchContext) {
    res.status(401).json({ error: "Admin relace neni platna." });
    return;
  }

  next();
}

function getOrCreateSurveyClientId(req, res) {
  const cookies = parseCookies(req.get("cookie"));
  const signedClientId = verifySignedCookie(cookies[surveyClientCookieName], surveyCookieSecret);
  if (signedClientId && /^[a-f0-9-]{36}$/.test(signedClientId)) {
    return signedClientId;
  }

  const clientId = crypto.randomUUID();
  setCookie(res, surveyClientCookieName, signCookiePayload(clientId, surveyCookieSecret), {
    httpOnly: true,
    maxAge: 365 * 24 * 60 * 60,
    path: "/api/submissions",
    sameSite: "Lax",
    secure: shouldUseSecureCookies(req)
  });
  return clientId;
}

async function ensureSchema() {
  if (!pool) {
    console.warn("DATABASE_URL neni nastaveno. Verejna appka pobezi, ale API pro ukladani bude vracet 503.");
    return;
  }

  const schemaPath = path.join(rootDir, "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);
}

function buildPgSslConfig() {
  if (process.env.PGSSLMODE !== "require") {
    return undefined;
  }

  const sslConfig = {
    rejectUnauthorized: process.env.PGSSLREJECTUNAUTHORIZED === "false" ? false : true
  };
  const caFile = process.env.PGSSLCAFILE || process.env.PGSSLROOTCERT;
  if (caFile) {
    sslConfig.ca = fs.readFileSync(path.resolve(caFile), "utf8");
  }

  return sslConfig;
}

function configureTrustProxy(expressApp, value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!normalized || ["0", "false", "no", "off"].includes(normalized)) {
    return;
  }

  if (/^\d+$/.test(normalized)) {
    expressApp.set("trust proxy", Number(normalized));
    return;
  }

  if (["true", "yes", "on"].includes(normalized)) {
    expressApp.set("trust proxy", 1);
    return;
  }

  expressApp.set("trust proxy", normalized);
}

function validateHost(req, res, next) {
  if (allowedHosts.length === 0) {
    next();
    return;
  }

  const hostInfo = getHostInfo(req);
  if (hostInfo && allowedHosts.includes(hostInfo.hostname)) {
    next();
    return;
  }

  res.status(400).type("text/plain").send("Neplatny host.\n");
}

function enforceHttps(req, res, next) {
  if (!enforceHttpsEnabled || req.secure) {
    next();
    return;
  }

  const hostInfo = getHostInfo(req);
  if (!hostInfo) {
    res.status(400).type("text/plain").send("Neplatny host.\n");
    return;
  }

  res.redirect(308, `https://${hostInfo.host}${req.originalUrl}`);
}

function getHostInfo(req) {
  const host = req.get("host");
  if (typeof host !== "string" || !host || /[\s/@?#\\]/.test(host)) {
    return null;
  }

  const normalized = host.toLowerCase();
  let hostname = "";
  let portSuffix = "";

  if (normalized.startsWith("[")) {
    const bracketIndex = normalized.indexOf("]");
    if (bracketIndex <= 1) {
      return null;
    }

    hostname = normalized.slice(1, bracketIndex);
    const rest = normalized.slice(bracketIndex + 1);
    if (rest) {
      if (!rest.startsWith(":")) {
        return null;
      }

      const port = normalizePort(rest.slice(1));
      if (!port) {
        return null;
      }
      portSuffix = `:${port}`;
    }

    if (!hostname.includes(":") || !/^[0-9a-f:.]+$/.test(hostname)) {
      return null;
    }

    return {
      host: `[${hostname}]${portSuffix}`,
      hostname
    };
  }

  const parts = normalized.split(":");
  if (parts.length > 2) {
    return null;
  }

  hostname = parts[0];
  if (!hostname || !/^[a-z0-9.-]+$/.test(hostname)) {
    return null;
  }

  if (parts.length === 2) {
    const port = normalizePort(parts[1]);
    if (!port) {
      return null;
    }
    portSuffix = `:${port}`;
  }

  return {
    host: `${hostname}${portSuffix}`,
    hostname
  };
}

function normalizePort(value) {
  if (!/^\d{1,5}$/.test(value)) {
    return "";
  }

  const port = Number(value);
  if (port < 1 || port > 65535) {
    return "";
  }

  return String(port);
}

function securityHeaders(req, res, next) {
  const crossOriginResourcePolicy = req.path.startsWith("/designs/") ? "cross-origin" : "same-origin";
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://images.unsplash.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'"
  ].join("; ");

  res.setHeader("content-security-policy", csp);
  res.setHeader("cross-origin-opener-policy", "same-origin");
  res.setHeader("cross-origin-resource-policy", crossOriginResourcePolicy);
  res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  res.setHeader("referrer-policy", "same-origin");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "SAMEORIGIN");

  if (req.secure) {
    res.setHeader("strict-transport-security", "max-age=15552000; includeSubDomains");
  }

  if (req.path === "/admin" || req.path === "/admin.html" || req.path.startsWith("/api/admin") || req.path.startsWith("/api/results") || req.path.startsWith("/api/export")) {
    res.setHeader("x-robots-tag", "noindex, nofollow");
    res.setHeader("cache-control", "no-store");
  }

  next();
}

function requireJson(req, res, next) {
  if (!isJsonContentType(req)) {
    res.status(415).json({ error: "Pozadavek musi byt JSON." });
    return;
  }

  next();
}

function isJsonContentType(req) {
  const contentType = req.headers["content-type"];
  if (typeof contentType !== "string") {
    return false;
  }

  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" || (mediaType.startsWith("application/") && mediaType.endsWith("+json"));
}

function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  const limit = Number.isFinite(max) ? Math.max(0, max) : 0;

  return (req, res, next) => {
    if (limit === 0) {
      next();
      return;
    }

    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let bucket = hits.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      hits.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Remaining", String(remaining));
    res.setHeader("RateLimit-Reset", String(resetSeconds));

    if (hits.size > 10000) {
      for (const [bucketKey, value] of hits) {
        if (value.resetAt <= now) {
          hits.delete(bucketKey);
        }
      }
    }

    if (bucket.count > limit) {
      res.setHeader("Retry-After", String(resetSeconds));
      res.status(429).json({ error: message });
      return;
    }

    next();
  };
}

function safeTokenEquals(received, expected) {
  if (typeof received !== "string" || typeof expected !== "string") {
    return false;
  }

  const receivedDigest = crypto.createHash("sha256").update(received, "utf8").digest();
  const expectedDigest = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(receivedDigest, expectedDigest);
}

function signCookiePayload(payload, secret) {
  const signature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
  return `${payload}.${signature}`;
}

function verifySignedCookie(value, secret) {
  if (typeof value !== "string" || !value || !secret) {
    return "";
  }

  const separator = value.lastIndexOf(".");
  if (separator <= 0) {
    return "";
  }

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
  return safeTokenEquals(signature, expectedSignature) ? payload : "";
}

function parseCookies(header) {
  if (typeof header !== "string" || !header) {
    return {};
  }

  const cookies = {};
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator <= 0) {
      continue;
    }

    const name = part.slice(0, separator).trim();
    const rawValue = part.slice(separator + 1).trim();
    try {
      cookies[name] = decodeURIComponent(rawValue);
    } catch (_error) {
      cookies[name] = "";
    }
  }
  return cookies;
}

function setCookie(res, name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  parts.push(`Path=${options.path || "/"}`);
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  parts.push("Priority=High");
  res.append("set-cookie", parts.join("; "));
}

function clearCookie(res, name, options = {}) {
  setCookie(res, name, "", {
    ...options,
    maxAge: -1
  });
}

function shouldUseSecureCookies(req) {
  return nodeEnv === "production" || req.secure;
}

function parseList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isEnabled(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function parseNonNegativeInteger(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  return fallback;
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallback;
}

function validateProductionConfig(env = process.env) {
  if (String(env.NODE_ENV || "").trim().toLowerCase() !== "production") {
    return;
  }

  const errors = [];
  const configuredAdminToken = String(env.ADMIN_TOKEN || "").trim();
  const configuredSurveySecret = String(env.SURVEY_COOKIE_SECRET || "").trim();
  const configuredDatabaseUrl = String(env.DATABASE_URL || "").trim();
  const configuredHosts = parseList(env.ALLOWED_HOSTS).map((host) => host.toLowerCase());
  const configuredListenHost = String(env.HOST || "").trim();
  const configuredTrustProxy = String(env.TRUST_PROXY || "").trim();

  if (configuredAdminToken.length < 32 || configuredAdminToken === "change-this-to-a-long-random-token") {
    errors.push("ADMIN_TOKEN musi byt nahodny a mit alespon 32 znaku.");
  }
  if (configuredSurveySecret.length < 32 || configuredSurveySecret === "change-this-to-another-long-random-secret") {
    errors.push("SURVEY_COOKIE_SECRET musi byt nahodny a mit alespon 32 znaku.");
  }
  if (configuredAdminToken && configuredSurveySecret && configuredAdminToken === configuredSurveySecret) {
    errors.push("SURVEY_COOKIE_SECRET musi byt odlisny od ADMIN_TOKEN.");
  }
  if (!configuredDatabaseUrl || /(?:change-me|user:password)@/i.test(configuredDatabaseUrl)) {
    errors.push("DATABASE_URL musi obsahovat realne produkcni udaje.");
  }
  if (configuredHosts.length === 0 || configuredHosts.some((host) => host === "*" || host === "example.com" || host === "www.example.com")) {
    errors.push("ALLOWED_HOSTS musi obsahovat realne produkcni domeny bez wildcard.");
  }
  if (!configuredListenHost) {
    errors.push("HOST musi byt v produkci nastaven explicitne.");
  }
  if (!configuredTrustProxy || ["0", "false", "no", "off"].includes(configuredTrustProxy.toLowerCase())) {
    errors.push("TRUST_PROXY musi byt v produkci nastaven pro duveryhodnou reverzni proxy.");
  }

  if (errors.length > 0) {
    throw new Error(`Neplatna produkcni konfigurace:\n- ${errors.join("\n- ")}`);
  }
}

app.use((error, _req, res, _next) => {
  if (error.type === "entity.too.large") {
    res.status(413).json({ error: "Pozadavek je prilis velky." });
    return;
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    res.status(400).json({ error: "Neplatny JSON." });
    return;
  }

  console.error(error);
  res.status(500).json({ error: "Serverova chyba." });
});

if (require.main === module) {
  Promise.resolve()
    .then(() => validateProductionConfig())
    .then(() => ensureSchema())
    .then(() => {
      const server = listenHost
        ? app.listen(port, listenHost, () => {
            console.log(`Anketa bezi na http://${listenHost}:${port}`);
          })
        : app.listen(port, () => {
            console.log(`Anketa bezi na http://localhost:${port}`);
          });

      const shutdown = () => {
        server.close(async () => {
          if (pool) {
            await pool.end().catch(() => {});
          }
          process.exit(0);
        });
      };
      process.once("SIGTERM", shutdown);
      process.once("SIGINT", shutdown);
    })
    .catch((error) => {
      console.error("Nepodarilo se spustit aplikaci.", error);
      process.exit(1);
    });
}

module.exports = {
  app,
  ensureSchema,
  validateProductionConfig
};
