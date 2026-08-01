# Moje recepty

Jednoduchá statická webová aplikace pro zobrazování receptů v češtině (client-only). Recepty se načítají z JSON souborů v adresáři `data/`.

Nově: vizuální vylepšení (moderní font, karty, responsivní rozvržení) a podpora tmavého režimu podle nastavení operačního systému.

Důležité: režim úprav receptů

- Sekce pro přidávání a úpravu receptů v UI byla odstraněna. Recepty spravujte přímo v repozitáři pomocí Gitu.
- Přidejte nebo upravte JSON soubory v adresáři `data/` (např. `data/sample-recipes.json` nebo vytvořte `data/user-recipes.json`) a commitněte změny do větve `main`.
- Struktura jednoho receptu (příklad):

```
{
  "id": "r3",
  "title": "Pečené kuře",
  "description": "Jednoduché pečené kuře",
  "ingredients": ["1 kuře", "sůl", "pepř"],
  "steps": ["Osolit", "Péct 90 minut"],
  "tags": ["hlavní jídlo"]
}
```

Jak to funguje lokálně

1. Otevřete `index.html` v prohlížeči, nebo spusťte lokální server:
   - Python 3: `python -m http.server 8000` a otevřete http://localhost:8000
2. Aplikace načte JSON soubory z adresáře `data/` při prvním načtení.
3. Pro změny receptů upravte JSON v repozitáři a proveďte commit + push.

Poznámka o cache / zobrazení změn

- Pokud neuvidíte změny ihned v prohlížeči, zkuste hard-refresh (Ctrl/Cmd+Shift+R) nebo otevřete anonymní okno.
- GitHub Pages (pokud je použito) může mít vlastní caching — po aktualizaci repozitáře chvíli počkejte, případně proveďte vyprázdnění cache v prohlížeči.
