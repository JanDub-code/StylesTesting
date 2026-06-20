const tasks = [
  {
    id: "elektro-nordic-mall",
    avatar: "NM",
    title: "Elektro revize pasáže",
    customer: "Nordic Mall",
    time: "9:30",
    window: "dnes 9:30–11:00",
    type: "Elektro",
    owner: "Tereza",
    priority: "Běžná",
    risk: false,
    note: "Připravit poslední protokol, potvrdit přístup do technické místnosti a po kontrole rovnou odeslat souhrn správci centra.",
    completed: false,
  },
  {
    id: "podklady-vinohradska",
    avatar: "V18",
    title: "Doplnit podklady k protokolu",
    customer: "Vinohradská 18",
    time: "11:00",
    window: "dnes do 11:00",
    type: "Dokumenty",
    owner: "Marek",
    priority: "Jemné riziko",
    risk: true,
    note: "Chybí podpis zástupce zákazníka a fotografie rozvaděče. Po doplnění se protokol vrátí do zeleného compliance stavu.",
    completed: false,
  },
  {
    id: "technik-sklad-jih",
    avatar: "SJ",
    title: "Potvrdit výjezd technika",
    customer: "Sklad Jih",
    time: "13:45",
    window: "dnes 13:45",
    type: "Koordinace",
    owner: "Lucie",
    priority: "Jemné riziko",
    risk: true,
    note: "Zákazník čeká na potvrzení kontaktní osoby na místě. Stačí krátký telefonát a aktualizace poznámky ve výjezdu.",
    completed: false,
  },
  {
    id: "opravneni-technika",
    avatar: "OT",
    title: "Oprávnění expiruje za 14 dní",
    customer: "Tým revizních techniků",
    time: "15:20",
    window: "dnes do 15:20",
    type: "Lidé",
    owner: "Anna",
    priority: "Sledovat",
    risk: true,
    note: "Ověřit termín obnovy oprávnění a poslat technikovi měkkou připomínku s odkazem na interní checklist.",
    completed: false,
  },
];

const taskList = document.querySelector("#taskList");
const riskList = document.querySelector("#riskList");
const remainingCount = document.querySelector("#remainingCount");
const mobileRemainingCount = document.querySelector("#mobileRemainingCount");
const detailPanel = document.querySelector("#detailPanel");
const panelOverlay = document.querySelector(".panel-overlay");
const panelDoneButton = document.querySelector("#panelDoneButton");
const toast = document.querySelector("#toast");

let activeTaskId = null;
let lastFocusedElement = null;
let toastTimer = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getTaskStatus(task) {
  if (task.completed) return "Hotovo";
  return task.risk ? "Čeká · riziko" : "Čeká";
}

function createTaskCard(task) {
  const article = document.createElement("article");
  article.className = `task-card${task.completed ? " is-done" : ""}${task.risk ? " is-risk" : ""}`;
  article.dataset.taskId = task.id;

  article.innerHTML = `
    <div class="task-avatar" aria-hidden="true">${escapeHtml(task.avatar)}</div>
    <div class="task-content">
      <div class="task-topline">
        <div>
          <h3 class="task-title">${escapeHtml(task.title)}</h3>
          <p class="task-customer">${escapeHtml(task.customer)}</p>
        </div>
        <span class="soft-badge ${task.completed ? "mint" : task.risk ? "warning" : ""}">${escapeHtml(getTaskStatus(task))}</span>
      </div>
      <div class="task-meta" aria-label="Metadata úkolu">
        <span>☼ ${escapeHtml(task.window)}</span>
        <span>${escapeHtml(task.type)}</span>
        <span>${escapeHtml(task.owner)}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="task-open" type="button" data-open-task data-task-id="${escapeHtml(task.id)}" aria-label="Otevřít detail úkolu: ${escapeHtml(task.title)}, ${escapeHtml(task.customer)}">
        Detail
      </button>
      <button class="task-complete" type="button" data-complete-task data-task-id="${escapeHtml(task.id)}" ${task.completed ? "disabled" : ""}>
        ${task.completed ? "Hotovo" : "Označit"}
      </button>
    </div>
  `;

  return article;
}

function renderTaskCollection(container, items, emptyText) {
  container.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }

  items.forEach((task) => container.append(createTaskCard(task)));
}

function updateCounters() {
  const openTasks = tasks.filter((task) => !task.completed).length;
  remainingCount.textContent = String(openTasks);
  mobileRemainingCount.textContent = String(openTasks);
}

function renderTasks() {
  renderTaskCollection(taskList, tasks, "Dnešní fronta je vyřízená.");
  renderTaskCollection(
    riskList,
    tasks.filter((task) => task.risk && !task.completed),
    "Aktuálně nejsou žádná rizika k řešení."
  );
  updateCounters();
}

function setView(view) {
  document.querySelectorAll(".view-button").forEach((button) => {
    const isActive = button.dataset.view === view;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".view-panel").forEach((panel) => {
    const isActive = panel.dataset.panel === view;
    panel.classList.toggle("is-active", isActive);
    panel.hidden = !isActive;
  });
}

function setDensity(density) {
  document.body.dataset.density = density;

  document.querySelectorAll(".density-button").forEach((button) => {
    const isActive = button.dataset.density === density;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  showToast(density === "compact" ? "Kompaktní hustota zobrazení." : "Komfortní hustota zobrazení.");
}

function findTask(taskId) {
  return tasks.find((task) => task.id === taskId);
}

function fillPanel(task) {
  document.querySelector("#panelAvatar").textContent = task.avatar;
  document.querySelector("#panelTitle").textContent = task.title;
  document.querySelector("#panelSubtitle").textContent = `${task.customer} · ${task.window}`;
  document.querySelector("#panelStatus").textContent = getTaskStatus(task);
  document.querySelector("#panelType").textContent = task.type;
  document.querySelector("#panelOwner").textContent = task.owner;
  document.querySelector("#panelPriority").textContent = task.priority;
  document.querySelector("#panelNote").textContent = task.note;

  panelDoneButton.disabled = task.completed;
  panelDoneButton.textContent = task.completed ? "Úkol je hotový" : "Označit jako hotové";
}

function openTask(taskId) {
  const task = findTask(taskId);
  if (!task) return;

  activeTaskId = taskId;
  lastFocusedElement = document.activeElement;
  fillPanel(task);

  detailPanel.hidden = false;
  panelOverlay.hidden = false;
  detailPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("panel-open");

  requestAnimationFrame(() => {
    const closeButton = detailPanel.querySelector(".panel-close");
    closeButton?.focus();
  });
}

function isVisibleElement(element) {
  return Boolean(element?.getClientRects().length);
}

function findVisibleTaskOpenButton(taskId) {
  return Array.from(document.querySelectorAll("[data-open-task]")).find(
    (button) => button.dataset.taskId === taskId && isVisibleElement(button)
  );
}

function getFallbackFocusTarget(taskId) {
  return (
    findVisibleTaskOpenButton(taskId) ||
    Array.from(document.querySelectorAll(".view-panel:not([hidden]) [data-open-task]")).find(isVisibleElement) ||
    document.querySelector(".view-button.is-active")
  );
}

function closePanel() {
  if (detailPanel.hidden) return;

  const taskIdToRestore = activeTaskId;

  detailPanel.hidden = true;
  panelOverlay.hidden = true;
  detailPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("panel-open");
  activeTaskId = null;

  const focusTarget =
    lastFocusedElement &&
    lastFocusedElement !== document.body &&
    lastFocusedElement.isConnected &&
    isVisibleElement(lastFocusedElement)
      ? lastFocusedElement
      : getFallbackFocusTarget(taskIdToRestore);

  if (focusTarget && typeof focusTarget.focus === "function") {
    focusTarget.focus();
  }

  lastFocusedElement = null;
}

function completeTask(taskId) {
  const task = findTask(taskId);
  if (!task || task.completed) return;

  const activeCompleteButton = document.activeElement?.closest?.("[data-complete-task]");
  const shouldRestoreCardFocus = activeCompleteButton?.dataset.taskId === taskId;

  task.completed = true;
  renderTasks();

  if (activeTaskId === taskId) {
    fillPanel(task);
  } else if (shouldRestoreCardFocus) {
    getFallbackFocusTarget(taskId)?.focus();
  }

  showToast(`Úkol „${task.title}“ je označený jako hotový.`);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2400);
}

function getScrollBehavior() {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  return prefersReducedMotion ? "auto" : "smooth";
}

function scrollToQueue() {
  document.querySelector("#queue")?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
}

function activateNavLink(link) {
  const nav = link.closest("nav");
  if (!nav) return;
  nav.querySelectorAll("a").forEach((item) => item.classList.toggle("is-active", item === link));
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest(".view-button");
  if (viewButton) {
    setView(viewButton.dataset.view);
    return;
  }

  const densityButton = event.target.closest(".density-button");
  if (densityButton) {
    setDensity(densityButton.dataset.density);
    return;
  }

  const completeButton = event.target.closest("[data-complete-task]");
  if (completeButton) {
    event.stopPropagation();
    completeTask(completeButton.dataset.taskId);
    return;
  }

  const openButton = event.target.closest("[data-open-task]");
  if (openButton) {
    event.stopPropagation();
    openTask(openButton.dataset.taskId);
    return;
  }

  const taskCard = event.target.closest(".task-card");
  if (taskCard) {
    openTask(taskCard.dataset.taskId);
    return;
  }

  if (event.target.closest("[data-close-panel]")) {
    closePanel();
    return;
  }

  if (event.target.closest("[data-jump-today]")) {
    setView("today");
    scrollToQueue();
    return;
  }

  if (event.target.closest("[data-open-risks]")) {
    setView("risks");
    scrollToQueue();
    return;
  }

  if (event.target.closest('[data-action="plan"]')) {
    showToast("Nová revize by se v reálné aplikaci otevřela v plánovači.");
    return;
  }

  const navLink = event.target.closest("nav a");
  if (navLink) {
    activateNavLink(navLink);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePanel();
  }
});

panelDoneButton.addEventListener("click", () => {
  if (activeTaskId) {
    completeTask(activeTaskId);
  }
});

renderTasks();
