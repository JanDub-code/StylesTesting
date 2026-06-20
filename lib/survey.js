const AGE_RANGES = ["<18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

const DESIGNS = [
  {
    id: "industrial-ops-console",
    iteration: "01",
    title: "Industrial Ops Console",
    subtitle: "Technický velín pro rizika, SLA a provozní zásahy.",
    folder: "iterace-01-industrial-ops-console",
    previewPath: "/designs/iterace-01-industrial-ops-console/",
    evaluationFocus: "Profesionalita, čitelnost alarmů, vhodnost industriálního stylu."
  },
  {
    id: "nordic-service-desk",
    iteration: "02",
    title: "Nordic Service Desk",
    subtitle: "Klidný servisní desk s měkkým světlým rozhraním.",
    folder: "iterace-02-nordic-service-desk",
    previewPath: "/designs/iterace-02-nordic-service-desk/",
    evaluationFocus: "Důvěra, jednoduchost, jestli pastelový styl neztrácí urgentnost."
  },
  {
    id: "field-tablet-rugged",
    iteration: "03",
    title: "Field Tablet Rugged",
    subtitle: "Tablet-first nástroj pro techniky v terénu.",
    folder: "iterace-03-field-tablet-rugged",
    previewPath: "/designs/iterace-03-field-tablet-rugged/",
    evaluationFocus: "Rychlost pochopení, dotykové ovládání, použitelnost mimo kancelář."
  },
  {
    id: "compliance-ledger",
    iteration: "04",
    title: "Compliance Ledger",
    subtitle: "Spisový a auditní styl pro lhůty, protokoly a podpisy.",
    folder: "iterace-04-compliance-ledger",
    previewPath: "/designs/iterace-04-compliance-ledger/",
    evaluationFocus: "Důvěryhodnost, formálnost, jestli nepůsobí moc archivně."
  },
  {
    id: "modular-bento-zones",
    iteration: "05",
    title: "Modular Bento Zones",
    subtitle: "Barevná modulární plocha s bento zónami.",
    folder: "iterace-05-modular-bento-zones",
    previewPath: "/designs/iterace-05-modular-bento-zones/",
    evaluationFocus: "Orientace v modulech, vizuální energie, možný chaos barev."
  },
  {
    id: "kimi-agent-dashboard",
    iteration: "06",
    title: "Kimi Agent Dashboard",
    subtitle: "Moderní agentní cockpit s katalogem modulů.",
    folder: "iterace-06-kimi-agent-dashboard",
    previewPath: "/designs/iterace-06-kimi-agent-dashboard/",
    evaluationFocus: "Dojem hotového produktu, práce s moduly, čitelnost priorit."
  }
];

function normalizeScore(value) {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 0 || numericValue > 100) {
    return null;
  }

  return numericValue;
}

function sanitizeNote(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, 500);
}

function validateSubmission(payload) {
  const errors = [];
  const designIds = new Set(DESIGNS.map((design) => design.id));

  const clientId = typeof payload.clientId === "string" ? payload.clientId.trim() : "";
  if (!/^[a-zA-Z0-9._:-]{8,128}$/.test(clientId)) {
    errors.push("Chybi client_id nebo nema povoleny format.");
  }

  const ageRange = typeof payload.ageRange === "string" ? payload.ageRange.trim() : "";
  if (!AGE_RANGES.includes(ageRange)) {
    errors.push("Vyberte vekovou kategorii.");
  }

  const scoresInput = Array.isArray(payload.scores) ? payload.scores : [];
  if (scoresInput.length !== DESIGNS.length) {
    errors.push("Je potreba ohodnotit vsech 6 navrhu.");
  }

  const seen = new Set();
  const scores = [];

  for (const item of scoresInput) {
    const designId = typeof item.designId === "string" ? item.designId.trim() : "";
    if (!designIds.has(designId)) {
      errors.push("Neznamy navrh v hodnoceni.");
      continue;
    }

    if (seen.has(designId)) {
      errors.push("Kazdy navrh smi byt v hodnoceni jen jednou.");
      continue;
    }

    seen.add(designId);
    const score = normalizeScore(item.score);
    if (score === null) {
      errors.push("Skore musi byt cele cislo od 0 do 100.");
      continue;
    }

    scores.push({
      designId,
      score,
      note: sanitizeNote(item.note)
    });
  }

  for (const designId of designIds) {
    if (!seen.has(designId)) {
      errors.push("Chybi hodnoceni pro navrh.");
      break;
    }
  }

  const requestedOrder = Array.isArray(payload.displayOrder) ? payload.displayOrder : [];
  const displayOrder = requestedOrder.filter((designId) => designIds.has(designId));
  if (displayOrder.length !== DESIGNS.length || new Set(displayOrder).size !== DESIGNS.length) {
    displayOrder.splice(0, displayOrder.length, ...DESIGNS.map((design) => design.id));
  }

  return {
    valid: errors.length === 0,
    errors: [...new Set(errors)],
    value: {
      clientId,
      ageRange,
      displayOrder,
      scores
    }
  };
}

function csvEscape(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

module.exports = {
  AGE_RANGES,
  DESIGNS,
  normalizeScore,
  sanitizeNote,
  validateSubmission,
  csvEscape
};
