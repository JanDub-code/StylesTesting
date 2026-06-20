const state = {
  ageRanges: [],
  designs: [],
  selectedAge: "",
  scores: new Map(),
  touched: new Set(),
  displayOrder: []
};

const storageKeys = {
  displayOrder: "stylesSurveyDisplayOrder",
  draft: "stylesSurveyDraft"
};

const elements = {
  ageGrid: document.querySelector("#ageGrid"),
  cards: document.querySelector("#designCards"),
  form: document.querySelector("#surveyForm"),
  submitButton: document.querySelector("#submitButton"),
  submitTitle: document.querySelector("#submitTitle"),
  submitDetail: document.querySelector("#submitDetail"),
  progressValue: document.querySelector("#progressValue"),
  progressHint: document.querySelector("#progressHint"),
  previewModal: document.querySelector("#previewModal"),
  previewFrame: document.querySelector("#previewFrame"),
  previewTitle: document.querySelector("#previewTitle"),
  previewKicker: document.querySelector("#previewKicker"),
  openNewTab: document.querySelector("#openNewTab"),
  closePreview: document.querySelector("#closePreview"),
  thankYou: document.querySelector("#thankYou"),
  ranking: document.querySelector("#personalRanking"),
  editAgain: document.querySelector("#editAgainButton"),
  toast: document.querySelector("#toast")
};

init();

async function init() {
  loadDraft();

  try {
    const response = await fetch("/api/designs");
    if (!response.ok) {
      throw new Error("Nepodařilo se načíst návrhy.");
    }

    const data = await response.json();
    state.ageRanges = data.ageRanges;
    state.designs = data.designs;
    pruneDraftToKnownDesigns();
    state.displayOrder = resolveDisplayOrder(data.designs);

    renderAgeOptions();
    renderDesignCards();
    updateProgress();
  } catch (error) {
    showToast(error.message || "Návrhy se nepodařilo načíst.");
  }
}

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canSubmit()) {
    showToast("Vyberte věkovou kategorii a ohodnoťte všech šest návrhů.");
    return;
  }

  elements.submitButton.disabled = true;
  elements.submitButton.textContent = "Odesílám...";

  const payload = {
    ageRange: state.selectedAge,
    displayOrder: state.displayOrder,
    scores: state.designs.map((design) => ({
      designId: design.id,
      score: state.scores.get(design.id),
      note: document.querySelector(`#note-${design.id}`).value
    }))
  };

  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(getSubmitErrorMessage(response.status));
    }

    saveDraft();
    showThankYou();
    showToast("Hodnocení bylo uloženo.");
  } catch (error) {
    showToast(error.message || "Hodnocení se nepodařilo uložit.");
  } finally {
    elements.submitButton.textContent = "Odeslat hodnocení";
    updateProgress();
  }
});

elements.closePreview.addEventListener("click", closePreview);
elements.previewModal.addEventListener("click", (event) => {
  if (event.target === elements.previewModal) {
    closePreview();
  }
});
elements.editAgain.addEventListener("click", () => {
  elements.thankYou.hidden = true;
  elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.previewModal.hidden) {
    closePreview();
  }
});

function renderAgeOptions() {
  elements.ageGrid.innerHTML = "";
  for (const ageRange of state.ageRanges) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `age-option${state.selectedAge === ageRange ? " is-selected" : ""}`;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(state.selectedAge === ageRange));
    button.textContent = ageRange;
    button.addEventListener("click", () => {
      state.selectedAge = ageRange;
      saveDraft();
      renderAgeOptions();
      updateProgress();
    });
    elements.ageGrid.append(button);
  }
}

function renderDesignCards() {
  const orderedDesigns = state.displayOrder
    .map((designId) => state.designs.find((design) => design.id === designId))
    .filter(Boolean);

  elements.cards.innerHTML = "";

  for (const design of orderedDesigns) {
    const score = state.scores.get(design.id);
    const isTouched = state.touched.has(design.id);

    const card = document.createElement("article");
    card.className = "design-card";
    card.innerHTML = `
      <div class="design-card__head">
        <span class="iteration-badge">Iterace ${design.iteration}</span>
        <h3>${escapeHtml(design.title)}</h3>
        <p>${escapeHtml(design.subtitle)}</p>
      </div>
      <p class="focus-text">${escapeHtml(design.evaluationFocus)}</p>
      <div class="score-control">
        <label for="range-${design.id}">
          <span>Skóre</span>
          <strong id="score-label-${design.id}">${isTouched ? `${score} bodů` : "Zatím nehodnoceno"}</strong>
        </label>
        <input id="range-${design.id}" type="range" min="0" max="100" value="${isTouched ? score : 50}" />
        <input id="number-${design.id}" class="score-number" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="0-100" value="${isTouched ? score : ""}" aria-label="Skóre pro ${escapeHtml(design.title)}" />
      </div>
      <label class="note-field" for="note-${design.id}">
        <span>Volitelná poznámka</span>
        <textarea id="note-${design.id}" maxlength="500" rows="3" placeholder="Co na návrhu funguje nebo vadí?">${escapeHtml(getDraftNote(design.id))}</textarea>
      </label>
      <div class="card-actions">
        <button class="secondary-button" type="button" data-preview="${design.id}">Prohlédnout</button>
        <a class="text-link" href="${design.previewPath}" target="_blank" rel="noreferrer">Nová karta</a>
      </div>
    `;

    const range = card.querySelector(`#range-${design.id}`);
    const number = card.querySelector(`#number-${design.id}`);
    const note = card.querySelector(`#note-${design.id}`);
    const preview = card.querySelector("[data-preview]");

    range.addEventListener("input", () => setScore(design.id, range.value, number, range));
    number.addEventListener("input", () => setScore(design.id, number.value, number, range));
    note.addEventListener("input", saveDraft);
    preview.addEventListener("click", () => openPreview(design));

    elements.cards.append(card);
  }
}

function setScore(designId, rawValue, numberInput, rangeInput) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    numberInput.setCustomValidity("Zadejte celé číslo od 0 do 100.");
    state.scores.delete(designId);
    state.touched.delete(designId);
  } else {
    numberInput.setCustomValidity("");
    state.scores.set(designId, value);
    state.touched.add(designId);
    numberInput.value = value;
    rangeInput.value = value;
    document.querySelector(`#score-label-${designId}`).textContent = `${value} bodů`;
  }

  saveDraft();
  updateProgress();
}

function updateProgress() {
  const scoreCount = state.touched.size;
  const missingAge = state.selectedAge ? 0 : 1;
  const missingScores = Math.max(0, state.designs.length - scoreCount);
  const ready = canSubmit();

  elements.progressValue.textContent = `${scoreCount} / ${state.designs.length || 6}`;
  elements.progressHint.textContent = ready
    ? "Vše je připraveno k odeslání."
    : `Chybí ${missingAge + missingScores} položek.`;

  elements.submitButton.disabled = !ready;
  elements.submitTitle.textContent = ready ? "Připraveno k odeslání" : "Ještě není vyplněno";
  elements.submitDetail.textContent = ready
    ? "Hodnocení uložíme pseudonymně do databáze."
    : buildMissingText(missingAge, missingScores);
}

function buildMissingText(missingAge, missingScores) {
  const parts = [];
  if (missingAge) {
    parts.push("věková kategorie");
  }
  if (missingScores) {
    parts.push(`${missingScores} skóre`);
  }
  return `Chybí: ${parts.join(", ")}.`;
}

function getSubmitErrorMessage(status) {
  if (status === 400) {
    return "Zkontrolujte prosím věkovou kategorii a skóre u všech návrhů.";
  }

  return "Hodnocení se teď nepodařilo uložit. Zkuste to prosím později.";
}

function canSubmit() {
  return Boolean(state.selectedAge)
    && state.designs.length > 0
    && state.designs.every((design) => state.touched.has(design.id) && Number.isInteger(state.scores.get(design.id)));
}

function openPreview(design) {
  elements.previewTitle.textContent = design.title;
  elements.previewKicker.textContent = `Iterace ${design.iteration}`;
  elements.previewFrame.src = design.previewPath;
  elements.openNewTab.href = design.previewPath;
  elements.previewModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closePreview() {
  elements.previewModal.hidden = true;
  elements.previewFrame.src = "about:blank";
  document.body.classList.remove("modal-open");
}

function showThankYou() {
  const rows = state.designs
    .map((design) => ({ design, score: state.scores.get(design.id) }))
    .sort((a, b) => b.score - a.score);

  elements.ranking.innerHTML = rows
    .map((row) => `<li><strong>${escapeHtml(row.design.title)}</strong><span>${row.score} bodů</span></li>`)
    .join("");
  elements.thankYou.hidden = false;
  elements.thankYou.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resolveDisplayOrder(designs) {
  const designIds = designs.map((design) => design.id);
  const saved = safeJson(localStorage.getItem(storageKeys.displayOrder));
  if (Array.isArray(saved) && saved.length === designIds.length && saved.every((id) => designIds.includes(id))) {
    return saved;
  }

  const shuffled = [...designIds].sort(() => Math.random() - 0.5);
  localStorage.setItem(storageKeys.displayOrder, JSON.stringify(shuffled));
  return shuffled;
}

function loadDraft() {
  const draft = safeJson(localStorage.getItem(storageKeys.draft));
  if (!draft) {
    return;
  }

  state.selectedAge = draft.selectedAge || "";
  for (const [designId, value] of Object.entries(draft.scores || {})) {
    if (Number.isInteger(value)) {
      state.scores.set(designId, value);
      state.touched.add(designId);
    }
  }
}

function pruneDraftToKnownDesigns() {
  const knownIds = new Set(state.designs.map((design) => design.id));
  for (const designId of Array.from(state.scores.keys())) {
    if (!knownIds.has(designId)) {
      state.scores.delete(designId);
    }
  }

  for (const designId of Array.from(state.touched)) {
    if (!knownIds.has(designId)) {
      state.touched.delete(designId);
    }
  }
}

function saveDraft() {
  const notes = {};
  for (const textarea of document.querySelectorAll(".note-field textarea")) {
    notes[textarea.id.replace("note-", "")] = textarea.value;
  }

  const draft = {
    selectedAge: state.selectedAge,
    scores: Object.fromEntries(state.scores),
    notes
  };
  localStorage.setItem(storageKeys.draft, JSON.stringify(draft));
}

function getDraftNote(designId) {
  const draft = safeJson(localStorage.getItem(storageKeys.draft));
  return draft?.notes?.[designId] || "";
}

function safeJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (_error) {
    return null;
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    elements.toast.hidden = true;
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
