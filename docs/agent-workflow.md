# Workflow agentów — KakaowySklepikFront

## Cel

Celem pracy w tym repozytorium jest zbudowanie prototypu storefrontu Kakaowy Sklepik w architekturze:

```text
Vercel Commerce UI / app structure
+
custom lib/spree adapter
+
pawelekbyra/sklepik jako backend Spree
```

`KakaowySklepikFront` ma zachować jakość UI i strukturę Vercel Commerce, ale nie jest projektem Shopify. Warstwa `lib/shopify` jest warstwą do stopniowego zastąpienia przez `lib/spree`, a źródłem prawdy dla commerce pozostaje backend Spree z repozytorium `pawelekbyra/sklepik`.

## Role

- ChatGPT odpowiada za architekturę, review, strategię, analizę ryzyk, kolejność prac i przygotowywanie promptów.
- Codex odpowiada za wykonanie małych, jasno opisanych zadań kodowych albo dokumentacyjnych.
- Codex nie rozszerza samodzielnie zakresu promptu i nie wykonuje szerokich refaktorów przy okazji.
- Jeśli Codex przyjmuje założenie, wybiera skrót albo zostawia rozwiązanie tymczasowe, musi zapisać to w dokumentacji.

## Rytm pracy

Przed zmianą agent powinien:

1. przeczytać `AGENTS.md`,
2. przeczytać dokumenty istotne dla zadania, zwłaszcza `docs/spree-adapter-plan.md`, `docs/provider-map.md`, `docs/technical-debt.md` i `docs/system-map.md`,
3. sprawdzić aktualny kod albo dokumentację zamiast opierać się na stanie z poprzednich promptów,
4. zawęzić zakres do najmniejszego sensownego kroku,
5. upewnić się, że zmiana nie uruchamia prac nad koszykiem, checkoutem ani konfiguracją produkcyjną bez osobnej decyzji.

Po zmianie agent powinien:

1. zaktualizować dokumentację, jeżeli zmienił się stan projektu, plan albo przyjęte założenia,
2. dopisać dług techniczny, jeżeli zostawił skrót lub ryzyko,
3. usunąć albo poprawić nieaktualne „następne kroki”,
4. uruchomić tylko checki dostępne w `package.json`,
5. w podsumowaniu PR opisać, co zmieniono, czego celowo nie zmieniono, jakie założenia przyjęto, jakie checki uruchomiono i jaki jest najlepszy następny krok.

## Zasada dokumentacji

- Jeśli pojawia się skrót, ryzyko albo założenie tymczasowe, dopisać je do `docs/technical-debt.md`.
- Jeśli zmienia się plan adaptera Spree, zaktualizować `docs/spree-adapter-plan.md`.
- Jeśli zmiana dotyczy backendu, zachować spójność z dokumentacją w `pawelekbyra/sklepik`.
- Jeśli następny krok w dokumentacji jest nieaktualny, poprawić go w tym samym PR.
- Nie dopisywać fałszywych deklaracji działania adaptera. Minimum do uznania adaptera za działający to przepływ: lista produktów → strona produktu → koszyk → checkout testowy.

## Definicja gotowego PR

PR jest gotowy dopiero, gdy:

- zakres jest mały,
- dokumentacja jest aktualna,
- dług techniczny jest jawny,
- wynik checków jest opisany,
- następny krok jest jednoznaczny.

## Aktualny etap

- PR #1 dodał audyt Shopify providera.
- PR #2 dodał minimalny adapter produktów Spree.
- Aktualny następny etap to walidacja `lib/spree` względem realnego backendu `pawelekbyra/sklepik`.
- Nie zaczynamy koszyka, dopóki produktowy adapter nie zostanie zweryfikowany z realnym backendem.
