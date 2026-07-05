import type {
  Image,
  Money,
  Product,
  ProductOption,
  ProductVariant,
  SEO,
} from "lib/shopify/types";

export type { Image, Money, Product, ProductOption, ProductVariant, SEO };

export type SpreeResource<TAttributes = Record<string, unknown>> = {
  id: string;
  type: string;
  attributes: TAttributes;
  relationships?: Record<
    string,
    { data: SpreeRelationshipData | SpreeRelationshipData[] | null } | undefined
  >;
};

export type SpreeRelationshipData = {
  id: string;
  type: string;
};

export type SpreeStorefrontResponse<T> = {
  data: T;
  included?: SpreeResource[];
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
};

export type SpreeProductAttributes = {
  name?: string;
  description?: string | null;
  slug?: string;
  permalink?: string;
  display_price?: string;
  price?: string | number;
  currency?: string;
  available?: boolean;
  purchasable?: boolean;
  in_stock?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  updated_at?: string;
  options_text?: string | null;
};

export type SpreeVariantAttributes = {
  name?: string;
  sku?: string | null;
  display_price?: string;
  price?: string | number;
  currency?: string;
  options_text?: string | null;
  purchasable?: boolean;
  in_stock?: boolean;
  is_master?: boolean;
  available?: boolean;
};

export type SpreeImageAttributes = {
  position?: number;
  alt?: string | null;
  original_url?: string;
  large_url?: string;
  product_url?: string;
  small_url?: string;
  mini_url?: string;
  url?: string;
  width?: number;
  height?: number;
};

export type SpreeOptionTypeAttributes = {
  name?: string;
  presentation?: string;
  position?: number;
};
