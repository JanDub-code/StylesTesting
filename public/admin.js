const tokenForm = document.querySelector("#tokenForm");
const tokenInput = document.querySelector("#adminToken");
const exportButton = document.querySelector("#exportCsv");
const logoutButton = document.querySelector("#logoutButton");
const results = document.querySelector("#results");
const submissionCount = document.querySelector("#submissionCount");
const generatedAt = document.querySelector("#generatedAt");
const summaryRows = document.querySelector("#summaryRows");
const ageRows = document.querySelector("#ageRows");
const feedbackRows = document.querySelector("#feedbackRows");
const toast = document.querySelector("#toast");

tokenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const token = tokenInput.value.trim();
  if (!token) {
    showToast("Zadejte admin token.");
    return;
  }

  try {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Přihlášení se nepodařilo.");
    }

    tokenInput.value = "";
    await loadResults();
  } catch (error) {
    showToast(error.message || "Přihlášení se nepodařilo.");
  }
});

exportButton.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/export.csv");
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "CSV export se nepodařilo stáhnout.");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "design-hodnoceni.csv";
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    showToast(error.message || "CSV export se nepodařilo stáhnout.");
  }
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
  exportButton.disabled = true;
  logoutButton.hidden = true;
  results.hidden = true;
  showToast("Admin relace byla ukončena.");
});

async function loadResults({ silent = false } = {}) {
  try {
    const response = await fetch("/api/results");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Výsledky se nepodařilo načíst.");
    }

    renderResults(data);
    exportButton.disabled = false;
    logoutButton.hidden = false;
    results.hidden = false;
    return true;
  } catch (error) {
    exportButton.disabled = true;
    logoutButton.hidden = true;
    if (!silent) {
      showToast(error.message || "Výsledky se nepodařilo načíst.");
    }
    return false;
  }
}

function renderResults(data) {
  submissionCount.textContent = data.submissionCount || 0;
  generatedAt.textContent = data.generatedAt ? `Vygenerováno ${new Date(data.generatedAt).toLocaleString("cs-CZ")}` : "-";

  summaryRows.innerHTML = (data.summary || [])
    .map(
      (row) => `
        <tr>
          <td><strong>${escapeHtml(row.iteration)} · ${escapeHtml(row.title)}</strong></td>
          <td>${row.vote_count}</td>
          <td>${formatScore(row.average_score)}</td>
          <td>${row.min_score}</td>
          <td>${row.max_score}</td>
        </tr>
      `
    )
    .join("");

  ageRows.innerHTML = (data.ageBreakdown || [])
    .map(
      (row) => `
        <tr>
          <td><strong>${escapeHtml(row.iteration)} &middot; ${escapeHtml(row.title)}</strong></td>
          <td>${escapeHtml(row.age_range)}</td>
          <td>${row.vote_count}</td>
          <td>${formatScore(row.average_score)}</td>
        </tr>
      `
    )
    .join("");

  feedbackRows.innerHTML = (data.feedback || [])
    .map(
      (row) => `
        <tr>
          <td>
            <strong>#${row.submission_id}</strong>
            <small>${formatDate(row.created_at)}</small>
          </td>
          <td>${escapeHtml(row.age_range)}</td>
          <td><strong>${escapeHtml(row.iteration)} &middot; ${escapeHtml(row.title)}</strong></td>
          <td>${row.score}</td>
          <td class="feedback-note">${escapeHtml(row.note || "-")}</td>
        </tr>
      `
    )
    .join("");
}

function formatScore(value) {
  return typeof value === "number" ? value.toLocaleString("cs-CZ", { maximumFractionDigits: 2 }) : "-";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("cs-CZ") : "-";
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.hidden = true;
  }, 4200);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadResults({ silent: true });
