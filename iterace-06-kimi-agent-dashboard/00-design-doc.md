# Iterace 06 — Kimi Agent Dashboard

## Status

Tento dokument je první artefakt iterace a vzniká před jakoukoliv implementací prototypu.

**Důležité pravidlo pro prototyp:** vzhledem k tomu, že jde čistě o hledání nejlepšího stylu a rychlé porovnání vizuálních směrů, stačí v této složce vytvářet čisté **HTML/CSS/JS** bez Reactu, Vite, backendu a napojení na reálná data. Cílem je rychle proklikat vzhled, layout, stavy a mikrointerakce.

Soubory prototypu v této iteraci:

- `index.html`
- `styles.css`
- `app.js`

## Základní idea

Původní Kimi dashboard je převedený do stejného formátu jako ostatní iterace: jedna statická složka, jeden HTML prototyp a jeden design dokument. Styl testuje **modulární agentní pracovní plochu** pro revizní firmu — ne čistý bento launcher, ale produktový dashboard, který ukazuje priority dne, vybrané moduly a jejich nastavení.

Vhodné pro ověření otázky:

> Může Evidence revizí působit jako moderní agentní cockpit, který drží každodenní moduly pohromadě a přitom neschovává urgentní provozní práci?

## Vizuální charakter

- Světlý prémiový dashboard s plovoucím sidebarem.
- Měkké karty, výrazné fotografie a jasné status badge.
- Vizuál je méně hravý než Iterace 05, více „hotový produkt“.
- Sidebar ukazuje jen vybranou pracovní množinu modulů; ostatní moduly jsou v obsahu.
- Důraz na agentní shrnutí: co hoří dnes, co je zapnuto, co lze zapnout a co je za vyšším plánem.

### Paleta

- App background: `#F4F7FB`
- Card: `#FFFFFF`
- Primary text: `#0F172A`
- Muted text: `#64748B`
- Border: `#E2E8F0`
- Primary dark action: `#0F172A`
- Sky / revize: `#0284C7`
- Emerald / provoz OK: `#059669`
- Amber / varování: `#D97706`
- Violet / reporting a růst: `#7C3AED`
- Danger: `#EF4444`

### Rohy a ořezávání

Tato iterace navazuje na původní Kimi UI a používá **velké měkké radiusy** bez clip-path efektů.

- Sidebar: `28px`.
- Hero a priority karty: `32px`.
- Modulové karty: `22px` až `28px`.
- Menší metriky a tlačítka: `16px` až `999px`.
- Nastavovací drawer: na desktopu jemné radiusy v obsahu, samotný panel je hranatý u pravého okraje.

## Layout

### Shell

- Desktop má vlevo fixní plovoucí panel šířky cca 264 px.
- Panel je bílý, průsvitný a stínovaný, aby nepůsobil jako těžký admin sidebar.
- Navigace obsahuje jen hlavní moduly:
  - Pracovní plocha
  - Revize & zařízení
  - Školení
  - Lidé & smlouvy
  - Finance
  - Reporting
- Sekundární položky `Všechny moduly` a `Nastavení` jsou oddělené od hlavní navigace.

### Top bar

- Na desktopu je top bar součástí plochy jako zaoblená karta.
- Vlevo tenant a stav online.
- Uprostřed globální hledání.
- Vpravo notifikace, úprava modulů a primární akce `Nová revize`.

### Dashboard

1. **Hero cockpit**
   - „Co dnes řešit“.
   - Shrnutí revizí, školení, smluv a dokumentů.
   - 4 stat karty: aktivní revize, po termínu, čekají na podpis, retence.
   - Pravá fotografická mozaika jako odkaz na terén, dokumenty a tým.

2. **Priorita dne**
   - Tři nejdůležitější položky dne.
   - Jasné stavy: danger, warning, info.
   - Pod tím souhrn aktivních modulů a dostupných modulů.

3. **Modulový workspace**
   - Moduly seskupené podle sekcí:
     - Provoz & compliance
     - Lidé, dokumenty & právní jistota
     - Finance & provoz
     - Růst & řízení
   - Karty mají stav `Zapnuto`, `K zapnutí`, `Plán Pro`.
   - Aktivní moduly ukazují metriky a health stav.
   - Dostupné moduly lze v prototypu zapnout.

4. **Filtry a režimy**
   - Filtr modulů: vše / zapnuté / k zapnutí / plán Pro.
   - Vyhledávání v modulech přes globální input.
   - Přepnutí density komfortní/kompaktní.
   - Fake režim `Upravit moduly` zvýrazní karty jako editovatelnou plochu.

## Side panel detail

Pravý panel slouží jako **nastavení modulu**.

- Otevírá se z ozubeného kola na aktivní kartě.
- Ukazuje název, stav, fotografii, popis a několik mockovaných přepínačů.
- Obsahuje nastavení zobrazení, notifikací a oprávnění.
- Uložení pouze zavře panel a ukáže toast.

## Mikrointerakce pro čistý prototyp

V `app.js` je nasimulováno:

- přepnutí aktivní položky v sidebaru a mobilním docku,
- otevření/zavření mobilního sidebaru,
- vyhledávání a filtrování modulů,
- zapnutí dostupného modulu,
- otevření modulu přes CTA,
- otevření nastavení modulu v pravém draweru,
- přepnutí density a edit režimu,
- toast hlášky pro primární akce.

## Co musí prototyp ukázat

- Stejnou konvenci pojmenování a souborů jako ostatní iterace.
- Desktop 1440 px s plovoucím sidebarem a modulovým workspace.
- Mobil 390 px: offcanvas sidebar, bottom dock a jednosloupcové modulové karty.
- Aktivní, dostupný i zamčený modul.
- Nastavovací detail pro aktivní modul.
- Rozdíl mezi každodenní navigací a širším katalogem modulů.

## Co neřešit

- Reálný agent nebo AI logiku.
- Autentizaci, role a skutečné ukládání nastavení.
- Napojení na API nebo router.
- Reálný upload dokumentů, fotek a protokolů.
- Produkční optimalizaci obrázků.

## Hodnoticí otázky

- Působí dashboard jako hotový produkt, ne jen designový experiment?
- Pomáhá omezený sidebar snížit navigační hluk?
- Jsou moduly s fotografiemi přínosné, nebo příliš dekorativní?
- Je rozdíl mezi `Zapnuto`, `K zapnutí` a `Plán Pro` okamžitě pochopitelný?
- Je tento směr lepším kompromisem mezi Iterací 02 a Iterací 05?
