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
