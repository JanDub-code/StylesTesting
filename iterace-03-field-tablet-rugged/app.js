const appShell = document.querySelector('.app-shell');
const body = document.body;

const connectionToggle = document.getElementById('connectionToggle');
const connectionText = document.getElementById('connectionText');
const syncTitle = document.getElementById('syncTitle');
const syncDetail = document.getElementById('syncDetail');
const drawerSyncCount = document.getElementById('drawerSyncCount');
const drawerSyncText = document.getElementById('drawerSyncText');
const forceSyncBtn = document.getElementById('forceSyncBtn');

const touchToggle = document.getElementById('touchToggle');
const drawerTouchToggle = document.getElementById('drawerTouchToggle');

const menuTrigger = document.getElementById('menuTrigger');
const drawer = document.getElementById('toolDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerClose = document.getElementById('drawerClose');

const routeList = document.getElementById('routeList');
const doneCount = document.getElementById('doneCount');
const remainingCount = document.getElementById('remainingCount');
const nextWorkBtn = document.getElementById('nextWorkBtn');

const photoModal = document.getElementById('photoModal');
const defectNote = document.getElementById('defectNote');
const openPhotoModal = document.getElementById('openPhotoModal');
const openPhotoModalSecondary = document.getElementById('openPhotoModalSecondary');
const closePhotoModal = document.getElementById('closePhotoModal');
const cancelPhotoModal = document.getElementById('cancelPhotoModal');
const savePhotoModal = document.getElementById('savePhotoModal');

let online = true;
let unsentChanges = 0;
let currentStop = 1;
let drawerCloseTimer = 0;
let modalCloseTimer = 0;

function formatChangeCount(count) {
  const label = count === 1 ? 'změna' : (count > 1 && count < 5 ? 'změny' : 'změn');
  return `${count} ${label}`;
}

const stops = Array.from(document.querySelectorAll('.route-stop')).map((element, index) => ({
  element,
  index,
  baseMeta: element.querySelector('.stop-meta').textContent,
  done: element.classList.contains('done'),
}));

function setView(viewName) {
  appShell.dataset.view = viewName;

  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('view-active', view.id === `view-${viewName}`);
  });

  document.querySelectorAll('.command-item[data-target]').forEach((button) => {
    const isActive = button.dataset.target === viewName;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderSyncState(messageOverride = '') {
  connectionToggle.classList.toggle('offline', !online);
  connectionToggle.classList.toggle('online', online);
  connectionToggle.setAttribute('aria-pressed', String(online));
  connectionText.textContent = online ? 'Online' : 'Offline';
  body.classList.toggle('is-offline', !online);

  if (!online) {
    syncTitle.textContent = 'Offline režim aktivní';
    syncDetail.textContent = messageOverride || `${formatChangeCount(unsentChanges)} neodesláno · poslední sync 08:42.`;
    drawerSyncCount.textContent = formatChangeCount(unsentChanges);
    drawerSyncText.textContent = 'Čeká na signál, vše se ukládá lokálně.';
    return;
  }

  if (unsentChanges > 0) {
    syncTitle.textContent = `${formatChangeCount(unsentChanges)} čeká na sync`;
    syncDetail.textContent = messageOverride || 'Připojení je k dispozici, změny jsou připravené k odeslání.';
    drawerSyncCount.textContent = formatChangeCount(unsentChanges);
    drawerSyncText.textContent = 'Připojeno, frontu lze odeslat.';
    return;
  }

  syncTitle.textContent = 'Vše synchronizováno';
  syncDetail.textContent = messageOverride || 'Poslední sync: 08:42 · lokální balík map připraven.';
  drawerSyncCount.textContent = '0 změn';
  drawerSyncText.textContent = 'Připraveno k práci online';
}

function toggleConnection() {
  online = !online;
  if (!online) {
    unsentChanges = Math.max(unsentChanges, 3);
    renderSyncState(`${formatChangeCount(unsentChanges)} neodesláno · poslední sync 08:42.`);
  } else {
    unsentChanges = 0;
    renderSyncState('Signál obnoven · synchronizováno právě teď.');
  }
}

function forceSync() {
  if (!online) {
    renderSyncState('Sync čeká na signál. Pokračuj v práci offline.');
    return;
  }

  unsentChanges = 0;
  renderSyncState('Synchronizováno právě teď · fronta je prázdná.');
}

function openDrawer() {
  window.clearTimeout(drawerCloseTimer);
  drawerBackdrop.hidden = false;
  drawer.setAttribute('aria-hidden', 'false');
  menuTrigger.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => body.classList.add('drawer-open'));
  drawerClose.focus({ preventScroll: true });
}

function closeDrawer() {
  body.classList.remove('drawer-open');
  menuTrigger.setAttribute('aria-expanded', 'false');
  window.clearTimeout(drawerCloseTimer);
  drawerCloseTimer = window.setTimeout(() => {
    drawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.hidden = true;
  }, 220);
}

function updateTouchLabels() {
  const large = body.classList.contains('touch-large');
  touchToggle.setAttribute('aria-pressed', String(large));
  drawerTouchToggle.setAttribute('aria-pressed', String(large));
  touchToggle.textContent = large ? 'Standardní dotyk' : 'Zvětšit dotyk';
  drawerTouchToggle.textContent = large ? 'Vrátit standardní touch režim' : 'Zvětšit dotykové cíle';
}

function toggleTouchMode() {
  body.classList.toggle('touch-large');
  updateTouchLabels();
}

function renderStops() {
  let doneTotal = 0;

  stops.forEach((stop) => {
    const isCurrent = stop.index === currentStop;
    const meta = stop.element.querySelector('.stop-meta');
    const doneButton = stop.element.querySelector('.stop-done');

    if (stop.done) doneTotal += 1;

    stop.element.classList.toggle('done', stop.done);
    stop.element.classList.toggle('current', isCurrent);
    doneButton.setAttribute('aria-pressed', String(stop.done));
    doneButton.textContent = stop.done ? 'Hotovo' : 'Označit hotovo';

    const waitingMeta = stop.baseMeta.replace('Aktuální · ', 'Čeká · ');
    const currentMeta = waitingMeta.replace('Čeká · ', 'Aktuální · ');

    if (isCurrent && stop.done) {
      meta.textContent = 'Aktuální · hotovo';
    } else if (isCurrent) {
      meta.textContent = currentMeta;
    } else if (stop.done) {
      meta.textContent = 'Dokončeno · odesláno do fronty';
    } else {
      meta.textContent = waitingMeta;
    }
  });

  doneCount.textContent = String(doneTotal);
  remainingCount.textContent = String(stops.length - doneTotal);
}

function setCurrentStop(index) {
  currentStop = index;
  renderStops();
}

function markStopDone(index) {
  const stop = stops[index];
  if (!stop) return;

  if (stop.done) {
    setCurrentStop(index);
    return;
  }

  stop.done = true;
  unsentChanges += 1;

  if (index === currentStop) {
    const nextOpen = stops.find((candidate) => !candidate.done && candidate.index > index)
      || stops.find((candidate) => !candidate.done);
    if (nextOpen) currentStop = nextOpen.index;
  }

  renderStops();
  renderSyncState(online ? `${formatChangeCount(unsentChanges)} čeká na sync po dokončení zastávky.` : `${formatChangeCount(unsentChanges)} neodesláno · práce pokračuje offline.`);
}

function startNextWork() {
  const nextOpen = stops.find((stop) => !stop.done && stop.index >= currentStop)
    || stops.find((stop) => !stop.done);
  if (!nextOpen) {
    nextWorkBtn.textContent = 'Vše hotovo pro dnešek';
    return;
  }

  currentStop = nextOpen.index;
  renderStops();
  document.getElementById('view-today').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openModal() {
  window.clearTimeout(modalCloseTimer);
  photoModal.hidden = false;
  requestAnimationFrame(() => body.classList.add('modal-open'));
  defectNote.focus({ preventScroll: true });
}

function closeModal() {
  body.classList.remove('modal-open');
  window.clearTimeout(modalCloseTimer);
  modalCloseTimer = window.setTimeout(() => {
    photoModal.hidden = true;
  }, 220);
}

function savePhoto() {
  unsentChanges += 1;
  defectNote.value = '';
  renderSyncState(online ? 'Fotka závady je uložená offline a čeká na sync.' : `${formatChangeCount(unsentChanges)} neodesláno · fotka je bezpečně lokálně.`);
  closeModal();
}

connectionToggle.addEventListener('click', toggleConnection);
forceSyncBtn.addEventListener('click', forceSync);

touchToggle.addEventListener('click', toggleTouchMode);
drawerTouchToggle.addEventListener('click', toggleTouchMode);

menuTrigger.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

routeList.addEventListener('click', (event) => {
  const stopElement = event.target.closest('.route-stop');
  if (!stopElement) return;

  const index = Number(stopElement.dataset.stop);

  if (event.target.closest('.stop-done')) {
    markStopDone(index);
    return;
  }

  if (event.target.closest('.stop-select')) {
    setCurrentStop(index);
  }
});

nextWorkBtn.addEventListener('click', startNextWork);

openPhotoModal.addEventListener('click', openModal);
openPhotoModalSecondary.addEventListener('click', openModal);
closePhotoModal.addEventListener('click', closeModal);
cancelPhotoModal.addEventListener('click', closeModal);
savePhotoModal.addEventListener('click', savePhoto);

photoModal.addEventListener('click', (event) => {
  if (event.target === photoModal) closeModal();
});

document.querySelectorAll('.command-item[data-target]').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.target));
});

document.querySelectorAll('[data-drawer-target]').forEach((button) => {
  button.addEventListener('click', () => {
    setView(button.dataset.drawerTarget);
    closeDrawer();
  });
});

document.querySelectorAll('.mode-switch button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mode-switch button').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (body.classList.contains('modal-open')) closeModal();
  if (body.classList.contains('drawer-open')) closeDrawer();
});

renderStops();
renderSyncState();
updateTouchLabels();
