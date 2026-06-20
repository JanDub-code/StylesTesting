const body = document.body;
const rows = Array.from(document.querySelectorAll('.deadline-row'));
const tabs = Array.from(document.querySelectorAll('.ledger-tabs__tab'));
const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
const overdueToggle = document.getElementById('only-overdue');
const filterNote = document.getElementById('filter-note');
const detailPanel = document.querySelector('[data-detail-panel]');
const panelBackdrop = document.querySelector('[data-panel-backdrop]');
const closeButtons = Array.from(document.querySelectorAll('[data-close-panel]'));
const markClosedButton = document.querySelector('[data-mark-closed]');
const burst = document.querySelector('[data-stamp-burst]');
const auditLog = document.getElementById('audit-log');
const navLinks = Array.from(document.querySelectorAll('.folder-tabs__item'));
const appShell = document.querySelector('.ledger-shell');

let activeRow = null;
let returnFocusTo = null;
let closeTimer = 0;

const statusMeta = {
  signature: { label: 'K PODPISU', className: 'stamp--gold', audit: 'předán k podpisu' },
  warning: { label: 'K PODPISU', className: 'stamp--gold', audit: 'čeká na podpis' },
  review: { label: 'V KONTROLE', className: 'stamp--blue', audit: 'předán ke kontrole' },
  closed: { label: 'UZAVŘENO', className: 'stamp--green', audit: 'uzavřen' },
  overdue: { label: 'PO LHŮTĚ', className: 'stamp--red', audit: 'označen jako po lhůtě' },
};

function metaFor(status) {
  return statusMeta[status] || statusMeta.review;
}

function setStamp(stamp, status, labelOverride = '') {
  const meta = metaFor(status);
  stamp.className = `stamp ${meta.className}`;
  stamp.textContent = labelOverride || meta.label;
}

function nowLabel() {
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function addAudit(message) {
  if (!auditLog) return;

  const item = document.createElement('li');
  const time = document.createElement('time');
  const text = document.createElement('span');
  time.textContent = nowLabel();
  text.textContent = message;
  item.append(time, text);
  auditLog.prepend(item);

  while (auditLog.children.length > 6) {
    auditLog.lastElementChild.remove();
  }
}

function updateNavActive(hash) {
  const targetHash = hash || '#overview';
  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === targetHash);
  });
}

function isVisibleElement(element) {
  return Boolean(element && !element.hidden && element.getClientRects().length);
}

function restoreFocus() {
  const target = isVisibleElement(returnFocusTo)
    ? returnFocusTo
    : rows.find(isVisibleElement) || overdueToggle || tabs.find((tab) => tab.classList.contains('is-active'));

  if (target && typeof target.focus === 'function') {
    target.focus({ preventScroll: true });
  }
}

function setActiveTab(button) {
  const panelId = button.dataset.tabTarget;

  tabs.forEach((tab) => {
    const selected = tab === button;
    tab.classList.toggle('is-active', selected);
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const selected = panel.id === panelId;
    panel.classList.toggle('is-active', selected);
    panel.hidden = !selected;
  });
}

function applyFilter() {
  const onlyOverdue = Boolean(overdueToggle?.checked);
  let visible = 0;

  rows.forEach((row) => {
    const isOverdue = row.dataset.overdue === 'true';
    const show = !onlyOverdue || isOverdue;
    row.hidden = !show;
    if (show) visible += 1;
  });

  if (filterNote) {
    filterNote.textContent = onlyOverdue
      ? `Zobrazeno ${visible} záznamů po lhůtě.`
      : 'Zobrazeny jsou všechny lhůty spisu.';
  }
}

function renderChecklist(row) {
  const list = detailPanel.querySelector('[data-detail-checks]');
  list.replaceChildren();

  row.dataset.checks.split('|').forEach((check) => {
    const item = document.createElement('li');
    const input = document.createElement('input');
    const label = document.createElement('span');
    input.type = 'checkbox';
    input.checked = row.dataset.status === 'closed';
    input.setAttribute('aria-label', check);
    label.textContent = check;
    item.append(input, label);
    list.append(item);
  });
}

function fillDetail(row) {
  detailPanel.querySelector('[data-detail-ref]').textContent = row.dataset.ref;
  detailPanel.querySelector('[data-detail-title]').textContent = row.dataset.title;
  detailPanel.querySelector('[data-detail-domain]').textContent = row.dataset.domain;
  detailPanel.querySelector('[data-detail-date]').textContent = row.dataset.date;
  detailPanel.querySelector('[data-detail-owner]').textContent = row.dataset.owner;

  const visibleStamp = row.querySelector('.stamp');
  setStamp(detailPanel.querySelector('[data-detail-stamp]'), row.dataset.status, visibleStamp?.textContent.trim());
  renderChecklist(row);
}

function openDetail(row) {
  window.clearTimeout(closeTimer);
  activeRow = row;
  returnFocusTo = document.activeElement;
  fillDetail(row);
  detailPanel.hidden = false;
  detailPanel.inert = false;
  panelBackdrop.hidden = false;
  detailPanel.setAttribute('aria-hidden', 'false');
  appShell.inert = true;
  requestAnimationFrame(() => body.classList.add('detail-open'));
  detailPanel.querySelector('[data-close-panel]').focus({ preventScroll: true });
}

function closeDetail() {
  body.classList.remove('detail-open');
  detailPanel.setAttribute('aria-hidden', 'true');
  appShell.inert = false;
  restoreFocus();
  detailPanel.inert = true;
  window.clearTimeout(closeTimer);
  closeTimer = window.setTimeout(() => {
    panelBackdrop.hidden = true;
    detailPanel.hidden = true;
  }, 220);
  activeRow = null;
  returnFocusTo = null;
}

function setRowStatus(row, status) {
  const rowStamp = row.querySelector('.stamp');
  row.dataset.status = status;
  row.dataset.statusLabel = status === 'closed' ? 'Uzavřeno' : metaFor(status).label;
  row.dataset.overdue = String(status === 'overdue');
  setStamp(rowStamp, status);

  if (activeRow === row) {
    setStamp(detailPanel.querySelector('[data-detail-stamp]'), status);
    renderChecklist(row);
  }

  applyFilter();
}

function markActiveClosed() {
  if (!activeRow) return;

  setRowStatus(activeRow, 'closed');
  addAudit(`${activeRow.dataset.ref} uzavřeno z pravého listu spisu.`);
  burst.classList.remove('is-active');
  void burst.offsetWidth;
  burst.classList.add('is-active');
}

function updateDocumentStatus(select) {
  const card = select.closest('[data-document-card]');
  const stamp = card?.querySelector('[data-doc-stamp]');
  const ref = card?.querySelector('.document-slip__ref')?.textContent.trim();
  if (!card || !stamp) return;

  const status = select.value;
  setStamp(stamp, status);
  addAudit(`${ref} ${metaFor(status).audit}.`);
}

tabs.forEach((tab, index) => {
  tab.id ||= `ledger-tab-${index}`;
  tab.setAttribute('aria-controls', tab.dataset.tabTarget);
  tab.tabIndex = tab.classList.contains('is-active') ? 0 : -1;
  const panel = document.getElementById(tab.dataset.tabTarget);
  if (panel) panel.setAttribute('aria-labelledby', tab.id);

  tab.addEventListener('click', () => setActiveTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;

    tabs[nextIndex].focus();
    setActiveTab(tabs[nextIndex]);
  });
});

rows.forEach((row) => row.addEventListener('click', () => openDetail(row)));
overdueToggle?.addEventListener('change', applyFilter);
closeButtons.forEach((button) => button.addEventListener('click', closeDetail));
panelBackdrop?.addEventListener('click', closeDetail);
markClosedButton?.addEventListener('click', markActiveClosed);

document.querySelectorAll('[data-status-select]').forEach((select) => {
  select.addEventListener('change', () => updateDocumentStatus(select));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => updateNavActive(link.getAttribute('href')));
});

window.addEventListener('hashchange', () => updateNavActive(window.location.hash));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && body.classList.contains('detail-open')) closeDetail();
});

applyFilter();
updateNavActive(window.location.hash);
