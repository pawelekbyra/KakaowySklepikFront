# Walidacja backendu Spree dla adaptera produktów

## Cel

Celem walidacji było sprawdzenie, czy minimalny adapter `lib/spree` dla produktów może komunikować się z backendem `pawelekbyra/sklepik` bez rozszerzania zakresu na koszyk, checkout, UI albo zmiany backendu.

Odpowiedź na pytanie główne brzmi: **obecny `lib/spree` jest zgodny z publicznym kontraktem współczesnego Spree Storefront API dla produktów, ale nie został w pełni potwierdzony względem realnego repozytorium `pawelekbyra/sklepik`, bo backend nie był dostępny lokalnie, a próba pobrania repozytorium z GitHuba zakończyła się blokadą sieciową `CONNECT tunnel failed, response 403`.**

Status walidacji produktowej: **częściowo wykonany — wymaga korekt lub potwierdzenia na lokalnie uruchomionym backendzie `sklepik`.**

## Sprawdzone źródła

Sprawdzono w tym repozytorium:

- `AGENTS.md`,
- `docs/agent-workflow.md`,
- `docs/system-map.md`,
- `docs/provider-map.md`,
- `docs/spree-adapter-plan.md`,
- `docs/shopify-provider-audit.md`,
- `docs/technical-debt.md`,
- `lib/spree/index.ts`,
- `lib/spree/types.ts`,
- `lib/spree/reshape.ts`,
- `next.config.ts`,
- `app/search/page.tsx`,
- `app/product/[handle]/page.tsx`.

Próbowano sprawdzić backend `pawelekbyra/sklepik` przez:

```bash
git clone --depth 1 https://github.com/pawelekbyra/sklepik.git /tmp/sklepik-validation
```

Wynik: repozytorium nie zostało pobrane w tym środowisku z powodu błędu sieciowego `CONNECT tunnel failed, response 403`.

Dodatkowo sprawdzono publiczną dokumentację Spree Storefront API dla aktualnego kontraktu produktów, wariantów, filtrowania, sortowania i uwierzytelniania Storefront API. To źródło potwierdza ogólny kontrakt Spree, ale **nie zastępuje walidacji realnej konfiguracji `pawelekbyra/sklepik`**.

## Endpointy produktów

Obecny adapter używa:

```text
GET /api/v2/storefront/products
GET /api/v2/storefront/products/{handle}
```

z `include`:

```text
default_variant,variants,images,option_types
```

Publiczna dokumentacja Spree Storefront API potwierdza endpoint listy produktów:

```text
GET /api/v2/storefront/products
```

oraz endpoint szczegółów produktu:

```text
GET /api/v2/storefront/products/{product_slug}
```

Dokumentacja Spree wskazuje też, że endpoint szczegółów może przyjąć permalink/slug albo ID produktu, a API próbuje najpierw wyszukać produkt po permalinku.

Relacje `default_variant`, `variants`, `option_types` i `images` są zgodne z dokumentacją Spree jako dopuszczalne relacje `include`. Dokumentacja pokazuje także relację `primary_variant`, której obecny adapter nie pobiera.

Wniosek: **założenie endpointów jest zgodne z publicznym Spree Storefront API, ale wymaga potwierdzenia w realnym backendzie `sklepik` po uruchomieniu jego aplikacji.**

## Nagłówki Store API

Obecny adapter wysyła:

```text
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
X-Spree-Storefront-Token: SPREE_PUBLISHABLE_KEY
```

Publiczna dokumentacja Spree Storefront API potwierdza `Accept: application/vnd.api+json` i `Content-Type: application/vnd.api+json` jako typ JSON:API dla Storefront API.

Nie potwierdzono natomiast w aktualnej publicznej dokumentacji Spree nagłówka:

```text
X-Spree-Storefront-Token
```

Dla Storefront API dokumentacja opisuje:

- publiczny dostęp do katalogu produktów bez bearer tokena,
- `X-Spree-Order-Token` dla gościnnego koszyka i checkoutu,
- OAuth bearer token dla zalogowanych użytkowników.

Wniosek: **nagłówek `X-Spree-Storefront-Token` jest niepotwierdzonym założeniem obecnego adaptera.** Nie zmieniono go w kodzie, bo realny backend `sklepik` nie został pobrany ani uruchomiony; jeśli `sklepik` korzysta ze starszej/customowej konfiguracji publishable key, usunięcie nagłówka mogłoby być przedwczesne. Przed koszykiem trzeba sprawdzić realny backend i zdecydować, czy `SPREE_PUBLISHABLE_KEY` zostaje, zmienia nazwę, czy jest usuwany z requestów produktowych.

## Format produktu

Obecne mapowanie w `lib/spree/reshape.ts` zakłada pola produktu:

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

Publiczny format Spree Storefront API potwierdza najważniejsze pola:

```text
id
name
description
slug
price
currency
display_price
available
purchasable
in_stock
meta_description
updated_at
```

Różnice i obserwacje:

- `permalink` nie jest pokazywany jako atrybut produktu w aktualnej publicznej odpowiedzi Storefront API; dokumentacja opisuje jednak endpoint `{product_slug}` jako przyjmujący permalink/slug.
- `meta_title` nie zostało potwierdzone w przykładowej odpowiedzi publicznej dokumentacji; potwierdzone jest `meta_description` oraz `meta_keywords`.
- Adapter poprawnie używa `slug` jako głównego `handle`, a `permalink` tylko jako fallback.
- Adapter używa `updated_at`, a przy jego braku generuje aktualny timestamp. Ten fallback jest wygodny dla typu frontu, ale może powodować niestabilny `updatedAt` w renderowanych danych, jeśli backend faktycznie nie zwróci daty.

Wniosek: **mapowanie podstawowych pól produktu jest zasadniczo zgodne z publicznym Spree API, ale `meta_title`, `permalink` i fallback `updatedAt` wymagają potwierdzenia na realnym backendzie.**

## Format wariantów

Obecny adapter pobiera warianty z relacji:

```text
default_variant
variants
```

Publiczna dokumentacja Spree potwierdza obie relacje oraz pokazuje także `primary_variant`.

Format wariantu w publicznej dokumentacji obejmuje między innymi:

```text
id
sku
price
currency
display_price
is_master
options_text
options
purchasable
in_stock
backorderable
```

Obecny adapter:

- mapuje `variant.id` na `ProductVariant.id`,
- mapuje `options_text` do `selectedOptions`,
- nie używa bogatszego pola `options`,
- nie używa relacji `option_values`,
- nie pobiera osobnego endpointu wariantów.

Wniosek: **`variant.id` wygląda na właściwy przyszły kandydat na `merchandiseId` dla line items, bo Spree line items operują na wariantach, ale należy to potwierdzić dopiero przy walidacji endpointów koszyka.**

`options_text` wystarcza jako minimalny most do UI Vercel Commerce, ale nie jest docelowym źródłem opcji. Jeśli realny backend `sklepik` ma produkty z wieloma wariantami i lokalizowanymi nazwami opcji, należy przejść na strukturalne `options` albo relacje `option_values`.

## Format cen

Publiczny format Spree Storefront API pokazuje ceny jako stringi, np.:

```text
price: "38.99"
currency: "USD"
display_price: "$38.99"
```

Obecny adapter:

- akceptuje `price` jako string albo number,
- zwraca `Money.amount` jako string,
- bierze `currency` z wariantu albo produktu,
- ignoruje `display_price`,
- wylicza `priceRange` jako min/max po wariantach,
- używa fallbacku waluty `PLN`.

Wniosek: **format `price` i `currency` jest zgodny z publicznym Spree API.** `display_price` nie powinno być głównym źródłem wartości liczbowej, bo zawiera format prezentacyjny, ale może być przydatne później dla i18n/formatowania.

Fallback `PLN` jest tylko założeniem projektowym dla Kakaowego Sklepiku. Nie jest potwierdzony przez backend `sklepik` w tej walidacji i pozostaje długiem technicznym do zamknięcia po sprawdzeniu realnej waluty sklepu/marketu.

## Format obrazów

Obecny adapter obsługuje pola obrazu:

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

Publiczna dokumentacja endpointów produktów potwierdza relację `images` i możliwość użycia parametrów:

```text
image_transformation[size]
image_transformation[quality]
```

z atrybutem `transformed_url` dla dołączonych obrazów. W sprawdzonym kontrakcie publicznym nie potwierdzono jednoznacznie pól `width` i `height`.

Obecny adapter nie obsługuje `transformed_url`. Jeżeli realny backend `sklepik` będzie zwracał tylko `transformed_url` albo będzie wymagał transformacji obrazów, adapter będzie wymagał małej korekty mapowania obrazu.

Obecny `next.config.ts` dopuszcza:

- `cdn.shopify.com`,
- host wyliczony z `SPREE_API_URL`.

Nie potwierdzono, czy obrazy `sklepik` są serwowane z tego samego hosta co API, czy z osobnego CDN/storage. Jeżeli backend używa osobnego hosta, trzeba dodać jawne źródło hosta obrazów do konfiguracji `next/image` zamiast zgadywać z `SPREE_API_URL`.

## Search i sortowanie

Obecny adapter używa:

```text
filter[name]
sort=price
sort=-price
sort=updated_at
sort=-updated_at
```

Publiczna dokumentacja Spree potwierdza:

- `filter[name]` jako wyszukiwanie po nazwie z dopasowaniem częściowym,
- sortowanie po `price`, `updated_at`, `created_at`, `available_on`, `name`, `sku`,
- prefiks `-` dla sortowania malejącego.

Wniosek: **search i sort adaptera są zgodne z publicznym Spree Storefront API.** Wymaga to nadal potwierdzenia, czy realny backend `sklepik` nie ma niestandardowego searchera albo ograniczeń konfiguracji.

## Zgodność obecnego lib/spree

Elementy zgodne z publicznym kontraktem Spree Storefront API:

1. `GET /api/v2/storefront/products`.
2. `GET /api/v2/storefront/products/{slug}`.
3. `include=default_variant,variants,images,option_types`.
4. Podstawowe pola produktu: `name`, `description`, `slug`, `price`, `currency`, `display_price`, `available`, `purchasable`, `in_stock`, `meta_description`, `updated_at`.
5. Relacje wariantów `default_variant` i `variants`.
6. `variant.id` jako identyfikator wariantu.
7. `options_text` jako minimalne źródło `selectedOptions`.
8. Ceny jako stringi z osobnym `currency`.
9. `filter[name]` oraz sortowanie `price`/`updated_at` z prefiksem `-`.

Elementy niepotwierdzone względem realnego backendu `sklepik`:

1. Dostępność repozytorium i jego realna wersja Spree w tym środowisku.
2. Czy produkty wymagają publishable key.
3. Czy `X-Spree-Storefront-Token` jest poprawnym nagłówkiem.
4. Czy backend zwraca `meta_title`.
5. Czy backend zwraca `permalink` jako atrybut, czy tylko `slug`.
6. Czy backend zwraca obrazy z `original_url`/`large_url`/`product_url`, czy raczej `transformed_url`.
7. Czy host obrazów jest taki sam jak host API.
8. Czy waluta backendu to zawsze `PLN`.
9. Czy realny katalog ma warianty wymagające strukturalnego mapowania opcji, nie tylko `options_text`.

## Różnice i ryzyka

1. **Nagłówek publishable key jest największą niepewnością.** Aktualna dokumentacja Spree nie potwierdza `X-Spree-Storefront-Token` dla publicznego katalogu produktów.
2. **Brak realnej walidacji backendu.** Nie można uczciwie oznaczyć adaptera jako `zweryfikowany`, dopóki `sklepik` nie zostanie uruchomiony albo przynajmniej sprawdzony lokalnie z kodu backendu.
3. **Obrazy mogą wymagać korekty.** Adapter nie obsługuje `transformed_url`, a `next/image` zna tylko host API i Shopify CDN.
4. **Fallback `PLN` może ukryć błąd danych.** Jeśli backend nie zwróci `currency`, frontend pokaże walutę przyjętą na ślepo.
5. **`options_text` jest mostem, nie docelowym modelem opcji.** Dla prostych wariantów wystarczy, ale przy wariantach z wieloma option values lepsze będzie strukturalne pole `options` albo relacje `option_values`.
6. **`primary_variant` jest ignorowany.** Publiczne API pokazuje tę relację obok `default_variant`; przed koszykiem trzeba zdecydować, czy powinna wejść do include/mapowania.

## Rekomendacje przed koszykiem

Przed rozpoczęciem implementacji koszyka należy:

1. Uruchomić lub pobrać realny backend `pawelekbyra/sklepik` w środowisku developerskim.
2. Wykonać realne requesty:

   ```bash
   curl -i "$SPREE_API_URL/api/v2/storefront/products?include=default_variant,variants,images,option_types"
   curl -i "$SPREE_API_URL/api/v2/storefront/products/{realny-slug}?include=default_variant,variants,images,option_types"
   ```

3. Sprawdzić te same requesty bez `SPREE_PUBLISHABLE_KEY` oraz z aktualnym nagłówkiem adaptera.
4. Zanotować realny host pierwszego obrazu produktu i porównać go z `next.config.ts`.
5. Potwierdzić walutę z realnych danych (`currency`) i usunąć lub ograniczyć fallback `PLN`, jeśli ukrywa błędy.
6. Potwierdzić, czy `variant.id` jest dokładnie wartością wymaganą przez przyszły endpoint line items.
7. Jeśli okaże się, że backend wymaga zmian konfiguracji API, opisać decyzję także w `sklepik/docs/engine-decisions.md`; nie implementować tej zmiany po stronie frontu bez osobnego zadania.
