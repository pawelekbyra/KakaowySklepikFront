# Codex prompt 001 — audyt zależności od Shopify providera

## Cel

Wykonaj audyt repozytorium `pawelekbyra/KakaowySklepikFront` pod kątem zależności od Shopify providera.

Nie zmieniaj jeszcze kodu aplikacji.

Nie refaktoruj.

Nie twórz adaptera Spree w tym zadaniu.

Celem jest tylko raport.

## Kontekst projektu

To repo jest prototypem:

```text
Vercel Commerce UI / app structure
+
custom Spree adapter
+
sklepik jako backend Spree
```

Docelowo chcemy zastąpić:

```text
lib/shopify
```

przez:

```text
lib/spree
```

Nie przechodzimy na Shopify.

Nie wyrzucamy Spree.

Backendowym źródłem prawdy jest repo `pawelekbyra/sklepik`.

## Zadanie

Znajdź wszystkie miejsca w repo, które:

1. importują coś z `lib/shopify`,
2. importują typy z `lib/shopify/types`,
3. używają funkcji providera, takich jak:
   - `getProducts`,
   - `getProduct`,
   - `getCart`,
   - `createCart`,
   - `addToCart`,
   - `updateCart`,
   - `removeFromCart`,
   - `getCollections`,
   - `getCollectionProducts`,
   - `getMenu`,
   - `getPage`,
   - `getPages`,
   - `getProductRecommendations`,
   - `revalidate`,
4. używają zmiennych środowiskowych Shopify,
5. używają tekstów lub metadanych sugerujących Shopify jako docelowy backend.

## Wymagany output

Utwórz plik:

```text
docs/shopify-provider-audit.md
```

Raport powinien zawierać:

### 1. Lista plików zależnych od Shopify

Tabela:

```text
plik | import / zależność | używane funkcje | priorytet migracji
```

Priorytety:

- `P0` — wymagane do homepage/listingu/produktu/koszyka,
- `P1` — ważne do checkoutu lub wyszukiwania,
- `P2` — menu, strony, SEO, revalidacja, mniej krytyczne na start.

### 2. Minimalny kontrakt dla `lib/spree`

Wypisz funkcje, które adapter Spree musi mieć najpierw.

Podziel na:

```text
MVP
later
optional
```

### 3. Typy danych do utrzymania

Wypisz typy lub kształty danych, których oczekują komponenty UI, szczególnie:

- Product,
- Product Variant,
- Image,
- Money,
- Cart,
- Cart Line,
- Collection.

### 4. Ryzyka

Wypisz miejsca, gdzie Shopify assumptions mogą być głęboko zaszyte, np.:

- Shopify GraphQL connection edges/nodes,
- Shopify cart id,
- checkout URL,
- collection handles,
- menu/pages z Shopify,
- webhook revalidation.

### 5. Rekomendowany pierwszy krok implementacyjny

Na końcu raportu dodaj jedną konkretną rekomendację: od czego zacząć adapter `lib/spree`.

## Ograniczenia

Nie zmieniaj kodu aplikacji.

Nie usuwaj Shopify providera.

Nie twórz jeszcze `lib/spree`.

Nie zmieniaj `.env.example`.

Nie zmieniaj komponentów UI.

Tylko audyt i dokumentacja.

## Dokumenty, które warto przeczytać przed audytem

- `AGENTS.md`
- `docs/system-map.md`
- `docs/provider-map.md`
- `docs/spree-adapter-plan.md`
- `docs/shopify-dependency-map.md`
- `docs/technical-debt.md`
