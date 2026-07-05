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

- [x] Spisać wszystkie importy z `lib/shopify` w aplikacji.
- [x] Spisać typy używane przez komponenty produktu, listingu i koszyka.
- [x] Sprawdzić, które funkcje są konieczne do pierwszego renderu homepage/listingu.
- [x] Sprawdzić, które funkcje są konieczne do strony produktu.
- [x] Sprawdzić, które funkcje są konieczne do koszyka.

## Etap 1 — zmienne środowiskowe

Dodać obsługę:

```env
SPREE_API_URL=
SPREE_PUBLISHABLE_KEY=
```

Aktualny minimalny krok produktowy obsługuje `SPREE_API_URL` oraz `SPREE_PUBLISHABLE_KEY`. `SPREE_REVALIDATION_SECRET` nie jest jeszcze wymagany, bo rewalidacja webhookami nie jest częścią etapu produktowego.

Na tym etapie można zostawić stare zmienne Shopify, ale docelowo nie są one źródłem prawdy.

## Etap 2 — klient Spree

Status: częściowo wykonany. Powstał minimalny klient Store API w `lib/spree/index.ts`, który buduje requesty do `/api/v2/storefront`, dodaje opcjonalny publishable key i zwraca czytelny błąd przy braku `SPREE_API_URL`.

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

Status: częściowo wykonany — wymaga korekt. `getProducts()` i `getProduct(handle)` nadal są zaimplementowane pod założenia Spree Storefront API v2, ale walidacja backendowa `sklepik#2` ustaliła, że realny backend `pawelekbyra/sklepik` używa API v3 Store: `/api/v3/store/products`, `expand`, `media` / `primary_media`, `X-Spree-Api-Key` i `q[name_cont]`. Ten etap nie jest zweryfikowany jako działający z realnym backendem.

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

## Zasada aktualizacji planu

- Każdy etap oznaczamy jako `niezaczęty`, `w toku`, `częściowo wykonany`, `zweryfikowany` albo `zamknięty`.
- Nie zostawiamy nieaktualnych następnych kroków.
- Jeśli agent zmienia kolejność etapów, musi to uzasadnić.

## Następny konkretny krok

Skorygować minimalny adapter produktów Spree do realnego kontraktu backendu `pawelekbyra/sklepik` API v3 w osobnym PR kodowym.

Walidacja dokumentacyjna jest opisana w `docs/spree-backend-validation.md`. Następny PR powinien bez ruszania koszyka poprawić:

- endpointy z `/api/v2/storefront/products` na `/api/v3/store/products`,
- `include` na `expand`,
- nagłówek `X-Spree-Storefront-Token` na `X-Spree-Api-Key`,
- search z `filter[name]` na `q[name_cont]`,
- obrazy z `images` na `media` / `primary_media`,
- mapowanie produktów, wariantów, cen i walut na realny format API v3,
- host obrazów i konfigurację `next/image`.

Nie zaczynać koszyka, dopóki produktowy adapter nie zostanie potwierdzony z realnym backendem.
