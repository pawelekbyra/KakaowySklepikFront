# Audyt zależności od Shopify providera

## Cel audytu

Ten raport mapuje miejsca, w których obecny prototyp Vercel Commerce zależy od warstwy `lib/shopify`, typów Shopify, zmiennych środowiskowych Shopify albo tekstów sugerujących Shopify jako backend docelowy.

Zakres tego kroku jest wyłącznie dokumentacyjny: nie zmieniamy kodu aplikacji, nie usuwamy providera Shopify i nie tworzymy jeszcze `lib/spree`.

## 1. Lista plików zależnych od Shopify

### Importy funkcji i typów z `lib/shopify`

| plik                                            | import / zależność                                                                           | używane funkcje                                                      | priorytet migracji                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| `app/layout.tsx`                                | `getCart` z `lib/shopify`                                                                    | `getCart`                                                            | P0                                       |
| `components/cart/actions.ts`                    | funkcje koszyka z `lib/shopify`                                                              | `getCart`, `createCart`, `addToCart`, `updateCart`, `removeFromCart` | P0                                       |
| `components/cart/cart-context.tsx`              | typy `Cart`, `CartItem`, `ProductVariant` z `lib/shopify/types`                              | typy koszyka i wariantów                                             | P0                                       |
| `components/cart/add-to-cart.tsx`               | typy `Product`, `ProductVariant` z `lib/shopify/types`                                       | typy produktu i wariantu                                             | P0                                       |
| `components/cart/delete-item-button.tsx`        | typ `CartItem` z `lib/shopify/types`                                                         | typ pozycji koszyka                                                  | P0                                       |
| `components/cart/edit-item-quantity-button.tsx` | typ `CartItem` z `lib/shopify/types`                                                         | typ pozycji koszyka                                                  | P0                                       |
| `app/product/[handle]/page.tsx`                 | `getProduct`, `getProductRecommendations` z `lib/shopify`, typ `Image` z `lib/shopify/types` | `getProduct`, `getProductRecommendations`                            | P0 dla `getProduct`, P2 dla rekomendacji |
| `components/product/product-description.tsx`    | typ `Product` z `lib/shopify/types`                                                          | typ produktu                                                         | P0                                       |
| `components/product/variant-selector.tsx`       | typy `ProductOption`, `ProductVariant` z `lib/shopify/types`                                 | typy opcji i wariantów                                               | P0                                       |
| `components/layout/product-grid-items.tsx`      | typ `Product` z `lib/shopify/types`                                                          | typ produktu na gridzie                                              | P0                                       |
| `app/search/page.tsx`                           | `getProducts` z `lib/shopify`                                                                | `getProducts`                                                        | P0                                       |
| `app/search/[collection]/page.tsx`              | `getCollection`, `getCollectionProducts` z `lib/shopify`                                     | `getCollection`, `getCollectionProducts`                             | P1                                       |
| `components/grid/three-items.tsx`               | `getCollectionProducts` z `lib/shopify`, typ `Product` z `lib/shopify/types`                 | `getCollectionProducts`                                              | P1                                       |
| `components/carousel.tsx`                       | `getCollectionProducts` z `lib/shopify`                                                      | `getCollectionProducts`                                              | P1                                       |
| `components/layout/search/collections.tsx`      | `getCollections` z `lib/shopify`                                                             | `getCollections`                                                     | P2                                       |
| `components/layout/navbar/index.tsx`            | `getMenu` z `lib/shopify`, typ `Menu` z `lib/shopify/types`                                  | `getMenu`                                                            | P2                                       |
| `components/layout/navbar/mobile-menu.tsx`      | typ `Menu` z `lib/shopify/types`                                                             | typ menu                                                             | P2                                       |
| `components/layout/footer.tsx`                  | `getMenu` z `lib/shopify`                                                                    | `getMenu`                                                            | P2                                       |
| `components/layout/footer-menu.tsx`             | typ `Menu` z `lib/shopify/types`                                                             | typ menu                                                             | P2                                       |
| `app/[page]/page.tsx`                           | `getPage` z `lib/shopify`                                                                    | `getPage`                                                            | P2                                       |
| `app/[page]/opengraph-image.tsx`                | `getPage` z `lib/shopify`                                                                    | `getPage`                                                            | P2                                       |
| `app/search/[collection]/opengraph-image.tsx`   | `getCollection` z `lib/shopify`                                                              | `getCollection`                                                      | P2                                       |
| `app/sitemap.ts`                                | `getCollections`, `getPages`, `getProducts` z `lib/shopify`                                  | `getCollections`, `getPages`, `getProducts`                          | P2                                       |
| `app/api/revalidate/route.ts`                   | `revalidate` z `lib/shopify`                                                                 | `revalidate`                                                         | P2                                       |

### Centralna warstwa Shopify do zastąpienia adapterem

| plik                                | import / zależność                                                                              | używane funkcje                                                                                                            | priorytet migracji |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `lib/shopify/index.ts`              | provider Shopify: fetch, reshape, cache, cart, products, collections, menu, pages, revalidation | eksportuje cały kontrakt providera                                                                                         | P0                 |
| `lib/shopify/types.ts`              | typy publiczne UI i typy operacji Shopify GraphQL                                               | `Product`, `ProductVariant`, `Image`, `Money`, `Cart`, `CartItem`, `Collection`, `Menu`, `Page` oraz typy operacji Shopify | P0                 |
| `lib/shopify/queries/product.ts`    | Shopify GraphQL queries                                                                         | `getProduct`, `getProducts`, `getProductRecommendations`                                                                   | P0/P2              |
| `lib/shopify/queries/cart.ts`       | Shopify GraphQL query koszyka                                                                   | `getCart`                                                                                                                  | P0                 |
| `lib/shopify/mutations/cart.ts`     | Shopify GraphQL mutations koszyka                                                               | `createCart`, `addToCart`, `updateCart`, `removeFromCart`                                                                  | P0                 |
| `lib/shopify/queries/collection.ts` | Shopify GraphQL queries kolekcji                                                                | `getCollection`, `getCollections`, `getCollectionProducts`                                                                 | P1/P2              |
| `lib/shopify/queries/menu.ts`       | Shopify GraphQL query menu                                                                      | `getMenu`                                                                                                                  | P2                 |
| `lib/shopify/queries/page.ts`       | Shopify GraphQL queries stron CMS                                                               | `getPage`, `getPages`                                                                                                      | P2                 |

### Zmienne środowiskowe, konfiguracja i teksty Shopify

| plik                           | import / zależność                                                                                              | używane funkcje                | priorytet migracji |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------ |
| `.env.example`                 | `SHOPIFY_REVALIDATION_SECRET`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, `SHOPIFY_STORE_DOMAIN`                        | konfiguracja providera Shopify | P1                 |
| `lib/utils.ts`                 | walidacja `SHOPIFY_STORE_DOMAIN` i `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, komunikat z linkiem do integracji Shopify | walidacja środowiska           | P1                 |
| `lib/constants.ts`             | `SHOPIFY_GRAPHQL_API_ENDPOINT`                                                                                  | endpoint Storefront GraphQL    | P1                 |
| `lib/type-guards.ts`           | `ShopifyErrorLike`, `isShopifyError`                                                                            | obsługa błędów providera       | P1                 |
| `next.config.ts`               | hostname `cdn.shopify.com`                                                                                      | whitelist obrazów Shopify CDN  | P1                 |
| `app/page.tsx`                 | metadata opisujące storefront jako zbudowany z Shopify                                                          | tekst/SEO                      | P2                 |
| `components/welcome-toast.tsx` | toast mówi, że storefront jest powered by Shopify                                                               | tekst UI                       | P2                 |
| `README.md`                    | upstreamowe instrukcje Shopify i deploy button z integracją Shopify                                             | dokumentacja upstream          | P2                 |
| `pnpm-lock.yaml`               | wpisy zależności pośredniej `@shopify/prettier-plugin-liquid`                                                   | zależność pośrednia lockfile   | optional           |

## 2. Minimalny kontrakt dla `lib/spree`

### MVP

Te funkcje są wymagane do minimalnego flow `lista produktów → strona produktu → koszyk → checkout testowy`:

- `getProducts({ query?, reverse?, sortKey? }): Promise<Product[]>`
- `getProduct(handle: string): Promise<Product | undefined>`
- `createCart(): Promise<Cart>`
- `getCart(): Promise<Cart | undefined>`
- `addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart>`
- `updateCart(lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<Cart>`
- `removeFromCart(lineIds: string[]): Promise<Cart>`

### later

Te funkcje są ważne, ale mogą poczekać do czasu stabilnego MVP produktów i koszyka:

- `getCollection(handle: string): Promise<Collection | undefined>`
- `getCollectionProducts({ collection, reverse?, sortKey? }): Promise<Product[]>`
- `getCollections(): Promise<Collection[]>`
- `getMenu(handle: string): Promise<Menu[]>`
- `getPage(handle: string): Promise<Page>`
- `getPages(): Promise<Page[]>`

### optional

Te elementy są przydatne dla kompletności Vercel Commerce, SEO i cache, ale nie powinny blokować pierwszego adaptera:

- `getProductRecommendations(productId: string): Promise<Product[]>`
- `revalidate(req: NextRequest): Promise<NextResponse>`
- mapowanie webhooków Spree na tagi cache `products`, `collections`, `cart`
- pełne CMS pages/menu, jeśli Spree albo docelowy CMS nie będzie ich źródłem

## 3. Typy danych do utrzymania

Adapter `lib/spree` powinien zwracać dane w kształcie oczekiwanym przez istniejące komponenty UI. Najbezpieczniej utrzymać publiczne typy obecnie eksportowane z `lib/shopify/types.ts`, nawet jeśli wewnętrzne typy operacji Shopify zostaną zastąpione typami Spree.

### Product

Wymagany kształt produktu:

- `id: string`
- `handle: string` — dla Spree najpewniej slug produktu
- `availableForSale: boolean`
- `title: string` — mapowane ze Spree `name`
- `description: string`
- `descriptionHtml: string`
- `options: ProductOption[]`
- `priceRange: { maxVariantPrice: Money; minVariantPrice: Money }`
- `variants: ProductVariant[]`
- `featuredImage: Image`
- `images: Image[]`
- `seo: { title: string; description: string }`
- `tags: string[]`
- `updatedAt: string`

### Product Variant

Wymagany kształt wariantu:

- `id: string` — musi być stabilnym identyfikatorem, którego `addToCart` przyjmie jako `merchandiseId`
- `title: string`
- `availableForSale: boolean`
- `selectedOptions: { name: string; value: string }[]`
- `price: Money`

### Image

Wymagany kształt obrazu:

- `url: string`
- `altText: string`
- `width: number`
- `height: number`

Ryzyko: Spree może nie zwracać zawsze szerokości i wysokości obrazów. Adapter powinien ustalić bezpieczną strategię fallbacków albo rozszerzyć pobieranie metadanych.

### Money

Wymagany kształt ceny:

- `amount: string`
- `currencyCode: string`

Kwoty powinny pozostać stringami, bo komponenty Vercel Commerce oczekują kształtu zbliżonego do Shopify MoneyV2.

### Cart

Wymagany kształt koszyka:

- `id: string | undefined`
- `checkoutUrl: string`
- `cost.subtotalAmount: Money`
- `cost.totalAmount: Money`
- `cost.totalTaxAmount: Money`
- `lines: CartItem[]`
- `totalQuantity: number`

Dla Spree `id` może nie wystarczyć: prawdopodobnie potrzebny będzie token order/cart. Obecne UI używa cookie `cartId`, więc adapter musi zdecydować, czy `cartId` zawiera token Spree, id zamówienia, czy złożony identyfikator.

### Cart Line

Wymagany kształt pozycji koszyka:

- `id: string | undefined`
- `quantity: number`
- `cost.totalAmount: Money`
- `merchandise.id: string`
- `merchandise.title: string`
- `merchandise.selectedOptions: { name: string; value: string }[]`
- `merchandise.product.id: string`
- `merchandise.product.handle: string`
- `merchandise.product.title: string`
- `merchandise.product.featuredImage: Image`

### Collection

Wymagany kształt kolekcji:

- `handle: string`
- `title: string`
- `description: string`
- `seo: { title: string; description: string }`
- `updatedAt: string`
- `path: string`

Dla Spree kolekcja powinna mapować się na taxon/kategorię. `path` powinien pozostać zgodny z trasami Vercel Commerce, czyli np. `/search/{handle}`.

## 4. Ryzyka

- **Shopify GraphQL connection edges/nodes** — `lib/shopify/index.ts` spłaszcza `Connection<T>` przez `removeEdgesAndNodes`. Spree REST/JSON:API nie zwraca danych w tym kształcie, więc adapter Spree powinien mieć własne typy surowych odpowiedzi i dopiero na końcu mapować do publicznych typów UI.
- **Shopify cart id vs Spree cart/order token** — obecne akcje koszyka czytają cookie `cartId` i przekazują je do mutacji Shopify. Spree może wymagać tokenu order/cart oraz innych nagłówków autoryzacyjnych.
- **`merchandiseId` jako id wariantu** — komponent `AddToCart` przekazuje `selectedVariantId` do `addToCart`. W Spree ten identyfikator musi jednoznacznie wskazywać wariant akceptowany przez endpoint line items.
- **`checkoutUrl`** — Shopify zwraca gotowy URL checkoutu w koszyku. Spree checkout może być flow wieloetapowym i może nie mieć identycznego jednego URL-a.
- **Collection handles** — obecne trasy `/search/[collection]` zakładają handle kolekcji Shopify. Spree taxons mogą mieć inne permalinki, slugi albo hierarchię.
- **Menu/pages z Shopify** — `getMenu`, `getPage` i `getPages` są podpięte pod Shopify CMS. Trzeba zdecydować, czy Spree, statyczne pliki, czy inny CMS będzie źródłem tych danych.
- **Webhook revalidation** — obecne `revalidate` czyta nagłówek `x-shopify-topic` i sekret `SHOPIFY_REVALIDATION_SECRET`. Dla Spree trzeba zaprojektować nowe tematy webhooków albo prostszy mechanizm manualnej rewalidacji.
- **Obrazy z Shopify CDN** — `next.config.ts` dopuszcza `cdn.shopify.com`. Spree będzie wymagać innej domeny obrazów, prawdopodobnie domeny backendu lub storage.
- **Walidacja envów Shopify** — `lib/utils.ts` wymaga Shopify envów dla działania serwisu. Przed przełączeniem na Spree trzeba rozdzielić walidację legacy Shopify od docelowych envów Spree.
- **Teksty i README** — `app/page.tsx`, `components/welcome-toast.tsx` i `README.md` nadal komunikują Shopify jako źródło storefrontu. To może mylić agentów i developerów, chociaż nie blokuje działania MVP.
- **Ukryte produkty i kolekcje** — obecny provider filtruje tag `nextjs-frontend-hidden` i kolekcje zaczynające się od `hidden`. Spree wymaga równoważnej decyzji, jeśli backend ma obsługiwać ukrywanie produktów/taxonów.

## 5. Rekomendowany pierwszy krok implementacyjny

Najpierw utworzyć szkielet `lib/spree` z publicznymi typami zgodnymi z obecnym `Product`, `ProductVariant`, `Image`, `Money`, `Cart`, `CartItem` i `Collection`, a następnie zaimplementować tylko `getProducts()` oraz `getProduct(handle)` na prawdziwych danych ze Spree.

Uzasadnienie: homepage, listing i strona produktu pozwolą szybko zweryfikować najtrudniejsze mapowanie danych produktowych — slug/handle, warianty, ceny i obrazy — bez ryzykownego przepisywania koszyka ani checkoutu. Dopiero po tym warto podpiąć `createCart`, `addToCart`, `getCart`, `updateCart` i `removeFromCart` z jasną decyzją, co zapisujemy w cookie `cartId`.
