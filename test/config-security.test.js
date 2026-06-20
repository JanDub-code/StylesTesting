const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProductionConfig } = require("../server");

function productionConfig(overrides = {}) {
  return {
    NODE_ENV: "production",
    HOST: "127.0.0.1",
    TRUST_PROXY: "loopback",
    ALLOWED_HOSTS: "survey.example.test",
    DATABASE_URL: "postgres://survey:strong-password@127.0.0.1:5432/survey",
    ADMIN_TOKEN: "a".repeat(64),
    SURVEY_COOKIE_SECRET: "b".repeat(64),
    ...overrides
  };
}

test("production security configuration accepts distinct strong secrets", () => {
  assert.doesNotThrow(() => validateProductionConfig(productionConfig()));
});

test("production security configuration rejects placeholders and unsafe proxy settings", () => {
  assert.throws(
    () => validateProductionConfig(productionConfig({
      ADMIN_TOKEN: "change-this-to-a-long-random-token",
      SURVEY_COOKIE_SECRET: "change-this-to-another-long-random-secret",
      DATABASE_URL: "postgres://styles_survey:change-me@127.0.0.1:5432/styles_survey",
      ALLOWED_HOSTS: "example.com",
      TRUST_PROXY: "false"
    })),
    /Neplatna produkcni konfigurace/
  );
});

test("non-production configuration remains flexible for local development", () => {
  assert.doesNotThrow(() => validateProductionConfig({ NODE_ENV: "test" }));
});
