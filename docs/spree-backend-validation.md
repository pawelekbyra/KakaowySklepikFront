# Walidacja backendu Spree dla adaptera produktów

## Cel

Celem walidacji jest ustalenie, czy obecny minimalny adapter `lib/spree` w `KakaowySklepikFront` komunikuje się poprawnie z realnym backendem `pawelekbyra/sklepik` dla produktów.

Odpowiedź: **nie — obecny `lib/spree` nie pasuje do realnego kontraktu produktowego backendu `sklepik` ustalonego w backendowym PR `sklepik#2`.** Adapter jest napisany pod założenia API v2 Storefront, natomiast realny backend udostępnia produkty przez API v3 Store.

Status walidacji produktowej: **częściowo wykonany — wymaga korekt kodu adaptera w osobnym PR.** Ten PR tylko poprawia dokumentację i nie zmienia kodu `lib/spree`.

## Sprawdzone źródła

Źródłem prawdy dla realnego backendu jest równoległa walidacja backendowa z PR `sklepik#2`, która sprawdziła kod repozytorium `pawelekbyra/sklepik` i ustaliła kontrakt API v3:

- produkty są pod `/api/v3/store/products`,
- backend używa `expand`, nie `include`,
- obrazy są jako `media` / `primary_media`, nie `images`,
- publishable key idzie w `X-Spree-Api-Key`, nie `X-Spree-Storefront-Token`,
- search używa `q[name_cont]`, nie `filter[name]`,
- `updated_at` sort nie jest potwierdzony dla realnego backendu.

Dodatkowo sprawdzono stan frontendu:

- `docs/spree-adapter-plan.md`,
- `docs/provider-map.md`,
- `docs/technical-debt.md`,
- `docs/system-map.md`,
- `lib/spree/index.ts`,
- `lib/spree/types.ts`,
- `lib/spree/reshape.ts`,
- `next.config.ts`,
- `app/search/page.tsx`,
- `app/product/[handle]/page.tsx`.

Poprzednia wersja tego dokumentu opierała się na publicznej dokumentacji Spree Storefront API v2. Po ustaleniach z `sklepik#2` dokumentacja frontu traktuje kontrakt backendu `sklepik` v3 jako ważniejsze źródło niż ogólne docs Spree v2.

## Endpointy produktów

Obecny adapter zakłada:

```text
GET /api/v2/storefront/products
GET /api/v2/storefront/products/{slug}
```

oraz parametr:

```text
include=default_variant,variants,images,option_types
```

Realny backend `sklepik` według `sklepik#2` używa:

```text
GET /api/v3/store/products
GET /api/v3/store/products/{id-or-slug-do-potwierdzenia-w-v3}
```

oraz parametru:

```text
expand=...
```

Wniosek: **endpointy obecnego adaptera są błędne względem realnego backendu.** Następny osobny PR powinien przepiąć `lib/spree` z `/api/v2/storefront` na `/api/v3/store` i zastąpić `include` parametrem `expand` zgodnie z realnymi relacjami API v3.

Do doprecyzowania przy korekcie kodu zostaje dokładna forma endpointu szczegółów produktu w API v3: czy backend przyjmuje slug, id, czy oba identyfikatory.

## Nagłówki Store API

Obecny adapter wysyła:

```text
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
X-Spree-Storefront-Token: SPREE_PUBLISHABLE_KEY
```

Realny backend `sklepik` według `sklepik#2` oczekuje publishable key w nagłówku:

```text
X-Spree-Api-Key: SPREE_PUBLISHABLE_KEY
```

Wniosek: **`X-Spree-Storefront-Token` jest błędnym nagłówkiem dla realnego backendu `sklepik`.** Kod adaptera trzeba zmienić w osobnym PR na `X-Spree-Api-Key`.

## Format produktu

Obecny adapter mapuje produkt z odpowiedzi JSON:API v2 i zakłada między innymi pola:

```text
id
name
description
slug
permalink
price
currency
available
purchasable
in_stock
meta_title
meta_description
updated_at
```

Ustalenia `sklepik#2` wskazują, że realny backend działa na kontrakcie API v3 Store. To oznacza, że obecne typy `SpreeProductAttributes` i reshape napisane pod v2 wymagają ponownego sprawdzenia względem realnej odpowiedzi v3.

Wniosek: **nie wolno uznawać obecnego mapowania produktu za zweryfikowane.** W kolejnym PR trzeba zaktualizować typy i reshape na podstawie realnej odpowiedzi `/api/v3/store/products`.

Szczególnie do ponownego sprawdzenia w v3:

- identyfikator i slug/handle produktu,
- nazwa i opis,
- pola SEO,
- dostępność produktu,
- pole daty aktualizacji,
- położenie ceny i waluty,
- relacje lub expandy potrzebne do wariantów oraz obrazów.

## Format wariantów

Obecny adapter pobiera warianty przez relacje v2:

```text
default_variant
variants
```

oraz mapuje opcje wariantu głównie z:

```text
options_text
```

Dla realnego backendu `sklepik` trzeba przejść na expandy API v3. `sklepik#2` nie potwierdza, że obecne relacje v2 `default_variant` / `variants` oraz `options_text` są wystarczającym kontraktem dla frontu.

Wniosek: **format wariantów pozostaje niezgodny albo co najmniej niepotwierdzony względem realnego API v3.** Następny PR powinien ustalić i zaimplementować mapowanie wariantów z odpowiedzi v3.

`ProductVariant.id` nadal powinien docelowo odpowiadać identyfikatorowi wariantu przekazywanemu później do line items, ale nie wolno tego uznać za potwierdzone przed sprawdzeniem v3 cart/line items. Koszyka w tym PR nie implementujemy.

## Format cen

Obecny adapter zakłada, że cena i waluta są dostępne jako:

```text
price
currency
display_price
```

na produkcie albo wariancie w kształcie zgodnym z API v2.

Dla realnego backendu `sklepik` należy sprawdzić format cen w API v3 Store. Ten PR nie zmienia kodu, więc fallback `PLN` pozostaje opisanym długiem technicznym, a nie potwierdzoną właściwością backendu.

Wniosek: **format cen i walut nie jest zweryfikowany dla realnego API v3.** Kolejny PR powinien oprzeć `priceRange` na rzeczywistych polach cen wariantów z `/api/v3/store/products`.

## Format obrazów

Obecny adapter zakłada relację:

```text
images
```

oraz pola obrazu:

```text
original_url
large_url
product_url
small_url
mini_url
url
width
height
alt
position
```

Realny backend `sklepik` według `sklepik#2` używa:

```text
media
primary_media
```

Wniosek: **obecne mapowanie obrazów przez `images` jest błędne względem realnego backendu.** Następny PR powinien zmienić expandy i reshape obrazów na `media` / `primary_media`.

Host obrazów i zgodność z `next/image` nadal wymagają sprawdzenia na realnych URL-ach zwracanych przez API v3. Obecny `next.config.ts` dopuszcza host wyliczony z `SPREE_API_URL`, ale to nie wystarczy, jeśli `media` wskazuje na osobny storage albo CDN.

## Search i sortowanie

Obecny adapter używa:

```text
filter[name]
sort=price
sort=-price
sort=updated_at
sort=-updated_at
```

Realny backend `sklepik` według `sklepik#2` używa wyszukiwania:

```text
q[name_cont]
```

Sort po `updated_at` nie jest potwierdzony dla realnego backendu.

Wniosek: **search obecnego adaptera jest błędny względem realnego backendu.** Następny PR powinien zastąpić `filter[name]` parametrem `q[name_cont]` oraz ograniczyć albo potwierdzić sortowanie po `updated_at`.

## Korekty adaptera po walidacji

- W `lib/spree` przepięto produktowe requesty z `/api/v2/storefront/products` na `/api/v3/store/products` oraz zachowano publiczny kontrakt `Product` oczekiwany przez UI Vercel Commerce.
- Usunięto założenia v2: `include=...`, relację `images`, nagłówek `X-Spree-Storefront-Token`, wyszukiwanie `filter[name]` oraz sortowanie po niepotwierdzonym `updated_at`.
- Zaimplementowano założenia API v3: `expand=default_variant,variants,media,primary_media,option_types`, nagłówek `X-Spree-Api-Key`, wyszukiwanie `q[name_cont]`, defensywne sorty `price` / `-price` / `available_on` / `-available_on` oraz mapowanie obrazów z `media` / `primary_media`.
- Dostosowano reshape produktów, wariantów, cen i obrazów do płaskiego formatu API v3 z kompatybilnościowymi fallbackami dla odpowiedzi podobnej do JSON:API.
- Nadal wymaga uruchomionego backendu: potwierdzenie endpointu szczegółu `/api/v3/store/products/{slug-or-id}`, obsługi wszystkich expandów, hosta mediów, strukturalnych `option_values`, waluty z marketu oraz realnych pól cen.
- Celowo nie ruszano koszyka, checkoutu, `components/cart/*`, cookie `cartId`, `lib/shopify`, Shopify envów ani backendu `sklepik`.

## Zgodność obecnego lib/spree

Aktualny `lib/spree` został skorygowany względem najważniejszych różnic kontraktu API v3, ale nadal wymaga testu na uruchomionym backendzie:

1. Używa `/api/v3/store/products` dla listy i szczegółu produktu.
2. Używa `expand=default_variant,variants,media,primary_media,option_types`.
3. Mapuje obrazy z `media` / `primary_media`.
4. Wysyła `SPREE_PUBLISHABLE_KEY` jako `X-Spree-Api-Key`.
5. Używa `q[name_cont]` dla wyszukiwania po nazwie.
6. Mapuje `CREATED_AT` z UI defensywnie na `available_on` / `-available_on`, zamiast wysyłać niepotwierdzony sort `updated_at`.

Elementy, które mogą pozostać kierunkowo sensowne, ale wymagają ponownej walidacji na v3:

- publiczny kształt zwracany do komponentów Vercel Commerce,
- mapowanie produktu na `handle`, `title`, `description`, `availableForSale`, `seo`,
- mapowanie wariantu na `ProductVariant.id`, `selectedOptions` i `price`,
- wyliczanie `priceRange` po wariantach,
- konfiguracja `next/image` dla hostów obrazów.

## Różnice i ryzyka

1. **Adapter jest pod API v2, backend jest na API v3.** To blokuje uczciwe przejście do koszyka.
2. **Nagłówek API key jest błędny.** `X-Spree-Storefront-Token` trzeba zastąpić `X-Spree-Api-Key` w osobnym PR kodowym.
3. **Parametry expand/include różnią się fundamentalnie.** Obecne `include=default_variant,variants,images,option_types` nie odpowiada kontraktowi `sklepik`.
4. **Obrazy są w innym modelu.** `media` / `primary_media` wymagają nowego reshape'u i ponownej kontroli `next/image`.
5. **Search wymaga zmiany.** `filter[name]` trzeba zastąpić `q[name_cont]`.
6. **Sortowanie po `updated_at` jest ryzykiem.** Dopóki backend go nie potwierdzi, nie powinno być traktowane jako bezpieczny sort realnego adaptera.
7. **Fallback `PLN` nadal może ukrywać błędy danych.** Waluta musi pochodzić z realnego API v3 albo zostać świadomie obsłużona jako decyzja produktowa.

## Rekomendacje przed koszykiem

Przed rozpoczęciem koszyka należy zrobić osobny PR kodowy dla adaptera produktów v3:

1. Zmienić bazową ścieżkę Store API z `/api/v2/storefront` na `/api/v3/store`.
2. Zastąpić `include` parametrem `expand` zgodnym z realnymi expandami produktów, wariantów i mediów.
3. Zastąpić `X-Spree-Storefront-Token` nagłówkiem `X-Spree-Api-Key`.
4. Zastąpić `filter[name]` parametrem `q[name_cont]`.
5. Zmapować obrazy z `media` / `primary_media` i sprawdzić hosty dla `next/image`.
6. Potwierdzić format wariantów, cen i walut w odpowiedzi `/api/v3/store/products`.
7. Ograniczyć albo potwierdzić sortowanie po `updated_at`.
8. Dopiero po działającym produkcie v3 wrócić do etapu koszyka.
