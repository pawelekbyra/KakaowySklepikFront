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

## Granica admin / API / storefront

`KakaowySklepikFront` jest storefrontem dla klientów, a nie panelem administracyjnym.

Logowanie administratora, zarządzanie produktami, wariantami, cenami, zdjęciami, dostępnością, zamówieniami, płatnościami, wysyłką i podatkami należą do backendu `pawelekbyra/sklepik` i Spree Admin.

Docelowy podział systemu:

```text
www.kakaowysklepik.pl
→ storefront dla klientów

admin.kakaowysklepik.pl
→ panel administracyjny Spree

api.kakaowysklepik.pl
→ Store API / backend Spree dla frontendu
```

Na etapie prototypu backend może być dostępny pod techniczną domeną z `/admin` i Store API, ale frontend nadal nie staje się panelem administracyjnym.

## Do rozważenia: Cloudflare w deployment

Cloudflare jest kandydatem do rozważenia jako warstwa infrastrukturalna wokół deploymentu, ale nie jako automatyczna odpowiedź na hosting całego systemu.

Do rozkminienia przed produkcyjnym deploymentem:

```text
Cloudflare DNS
→ zarządzanie domeną kakaowysklepik.pl

Cloudflare CDN / WAF
→ cache, SSL, ochrona i bezpieczeństwo ruchu

Cloudflare Access
→ opcjonalna dodatkowa ochrona admin.kakaowysklepik.pl

Cloudflare R2
→ opcjonalny storage zdjęć i mediów, jeśli dobrze zepnie się ze Spree / Active Storage

Cloudflare Pages
→ opcjonalna alternatywa dla frontendu, do porównania z Vercel
```

Na obecnym etapie nie przesądzamy tej decyzji. Domyślny kierunek pozostaje:

```text
KakaowySklepikFront
→ Vercel albo inny hosting zoptymalizowany pod Next.js storefront

sklepik
→ osobny backend hosting dla Spree, admina, Store API, bazy, jobów i storage

Cloudflare
→ potencjalnie DNS / CDN / security / Access / R2
```

Nie należy deployować backendu `sklepik` na Cloudflare tylko dlatego, że Cloudflare jest w systemie. Backend Spree wymaga osobnej decyzji hostingowej, uwzględniającej Rails, Postgres, joby, storage, webhooki płatności, admina i stabilność Store API.

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
