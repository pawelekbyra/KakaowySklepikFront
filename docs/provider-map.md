# Mapa providera: Shopify → Spree

## Cel

Ten dokument mapuje warstwę Shopify w Vercel Commerce na przyszły adapter Spree.

Vercel Commerce mówi w README, że alternatywni providerzy powinni móc podmienić `lib/shopify` na własną implementację, zostawiając resztę template'u w większości bez zmian.

Dla nas oznacza to:

```text
lib/shopify
→ lib/spree
```

## Aktualna warstwa Shopify

Najważniejszy plik:

```text
lib/shopify/index.ts
```

Ten plik zawiera:

- `shopifyFetch`,
- mapowanie produktów,
- mapowanie kolekcji,
- mapowanie obrazów,
- operacje koszyka,
- pobieranie menu,
- pobieranie stron,
- revalidację po webhookach Shopify.

## Funkcje do zastąpienia

Docelowy adapter Spree powinien dostarczyć odpowiedniki:

```text
createCart()
addToCart(lines)
removeFromCart(lineIds)
updateCart(lines)
getCart()
getCollection(handle)
getCollectionProducts(args)
getCollections()
getMenu(handle)
getPage(handle)
getPages()
getProduct(handle)
getProductRecommendations(productId)
getProducts(args)
revalidate(req)
```

Nie wszystkie muszą działać od razu. MVP adaptera powinien zacząć od produktów i koszyka.

## Minimalny zakres adaptera MVP

Najpierw implementujemy:

```text
getProducts()
getProduct(handle)
createCart()
addToCart(lines)
getCart()
updateCart(lines)
removeFromCart(lineIds)
```

Dopiero potem:

```text
getCollections()
getCollectionProducts()
getMenu()
getPage()
getPages()
getProductRecommendations()
revalidate()
```

## Zmienne środowiskowe

Obecne zmienne Shopify:

```env
SHOPIFY_REVALIDATION_SECRET=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_STORE_DOMAIN=
```

Docelowe zmienne Spree:

```env
SPREE_API_URL=
SPREE_PUBLISHABLE_KEY=
SPREE_REVALIDATION_SECRET=
```

Zmienne ogólne zostają:

```env
COMPANY_NAME="Kakaowy Sklepik"
SITE_NAME="Kakaowy Sklepik"
```

## Mapowanie pojęć

```text
Shopify Product        → Spree Product
Shopify Variant        → Spree Variant
Shopify Collection     → Spree Taxon / Category
Shopify Cart           → Spree Cart / Order in cart state
Shopify Checkout       → Spree Checkout / Order checkout flow
Shopify Storefront API → Spree Store API
Shopify Webhook        → Spree webhook / manual revalidation / cache tag
```

## Ryzyka

- Spree REST API ma inny model danych niż Shopify GraphQL.
- Koszyk w Spree jest zwykle reprezentowany jako order/cart z tokenem.
- Checkout w Spree może wymagać innego flow niż Shopify checkout URL.
- Kategorie Spree mogą nie mapować się 1:1 na Shopify Collections.
- Obrazy, ceny i warianty wymagają ostrożnego reshape'u.

## Zasada implementacji

Nie przepisywać całego frontu.

Najpierw odtworzyć kontrakt danych oczekiwany przez komponenty Vercel Commerce.

Innymi słowy: adapter `lib/spree` ma zwracać dane w kształcie, którego oczekuje aplikacja.

## Decyzja po prototypie

Jeśli adapter Spree da się zrobić czysto, Vercel Commerce może zostać głównym storefrontem.

Jeśli adapter będzie zbyt ciężki, zostajemy przy `sklepikFront` opartym o Spree Storefront i przenosimy tylko inspiracje UI/UX z Vercel Commerce.
