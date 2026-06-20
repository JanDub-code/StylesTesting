# Iterace 04 — Compliance Ledger

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Doporučené budoucí soubory prototypu:

- `index.html`
- `styles.css`
- `app.js`
- případně `assets/` jen pro lokální placeholdery

## Základní idea

Revizní systém jako **spis, auditní kniha a compliance ledger**. Tato iterace se odklání od moderního SaaS dashboardu a testuje styl blízký právním dokumentům, archivům, protokolům a revizním záznamům.

Vhodné pro ověření otázky:

> Může aplikace působit jako důvěryhodný dokumentový systém s auditní vahou, ne jen jako provozní tabule?

## Vizuální charakter

- Krémové/papírové pozadí.
- Tmavý inkoustový text.
- Jemné linky místo silných stínů.
- Badge jako razítka, štítky, spisové značky.
- Důraz na lhůty, stav dokumentu, checklisty a auditní stopu.

### Paleta

- Paper background: `#F7F1E8`
- Workspace: `#FBF8F2`
- Card: `#FFFDF8`
- Ink text: `#1F2933`
- Muted ink: `#6B6258`
- Border: `#DDD2C2`
- Stamp red: `#B42318`
- Stamp green: `#157F3B`
- Stamp blue: `#1D4E89`
- Gold warning: `#B7791F`

### Rohy a ořezávání

Tato iterace má testovat **papírové / spisové rohy**.

- Karty většinou menší radius: 6–10 px.
- Vybrané dokumentové panely mají seříznutý horní pravý roh jako list papíru.
- Navigační položky mohou vypadat jako záložky složek.
- Nepoužívat velké moderní radiusy 30 px.

Možný CSS efekt:

```css
.paper-card {
  position: relative;
  border-radius: 8px;
}
.paper-card::after {
  content: "";
  position: absolute;
  right: -1px;
  top: -1px;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #E7DCCB 50%, transparent 51%);
}
```

## Layout

### Shell

- Levý panel jako **spisová páteř**.
- Navigace může být víc dokumentová:
  - Přehled spisu
  - Lhůty
  - Revize
  - Protokoly
  - Závady
  - Osoby
  - Smlouvy
  - GDPR
  - Audit
- Aktivní položka má podobu vytažené záložky.

### Header

- Breadcrumb je důležitý: uživatel ví, v jakém spisu/modulu je.
- Hledání jako “Najít ve spise”.
- Rychlé akce méně výrazné, více formální.

### Dashboard

Dashboard není “hero marketing”, ale **přehled právního a provozního stavu**:

1. **Compliance summary**
   - kolik věcí je po lhůtě,
   - kolik čeká na podpis,
   - kolik dokumentů je bez spisového zařazení.

2. **Lhůtová kniha**
   - řádky podle data,
   - doména,
   - odpovědná osoba,
   - stav.

3. **Dokumenty čekající na uzavření**
   - protokoly,
   - smlouvy,
   - potvrzení školení.

4. **Audit trail**
   - poslední významné události.

5. **Spisové moduly**
   - dlaždice modulů jako složky, ne jako produktové karty.

## Side panel detail

Detailní panel má působit jako **pravý list spisu**:

- nahoře spisová značka,
- vedle status razítko,
- checklist formou odškrtávacího protokolu,
- dole auditní stopa.

Klik na položku lhůtové knihy otevře tento panel.

## Mikrointerakce pro čistý prototyp

V `app.js` stačí nasimulovat:

- otevření detailu lhůty,
- přepnutí záložek `Lhůty / Dokumenty / Audit`,
- změnu statusu dokumentu,
- filtr “jen po lhůtě”,
- animaci razítka při označení jako uzavřeno.

## Co musí prototyp ukázat

- Desktop dashboard s dokumentovou strukturou.
- Detail pravého spisového panelu.
- Minimálně 3 typy razítek/statusů.
- Sidebar jako záložky/složky.
- Papírový cut corner efekt alespoň na hlavních kartách.

## Co neřešit

- Realistický PDF viewer.
- Tiskové styly do detailu.
- Skutečný audit log.
- Implementaci eSSL.

## Hodnoticí otázky

- Působí styl důvěryhodněji pro právní/compliance workflow?
- Není papírový vzhled moc retro?
- Dá se v něm pohodlně dělat denní provoz, nebo jen archiv?
- Pomáhá nižší radius a spisová metafora odlišit produkt od běžných SaaS app?
