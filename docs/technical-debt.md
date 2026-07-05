# Skróty tymczasowe i dług techniczny

## Cel

Ten dokument zapisuje świadome skróty i ryzyka w prototypie KakaowySklepikFront.

Jeśli idziemy na skróty, zapisujemy to tutaj.

## Statusy

- otwarte: trzeba wrócić i naprawić albo doprecyzować.
- w toku: temat jest aktualnie rozwiązywany.
- zamknięte: skrót został spłacony albo decyzja stała się finalna.

## Dług techniczny

### 2026-07-05 — Template nadal zawiera Shopify jako provider

Status: otwarte

Skrót: Repo bazuje na Vercel Commerce, który domyślnie używa Shopify.

Dlaczego to robimy: Vercel Commerce daje mocny frontendowy fundament i dobry kierunek UX.

Ryzyko: Aplikacja nie będzie działać z naszym backendem Spree, dopóki nie powstanie adapter lib/spree.

Co trzeba zrobić później:

1. Zmapować importy lib/shopify.
2. Stworzyć lib/spree.
3. Przepiąć minimalny flow produktów i koszyka.
4. Usunąć albo ograniczyć zależność od Shopify.

Warunek zamknięcia: flow produktów, strony produktu, koszyka i checkoutu testowego działa ze Spree API.

### 2026-07-05 — Env-y Shopify są jeszcze w .env.example

Status: otwarte

Skrót: .env.example nadal zawiera SHOPIFY, bo template startuje jako Vercel Commerce Shopify.

Dlaczego to robimy: Nie zmieniamy wszystkiego naraz, zanim nie znamy minimalnego kontraktu adaptera Spree.

Ryzyko: Agent albo developer może błędnie uznać Shopify za docelowy backend.

Co trzeba zrobić później:

1. Dodać zmienne Spree.
2. Oznaczyć Shopify jako legacy/prototype-only.
3. Po działającym adapterze usunąć niepotrzebne zmienne Shopify.

Warunek zamknięcia: .env.example opisuje Spree jako główny provider, a Shopify nie jest wymagany do działania MVP.

### 2026-07-05 — Minimalny adapter Spree produktów ma uproszczone mapowanie

Status: otwarte

Skrót: `lib/spree` obsługuje tylko listę produktów i szczegóły produktu. Koszyk, checkout, kolekcje/taxony, CMS, menu i rewalidacja nadal nie są zaimplementowane po stronie Spree.

Dlaczego to robimy: To pierwszy bezpieczny krok migracji, pozwalający sprawdzić kontrakt danych produktowych bez przepisywania UI i bez ruszania flow koszyka.

Ryzyka i ograniczenia:

1. Obrazy Spree mogą nie zwracać `width` i `height`; adapter używa fallbacku `600x600`.
2. Warianty są mapowane głównie z `options_text`; jeśli backend zwróci bogatsze relacje opcji, mapowanie trzeba doprecyzować.
3. Brak kolekcji/taxonów Spree, więc listing `/search` pobiera ogólną listę produktów.
4. Brak koszyka Spree: `AddToCart` i akcje koszyka nadal korzystają z dotychczasowego kontraktu i będą wymagały osobnego etapu.
5. Adapter zakłada endpointy Spree Store API `/api/v2/storefront/products` oraz `/api/v2/storefront/products/{slug}` z parametrem `include=default_variant,variants,images,option_types`.
6. Adapter zakłada nagłówek `X-Spree-Storefront-Token` dla `SPREE_PUBLISHABLE_KEY`; jeśli backend `sklepik` używa innej nazwy nagłówka, zmiana jest izolowana w helperze requestów.

Co trzeba zrobić później:

1. Zweryfikować endpointy i nagłówki z rzeczywistą konfiguracją `pawelekbyra/sklepik`.
2. Rozszerzyć mapowanie wariantów o relacje option values, jeśli będą dostępne.
3. Dodać obsługę taxonów/kolekcji.
4. Zaimplementować osobny etap koszyka i checkoutu Spree.

Warunek zamknięcia: pełny flow produktów, koszyka i checkoutu testowego działa na Spree API bez zależności od Shopify.

### 2026-07-05 — Mosty kompatybilnościowe adaptera Spree produktów

Status: otwarte

Skrót: Minimalne podpięcie produktów ze Spree nadal ma kilka mostów kompatybilnościowych potrzebnych do utrzymania UI Vercel Commerce bez szerszego refaktoru.

Ryzyka i ograniczenia:

1. `next.config.ts` dopuszcza host obrazów wyliczony z `SPREE_API_URL`; jeśli obrazy Spree będą serwowane z osobnego CDN/storage, trzeba dodać docelową zmienną lub wzorzec hosta obrazów.
2. `lib/spree/types.ts` tymczasowo re-exportuje publiczne typy z `lib/shopify/types`. To most kompatybilnościowy na czas prototypu; docelowo publiczne typy commerce powinny trafić do neutralnego miejsca, np. `lib/commerce/types`.
3. Related products na stronie produktu używają tymczasowego fallbacku: pobierają listę produktów ze Spree, odfiltrowują aktualny produkt i ograniczają wynik do 10 pozycji. Docelowo powinny korzystać z rekomendacji, taxonów albo podobnego mechanizmu po stronie Spree.

Warunek zamknięcia: produktowy adapter Spree ma docelowe źródło hostów obrazów, neutralne publiczne typy commerce oraz rekomendacje albo powiązane produkty oparte o Spree.

### 2026-07-05 — Produktowy adapter Spree nie został potwierdzony na realnym backendzie sklepik

Status: otwarte

Skrót: Walidacja adaptera produktów potwierdziła zgodność z publicznym kontraktem Spree Storefront API, ale nie potwierdziła działania względem realnego repozytorium `pawelekbyra/sklepik`, bo backend nie był dostępny lokalnie, a próba pobrania repozytorium z GitHuba zakończyła się błędem sieciowym `CONNECT tunnel failed, response 403`.

Potwierdzone ograniczenia:

1. Nagłówek `X-Spree-Storefront-Token` dla `SPREE_PUBLISHABLE_KEY` nie został potwierdzony w aktualnej publicznej dokumentacji Spree Storefront API dla produktów.
2. Fallback waluty `PLN` pozostaje założeniem frontendu, dopóki realny backend nie potwierdzi waluty w odpowiedziach produktów i wariantów.
3. Host obrazów nie został potwierdzony względem realnego storage/CDN backendu `sklepik`; `next.config.ts` dopuszcza tylko host z `SPREE_API_URL` oraz dotychczasowy Shopify CDN.
4. Adapter nie obsługuje `transformed_url` obrazów opisanego w aktualnej dokumentacji Spree; wymaga to sprawdzenia na realnych odpowiedziach `sklepik`.

Co trzeba zrobić później:

1. Uruchomić realny backend `sklepik` i wykonać requesty listy oraz szczegółów produktu z aktualnym `include`.
2. Sprawdzić requesty produktowe z nagłówkiem `X-Spree-Storefront-Token` i bez niego.
3. Potwierdzić realne pola obrazów oraz host obrazów.
4. Potwierdzić walutę i usunąć albo zawęzić fallback `PLN`, jeśli ukrywa brak danych.

Warunek zamknięcia: `docs/spree-backend-validation.md` zostaje uzupełnione wynikami z realnego backendu `sklepik`, a adapter produktów działa na realnych danych bez niepotwierdzonych założeń.

### 2026-07-05 — Workflow agentów wymaga dyscypliny dokumentacyjnej

Status: w toku

Skrót: Workflow agentów był rozproszony między promptami, `AGENTS.md` i dokumentami planistycznymi, więc kolejne zadania mogły zostawiać nieaktualne następne kroki albo nieopisaną zmianę założeń.

Ryzyko: Nieaktualna dokumentacja jest ryzykiem architektonicznym, bo kolejny agent może rozszerzyć zakres, zacząć koszyk przed walidacją adaptera produktów albo potraktować tymczasowy skrót jako decyzję docelową.

Zasada pracy: Każdy agent musi dopisać skrót albo założenie do dokumentacji, jeśli pojawia się ono w trakcie zadania. Nie wolno zostawiać nieaktualnych następnych kroków.

Warunek zamknięcia: `AGENTS.md`, `docs/agent-workflow.md`, `docs/spree-adapter-plan.md` i dokumentacja backendu `pawelekbyra/sklepik` mają spójny workflow agentów.
