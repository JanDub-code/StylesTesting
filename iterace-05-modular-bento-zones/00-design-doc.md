# Iterace 05 — Modular Bento Zones

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Doporučené budoucí soubory prototypu:

- `index.html`
- `styles.css`
- `app.js`
- případně `assets/` jen pro lokální placeholdery

## Základní idea

Revizní systém jako **modulární pracovní plocha** s výrazně barevnými zónami. Tato iterace navazuje na myšlenku modulového workspace z existujícího prototypu, ale dělá ji odvážnější: bento layout, výrazné bloky, méně klasický sidebar, více “produktová domovská obrazovka”.

Vhodné pro ověření otázky:

> Může aplikace působit jako moderní modulární operační systém firmy, ne jako strom položek v menu?

## Vizuální charakter

- Bento grid s různě velkými kartami.
- Barevné pracovní zóny podle domény.
- Hlavní dashboard je osobní/firmní cockpit.
- Navigace je spíš launcher než trvalý seznam.
- Více vizuální energie než Iterace 02, méně technické tvrdosti než Iterace 01.

### Paleta

- Background: `#F3F4F8`
- Deep text: `#0F172A`
- Card base: `#FFFFFF`
- Revize zone: `#0EA5E9`
- Školení zone: `#14B8A6`
- HR/smlouvy zone: `#8B5CF6`
- Finance zone: `#F59E0B`
- Compliance zone: `#334155`
- Danger: `#EF4444`
- Soft gradients: použít velmi jemně, ne přes text.

### Rohy a ořezávání

Tato iterace má testovat **asymetrické radiusy** a hravější karty.

- Bento karty: `border-radius: 28px`.
- Některé dominantní karty: `border-radius: 36px 18px 36px 18px`.
- Alert karty mohou mít diagonální barevný roh.
- Module launcher může používat kruhové/pill prvky.

Možný CSS princip:

```css
.bento-card {
  border-radius: 32px 18px 32px 18px;
}
.zone-alert {
  background:
    linear-gradient(135deg, rgba(239,68,68,.18) 0 22%, transparent 22%),
    #fff;
}
```

## Layout

### Shell

- Minimalizovat klasický sidebar.
- Vlevo jen **floating area switcher**:
  - ikonové zóny Revize, Lidé, Dokumenty, Finance, Reporting.
  - tooltip/label při hoveru.
  - aktivní zóna se rozbalí do malého panelu.
- Alternativně top-left “launcher” tlačítko otevře full overlay s moduly.

### Header

- Top command bar:
  - globální vyhledávání,
  - tenant/firma,
  - `+` rychlá akce,
  - command palette hint.
- Header má být součástí plochy, ne tvrdý horizontální pruh.

### Dashboard

Dashboard je bento pracovní plocha:

1. **Hero bento karta**
   - “Co dnes řešit”
   - velké číslo urgentních položek
   - CTA podle priority

2. **Mini calendar / today timeline**
   - vertikální nebo horizontální karta.

3. **Module zones**
   - Revize & zařízení
   - Školení elektro
   - BOZP
   - Lidé & smlouvy
   - GDPR
   - Reporting
   Každá zóna má barvu, ikonu, počet věcí a stav.

4. **Work queue**
   - bento karta se seznamem “čeká na mě”.

5. **Insight card**
   - “Tento týden +18 % dokončených revizí” nebo compliance skóre.

6. **Marketplace / dostupné moduly**
   - menší karta, ne hlavní navigace.

## Side panel / launcher

Místo běžného side panelu testovat **module launcher overlay**:

- stisk `Všechny moduly`,
- overlay přes 80 % viewportu,
- karty modulů rozdělené podle zón,
- každý modul může být `aktivní`, `dostupný`, `zamčený`,
- klik na modul zavře overlay a zvýrazní zónu na dashboardu.

## Mikrointerakce pro čistý prototyp

V `app.js` stačí nasimulovat:

- otevření module launcheru,
- přepnutí aktivní zóny,
- drag-like změnu pořadí bento karet jen fake tlačítkem `Upravit plochu`,
- přepnutí compact/comfortable gridu,
- změnu stavu modulu `zapnout`.

## Co musí prototyp ukázat

- Desktop 1440 px s bento gridem.
- Tablet 1024 px: grid se přelije na 2 sloupce.
- Mobil 390 px: zóny jako vertikální karty a bottom nav/launcher.
- Launcher overlay s minimálně 10 moduly.
- Výrazně odlišnou navigaci oproti aktuálnímu sidebaru.

## Co neřešit

- Přesnou editaci dashboardu drag-and-drop.
- Reálné ukládání nastavení modulů.
- Datové grafy s knihovnou.
- Kompletní role/RBAC.

## Hodnoticí otázky

- Pomáhá barevné zónování orientaci, nebo vytváří vizuální chaos?
- Je launcher lepší pro široký systém než dlouhý sidebar?
- Cítí se aplikace víc jako moderní modulární platforma?
- Není bento layout příliš marketingový pro každodenní práci?
