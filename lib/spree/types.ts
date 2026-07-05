import type {
  Image,
  Money,
  Product,
  ProductOption,
  ProductVariant,
  SEO,
} from "lib/shopify/types";

export type { Image, Money, Product, ProductOption, ProductVariant, SEO };

export type SpreeRelationshipData = {
  id: string;
  type: string;
};

export type SpreeResource<TAttributes = Record<string, unknown>> = {
  id: string;
  type?: string;
  attributes?: TAttributes;
  relationships?: Record<
    string,
    { data: SpreeRelationshipData | SpreeRelationshipData[] | null } | undefined
  >;
} & TAttributes;

export type SpreeStoreResponse<T> = {
  data: T;
  included?: SpreeResource[];
  meta?: Record<string, unknown>;
  links?: Record<string, unknown>;
};

export type SpreePrice = {
  amount?: string | number;
  amount_in_cents?: string | number;
  display_amount?: string;
  currency?: string;
};

export type SpreeOptionValue = {
  id?: string | number;
  name?: string;
  presentation?: string;
  option_type_name?: string;
  option_type_presentation?: string;
  option_type?: {
    name?: string;
    presentation?: string;
  };
};

export type SpreeMediaAttributes = {
  position?: number;
  alt?: string | null;
  original_url?: string;
  mini_url?: string;
  small_url?: string;
  medium_url?: string;
  large_url?: string;
  xlarge_url?: string;
  og_image_url?: string;
  thumbnail_url?: string;
  url?: string;
  width?: number;
  height?: number;
};

export type SpreeVariantAttributes = {
  id?: string | number;
  name?: string;
  sku?: string | null;
  price?: SpreePrice | string | number;
  display_price?: string;
  currency?: string;
  options_text?: string | null;
  option_values?: SpreeOptionValue[];
  purchasable?: boolean;
  in_stock?: boolean;
  is_master?: boolean;
  available?: boolean;
};

export type SpreeProductAttributes = {
  id?: string | number;
  name?: string;
  description?: string | null;
  slug?: string;
  permalink?: string;
  display_price?: string;
  price?: SpreePrice | string | number;
  currency?: string;
  available?: boolean;
  purchasable?: boolean;
  in_stock?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  updated_at?: string;
  options_text?: string | null;
  default_variant?: SpreeResource<SpreeVariantAttributes>;
  variants?: SpreeResource<SpreeVariantAttributes>[];
  media?: SpreeResource<SpreeMediaAttributes>[];
  primary_media?: SpreeResource<SpreeMediaAttributes> | null;
  option_types?: { name?: string; presentation?: string; position?: number }[];
};
