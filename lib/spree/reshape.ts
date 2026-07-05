import type {
  Image,
  Money,
  Product,
  ProductOption,
  ProductVariant,
  SpreeImageAttributes,
  SpreeProductAttributes,
  SpreeResource,
  SpreeStorefrontResponse,
  SpreeVariantAttributes,
} from "./types";

const DEFAULT_IMAGE_SIZE = 600;
const DEFAULT_CURRENCY = "PLN";

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "").trim();

const getRelationshipIds = (
  resource: SpreeResource,
  name: string,
): { id: string; type: string }[] => {
  const relationship = resource.relationships?.[name]?.data;

  if (!relationship) return [];

  return Array.isArray(relationship) ? relationship : [relationship];
};

const findIncluded = <TAttributes>(
  included: SpreeResource[] | undefined,
  relationship: { id: string; type: string },
): SpreeResource<TAttributes> | undefined => {
  return included?.find(
    (resource) =>
      resource.id === relationship.id && resource.type === relationship.type,
  ) as SpreeResource<TAttributes> | undefined;
};

const parseOptionsText = (
  optionsText: string | null | undefined,
): { name: string; value: string }[] => {
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

const parseMoney = (
  amount: string | number | undefined,
  currencyCode: string | undefined,
): Money => ({
  amount: amount === undefined ? "0.00" : String(amount),
  currencyCode: currencyCode || DEFAULT_CURRENCY,
});

const isAvailable = (
  attributes: SpreeProductAttributes | SpreeVariantAttributes,
): boolean => {
  return Boolean(
    attributes.purchasable ??
      attributes.in_stock ??
      attributes.available ??
      true,
  );
};

const reshapeImage = (
  image: SpreeResource<SpreeImageAttributes>,
  productTitle: string,
): Image => {
  const attributes = image.attributes;
  const url =
    attributes.original_url ||
    attributes.large_url ||
    attributes.product_url ||
    attributes.url ||
    attributes.small_url ||
    attributes.mini_url ||
    "";

  return {
    url,
    altText: attributes.alt || productTitle,
    width: attributes.width || DEFAULT_IMAGE_SIZE,
    height: attributes.height || DEFAULT_IMAGE_SIZE,
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
  const attributes = variant.attributes;
  const selectedOptions = parseOptionsText(attributes.options_text);

  return {
    id: variant.id,
    title:
      attributes.name ||
      attributes.sku ||
      product.attributes.name ||
      variant.id,
    availableForSale: isAvailable(attributes),
    selectedOptions,
    price: parseMoney(
      attributes.price ?? product.attributes.price,
      attributes.currency ?? product.attributes.currency,
    ),
  };
};

export function reshapeProduct(
  product: SpreeResource<SpreeProductAttributes> | undefined,
  included?: SpreeResource[],
): Product | undefined {
  if (!product) return undefined;

  const attributes = product.attributes;
  const title = attributes.name || product.id;
  const descriptionHtml = attributes.description || "";
  const description = stripHtml(descriptionHtml);
  const handle = attributes.slug || attributes.permalink || product.id;

  const variantRelationships = [
    ...getRelationshipIds(product, "default_variant"),
    ...getRelationshipIds(product, "variants"),
  ];
  const variants = variantRelationships
    .map((relationship) =>
      findIncluded<SpreeVariantAttributes>(included, relationship),
    )
    .filter((variant): variant is SpreeResource<SpreeVariantAttributes> =>
      Boolean(variant),
    )
    .filter(
      (variant, index, all) =>
        all.findIndex((candidate) => candidate.id === variant.id) === index,
    )
    .map((variant) => reshapeVariant(variant, product));

  const fallbackVariant: ProductVariant = {
    id: product.id,
    title,
    availableForSale: isAvailable(attributes),
    selectedOptions: [],
    price: parseMoney(attributes.price, attributes.currency),
  };
  const productVariants = variants.length ? variants : [fallbackVariant];

  const prices = productVariants.map((variant) => Number(variant.price.amount));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currencyCode =
    productVariants[0]?.price.currencyCode || DEFAULT_CURRENCY;

  const images = getRelationshipIds(product, "images")
    .map((relationship) =>
      findIncluded<SpreeImageAttributes>(included, relationship),
    )
    .filter((image): image is SpreeResource<SpreeImageAttributes> =>
      Boolean(image),
    )
    .sort((a, b) => (a.attributes.position || 0) - (b.attributes.position || 0))
    .map((image) => reshapeImage(image, title));
  const featuredImage = images[0] || {
    url: "",
    altText: title,
    width: DEFAULT_IMAGE_SIZE,
    height: DEFAULT_IMAGE_SIZE,
  };

  return {
    id: product.id,
    handle,
    availableForSale: productVariants.some(
      (variant) => variant.availableForSale,
    ),
    title,
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
      title: attributes.meta_title || title,
      description: attributes.meta_description || description,
    },
    tags: [],
    updatedAt: attributes.updated_at || new Date().toISOString(),
  };
}

export function reshapeProducts(
  response: SpreeStorefrontResponse<SpreeResource<SpreeProductAttributes>[]>,
): Product[] {
  return response.data
    .map((product) => reshapeProduct(product, response.included))
    .filter((product): product is Product => Boolean(product));
}
