# KakaowySklepikFront — zasady pracy agentów

To repozytorium jest prototypem storefrontu **Kakaowy Sklepik** opartym o Vercel Commerce / Next.js Commerce.

Nie traktuj tego repo jako projektu Shopify.

Celem jest sprawdzenie, czy możemy użyć jakości frontendu Vercel Commerce razem z backendem Spree z repozytorium `pawelekbyra/sklepik`.

## Podział repozytoriów

```text
pawelekbyra/sklepik
→ Spree backend, admin, API, produkty, zamówienia, płatności

pawelekbyra/sklepikFront
→ bezpieczny frontend oparty o oficjalny Spree Storefront

pawelekbyra/KakaowySklepikFront
→ prototyp Vercel Commerce + przyszły adapter Spree
```

## Główna decyzja

Chcemy iść w kierunku:

```text
Vercel Commerce UI / app structure
+
custom Spree adapter
+
sklepik jako backend Spree
```

Nie przechodzimy na Shopify.

Nie wyrzucamy Spree.

Nie podmieniamy produkcyjnego frontu bez działającego prototypu.

## Hierarchia decyzji

1. Cel projektu Kakaowy Sklepik.
2. Decyzje właściciela projektu.
3. Zgodność z backendem `pawelekbyra/sklepik`.
4. Stabilność flow: produkty → koszyk → checkout.
5. Jakość frontendu Vercel Commerce.
6. Kompatybilność z upstream Vercel Commerce.
7. Oryginalne konwencje Shopify w template, tylko tam gdzie jeszcze nie zostały zastąpione.

## Co robić

Agent powinien:

- traktować `lib/shopify` jako warstwę do zastąpienia, a nie jako docelowy provider,
- projektować `lib/spree` jako adapter do Spree API,
- utrzymywać UI i strukturę Vercel Commerce tak długo, jak to możliwe,
- dokumentować każdy świadomy skrót,
- nie kasować dużych części kodu bez uzasadnienia,
- nie przepisywać checkoutu bez testu end-to-end,
- nie hardcodować danych produkcyjnych,
- preferować małe commity i małe kroki.

## Czego nie robić

Nie konfiguruj Shopify jako docelowego backendu.

Nie usuwaj Spree z architektury.

Nie udawaj, że adapter Spree działa, dopóki nie działa minimum:

```text
lista produktów → strona produktu → koszyk → checkout testowy
```

Nie przenoś logiki backendowej do frontendu.

Nie commituj prawdziwych sekretów API ani kluczy płatniczych.

## Minimalny cel prototypu

Pierwszy sukces prototypu to:

1. odczyt listy produktów ze Spree,
2. odczyt szczegółów produktu ze Spree,
3. mapowanie wariantów i cen,
4. utworzenie koszyka,
5. dodanie produktu do koszyka,
6. odczyt koszyka,
7. przejście do checkoutu testowego.

## Ważne dokumenty

- `docs/spree-adapter-plan.md`
- `docs/provider-map.md`
- `docs/technical-debt.md`
- `docs/system-map.md`

Jeśli zmiana dotyczy całego systemu, dokumentacja w `sklepik`, `sklepikFront` i `KakaowySklepikFront` musi pozostać spójna.
