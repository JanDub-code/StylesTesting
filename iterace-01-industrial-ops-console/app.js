const body = document.body;
const navItems = document.querySelectorAll(".nav-item");
const mobileDockItems = document.querySelectorAll("[data-mobile-nav]");
const screenTitle = document.querySelector("#screenTitle");
const sidebarToggle = document.querySelector("#sidebarToggle");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileBackdrop = document.querySelector("#mobileBackdrop");
const newRevision = document.querySelector("#newRevision");
const toast = document.querySelector("#toast");
const riskCards = document.querySelectorAll(".risk-card");
const filterButtons = document.querySelectorAll(".filter-chip");
const riskCount = document.querySelector("#riskCount");
const drawer = document.querySelector("#detailDrawer");
const drawerClose = document.querySelector("#drawerClose");
const drawerTitle = document.querySelector("#drawerTitle");
const drawerSeverity = document.querySelector("#drawerSeverity");
const drawerLead = document.querySelector("#drawerLead");
const drawerCode = document.querySelector("#drawerCode");
const drawerOwner = document.querySelector("#drawerOwner");
const drawerDue = document.querySelector("#drawerDue");

const riskDetails = {
  overdue: {
    title: "Revize po termínu",
    severity: "Kritické",
    severityClass: "danger",
    lead: "18 revizí je po termínu, nejstarší položka překračuje SLA o 14 dnů. Priorita je přesunout kapacity z méně rizikových zakázek.",
    code: "R-142",
    owner: "Marek L.",
    due: "Dnes 15:00",
  },
  invalid: {
    title: "Zařízení bez platné revize",
    severity: "Kritické",
    severityClass: "danger",
    lead: "6 zařízení nemá platnou revizi. Dvě položky jsou ve výrobním provozu a vyžadují potvrzení bezpečného režimu.",
    code: "Z-087",
    owner: "Petr H.",
    due: "Dnes 12:30",
  },
  defects: {
    title: "Závady A",
    severity: "Varování",
    severityClass: "warning",
    lead: "7 závad třídy A čeká na akci. U tří položek chybí vlastník a v 15:00 proběhne automatická eskalace.",
    code: "A-031",
    owner: "Dana M.",
    due: "Dnes 15:00",
  },
  protocols: {
    title: "Chybějící protokoly",
    severity: "Varování",
    severityClass: "warning",
    lead: "9 protokolů není kompletních. Většina čeká na podpis klienta nebo upload fotodokumentace z terénu.",
    code: "P-224",
    owner: "Jana K.",
    due: "Zítra 09:00",
  },
  permits: {
    title: "Expirovaná oprávnění",
    severity: "OK",
    severityClass: "ok",
    lead: "Žádné kritické oprávnění není expirované. Dvě certifikace vstoupí do třicetidenního okna obnovy.",
    code: "L-019",
    owner: "Adam V.",
    due: "30 dnů",
  },
};

let toastTimer;

function isMobile() {
  return window.matchMedia("(max-width: 720px)").matches;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function setActiveNav(label) {
  navItems.forEach((item) => item.classList.toggle("is-active", item.dataset.nav === label));
  mobileDockItems.forEach((item) => item.classList.toggle("is-active", item.dataset.mobileNav === label));
  if (screenTitle && ["Velín", "Revize", "Zařízení", "Závady", "Lidé a doklady", "Finance", "Reporting"].includes(label)) {
    screenTitle.textContent = label === "Velín" ? "Velín revizí" : label;
  }
}

function openDrawer(riskId) {
  const detail = riskDetails[riskId];
  if (!detail) return;

  riskCards.forEach((card) => card.classList.toggle("is-selected", card.dataset.riskId === riskId));
  drawerTitle.textContent = detail.title;
  drawerSeverity.textContent = detail.severity;
  drawerSeverity.classList.remove("is-warning", "is-ok");
  if (detail.severityClass === "warning") drawerSeverity.classList.add("is-warning");
  if (detail.severityClass === "ok") drawerSeverity.classList.add("is-ok");
  drawerLead.textContent = detail.lead;
  drawerCode.textContent = detail.code;
  drawerOwner.textContent = detail.owner;
  drawerDue.textContent = detail.due;

  body.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
}

function applyRiskFilter(filter) {
  let visible = 0;
  filterButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === filter));

  riskCards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.riskStatus === filter;
    card.hidden = !isVisible;
    if (isVisible) visible += 1;
  });

  riskCount.textContent = String(visible);

  const selected = document.querySelector(".risk-card.is-selected");
  if (selected?.hidden) {
    const firstVisible = Array.from(riskCards).find((card) => !card.hidden);
    if (firstVisible) openDrawer(firstVisible.dataset.riskId);
  }
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    setActiveNav(item.dataset.nav);
    if (isMobile()) body.classList.remove("sidebar-open");
  });
});

mobileDockItems.forEach((item) => {
  item.addEventListener("click", () => {
    setActiveNav(item.dataset.mobileNav === "Velín" ? "Velín" : item.dataset.mobileNav);
    if (item.dataset.mobileNav === "Rizika") {
      document.querySelector(".risk-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (item.dataset.mobileNav === "Mise") {
      document.querySelector(".missions-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

sidebarToggle.addEventListener("click", () => {
  if (isMobile()) {
    body.classList.remove("sidebar-open");
    return;
  }

  body.classList.toggle("sidebar-collapsed");
  const collapsed = body.classList.contains("sidebar-collapsed");
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute("aria-label", collapsed ? "Rozbalit sidebar" : "Sbalit sidebar");
});

mobileMenu.addEventListener("click", () => body.classList.add("sidebar-open"));
mobileBackdrop.addEventListener("click", () => body.classList.remove("sidebar-open"));

drawerClose.addEventListener("click", closeDrawer);

riskCards.forEach((card) => {
  card.addEventListener("click", () => openDrawer(card.dataset.riskId));
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => applyRiskFilter(button.dataset.filter));
});

newRevision.addEventListener("click", () => {
  showToast("+ Nová revize: koncept založen, čeká na výběr zařízení.");
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    body.classList.remove("sidebar-open");
    closeDrawer();
  }
});

openDrawer("overdue");
