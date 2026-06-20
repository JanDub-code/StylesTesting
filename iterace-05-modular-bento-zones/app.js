(() => {
  const zoneConfig = {
    revize: {
      label: "Revize & zařízení",
      short: "Revize",
      meta: "12 aktivních revizí",
      count: "12",
      status: "3 urgentní",
      description: "Přehled zařízení, revizních lhůt, techniků a urgentních protokolů."
    },
    skoleni: {
      label: "Školení elektro",
      short: "Školení",
      meta: "7 techniků v běhu",
      count: "7",
      status: "4 expirace",
      description: "Termíny školení, certifikáty, expirace a potvrzení účasti pro elektro tým."
    },
    bozp: {
      label: "BOZP",
      short: "BOZP",
      meta: "5 incidentů",
      count: "5",
      status: "1 nové hlášení",
      description: "Incidenty, nápravná opatření a bezpečnostní checklisty pro provozy."
    },
    lide: {
      label: "Lidé & smlouvy",
      short: "Lidé",
      meta: "3 podpisové kroky",
      count: "3",
      status: "2 nástupy",
      description: "Osoby, smlouvy, role, dodavatelé a podpisy bez dlouhého menu."
    },
    dokumenty: {
      label: "GDPR & dokumenty",
      short: "Dokumenty",
      meta: "94 % compliance",
      count: "94 %",
      status: "6 změn v registru",
      description: "GDPR registr, řízené dokumenty, auditní stopa a přístupy k citlivým datům."
    },
    finance: {
      label: "Finance",
      short: "Finance",
      meta: "3 fakturační fronty",
      count: "3",
      status: "1 kontrola nákladů",
      description: "Fakturace revizí, podklady zakázek a přehled nákladů bez samostatného sidebaru."
    },
    reporting: {
      label: "Reporting",
      short: "Reporting",
      meta: "3 reporty připravené",
      count: "3",
      status: "1 čeká na export",
      description: "Manažerské reporty, trendy dokončení a compliance insighty v jednom pohledu."
    }
  };

  const zoneClassMap = {
    revize: "zone-revize",
    skoleni: "zone-skoleni",
    bozp: "zone-bozp",
    lide: "zone-lide",
    dokumenty: "zone-compliance",
    finance: "zone-finance",
    reporting: "zone-reporting"
  };

  const zoneClasses = Object.values(zoneClassMap);
  const body = document.body;
  const appShell = document.querySelector(".app-shell");
  const mobileBar = document.querySelector(".mobile-bar");
  const grid = document.getElementById("bentoGrid");
  const launcher = document.getElementById("moduleLauncher");
  const toast = document.getElementById("toast");
  const editBanner = document.getElementById("editBanner");
  const editLayoutButton = document.getElementById("editLayout");
  const densityToggle = document.getElementById("densityToggle");
  const quickAction = document.getElementById("quickAction");
  const activeZonePill = document.getElementById("activeZonePill");
  const areaDetailTitle = document.getElementById("areaDetailTitle");
  const areaDetailMeta = document.getElementById("areaDetailMeta");
  const focusZoneTitle = document.getElementById("focusZoneTitle");
  const focusZoneDescription = document.getElementById("focusZoneDescription");
  const focusZoneCount = document.getElementById("focusZoneCount");
  const focusZoneStatus = document.getElementById("focusZoneStatus");
  const focusCard = document.querySelector(".focus-card");
  const zonesCard = document.querySelector(".zones-card");
  const moduleStates = new Map();
  const moduleMeta = new Map();
  let toastTimer = 0;
  let launcherCloseTimer = 0;
  let lastFocusedElement = null;

  function setVisualZoneClass(element, zone) {
    if (!element) return;
    element.classList.remove(...zoneClasses);
    element.classList.add(zoneClassMap[zone] || "zone-revize");
    element.dataset.zone = zone;
  }

  function setActiveZone(zone, options = {}) {
    const config = zoneConfig[zone];
    if (!config) return;

    body.dataset.activeZone = zone;

    document.querySelectorAll(".area-button").forEach((button) => {
      const isActive = button.dataset.zone === zone;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    document.querySelectorAll(".mobile-zone-button, .zone-tile").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.zone === zone);
    });

    setVisualZoneClass(focusCard, zone);
    setVisualZoneClass(zonesCard, zone);

    document.querySelectorAll(".bento-card[data-zone]").forEach((card) => {
      card.classList.toggle("is-zone-active", card.dataset.zone === zone);
    });

    activeZonePill.textContent = `Zóna ${config.label}`;
    areaDetailTitle.textContent = config.label;
    areaDetailMeta.textContent = config.meta;
    focusZoneTitle.textContent = config.label;
    focusZoneDescription.textContent = config.description;
    focusZoneCount.textContent = config.count;
    focusZoneStatus.textContent = config.status;

    if (options.announce) {
      showToast(`Aktivní zóna: ${config.label}`);
    }
  }

  function setElementInert(element, inert) {
    if (!element) return;
    element.inert = inert;
    if (inert) {
      element.setAttribute("inert", "");
    } else {
      element.removeAttribute("inert");
    }
  }

  function isLauncherOpen() {
    return launcher.classList.contains("is-open");
  }

  function openLauncher() {
    if (isLauncherOpen()) return;
    window.clearTimeout(launcherCloseTimer);
    lastFocusedElement = document.activeElement;
    launcher.hidden = false;
    setElementInert(launcher, false);
    setElementInert(appShell, true);
    setElementInert(mobileBar, true);
    launcher.setAttribute("aria-hidden", "false");
    document.querySelectorAll("[data-open-launcher]").forEach((button) => {
      button.setAttribute("aria-expanded", "true");
    });
    document.body.classList.add("launcher-open");

    window.requestAnimationFrame(() => {
      launcher.classList.add("is-open");
      launcher.querySelector(".close-button")?.focus({ preventScroll: true });
    });
  }

  function closeLauncher() {
    if (!isLauncherOpen()) return;
    launcher.classList.remove("is-open");
    launcher.setAttribute("aria-hidden", "true");
    setElementInert(launcher, true);
    setElementInert(appShell, false);
    setElementInert(mobileBar, false);
    document.querySelectorAll("[data-open-launcher]").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
    document.body.classList.remove("launcher-open");

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }

    window.clearTimeout(launcherCloseTimer);
    launcherCloseTimer = window.setTimeout(() => {
      if (!isLauncherOpen()) launcher.hidden = true;
    }, 220);
  }

  function statusCopy(status) {
    if (status === "active") return { state: "Aktivní", action: "Otevřít" };
    if (status === "locked") return { state: "Zamčený", action: "Žádat přístup" };
    return { state: "Dostupný", action: "Zapnout" };
  }

  function syncModuleState(moduleId) {
    const status = moduleStates.get(moduleId) || "available";
    const copy = statusCopy(status);

    document.querySelectorAll(`[data-module="${moduleId}"]`).forEach((element) => {
      if (element.classList.contains("module-card")) {
        element.dataset.status = status;
        element.querySelector(".module-state").textContent = copy.state;
        element.querySelector(".module-action").textContent = copy.action;
      }

      if (element.classList.contains("module-toggle")) {
        element.textContent = status === "active" ? "Aktivní" : copy.action;
        element.classList.toggle("is-active", status === "active");
        element.setAttribute("aria-pressed", status === "active" ? "true" : "false");
      }
    });
  }

  function handleModuleSelection(moduleId) {
    const meta = moduleMeta.get(moduleId);
    if (!meta) return;

    const currentStatus = moduleStates.get(moduleId) || "available";
    setActiveZone(meta.zone);

    if (currentStatus === "locked") {
      closeLauncher();
      showToast(`Modul ${meta.title} je zamčený. V prototypu se jen zvýraznila zóna ${zoneConfig[meta.zone].short}.`);
      return;
    }

    if (currentStatus === "available") {
      moduleStates.set(moduleId, "active");
      syncModuleState(moduleId);
      closeLauncher();
      showToast(`Modul ${meta.title} zapnut. Zóna ${zoneConfig[meta.zone].short} je aktivní.`);
      return;
    }

    closeLauncher();
    showToast(`Otevřen modul ${meta.title}. Zóna ${zoneConfig[meta.zone].short} je zvýrazněná.`);
  }

  function setDensity(compact) {
    body.dataset.density = compact ? "compact" : "comfortable";
    densityToggle.setAttribute("aria-pressed", compact ? "true" : "false");
    densityToggle.textContent = compact ? "Pohodlná mřížka" : "Kompaktní mřížka";
    showToast(compact ? "Zapnut kompaktní bento grid." : "Zapnut pohodlný bento grid.");
  }

  function setEditMode(enabled) {
    body.classList.toggle("is-editing", enabled);
    grid.classList.toggle("layout-remix", enabled);
    editBanner.hidden = !enabled;
    editLayoutButton.setAttribute("aria-pressed", enabled ? "true" : "false");
    editLayoutButton.textContent = enabled ? "Hotovo" : "Upravit plochu";

    showToast(
      enabled
        ? "Fake režim úprav: pořadí a velikosti bento karet se změnily."
        : "Režim úprav ukončen."
    );
  }

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  document.querySelectorAll("[data-open-launcher]").forEach((button) => {
    button.addEventListener("click", openLauncher);
  });

  document.querySelectorAll("[data-close-launcher]").forEach((button) => {
    button.addEventListener("click", closeLauncher);
  });

  document.querySelectorAll(".area-button, .zone-tile, .mobile-zone-button, [data-focus-zone]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveZone(button.dataset.zone, { announce: true });
    });
  });

  document.querySelectorAll(".module-card[data-module]").forEach((card) => {
    const moduleId = card.dataset.module;
    const title = card.querySelector(".module-title")?.textContent.trim() || moduleId;
    moduleStates.set(moduleId, card.dataset.status || "available");
    moduleMeta.set(moduleId, {
      title,
      zone: card.dataset.zone || "revize"
    });

    card.addEventListener("click", () => handleModuleSelection(moduleId));
  });

  document.querySelectorAll(".module-toggle[data-module]").forEach((button) => {
    const moduleId = button.dataset.module;
    button.addEventListener("click", () => handleModuleSelection(moduleId));
  });

  moduleStates.forEach((_, moduleId) => syncModuleState(moduleId));

  densityToggle.addEventListener("click", () => {
    setDensity(body.dataset.density !== "compact");
  });

  editLayoutButton.addEventListener("click", () => {
    setEditMode(!body.classList.contains("is-editing"));
  });

  quickAction.addEventListener("click", () => {
    showToast("Rychlá akce: v reálné aplikaci by se otevřel command dialog.");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isLauncherOpen()) {
      closeLauncher();
    }
  });

  setActiveZone(body.dataset.activeZone || "revize");
})();
