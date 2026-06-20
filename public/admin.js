const tokenForm = document.querySelector("#tokenForm");
const tokenInput = document.querySelector("#adminToken");
const exportButton = document.querySelector("#exportCsv");
const results = document.querySelector("#results");
const submissionCount = document.querySelector("#submissionCount");
const generatedAt = document.querySelector("#generatedAt");
const summaryRows = document.querySelector("#summaryRows");
const ageRows = document.querySelector("#ageRows");
const toast = document.querySelector("#toast");
const tokenKey = "stylesSurveyAdminToken";

tokenInput.value = localStorage.getItem(tokenKey) || "";

tokenForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loadResults();
});

exportButton.addEventListener("click", async () => {
  const token = tokenInput.value.trim();
  if (!token) {
    showToast("Zadejte admin token.");
    return;
  }

  try {
    const response = await fetch("/api/export.csv", {
      headers: { "x-admin-token": token }
    });
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

async function loadResults() {
  const token = tokenInput.value.trim();
  if (!token) {
    showToast("Zadejte admin token.");
    return;
  }

  localStorage.setItem(tokenKey, token);

  try {
    const response = await fetch("/api/results", {
      headers: { "x-admin-token": token }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Výsledky se nepodařilo načíst.");
    }

    renderResults(data);
    exportButton.disabled = false;
    results.hidden = false;
  } catch (error) {
    exportButton.disabled = true;
    showToast(error.message || "Výsledky se nepodařilo načíst.");
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
          <td>${escapeHtml(row.design_id)}</td>
          <td>${escapeHtml(row.age_range)}</td>
          <td>${row.vote_count}</td>
          <td>${formatScore(row.average_score)}</td>
        </tr>
      `
    )
    .join("");
}

function formatScore(value) {
  return typeof value === "number" ? value.toLocaleString("cs-CZ", { maximumFractionDigits: 2 }) : "-";
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
