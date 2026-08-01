# Moje recepty

Jednoduchá statická webová aplikace pro ukládání receptů v prohlížeči (localStorage).

Nově: vizuální vylepšení (moderní font, karty, modalní formulář, responsivní rozvržení).

Jak spustit

1. Stačí otevřít `index.html` v prohlížeči (bez serveru). Aplikace načte ukázkové recepty, pokud v localStorage žádná nejsou.
2. Pokud prohlížeč zablokuje načítání lokálních souborů (fetch), spusťte jednoduchý lokální server:
   - Python 3: `python -m http.server 8000` a otevřete http://localhost:8000
3. Pro nasazení na GitHub Pages: v nastavení repozitáře povolte Pages a nastavte zdroj na `main` branch (root).

Poznámka ohledně dat

- Data jsou i nadále uložena v localStorage pod klíčem `mojeRecepty_v1`.
- Export/import tlačítka byla odstraněna — zálohujte nebo spravujte JSON soubory ručně v adresáři `data/` pokud chcete trvalé uložení v repozitáři.
