# Iterace 02 — Nordic Service Desk

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Doporučené budoucí soubory prototypu:

- `index.html`
- `styles.css`
- `app.js`
- případně `assets/` jen pro lokální placeholdery

## Základní idea

Revizní firma jako **klidný servisní desk**. Ne velín, ale přehledný moderní provozní systém pro administrátory, techniky a zákaznický servis. Vizuálně má působit čistě, nordicky, vzdušně, méně technicky a méně agresivně než současný admin.

Vhodné pro ověření otázky:

> Může aplikace působit prémiově, klidně a přátelsky, aniž by ztratila provozní jasnost?

## Vizuální charakter

- Světlé pozadí, hodně prostoru.
- Velké měkké karty, jemné stíny.
- Pastelové akcenty místo tvrdých barev.
- Přátelská typografie, méně hutných tabulek v prvním foldu.
- Vizuální důraz na “co dnes vyřídit”, ne na systémové moduly.

### Paleta

- App background: `#F6F8FB`
- Card: `#FFFFFF`
- Soft blue panel: `#EAF3FF`
- Mint panel: `#EAFBF3`
- Sand panel: `#FFF6E6`
- Primary text: `#111827`
- Muted: `#6B7280`
- Primary action: `#2563EB`
- Success: `#059669`
- Warning: `#D97706`
- Danger: `#DC2626`

### Rohy a ořezávání

Tahle iterace nemá používat seříznuté rohy. Má testovat opačný pól: **měkké velké radiusy** a “squircle” dojem.

- Hlavní karty: `border-radius: 28px` až `36px`.
- Menší karty: `20px`.
- Inputy a tlačítka: `16px` až `999px` u pill prvků.
- Žádný clip-path.
- Důraz na jemné okraje a světlý shadow.

## Layout

### Shell

- Levý panel není tmavý blok přes celou výšku.
- Místo toho použít **plovoucí světlý panel** v rámci světlého backgroundu.
- Sidebar šířka cca 260 px, ale s výrazně většími mezerami.
- Navigace může být kratší:
  - Přehled
  - Dnes
  - Revize
  - Zákazníci
  - Lidé
  - Dokumenty
  - Finance
  - Nastavení

### Header

- Header jako bílá pill karta nahoře.
- Vlevo tenant/firma, uprostřed hledání, vpravo notifikace a akce.
- Breadcrumby minimalizovat, nenechat je vizuálně dominovat.

### Dashboard

Dashboard má připomínat servisní frontu:

1. **Welcome / service summary card**
   - “Dobré ráno, co dnes vyřídit”
   - měkký gradient blue → mint
   - 3 hlavní CTA: naplánovat revizi, otevřít dnešní plán, vyřešit upozornění

2. **Dnešní fronta**
   - karty úkolů s avatar/ikonou, termínem, zákazníkem a stavem
   - méně dat na řádek, lepší čitelnost

3. **Klienti a lokace**
   - mapa jen jako abstraktní karta nebo mini list nejaktivnějších zákazníků

4. **Compliance health**
   - kruhové progress prvky nebo soft badges
   - “92 % v pořádku”, “3 věci čekají”

5. **Moduly**
   - ne jako marketplace, ale jako “pracovní oblasti” v horizontálním pásu.

## Side panel detail

V této iteraci nemá být side panel technický drawer, ale **měkký detailní list**:

- bílé pozadí,
- radius vlevo 32 px,
- nahoře avatar zákazníka/modulu,
- dole sticky CTA.

Použít při otevření úkolu z dnešní fronty.

## Mikrointerakce pro čistý prototyp

V `app.js` stačí nasimulovat:

- přepnutí mezi `Dnes`, `Týden`, `Rizika`,
- otevření detailu úkolu,
- označení úkolu jako hotový,
- změnu density `komfortní / kompaktní`,
- hover/focus stavy měkkých karet.

## Co musí prototyp ukázat

- Desktop 1440 px s plovoucím světlým sidebarem.
- Mobil 390 px: bottom nav + zjednodušená karta “Dnes”.
- Měkké radiusy musí působit konzistentně napříč kartami, inputy a drawerem.
- Hlavní dashboard musí být výrazně klidnější než Iterace 01.

## Co neřešit

- Dark mode.
- Komplexní tabulky.
- Reálné grafy.
- Napojení na router nebo API.

## Hodnoticí otázky

- Je aplikace dost důvěryhodná, i když je měkčí a světlejší?
- Neztrácí se urgentní problémy v pastelových barvách?
- Je tenhle styl vhodný pro revizní firmu, nebo působí moc obecně SaaS?
- Je sidebar přehlednější než současný tmavý blok?
