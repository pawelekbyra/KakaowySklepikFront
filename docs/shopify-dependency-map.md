# Mapa zależności Shopify

## Cel

Ten dokument opisuje, które elementy Vercel Commerce trzeba zastąpić adapterem Spree.

## Centralny plik providera

Najważniejszy plik do zastąpienia to:

```text
lib/shopify/index.ts
```

To on definiuje kontrakt commerce używany przez aplikację.

## Eksportowane funkcje do odtworzenia w lib/spree

Minimalny kontrakt adaptera Spree powinien odtworzyć funkcje:

```text
createCart
addToCart
removeFromCart
updateCart
getCart
getCollection
getCollectionProducts
getCollections
getMenu
getPage
getPages
getProduct
getProductRecommendations
getProducts
revalidate
```

## Priorytet MVP

Najpierw robimy tylko minimum:

```text
getProducts
getProduct
createCart
addToCart
getCart
updateCart
removeFromCart
```

Dopiero po tym ruszamy kolekcje, menu, strony CMS i revalidację.

## Co zostaje z Vercel Commerce

Chcemy zostawić możliwie dużo:

- App Router,
- layout,
- komponenty UI,
- koszyk jako doświadczenie użytkownika,
- search/product routes,
- styling Tailwind,
- wzorce cache/revalidate, jeśli pasują.

## Co wymaga adaptera

Spree musi dostarczyć dane w kształcie oczekiwanym przez komponenty Vercel Commerce.

Adapter powinien mapować:

```text
Spree Product -> Product
Spree Variant -> Product Variant
Spree Taxon -> Collection
Spree Cart/Order -> Cart
Spree Line Item -> Cart Line
Spree Image -> Image
Spree Price -> Money
```

## Zasada implementacji

Nie zmieniamy komponentów UI, jeśli da się napisać adapter.

Najpierw tłumaczymy dane w `lib/spree`.

Dopiero gdy adapter nie wystarczy, zmieniamy komponent.

## Otwarty dług

Ten dokument nie jest jeszcze pełną listą wszystkich importów, bo GitHub code search w tym repo nie zwrócił wyników mimo obecności `lib/shopify`.

Pełną listę importów trzeba potwierdzić przez Codex albo lokalne wyszukanie po repo.

To jest świadomy skrót i zostaje otwarte do uzupełnienia.
