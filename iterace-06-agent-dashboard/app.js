const photos = {
  revize: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=900&q=80",
  elektro: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=80",
  bozp: "https://images.unsplash.com/photo-1581092919535-7146ff1a590b?auto=format&fit=crop&w=900&q=80",
  hr: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
  smlouvy: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
  archiv: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  finance: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80",
  fakturace: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
  fleet: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80",
  reporting: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
  projekty: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  dotace: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
};

const sectionOrder = [
  "Provoz & compliance",
  "Lidé, dokumenty & právní jistota",
  "Finance & provoz",
  "Růst & řízení",
];

const modules = [
  {
    id: "revize",
    name: "Revize & zařízení",
    subtitle: "Revize, závady, zařízení a protokoly",
    description: "Denní provoz revizní firmy na jednom místě: plán, měření, závady, termíny a protokoly.",
    status: "active",
    accentColor: "cyan",
    icon: "☑",
    section: "Provoz & compliance",
    metrics: [
      { label: "aktivních revizí", value: "12" },
      { label: "po termínu", value: "2", alert: true },
    ],
    healthStatus: "alert",
    ctaLabel: "Otevřít",
    photoUrl: photos.revize,
    photoAlt: "Revizní technik kontroluje elektrický rozvaděč",
  },
  {
    id: "skoleni-elektro",
    name: "Školení Elektro",
    subtitle: "NV 194/2022, termíny a doklady",
    description: "Termíny školení, testy, doklady a potvrzení odbornosti pro elektro pracovníky.",
    status: "active",
    accentColor: "cyan",
    icon: "◇",
    section: "Provoz & compliance",
    metrics: [
      { label: "termíny letos", value: "3" },
      { label: "vyprší do 30 dní", value: "1", warning: true },
    ],
    healthStatus: "warning",
    ctaLabel: "Otevřít",
    photoUrl: photos.elektro,
    photoAlt: "Technické školení a práce s dokumentací",
  },
  {
    id: "skoleni-bozp",
    name: "Školení BOZP & PO",
    subtitle: "Bezpečnost, testy a podpisy",
    description: "Povinná školení, účastníci, testy, podpisy a hlídání pravidelného opakování.",
    status: "active",
    accentColor: "emerald",
    icon: "▣",
    section: "Provoz & compliance",
    metrics: [
      { label: "aktivních školení", value: "5" },
      { label: "vše v pořádku", value: "OK" },
    ],
    healthStatus: "ok",
    ctaLabel: "Otevřít",
    photoUrl: photos.bozp,
    photoAlt: "Ochranné pracovní pomůcky a bezpečnostní příprava",
  },
  {
    id: "osoby-hr",
    name: "Osoby & HR",
    subtitle: "Pracovníci, kvalifikace a citlivá data",
    description: "Evidence pracovníků, odborností, kvalifikací a personálních údajů s oprávněným přístupem.",
    status: "active",
    accentColor: "blue",
    icon: "◉",
    section: "Lidé, dokumenty & právní jistota",
    metrics: [{ label: "osob v evidenci", value: "28" }],
    healthStatus: "ok",
    ctaLabel: "Otevřít",
    photoUrl: photos.hr,
    photoAlt: "Pracovní dokumentace a onboarding zaměstnance",
  },
  {
    id: "smlouvy-clm",
    name: "Smlouvy & CLM",
    subtitle: "Smlouvy, dodatky a podpisy",
    description: "Pracovní smlouvy, dodatky, podpisy, expirace a návaznost na osoby a dokumenty.",
    status: "active",
    accentColor: "blue",
    icon: "✒",
    section: "Lidé, dokumenty & právní jistota",
    metrics: [
      { label: "smluv celkem", value: "47" },
      { label: "expirují", value: "3", warning: true },
    ],
    healthStatus: "warning",
    ctaLabel: "Otevřít",
    photoUrl: photos.smlouvy,
    photoAlt: "Smlouvy a firemní dokumenty připravené k podpisu",
  },
  {
    id: "gdpr-spisovka",
    name: "GDPR & spisovka",
    subtitle: "Retence, DSAR a auditní stopa",
    description: "Retenční pravidla, skartační režim, žádosti subjektů údajů a dohled nad dokumenty.",
    status: "active",
    accentColor: "slate",
    icon: "▤",
    section: "Lidé, dokumenty & právní jistota",
    metrics: [
      { label: "retenční pravidlo", value: "10 let" },
      { label: "bez alarmu", value: "OK" },
    ],
    healthStatus: "ok",
    ctaLabel: "Otevřít",
    photoUrl: photos.archiv,
    photoAlt: "Uspořádaný archiv dokumentů",
  },
  {
    id: "ceniky-naklady",
    name: "Ceníky & náklady",
    subtitle: "Sazby, kalkulace a marže",
    description: "Ceníky pro revize, interní sazby, nákladovost práce a podklady pro fakturaci.",
    status: "active",
    accentColor: "emerald",
    icon: "₭",
    section: "Finance & provoz",
    metrics: [{ label: "aktivní ceník", value: "2026" }],
    healthStatus: "ok",
    ctaLabel: "Otevřít",
    photoUrl: photos.finance,
    photoAlt: "Finanční kalkulace a provozní náklady",
  },
  {
    id: "fakturace",
    name: "Fakturace",
    subtitle: "Faktury z dokončených revizí",
    description: "Vystavujte faktury přímo z dokončených revizí a sledujte úhrady bez přepisování.",
    status: "available",
    accentColor: "emerald",
    icon: "▥",
    section: "Finance & provoz",
    ctaLabel: "Zapnout",
    healthStatus: "empty",
    photoUrl: photos.fakturace,
    photoAlt: "Faktura a platební podklady",
  },
  {
    id: "vozovy-park",
    name: "Vozový park & STK",
    subtitle: "Vozidla, STK, emise a leasing",
    description: "Evidence vozidel, technických kontrol, emisí, leasingu, řidičů a provozních lhůt.",
    status: "available",
    accentColor: "amber",
    icon: "▰",
    section: "Finance & provoz",
    ctaLabel: "Zapnout",
    healthStatus: "empty",
    photoUrl: photos.fleet,
    photoAlt: "Servisní kontrola firemního vozidla",
  },
  {
    id: "reporting",
    name: "Reporting & export",
    subtitle: "Přehledy a exporty pro kontrolní orgány",
    description: "Manažerské přehledy, provozní statistiky a exporty pro kontrolní orgány.",
    status: "active",
    accentColor: "violet",
    icon: "▧",
    section: "Růst & řízení",
    metrics: [{ label: "exporty připravené", value: "4" }],
    healthStatus: "ok",
    ctaLabel: "Otevřít",
    photoUrl: photos.reporting,
    photoAlt: "Dashboard s provozními reporty",
  },
  {
    id: "zakazky-projekty",
    name: "Zakázky & projekty",
    subtitle: "Milníky a práce techniků",
    description: "Plánování zakázek, milníků, kapacit techniků a návaznosti na revize.",
    status: "available",
    accentColor: "violet",
    icon: "□",
    section: "Růst & řízení",
    ctaLabel: "Zapnout",
    healthStatus: "empty",
    photoUrl: photos.projekty,
    photoAlt: "Plánování technické zakázky nad projektem",
  },
  {
    id: "dotace",
    name: "Dotace",
    subtitle: "Žádosti, rozpočty a lhůty",
    description: "Evidence dotačních žádostí, rozpočtů, termínů a povinných příloh.",
    status: "locked",
    accentColor: "violet",
    icon: "◆",
    section: "Růst & řízení",
    ctaLabel: "Upgradovat",
    lockedPlan: "Plán Pro",
    healthStatus: "empty",
    photoUrl: photos.dotace,
    photoAlt: "Administrativní dokumenty k žádosti",
  },
];

const activationMetrics = {
  fakturace: [
    { label: "čeká k vystavení", value: "6" },
    { label: "stav napojení", value: "OK" },
  ],
  "vozovy-park": [
    { label: "vozidel", value: "4" },
    { label: "STK do 30 dní", value: "1", warning: true },
  ],
  "zakazky-projekty": [
    { label: "aktivních zakázek", value: "9" },
    { label: "milníky dnes", value: "2" },
  ],
};

const statusLabel = {
  active: "Zapnuto",
  available: "K zapnutí",
  locked: "Plán Pro",
};

const healthLabel = {
  ok: "V pořádku",
  warning: "Pozor",
  alert: "Řešit dnes",
  empty: "Bez dat",
};

const state = {
  modules: modules.map((module) => ({
    ...module,
    metrics: module.metrics ? module.metrics.map((metric) => ({ ...metric })) : undefined,
  })),
  filter: "all",
  search: "",
  toastTimer: undefined,
};

const body = document.body;
const moduleSections = document.querySelector("#moduleSections");
const emptyState = document.querySelector("#emptyState");
const activeModuleCount = document.querySelector("#activeModuleCount");
const availableModuleCount = document.querySelector("#availableModuleCount");
const moduleSearch = document.querySelector("#moduleSearch");
const toast = document.querySelector("#toast");
const screenTitle = document.querySelector("#screenTitle");
const sidebar = document.querySelector("#sidebar");
const mobileMenu = document.querySelector("#mobileMenu");
const mobileScrim = document.querySelector("#mobileScrim");
const densityToggle = document.querySelector("#densityToggle");
const editModules = document.querySelector("#editModules");
const drawer = document.querySelector("#settingsDrawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");
const drawerClose = document.querySelector("#drawerClose");
const drawerCancel = document.querySelector("#drawerCancel");
const drawerSave = document.querySelector("#drawerSave");
const drawerIcon = document.querySelector("#drawerIcon");
const drawerStatus = document.querySelector("#drawerStatus");
const drawerTitle = document.querySelector("#drawerTitle");
const drawerPhoto = document.querySelector("#drawerPhoto");
const drawerSubtitle = document.querySelector("#drawerSubtitle");
const drawerDescription = document.querySelector("#drawerDescription");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[char];
  });
}

function normalize(value) {
  return String(value ?? "")
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function moduleMatches(module) {
  const matchesStatus = state.filter === "all" || module.status === state.filter;
  if (!matchesStatus) return false;

  const query = normalize(state.search.trim());
  if (!query) return true;

  const haystack = normalize([
    module.name,
    module.subtitle,
    module.description,
    module.section,
    module.status,
  ].join(" "));

  return haystack.includes(query);
}

function updateSummaryCounts() {
  const activeCount = state.modules.filter((module) => module.status === "active").length;
  const availableCount = state.modules.filter((module) => module.status === "available").length;

  activeModuleCount.textContent = String(activeCount);
  availableModuleCount.textContent = String(availableCount);
}

function metricTemplate(metric) {
  const tone = metric.alert ? " is-alert" : metric.warning ? " is-warning" : "";
  return `
    <div class="metric-card${tone}">
      <strong>${escapeHtml(metric.value)}</strong>
      <span>${escapeHtml(metric.label)}</span>
    </div>
  `;
}

function moduleBodyTemplate(module) {
  if (module.status === "active" && module.metrics?.length) {
    return `<div class="metric-grid">${module.metrics.map(metricTemplate).join("")}</div>`;
  }

  if (module.status === "locked") {
    return `<div class="module-note">${escapeHtml(module.lockedPlan ?? "Vyšší plán")} odemkne pokročilé řízení a termíny.</div>`;
  }

  if (module.status === "available") {
    return `<div class="module-note">Modul lze zapnout později bez změny každodenní navigace.</div>`;
  }

  return `<div class="module-note">Modul je zapnutý a připravený pro pracovní plochu.</div>`;
}

function moduleCtaTemplate(module) {
  if (module.status === "active") {
    return `<button class="module-cta module-cta--open" type="button" data-action="open" data-module-id="${escapeHtml(module.id)}">${escapeHtml(module.ctaLabel)} →</button>`;
  }

  if (module.status === "available") {
    return `<button class="module-cta module-cta--enable" type="button" data-action="enable" data-module-id="${escapeHtml(module.id)}">+ ${escapeHtml(module.ctaLabel)}</button>`;
  }

  return `<button class="module-cta module-cta--upgrade" type="button" data-action="upgrade" data-module-id="${escapeHtml(module.id)}">🔒 ${escapeHtml(module.ctaLabel)}</button>`;
}

function moduleCardTemplate(module, index) {
  const health = module.healthStatus ?? "empty";
  const settingsButton = module.status === "active"
    ? `<button class="settings-trigger" type="button" data-action="settings" data-module-id="${escapeHtml(module.id)}" aria-label="Nastavení modulu ${escapeHtml(module.name)}">⚙</button>`
    : "";

  return `
    <article class="module-card accent-${escapeHtml(module.accentColor)}" data-module-card="${escapeHtml(module.id)}" data-status="${escapeHtml(module.status)}" style="--delay:${index * 45}ms">
      <div class="module-card__media">
        <img src="${escapeHtml(module.photoUrl)}" alt="${escapeHtml(module.photoAlt)}" loading="lazy" />
        <div class="module-card__top">
          <div class="module-card__badges">
            <span class="module-icon" aria-hidden="true">${escapeHtml(module.icon)}</span>
            <span class="status-pill">${escapeHtml(statusLabel[module.status])}</span>
          </div>
          ${settingsButton}
        </div>
      </div>

      <div class="module-card__body">
        <h4>${escapeHtml(module.name)}</h4>
        <p class="module-subtitle">${escapeHtml(module.subtitle)}</p>
        <p class="module-description">${escapeHtml(module.description)}</p>
        ${moduleBodyTemplate(module)}

        <div class="module-card__footer">
          ${moduleCtaTemplate(module)}
          <span class="health-text"><i class="health-dot health-dot--${escapeHtml(health)}"></i>${escapeHtml(healthLabel[health])}</span>
        </div>
      </div>
      <div class="health-bar health-bar--${escapeHtml(health)}" aria-hidden="true"></div>
    </article>
  `;
}

function renderModules() {
  let visibleCount = 0;

  const sectionsMarkup = sectionOrder
    .map((section) => {
      const sectionModules = state.modules.filter((module) => module.section === section && moduleMatches(module));
      if (sectionModules.length === 0) return "";

      visibleCount += sectionModules.length;
      return `
        <section class="module-section">
          <div class="module-section__title">
            <h3>${escapeHtml(section)}</h3>
            <span>${sectionModules.length}</span>
          </div>
          <div class="module-grid">
            ${sectionModules.map(moduleCardTemplate).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  moduleSections.innerHTML = sectionsMarkup;
  emptyState.hidden = visibleCount > 0;
  updateSummaryCounts();
}

function findModule(moduleId) {
  return state.modules.find((module) => module.id === moduleId);
}

function setActiveNavigation(label) {
  document.querySelectorAll(".nav-item[data-nav]").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.nav === label);
  });

  document.querySelectorAll("[data-mobile-nav]").forEach((item) => {
    const mobileLabel = item.dataset.mobileNav;
    const isActive = mobileLabel === label || (mobileLabel === "Moduly" && label === "Moduly");
    item.classList.toggle("is-active", isActive);
  });

  if (label !== "Moduly") {
    screenTitle.textContent = label;
  }
}

function scrollToModule(moduleId) {
  state.filter = "all";
  state.search = "";
  moduleSearch.value = "";
  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === "all");
  });
  renderModules();

  window.requestAnimationFrame(() => {
    const card = document.querySelector(`[data-module-card="${moduleId}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (card) {
      card.animate(
        [
          { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)" },
          { boxShadow: "0 0 0 8px rgba(14, 165, 233, 0.18)" },
          { boxShadow: "0 0 0 0 rgba(14, 165, 233, 0)" },
        ],
        { duration: 900, easing: "ease-out" }
      );
    }
  });
}

function openSettings(module) {
  if (!module) return;

  drawerIcon.className = `drawer-title__icon accent-${module.accentColor}`;
  drawerIcon.textContent = module.icon;
  drawerStatus.textContent = `${statusLabel[module.status]} · Nastavení modulu`;
  drawerTitle.textContent = module.name;
  drawerPhoto.src = module.photoUrl;
  drawerPhoto.alt = module.photoAlt;
  drawerSubtitle.textContent = module.subtitle;
  drawerDescription.textContent = module.description;

  body.classList.add("drawer-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
}

function enableModule(moduleId) {
  const module = findModule(moduleId);
  if (!module || module.status !== "available") return;

  module.status = "active";
  module.healthStatus = "ok";
  module.ctaLabel = "Otevřít";
  module.metrics = activationMetrics[moduleId] || [
    { label: "stav modulu", value: "OK" },
    { label: "workflow", value: "Nový" },
  ];

  renderModules();
  showToast(`Modul „${module.name}“ je zapnutý a přidaný na pracovní plochu.`);
  scrollToModule(moduleId);
}

function openModule(moduleId) {
  const module = findModule(moduleId);
  if (!module) return;
  showToast(`Otevírám ${module.name}. V reálné aplikaci by následovala sekundární navigace modulu.`);
}

function upgradeModule(moduleId) {
  const module = findModule(moduleId);
  if (!module) return;
  showToast(`${module.name}: připraveno pro ${module.lockedPlan ?? "vyšší plán"}.`);
}

function closeMobileSidebar() {
  body.classList.remove("sidebar-open");
}

moduleSections.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-action][data-module-id]");
  if (!trigger) return;

  const moduleId = trigger.dataset.moduleId;
  const action = trigger.dataset.action;
  const module = findModule(moduleId);

  if (action === "settings") openSettings(module);
  if (action === "enable") enableModule(moduleId);
  if (action === "open") openModule(moduleId);
  if (action === "upgrade") upgradeModule(moduleId);
});

document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle("is-active", chip === button);
    });
    renderModules();
  });
});

moduleSearch.addEventListener("input", () => {
  state.search = moduleSearch.value;
  renderModules();
});

document.querySelectorAll(".nav-item[data-nav]").forEach((item) => {
  item.addEventListener("click", () => {
    setActiveNavigation(item.dataset.nav);
    closeMobileSidebar();
  });
});

document.querySelectorAll("[data-mobile-nav]").forEach((item) => {
  item.addEventListener("click", () => {
    const label = item.dataset.mobileNav;
    if (label === "Moduly") {
      setActiveNavigation("Moduly");
      document.querySelector(".module-header")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setActiveNavigation(label);
    if (label === "Revize & zařízení") scrollToModule("revize");
  });
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => showToast(button.dataset.toast));
});

document.querySelectorAll("[data-priority]").forEach((button) => {
  button.addEventListener("click", () => {
    const moduleId = button.dataset.priority;
    const module = findModule(moduleId);
    if (!module) return;
    scrollToModule(moduleId);
    showToast(`Priorita dne směřuje do modulu „${module.name}“.`);
  });
});

mobileMenu.addEventListener("click", () => body.classList.add("sidebar-open"));
mobileScrim.addEventListener("click", closeMobileSidebar);

densityToggle.addEventListener("click", () => {
  const compact = body.classList.toggle("compact");
  densityToggle.textContent = compact ? "Komfortní režim" : "Kompaktní režim";
  showToast(compact ? "Modulové karty jsou kompaktnější." : "Modulové karty jsou zpět v komfortním režimu.");
});

editModules.addEventListener("click", () => {
  const editing = body.classList.toggle("edit-mode");
  editModules.textContent = editing ? "Hotovo" : "Upravit moduly";
  showToast(editing ? "Režim úprav zapnutý: karty jsou připravené k přeuspořádání." : "Rozložení pracovní plochy uloženo.");
});

[drawerBackdrop, drawerClose, drawerCancel].forEach((element) => {
  element.addEventListener("click", closeSettings);
});

drawerSave.addEventListener("click", () => {
  closeSettings();
  showToast("Nastavení modulu bylo uloženo.");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileSidebar();
    closeSettings();
  }
});

renderModules();
