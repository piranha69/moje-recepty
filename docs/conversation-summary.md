# Shrnutí konverzace — Moje recepty (kopie pro repozitář)

Toto krátké shrnutí obsahuje klíčové body a rozhodnutí z konverzace pro budoucí použití.

Co bylo nasazeno (v main)
- Redesign UI inspirovaný Varenka: hero s centrálním vyhledáváním, větší typografie, karty s obrázky.
- Podpora tmavého režimu (prefers-color-scheme) se speciálními krémovými odstíny pro hero.
- Odebrán formulář „Přidat recept“ a původní header texty; footer zůstal prázdný.
- Data: doplněn `data/sample-recipes.json` s 50 demo recepty.
- Data načítání: odstraněna závislost na localStorage — klient vždy fetchuje JSON z `data/`.
- Performance/UX: infinite scroll (dávky 12), lazy-loading obrázků, preview 10 ingrediencí s "(a další N)" a tooltipem.
- Karty: celé `.card` jsou klikací, přístupné z klávesnice (tabIndex, role, Enter/Space), focus outline.
- Chips: štítky upraveny na Varenka‑like pilly (světlé/tmavé varianty).

Aktuální požadavky a otevřené úkoly
- Přidat pole `time` (časová náročnost) a `difficulty` (složitost), zobrazit je v kartě s ikonou hodin.
- Aktualizovat `data/sample-recipes.json` o nová pole (time, difficulty) pro testování.
- Změnit pozadí tagů v kartě na méně invazivní (jemnější/transparentní variantu).
- Vylepšit hero barvy (volitelné: doladit hex odstíny krémových tónů pro tmavý režim).
- Volitelné: přepsat karty na skutečné odkazy `<a>` pro SEO a deep-linking; přidat per‑recept URL.

Důležitá implementační rozhodnutí
- Data budou držena jako statické JSON soubory v `data/` a klient je vždy načte; uživatelská persistence v localStorage byla odstraněna.
- Pro výkon se používá infinite scroll a lazy-loading obrázků; pro větší škálu lze přidat stránkování nebo virtualizaci.
- UX: karta zobrazí prvních 10 ingrediencí s indikací, že seznam není kompletní; tooltip pro zobrazení kompletního seznamu.

Jak pokračovat (návrh pracovních kroků)
1. Přidat pole `time` a `difficulty` do UI karty (ikona hodin + text + malý badge pro difficulty).  
2. Aktualizovat `data/sample-recipes.json` s realistickými hodnotami pro `time` a `difficulty`.  
3. Upravit CSS pro tagy (nižší kontrast, jemné pozadí/transparentní overlay).  
4. (Volitelné) Přidat per‑recept URL / generování statických podstránek pro sdílení.

Poznámky pro vývojáře
- Pro lokální testování vždy používejte jednoduchý HTTP server (např. `python -m http.server 8000`) kvůli fetch lokálních JSON souborů (file:// může fetch blokovat).
- Po změně JSON souborů doporučit uživatelům provést hard-refresh nebo zajistit cache-busting v requestu.

Autor: Copilot (úpravy provedeny na základě požadavků uživatele)
Datum: 2026-08-01
