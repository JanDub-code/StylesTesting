# Iterace 01 — Industrial Ops Console

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Doporučené budoucí soubory prototypu:

- `index.html`
- `styles.css`
- `app.js`
- případně `assets/` jen pro lokální placeholdery

## Základní idea

Revizní systém jako **provozní velín**. Vizuálně má působit jako nástroj pro firmu, která hlídá rizika, termíny, zásahy a auditní stopu. Směr je technický, sebevědomý, trochu industriální, ale stále čitelný pro kancelář.

Vhodné pro ověření otázky:

> Může Evidence revizí působit jako profesionální operační centrum, ne jako běžný admin panel?

## Vizuální charakter

- Tmavý levý panel, světlá pracovní plocha.
- Vysoký kontrast u kritických metrik.
- Technické akcenty: cyan, amber, red, emerald.
- Kompaktnější typografie, tabulková čísla, pevná hierarchie.
- Mírný “control-room” pocit: statusy, SLA, fronty, alarmy.

### Paleta

- Background aplikace: `#EEF3F8`
- Sidebar: `#070A0F`
- Sidebar secondary: `#101722`
- Card: `#FFFFFF`
- Primary text: `#0B1220`
- Muted text: `#64748B`
- Cyan ops: `#06B6D4`
- Emerald OK: `#10B981`
- Amber warning: `#F59E0B`
- Red danger: `#EF4444`

### Rohy a ořezávání

Tahle iterace se má výrazně odlišit od měkkých SaaS karet. Použít **seříznuté rohy** u velkých panelů a alarmů.

Doporučený CSS princip:

```css
.panel-cut {
  clip-path: polygon(
    0 0,
    calc(100% - 18px) 0,
    100% 18px,
    100% 100%,
    18px 100%,
    0 calc(100% - 18px)
  );
}
```

- Kritické alert karty: výraznější ořez 20–24 px.
- Běžné karty: radius 16 px nebo jemný cut 10–12 px.
- Tlačítka: spíš capsule/rounded 12 px, aby nepůsobila nepohodlně.

## Layout

### Shell

- Persistentní levý panel šířka cca 280 px.
- Uvnitř panelu nahoře znak/štít a název firmy.
- Pod tím status blok “Dnes je potřeba”.
- Navigace ne jako dlouhý strom, ale jako pracovní oblasti:
  - Velín
  - Revize
  - Zařízení
  - Závady
  - Lidé a doklady
  - Finance
  - Reporting
- Dole uživatel, sync stav, případně mini stav systému.

### Top bar

- Nízký, technický, ne moc vysoký.
- Globální hledání jako command input.
- Vpravo notifikace, rychlá akce `+ Nová revize`, stav online.

### Dashboard

Dashboard má být skutečný velín:

1. **Operational status strip**
   - online/offline
   - počet alarmů
   - poslední synchronizace
   - dokončeno dnes

2. **Hlavní fronta rizik**
   - Revize po termínu
   - Zařízení bez platné revize
   - Závady A
   - Chybějící protokoly
   - Expirovaná oprávnění

3. **Dnešní mise**
   - seznam prací techniků s časem, místem, stavem a odpovědnou osobou
   - jasný CTA “otevřít detail”

4. **Mapa/coverage placeholder**
   - tmavší karta s body zakázek nebo jen schematic grid

5. **Modulové zdraví**
   - ne galerie fotek, ale technické health cards: Revize, Školení, Smlouvy, GDPR, Reporting.

## Side panel detail

Vyzkoušet sekundární vysouvací panel zprava:

- po kliknutí na riziko otevře detail fronty,
- nahoře severity,
- střed checklist,
- dole akce: přiřadit, naplánovat, označit jako řešené.

## Mikrointerakce pro čistý prototyp

V `app.js` stačí nasimulovat:

- přepnutí aktivní navigační položky,
- otevření detail draweru,
- collapse sidebaru,
- filtr rizik `vše / po termínu / varování / OK`,
- fake toast po kliknutí na `+ Nová revize`.

## Co musí prototyp ukázat

- První fold dashboardu na desktopu 1440 px.
- Stav mobilu 390 px: sidebar se změní na bottom/status bar nebo offcanvas.
- Alespoň 3 severity stavy.
- Jedna otevřená detailní boční karta.
- Ořezané rohy musí být záměrné a konzistentní, ne náhodný efekt.

## Co neřešit

- Reálná data.
- Reálné routování.
- Přesnou tabulkovou logiku.
- Přihlašování.
- Komponentový systém aplikace.

## Hodnoticí otázky

- Působí systém profesionálně a důvěryhodně pro revizní firmu?
- Neunavuje tmavý sidebar při celodenní práci?
- Jsou alarmy čitelné bez agresivního červeného chaosu?
- Je ořezávání rohů příjemné, nebo působí moc “gamingově”?
