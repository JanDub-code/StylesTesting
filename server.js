const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const { Pool } = require("pg");
const { AGE_RANGES, DESIGNS, validateSubmission, csvEscape } = require("./lib/survey");

const app = express();
const port = Number(process.env.PORT || 3000);
const adminToken = process.env.ADMIN_TOKEN || "";
const databaseUrl = process.env.DATABASE_URL || "";
const rootDir = __dirname;

let pool = null;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined
  });
}

app.disable("x-powered-by");
app.use(express.json({ limit: "80kb" }));
app.use(express.static(path.join(rootDir, "public"), { extensions: ["html"] }));

for (const design of DESIGNS) {
  app.use(`/designs/${design.folder}`, express.static(path.join(rootDir, design.folder), { extensions: ["html"] }));
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    databaseConfigured: Boolean(pool),
    adminConfigured: Boolean(adminToken)
  });
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

app.post("/api/submissions", async (req, res, next) => {
  if (!pool) {
    res.status(503).json({
      error: "Ukladani neni nakonfigurovano. Nastavte DATABASE_URL pro PostgreSQL."
    });
    return;
  }

  const validation = validateSubmission(req.body || {});
  if (!validation.valid) {
    res.status(400).json({ error: "Neplatne hlasovani.", details: validation.errors });
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
    const [summary, ageBreakdown, totals] = await Promise.all([
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
        `select count(*)::int as submission_count,
                jsonb_object_agg(age_range, count_per_age order by age_range) as age_counts
         from (
           select age_range, count(*)::int as count_per_age
           from submissions
           group by age_range
         ) age_totals`
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
      ageBreakdown: ageBreakdown.rows
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
  if (!adminToken) {
    res.status(503).json({ error: "ADMIN_TOKEN neni nastaven." });
    return;
  }

  const token = req.get("x-admin-token") || req.query.token;
  if (token !== adminToken) {
    res.status(401).json({ error: "Neplatny admin token." });
    return;
  }

  next();
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

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Serverova chyba." });
});

if (require.main === module) {
  ensureSchema()
    .then(() => {
      app.listen(port, () => {
        console.log(`Anketa bezi na http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error("Nepodarilo se pripravit databazi.", error);
      process.exit(1);
    });
}

module.exports = {
  app,
  ensureSchema
};
