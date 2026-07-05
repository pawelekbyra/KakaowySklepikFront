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

### 2026-07-05 — Minimalny adapter Spree produktów ma zawężony zakres

Status: otwarte

Skrót: `lib/spree` obsługuje tylko listę produktów i szczegóły produktu przez API v3 Store. Koszyk, checkout, kolekcje/taxony, CMS, menu i rewalidacja nadal nie są zaimplementowane po stronie Spree.

Dlaczego to robimy: To pierwszy bezpieczny krok migracji, pozwalający sprawdzić kontrakt danych produktowych bez przepisywania UI i bez ruszania flow koszyka.

Ryzyka i ograniczenia:

1. Brak kolekcji/taxonów Spree, więc listing `/search` pobiera ogólną listę produktów.
2. Brak koszyka Spree: `AddToCart` i akcje koszyka nadal korzystają z dotychczasowego kontraktu i będą wymagały osobnego etapu.
3. Brak CMS, menu i rewalidacji po stronie Spree.
4. Publiczne typy nadal są re-exportowane z `lib/shopify/types` jako tymczasowy most kompatybilnościowy.

Co trzeba zrobić później:

1. Zweryfikować produktowe endpointy API v3 z rzeczywistą konfiguracją `pawelekbyra/sklepik`.
2. Dodać obsługę taxonów/kolekcji.
3. Zaimplementować osobny etap koszyka i checkoutu Spree.
4. Przenieść publiczne typy commerce do neutralnego miejsca, gdy zakres adaptera wyjdzie poza produkty.

Warunek zamknięcia: pełny flow produktów, koszyka i checkoutu testowego działa na Spree API bez zależności od Shopify.

### 2026-07-05 — Mosty kompatybilnościowe adaptera Spree produktów

Status: otwarte

Skrót: Minimalne podpięcie produktów ze Spree nadal ma kilka mostów kompatybilnościowych potrzebnych do utrzymania UI Vercel Commerce bez szerszego refaktoru.

Ryzyka i ograniczenia:

1. `next.config.ts` dopuszcza host obrazów wyliczony z `SPREE_API_URL`; jeśli obrazy Spree będą serwowane z osobnego CDN/storage, trzeba dodać docelową zmienną lub wzorzec hosta obrazów.
2. `lib/spree/types.ts` tymczasowo re-exportuje publiczne typy z `lib/shopify/types`. To most kompatybilnościowy na czas prototypu; docelowo publiczne typy commerce powinny trafić do neutralnego miejsca, np. `lib/commerce/types`.
3. Related products na stronie produktu używają tymczasowego fallbacku: pobierają listę produktów ze Spree, odfiltrowują aktualny produkt i ograniczają wynik do 10 pozycji. Docelowo powinny korzystać z rekomendacji, taxonów albo podobnego mechanizmu po stronie Spree.

Warunek zamknięcia: produktowy adapter Spree ma docelowe źródło hostów obrazów, neutralne publiczne typy commerce oraz rekomendacje albo powiązane produkty oparte o Spree.

### 2026-07-05 — Minimalny adapter produktów Spree API v3 wymaga walidacji runtime

Status: otwarte

Skrót: `lib/spree` został przepięty z założeń Spree Storefront API v2 na produktowy kontrakt API v3 Store, ale nie został jeszcze sprawdzony realnymi requestami do uruchomionego backendu `pawelekbyra/sklepik`.

Pozostałe ograniczenia:

1. Endpoint szczegółu produktu `/api/v3/store/products/{handle}` zakłada, że API v3 przyjmuje slug używany przez frontend jako `handle`; trzeba to potwierdzić na uruchomionym backendzie albo przejść na id, jeśli backend tego wymaga.
2. Expandy `default_variant,variants,media,primary_media,option_types` są zgodne z walidacją dokumentacyjną, ale trzeba potwierdzić, że wszystkie działają w realnym backendzie.
3. Host obrazów nie został potwierdzony względem realnych URL-i `media` / `primary_media`; `next.config.ts` dopuszcza tylko host z `SPREE_API_URL` oraz dotychczasowy Shopify CDN.
4. Obrazy API v3 mogą nie zwracać `width` i `height`; adapter zachowuje fallback `600x600`.
5. Fallback waluty `PLN` pozostaje awaryjnym fallbackiem frontendu, dopóki API v3/market nie potwierdzi waluty w odpowiedziach produktów i wariantów.
6. Strukturalne `option_values` wariantów są obsługiwane defensywnie, ale ich dokładny kształt musi zostać potwierdzony na realnej odpowiedzi API v3.

Co trzeba zrobić później:

1. Uruchomić backend `pawelekbyra/sklepik` i wykonać realne requesty listy oraz szczegółu produktu.
2. Potwierdzić endpoint szczegółu, expandy, format wariantów, cen, walut i mediów.
3. Po pozytywnej walidacji zaktualizować `next.config.ts` tylko o realnie potrzebny host mediów, jeśli okaże się inny niż `SPREE_API_URL`.

Warunek zamknięcia: produktowy adapter `lib/spree` działa z realnym kontraktem API v3 backendu `sklepik` dla listy produktów i szczegółów produktu.

### 2026-07-05 — Workflow agentów wymaga dyscypliny dokumentacyjnej

Status: w toku

Skrót: Workflow agentów był rozproszony między promptami, `AGENTS.md` i dokumentami planistycznymi, więc kolejne zadania mogły zostawiać nieaktualne następne kroki albo nieopisaną zmianę założeń.

Ryzyko: Nieaktualna dokumentacja jest ryzykiem architektonicznym, bo kolejny agent może rozszerzyć zakres, zacząć koszyk przed walidacją adaptera produktów albo potraktować tymczasowy skrót jako decyzję docelową.

Zasada pracy: Każdy agent musi dopisać skrót albo założenie do dokumentacji, jeśli pojawia się ono w trakcie zadania. Nie wolno zostawiać nieaktualnych następnych kroków.

Warunek zamknięcia: `AGENTS.md`, `docs/agent-workflow.md`, `docs/spree-adapter-plan.md` i dokumentacja backendu `pawelekbyra/sklepik` mają spójny workflow agentów.
