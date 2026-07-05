import type {
  Image,
  Money,
  Product,
  ProductOption,
  ProductVariant,
  SpreeMediaAttributes,
  SpreeOptionValue,
  SpreePrice,
  SpreeProductAttributes,
  SpreeResource,
  SpreeStoreResponse,
  SpreeVariantAttributes,
} from "./types";

const DEFAULT_IMAGE_SIZE = 600;
const DEFAULT_CURRENCY = "PLN";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const attrs = <T>(
  resource: SpreeResource<T> | undefined,
): T & Record<string, unknown> =>
  ({ ...(resource || {}), ...(resource?.attributes || {}) }) as T &
    Record<string, unknown>;

const getRelationshipIds = (resource: SpreeResource, name: string) => {
  const relationship = resource.relationships?.[name]?.data;
  if (!relationship) return [];
  return Array.isArray(relationship) ? relationship : [relationship];
};

const findIncluded = <TAttributes>(
  included: SpreeResource[] | undefined,
  relationship: { id: string; type: string },
): SpreeResource<TAttributes> | undefined =>
  included?.find(
    (resource) =>
      resource.id === relationship.id && resource.type === relationship.type,
  ) as SpreeResource<TAttributes> | undefined;

const normalizeArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const parseOptionsText = (optionsText: string | null | undefined) => {
  if (!optionsText) return [];

  return optionsText
    .split(",")
    .map((option) => option.trim())
    .map((option) => {
      const [name, ...valueParts] = option.split(":");
      return {
        name: name?.trim() || "Option",
        value: valueParts.join(":").trim() || option,
      };
    })
    .filter((option) => option.value.length > 0);
};

const optionValueToSelectedOption = (optionValue: SpreeOptionValue) => ({
  name:
    optionValue.option_type?.presentation ||
    optionValue.option_type_presentation ||
    optionValue.option_type?.name ||
    optionValue.option_type_name ||
    "Option",
  value:
    optionValue.presentation ||
    optionValue.name ||
    String(optionValue.id || ""),
});

const amountFromDisplay = (displayAmount: string | undefined) => {
  const match = displayAmount?.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match?.[0];
};

const parseMoney = (
  price: SpreePrice | string | number | undefined,
  currencyCode: string | undefined,
): Money => {
  if (typeof price === "object" && price !== null) {
    const amount =
      price.amount ??
      (price.amount_in_cents !== undefined
        ? Number(price.amount_in_cents) / 100
        : undefined) ??
      amountFromDisplay(price.display_amount);

    return {
      amount: amount === undefined ? "0.00" : String(amount),
      currencyCode: price.currency || currencyCode || DEFAULT_CURRENCY,
    };
  }

  return {
    amount: price === undefined ? "0.00" : String(price),
    currencyCode: currencyCode || DEFAULT_CURRENCY,
  };
};

const isAvailable = (
  attributes: SpreeProductAttributes | SpreeVariantAttributes,
) =>
  Boolean(
    attributes.purchasable ??
      attributes.in_stock ??
      attributes.available ??
      true,
  );

const reshapeImage = (
  media: SpreeResource<SpreeMediaAttributes>,
  productTitle: string,
): Image => {
  const attributes = attrs(media);
  const url =
    attributes.original_url ||
    attributes.thumbnail_url ||
    attributes.large_url ||
    attributes.xlarge_url ||
    attributes.medium_url ||
    attributes.og_image_url ||
    attributes.small_url ||
    attributes.mini_url ||
    attributes.url ||
    "";

  return {
    url: String(url),
    altText: attributes.alt || productTitle,
    width: Number(attributes.width) || DEFAULT_IMAGE_SIZE,
    height: Number(attributes.height) || DEFAULT_IMAGE_SIZE,
  };
};

const buildOptions = (variants: ProductVariant[]): ProductOption[] => {
  const optionValues = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    variant.selectedOptions.forEach((option) => {
      const values = optionValues.get(option.name) || new Set<string>();
      values.add(option.value);
      optionValues.set(option.name, values);
    });
  });

  return Array.from(optionValues.entries()).map(([name, values]) => ({
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    values: Array.from(values),
  }));
};

const reshapeVariant = (
  variant: SpreeResource<SpreeVariantAttributes>,
  product: SpreeResource<SpreeProductAttributes>,
): ProductVariant => {
  const attributes = attrs(variant);
  const productAttributes = attrs(product);
  const selectedOptions = attributes.option_values?.length
    ? attributes.option_values
        .map(optionValueToSelectedOption)
        .filter((option) => option.value)
    : parseOptionsText(attributes.options_text);

  return {
    id: String(attributes.id || variant.id),
    title:
      attributes.name ||
      attributes.sku ||
      productAttributes.name ||
      String(variant.id),
    availableForSale: isAvailable(attributes),
    selectedOptions,
    price: parseMoney(
      attributes.price ?? productAttributes.price,
      attributes.currency ?? productAttributes.currency,
    ),
  };
};

export function reshapeProduct(
  product: SpreeResource<SpreeProductAttributes> | undefined,
  included?: SpreeResource[],
): Product | undefined {
  if (!product) return undefined;

  const attributes = attrs(product);
  const title = attributes.name || String(product.id);
  const descriptionHtml =
    attributes.description_html || attributes.description || "";
  const description = attributes.description || stripHtml(descriptionHtml);
  const handle =
    attributes.slug ||
    attributes.permalink ||
    String(attributes.id || product.id);

  const variantResources = [
    ...normalizeArray(attributes.default_variant),
    ...normalizeArray(attributes.variants),
    ...getRelationshipIds(product, "default_variant").map((relationship) =>
      findIncluded<SpreeVariantAttributes>(included, relationship),
    ),
    ...getRelationshipIds(product, "variants").map((relationship) =>
      findIncluded<SpreeVariantAttributes>(included, relationship),
    ),
  ].filter((variant): variant is SpreeResource<SpreeVariantAttributes> =>
    Boolean(variant),
  );

  const variants = variantResources
    .filter(
      (variant, index, all) =>
        all.findIndex(
          (candidate) => String(candidate.id) === String(variant.id),
        ) === index,
    )
    .map((variant) => reshapeVariant(variant, product));

  const fallbackVariant: ProductVariant = {
    id: String(product.id),
    title,
    availableForSale: isAvailable(attributes),
    selectedOptions: parseOptionsText(attributes.options_text),
    price: parseMoney(attributes.price, attributes.currency),
  };
  const productVariants = variants.length ? variants : [fallbackVariant];

  const prices = productVariants
    .map((variant) => Number(variant.price.amount))
    .filter(Number.isFinite);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const currencyCode =
    productVariants[0]?.price.currencyCode || DEFAULT_CURRENCY;

  const primaryMedia = [
    ...normalizeArray(attributes.primary_media),
    ...getRelationshipIds(product, "primary_media").map((relationship) =>
      findIncluded<SpreeMediaAttributes>(included, relationship),
    ),
  ].filter((image): image is SpreeResource<SpreeMediaAttributes> =>
    Boolean(image),
  );
  const media = [
    ...primaryMedia,
    ...normalizeArray(attributes.media),
    ...getRelationshipIds(product, "media").map((relationship) =>
      findIncluded<SpreeMediaAttributes>(included, relationship),
    ),
  ].filter((image): image is SpreeResource<SpreeMediaAttributes> =>
    Boolean(image),
  );
  const uniqueMedia = media.filter(
    (image, index, all) =>
      all.findIndex(
        (candidate) => String(candidate.id) === String(image.id),
      ) === index,
  );
  const featuredMedia =
    primaryMedia[0] ||
    uniqueMedia.find((image) => Boolean(attrs(image).thumbnail_url)) ||
    uniqueMedia[0];
  const images = uniqueMedia
    .sort(
      (a, b) =>
        (Number(attrs(a).position) || 0) - (Number(attrs(b).position) || 0),
    )
    .map((image) => reshapeImage(image, title));
  const featuredImage = featuredMedia
    ? reshapeImage(featuredMedia, title)
    : {
        url: "",
        altText: title,
        width: DEFAULT_IMAGE_SIZE,
        height: DEFAULT_IMAGE_SIZE,
      };

  return {
    id: String(attributes.id || product.id),
    handle: String(handle),
    availableForSale: productVariants.some(
      (variant) => variant.availableForSale,
    ),
    title: String(title),
    description,
    descriptionHtml,
    options: buildOptions(productVariants),
    priceRange: {
      maxVariantPrice: { amount: maxPrice.toFixed(2), currencyCode },
      minVariantPrice: { amount: minPrice.toFixed(2), currencyCode },
    },
    variants: productVariants,
    featuredImage,
    images,
    seo: {
      title: attributes.meta_title || String(title),
      description: attributes.meta_description || description,
    },
    tags: [],
    updatedAt: attributes.updated_at || new Date().toISOString(),
  };
}

export function reshapeProducts(
  response: SpreeStoreResponse<SpreeResource<SpreeProductAttributes>[]>,
): Product[] {
  return response.data
    .map((product) => reshapeProduct(product, response.included))
    .filter((product): product is Product => Boolean(product));
}
