# Deployment map: Kakaowy Sklepik

## Status

Ten dokument zapisuje robocze decyzje i obserwacje dotyczące deploymentu Kakaowego Sklepiku.

Nie jest to jeszcze finalna instrukcja produkcyjna.

Na obecnym etapie celem jest przygotowanie środowiska backendowego dla `pawelekbyra/sklepik`, żeby później dało się wykonać runtime validation adaptera `lib/spree` w `pawelekbyra/KakaowySklepikFront`.

## Docelowy podział domen

```text
www.kakaowysklepik.pl
→ storefront dla klientów
→ KakaowySklepikFront

api.kakaowysklepik.pl
→ Store API
→ sklepik / Spree backend

admin.kakaowysklepik.pl
→ panel administracyjny
→ sklepik / Spree Admin
```

## Robocza decyzja hostingowa

Domyślny kierunek na start:

```text
Frontend
→ Vercel
→ KakaowySklepikFront

Backend Spree
→ Render
→ sklepik

DNS / CDN / security
→ Cloudflare

Media / storage
→ do rozważenia: Cloudflare R2 albo S3-compatible storage
```

Alternatywy do późniejszego porównania:

```text
Fly.io
→ dobra opcja techniczna, ale wymaga więcej decyzji infrastrukturalnych

VPS
→ tanio i pełna kontrola, ale dużo odpowiedzialności za security, backupy, deploye i monitoring

AWS
→ mocne docelowo, ale zbyt ciężkie na obecny etap prototypu
```

## Render — obecny status

Render został wybrany roboczo jako pierwszy kandydat dla backendu Spree, bo powinien uprościć start:

```text
web service
Postgres
Redis-compatible / Key Value
background worker
env vars
deploy z GitHuba
logi
custom domains
```

Użytkownik założył Render i połączył GitHuba. Render widzi repo:

```text
pawelekbyra/sklepik
```

Na tym etapie wybrano darmowy plan Render tylko do rozpoznania konfiguracji.

Darmowy plan nie jest docelowym planem produkcyjnym dla backendu sklepu, bo backend commerce nie powinien usypiać i powinien mieć stabilne środowisko dla API, admina, checkoutu, webhooków, jobów i połączeń z bazą.

## Ważna obserwacja z konfiguratora Render

Render wstępnie wykrył repo `sklepik` jako aplikację Node/PNPM i zaproponował komendy typu:

```text
Build Command:
pnpm install --frozen-lockfile; pnpm run build

Start Command:
yarn start
```

Tego nie należy używać dla `sklepik`.

`sklepik` jest backendem Spree/Rails, a nie frontendem Node/PNPM. Przed pierwszym deployem trzeba zmienić runtime / environment na właściwy dla backendu:

```text
Ruby
```

albo, jeśli repo jest przygotowane pod kontener:

```text
Docker
```

Nie należy klikać deployu z komendami `pnpm` / `yarn start`.

## Komendy backendu — do ustalenia

Nie wpisujemy jeszcze finalnych komend build/start na ślepo.

Do potwierdzenia w repo `pawelekbyra/sklepik`:

```text
Gemfile
Gemfile.lock
bin/setup
bin/rails
Dockerfile
Procfile
package.json
config/database.yml
config/storage.yml
README.md
```

Dopiero po audycie repo należy ustalić poprawne komendy Render.

Możliwe kierunkowe komendy dla Rails mogą wyglądać podobnie do:

```text
Build Command:
bundle install && bundle exec rails assets:precompile

Start Command:
bundle exec rails server -b 0.0.0.0 -p $PORT
```

ale to nie jest jeszcze zatwierdzona konfiguracja.

## Env vars — do ustalenia

Prawdopodobnie potrzebne będą:

```text
RAILS_ENV=production
RAILS_MASTER_KEY
SECRET_KEY_BASE
DATABASE_URL
RAILS_SERVE_STATIC_FILES=true
REDIS_URL albo inny URL dla Redis/Key Value, jeśli backend wymaga jobów/cache
```

Nie commitować sekretów.

Nie commitować `master.key`.

Nie wklejać prawdziwych kluczy do dokumentacji.

## Baza i joby

Backend Spree będzie potrzebował osobnej decyzji dla:

```text
Postgres
Redis / Key Value
background worker / Sidekiq albo odpowiednik
migracje bazy
seedy produktów
admin user setup
publishable key dla Store API
```

Dopiero po tym można wykonać runtime validation frontu.

## Cloudflare — do rozważenia

Cloudflare nie jest decyzją o hostingu całego backendu.

Cloudflare może być użyte jako:

```text
DNS dla kakaowysklepik.pl
CDN / WAF / SSL
Cloudflare Access dla admin.kakaowysklepik.pl
Cloudflare R2 dla mediów, jeśli dobrze zepnie się ze Spree / Active Storage
```

Nie należy deployować backendu `sklepik` na Cloudflare tylko dlatego, że Cloudflare jest w systemie.

## Czego teraz nie robić

Na tym etapie nie należy:

```text
klikać deployu z konfiguracją Node/PNPM
ustawiać custom domain
podpinać Cloudflare DNS
wklejać sekretów do GitHuba
dodawać SPREE_API_URL do frontu bez działającego backendu
implementować koszyka
implementować checkoutu
zmieniać core Spree
```

## Następny krok

Najpierw trzeba zrobić audyt backend readiness dla `pawelekbyra/sklepik`:

```text
jak uruchomić backend lokalnie
jakie są wymagane env vars
czy repo powinno iść na Render jako Ruby czy Docker
jak skonfigurować Postgres
jak skonfigurować Redis / worker
jak uruchomić migracje
jak utworzyć seedy produktów
jak utworzyć admina
jak uzyskać publishable key dla X-Spree-Api-Key
```

Dopiero po tym wracamy do runtime validation `KakaowySklepikFront/lib/spree`.
