const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");

const SERVER_PATH = require.resolve("../server");
const DEFAULT_ENV = {
  ADMIN_TOKEN: "0123456789abcdef0123456789abcdef",
  NODE_ENV: "test"
};
const ENV_KEYS = [
  "NODE_ENV",
  "ADMIN_TOKEN",
  "SURVEY_COOKIE_SECRET",
  "ADMIN_SESSION_TTL_SECONDS",
  "HOST",
  "DATABASE_URL",
  "ALLOWED_HOSTS",
  "ENFORCE_HTTPS",
  "TRUST_PROXY",
  "PGSSLMODE",
  "PGSSLREJECTUNAUTHORIZED",
  "PGSSLCAFILE",
  "PGSSLROOTCERT",
  "SUBMISSION_RATE_LIMIT",
  "ADMIN_LOGIN_RATE_LIMIT",
  "ADMIN_RATE_LIMIT"
];

function loadApp(env = {}) {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  Object.assign(process.env, DEFAULT_ENV, env);
  delete require.cache[SERVER_PATH];
  return require("../server").app;
}

function loadAppWithPool(fakePool, env = {}) {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
  Object.assign(process.env, DEFAULT_ENV, {
    DATABASE_URL: "postgres://survey:password@127.0.0.1:5432/survey"
  }, env);
  delete require.cache[SERVER_PATH];

  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "pg") {
      return {
        Pool: function Pool() {
          return fakePool;
        }
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return require("../server").app;
  } finally {
    Module._load = originalLoad;
  }
}

async function request(app, path, options = {}) {
  const server = await new Promise((resolve) => {
    const listening = app.listen(0, "127.0.0.1", () => resolve(listening));
  });

  try {
    const address = server.address();
    return await fetch(`http://127.0.0.1:${address.port}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test("responses include baseline security headers", async () => {
  const app = loadApp();
  const response = await request(app, "/api/designs");

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
  assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
});

test("design preview assets can load inside the opaque sandboxed iframe", async () => {
  const app = loadApp();
  const response = await request(app, "/designs/iterace-01-industrial-ops-console/app.js");

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cross-origin-resource-policy"), "cross-origin");
});

test("allowed host checks ignore spoofed forwarded host", async () => {
  const app = loadApp({ ALLOWED_HOSTS: "allowed.test", TRUST_PROXY: "loopback" });
  const response = await request(app, "/api/designs", {
    headers: {
      host: "evil.test",
      "x-forwarded-host": "allowed.test"
    }
  });

  assert.equal(response.status, 400);
});

test("false trust proxy setting does not crash startup", async () => {
  const app = loadApp({ TRUST_PROXY: "false" });
  const response = await request(app, "/api/designs");

  assert.equal(response.status, 200);
});

test("admin token is accepted only through x-admin-token header", async () => {
  const app = loadApp();
  const queryResponse = await request(app, "/api/results?token=0123456789abcdef0123456789abcdef");
  assert.equal(queryResponse.status, 401);

  const headerResponse = await request(app, "/api/results", {
    headers: { "x-admin-token": "0123456789abcdef0123456789abcdef" }
  });
  assert.equal(headerResponse.status, 503);
  assert.equal(headerResponse.headers.get("cache-control"), "no-store");
  assert.match(headerResponse.headers.get("vary"), /x-admin-token/i);
});

test("admin browser login exchanges the token for an HttpOnly session cookie", async () => {
  const app = loadApp();
  const loginResponse = await request(app, "/api/admin/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: "0123456789abcdef0123456789abcdef" })
  });

  assert.equal(loginResponse.status, 200);
  const cookie = loginResponse.headers.get("set-cookie");
  assert.match(cookie, /styles_admin_session=/);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=Strict/i);
  assert.doesNotMatch(cookie, /0123456789abcdef/);

  const sessionResponse = await request(app, "/api/results", {
    headers: { cookie: cookie.split(";", 1)[0] }
  });
  assert.equal(sessionResponse.status, 503);

  const crossSiteResponse = await request(app, "/api/results", {
    headers: {
      cookie: cookie.split(";", 1)[0],
      "sec-fetch-site": "cross-site"
    }
  });
  assert.equal(crossSiteResponse.status, 401);
});

test("admin results count submissions, not age buckets", async () => {
  const fakePool = {
    async query(sql) {
      const compactSql = sql.replace(/\s+/g, " ").trim();

      if (compactSql.includes("from scores group by design_id")) {
        return { rows: [] };
      }
      if (compactSql.includes("from scores s join submissions sub")) {
        return { rows: [] };
      }
      if (compactSql.includes("as submission_count")) {
        assert.match(compactSql, /select count\(\*\)::int from submissions/);
        assert.doesNotMatch(compactSql, /^select count\(\*\)::int as submission_count, jsonb_object_agg/);
        return {
          rows: [{
            submission_count: 2,
            age_counts: { "35-44": 2 }
          }]
        };
      }
      if (compactSql.includes("s.note") && compactSql.includes("join scores s on s.submission_id = sub.id")) {
        return {
          rows: [{
            submission_id: 1,
            age_range: "35-44",
            created_at: "2026-06-20T12:00:00.000Z",
            updated_at: "2026-06-20T12:00:00.000Z",
            design_id: "industrial-ops-console",
            score: 88,
            note: "Citelne alarmy."
          }]
        };
      }

      throw new Error(`Unexpected query: ${compactSql}`);
    }
  };
  const app = loadAppWithPool(fakePool);
  const response = await request(app, "/api/results", {
    headers: { "x-admin-token": "0123456789abcdef0123456789abcdef" }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.submissionCount, 2);
  assert.deepEqual(body.ageCounts, { "35-44": 2 });
  assert.deepEqual(body.feedback, [{
    submission_id: 1,
    age_range: "35-44",
    created_at: "2026-06-20T12:00:00.000Z",
    updated_at: "2026-06-20T12:00:00.000Z",
    design_id: "industrial-ops-console",
    score: 88,
    note: "Citelne alarmy.",
    title: "Industrial Ops Console",
    iteration: "01"
  }]);
});

test("submission endpoint rejects non-json and malformed json", async () => {
  const app = loadApp();
  const nonJsonResponse = await request(app, "/api/submissions", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "{}"
  });
  assert.equal(nonJsonResponse.status, 415);

  const malformedResponse = await request(app, "/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{bad"
  });
  assert.equal(malformedResponse.status, 400);

  const suffixJsonResponse = await request(app, "/api/submissions", {
    method: "POST",
    headers: { "content-type": "application/vnd.api+json" },
    body: "{bad"
  });
  assert.equal(suffixJsonResponse.status, 400);
});
