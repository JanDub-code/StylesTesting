# Iterace 03 — Field Tablet Rugged

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Doporučené budoucí soubory prototypu:

- `index.html`
- `styles.css`
- `app.js`
- případně `assets/` jen pro lokální placeholdery

## Základní idea

Revizní systém navržený primárně pro **technika v terénu na tabletu**. Desktop má existovat, ale tato iterace má ověřit, jak by aplikace vypadala, kdyby prioritou byla práce v rukavicích, venku, rychlé akce a offline režim.

Vhodné pro ověření otázky:

> Co když hlavní produktová tvář není kancelářský dashboard, ale terénní pracovní panel?

## Vizuální charakter

- Vysoký kontrast.
- Velké touch targety.
- Jednoduché texty, minimum jemných detailů.
- Stavové barvy jsou funkční, ne dekorativní.
- Vizuál lehce “rugged”: jako technický tablet nebo pracovní nástroj.

### Paleta

- Background: `#0E1726` nebo pro světlý režim `#F2F5F8`
- Surface dark: `#111C2E`
- Surface light: `#FFFFFF`
- Primary safety yellow: `#FACC15`
- Action blue: `#2563EB`
- Success green: `#22C55E`
- Danger red: `#EF4444`
- Text dark mode: `#F8FAFC`
- Text muted: `#94A3B8`

### Rohy a ořezávání

Použít kombinaci větších rohů a **ochranných “bumper” hran**.

- Hlavní dlaždice: radius 22 px.
- Kritické dlaždice: seříznutý jeden roh nebo robustní vnitřní border.
- Bottom command bar: radius nahoře 28 px.
- Touch tlačítka: minimálně 52–60 px výška.

Možný CSS efekt pro rugged kartu:

```css
.rugged-card {
  border-radius: 22px;
  border: 2px solid rgba(255,255,255,.12);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
}

.rugged-alert {
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
}
```

## Layout

### Shell

- Mobile/tablet-first.
- Žádný klasický persistentní desktop sidebar jako výchozí prvek.
- Hlavní navigace je **spodní command bar**:
  - Dnes
  - Trasa
  - Revize
  - Závady
  - Menu
- Na desktopu se command bar může proměnit na levý “tool rail”, ale pořád zůstává velký a dotykový.

### Header

- Velmi jednoduchý:
  - stav online/offline,
  - jméno technika,
  - aktuální zakázka,
  - sync indicator.
- Hledání není dominantní; v terénu je důležitější skener/QR/rychlá volba zařízení.

### Dashboard

Dashboard má být “dnešní směna”:

1. **Shift card**
   - “Dnes: 4 zastávky, 2 rizika, 1 podpis čeká”
   - velké CTA `Zahájit další práci`

2. **Route timeline**
   - zakázky za sebou s časem a stavem
   - výrazně označit aktuální položku

3. **Quick actions**
   - Naskenovat QR
   - Přidat fotku závady
   - Spustit měření
   - Diktovat poznámku

4. **Offline box**
   - počet neodeslaných změn
   - poslední sync

5. **Risk alerts**
   - velké barevné alerty: závada A, chybí podpis, revize po termínu.

## Side panel / menu

Side panel je v této iteraci **full-height tool drawer**:

- otevírá se z tlačítka Menu,
- velké položky navigace,
- přepínač režimu `Terén / Kancelář`,
- rychlé info o baterii/sync mockem.

Na desktopu může být drawer připnutý vlevo jako 96 px rail + rozbalení.

## Mikrointerakce pro čistý prototyp

V `app.js` stačí nasimulovat:

- přepnutí stavů online/offline,
- otevření tool draweru,
- označení zastávky jako hotové,
- přepnutí aktuální zastávky,
- otevření modalu “Přidat fotku závady”,
- zvětšení touch režimu.

## Co musí prototyp ukázat

- Primárně viewport 390 × 844 a tablet 1024 × 768.
- Desktop 1440 px jako sekundární adaptace.
- Všechny hlavní ovládací prvky minimálně 48 px, ideálně 56 px.
- Žádné malé ikonkové tlačítko bez textu u primárních akcí.
- Dashboard musí být použitelný jednou rukou a rychle pochopitelný.

## Co neřešit

- Kompletní kancelářský dashboard.
- Dlouhé tabulky.
- Složitá nastavení.
- Reálnou práci s kamerou nebo geolokací.

## Hodnoticí otázky

- Je styl pořád vhodný pro administrátory, nebo už je moc terénní?
- Funguje spodní command bar lépe než sidebar pro hlavní flow?
- Jsou barvy dost bezpečnostní a čitelné i na slunci?
- Je rugged estetika profesionální, nebo příliš hrubá?
