# Moje recepty

Aplikace nyní vizuálně vychází z moderních karet s obrázky a hero sekcí. Recepty mohou obsahovat volitelné pole `image` (URL) v JSON objektech.

Příklad receptu s obrázkem:

```
{
  "id": "r3",
  "title": "Pečené kuře",
  "description": "Jednoduché pečené kuře",
  "image": "https://example.com/obrazek.jpg",
  "ingredients": ["1 kuře", "sůl", "pepř"],
  "steps": ["Osolit", "Péct 90 minut"],
  "tags": ["hlavní jídlo"]
}
```

Jak spravovat recepty

- Upravujte JSON soubory v adresáři `data/` a commitujte změny do větve `main`.
- Po změně v repozitáři proveďte v prohlížeči hard-refresh (Ctrl/Cmd+Shift+R) nebo smažte localStorage: `localStorage.removeItem('mojeRecepty_v1'); location.reload();` aby se nová data načetla.
