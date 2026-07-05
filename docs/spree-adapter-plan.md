# Plan adaptera Spree dla Vercel Commerce

## Cel

Celem jest sprawdzenie, czy `KakaowySklepikFront` może używać Vercel Commerce jako frontendu i Spree jako backendu.

Docelowo chcemy zamienić warstwę:

```text
lib/shopify
```

na:

```text
lib/spree
```

bez przepisywania całej aplikacji.

## Zasada techniczna

Adapter Spree powinien ukrywać różnice między Shopify a Spree.

Komponenty Vercel Commerce powinny otrzymywać dane w kształcie, którego już oczekują.

Nie próbujemy dopasowywać całej aplikacji do surowych odpowiedzi Spree API.

To adapter ma tłumaczyć Spree na kontrakt frontu.

## Etap 0 — rozpoznanie

- [ ] Spisać wszystkie importy z `lib/shopify` w aplikacji.
- [ ] Spisać typy używane przez komponenty produktu, listingu i koszyka.
- [ ] Sprawdzić, które funkcje są konieczne do pierwszego renderu homepage.
- [ ] Sprawdzić, które funkcje są konieczne do strony produktu.
- [ ] Sprawdzić, które funkcje są konieczne do koszyka.

## Etap 1 — zmienne środowiskowe

Dodać obsługę:

```env
SPREE_API_URL=
SPREE_PUBLISHABLE_KEY=
SPREE_REVALIDATION_SECRET=
```

Na tym etapie można zostawić stare zmienne Shopify, ale docelowo nie są one źródłem prawdy.

## Etap 2 — klient Spree

Utworzyć strukturę:

```text
lib/spree/index.ts
lib/spree/types.ts
lib/spree/reshape.ts
```

Minimalny klient powinien umieć:

- wysłać request do Spree Store API,
- dodać wymagane nagłówki,
- obsłużyć brak `SPREE_API_URL`,
- obsłużyć błędy API,
- zwrócić dane w stabilnym kształcie.

## Etap 3 — produkty

Pierwsze funkcje:

```text
getProducts()
getProduct(handle)
```

Cel:

```text
homepage / listing → produkty ze Spree
product page → konkretny produkt ze Spree
```

Do zmapowania:

- id,
- handle/slug,
- title/name,
- description,
- price,
- currency,
- images,
- variants,
- availableForSale,
- SEO.

## Etap 4 — kategorie / kolekcje

Shopify Collections trzeba zmapować na Spree Taxons/Categories.

Funkcje:

```text
getCollections()
getCollection(handle)
getCollectionProducts(args)
```

Na MVP można uprościć kategorie, ale trzeba oznaczyć to w `docs/technical-debt.md`.

## Etap 5 — koszyk

Funkcje:

```text
createCart()
addToCart(lines)
getCart()
updateCart(lines)
removeFromCart(lineIds)
```

Do sprawdzenia w Spree:

- jak tworzymy koszyk/order,
- gdzie przechowujemy cart token,
- czy cookie `cartId` wystarczy,
- jak mapujemy line items,
- jak mapujemy warianty.

## Etap 6 — checkout

Cel MVP:

```text
koszyk → checkout testowy
```

Checkout może wymagać osobnej decyzji, bo flow Spree może różnić się od Shopify.

Jeśli trzeba zrobić skrót, musi trafić do:

```text
docs/technical-debt.md
```

## Etap 7 — revalidacja i cache

Vercel Commerce ma revalidację pod Shopify webhooki.

Dla Spree trzeba zdecydować:

- czy używamy webhooków Spree,
- czy robimy ręczną revalidację,
- czy na MVP wystarczy prostszy cache.

## Warunek sukcesu

Adapter uznajemy za realny, jeśli działa przepływ:

```text
lista produktów → strona produktu → koszyk → checkout testowy
```

z backendem `pawelekbyra/sklepik` przez Spree API.

## Warunek przerwania

Przerywamy migrację na Vercel Commerce, jeśli:

- adapter wymaga przepisywania większości aplikacji,
- checkout okazuje się zbyt trudny do czystego podpięcia,
- mapowanie danych Spree jest zbyt niestabilne,
- szybciej i bezpieczniej będzie rozwijać `pawelekbyra/sklepikFront` oparty o Spree Storefront.

## Następny konkretny krok

Zmapować wszystkie miejsca w kodzie, które importują `lib/shopify`.

Na tej podstawie ustalić minimalny kontrakt dla `lib/spree`.
