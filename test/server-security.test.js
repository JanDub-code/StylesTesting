const test = require("node:test");
const assert = require("node:assert/strict");

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
  assert.match(response.headers.get("content-security-policy"), /default-src 'self'/);
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
