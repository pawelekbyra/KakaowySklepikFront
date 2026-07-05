# Mapa systemu: Kakaowy Sklepik

## Repozytoria

System składa się teraz z trzech repozytoriów roboczych:

```text
pawelekbyra/sklepik
→ Spree backend, admin, API, produkty, zamówienia, płatności

pawelekbyra/sklepikFront
→ bezpieczny frontend oparty o oficjalny Spree Storefront

pawelekbyra/KakaowySklepikFront
→ prototyp Vercel Commerce + adapter Spree
```

## Rola tego repo

`KakaowySklepikFront` służy do sprawdzenia, czy Vercel Commerce może być lepszym frontendowym fundamentem niż standardowy Spree Storefront.

To repo nie jest jeszcze produkcyjnym storefrontem.

To repo jest prototypem.

## Docelowy kierunek

```text
Vercel Commerce UI / app structure
+
custom Spree adapter
+
sklepik jako backend Spree
+
Vercel deployment
```

## Źródło prawdy

Backendowym źródłem prawdy pozostaje:

```text
pawelekbyra/sklepik
```

Produkty, warianty, ceny, koszyk, checkout i zamówienia mają pochodzić ze Spree API.

## Warstwa do zastąpienia

Obecny kod Vercel Commerce używa Shopify jako providera.

Warstwa do zastąpienia:

```text
lib/shopify
```

Docelowa warstwa:

```text
lib/spree
```

Nie musimy od razu kasować `lib/shopify`. Najpierw trzeba zrozumieć kontrakty i przygotować równoważną implementację dla Spree.

## Minimalny przepływ sukcesu

Prototyp ma sens, jeśli zadziała minimum:

```text
lista produktów → strona produktu → koszyk → checkout testowy
```

Jeśli tego nie osiągniemy rozsądnym kosztem, wracamy do `sklepikFront` jako głównego frontu i traktujemy Vercel Commerce jako inspirację UX.

## Zasada bezpieczeństwa

Nie podmieniamy `sklepikFront` na ten prototyp, dopóki adapter Spree nie działa.

Nie przechodzimy na Shopify.

Nie wyrzucamy Spree.

Nie udajemy, że prototyp jest gotowym sklepem.
