import { TAGS } from "lib/constants";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";
import { reshapeProduct, reshapeProducts } from "./reshape";
import type {
  Product,
  SpreeProductAttributes,
  SpreeResource,
  SpreeStorefrontResponse,
} from "./types";

const apiUrl = process.env.SPREE_API_URL?.replace(/\/$/, "") || "";
const publishableKey = process.env.SPREE_PUBLISHABLE_KEY;
const storefrontPath = "/api/v2/storefront";

type SpreeFetchOptions = {
  path: string;
  searchParams?: Record<string, string | undefined>;
};

const getSpreeEndpoint = (
  path: string,
  searchParams?: Record<string, string | undefined>,
) => {
  if (!apiUrl) {
    throw new Error(
      "SPREE_API_URL environment variable is not set. Configure Spree Store API before using lib/spree.",
    );
  }

  const url = new URL(`${apiUrl}${storefrontPath}${path}`);

  Object.entries(searchParams || {}).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  return url;
};

async function spreeFetch<T>({
  path,
  searchParams,
}: SpreeFetchOptions): Promise<T> {
  const endpoint = getSpreeEndpoint(path, searchParams);

  const result = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      // Assumption for Spree Store API publishable keys. If the backend uses a
      // different header, this is isolated here for easy replacement.
      ...(publishableKey ? { "X-Spree-Storefront-Token": publishableKey } : {}),
    },
  });

  const body = await result.json().catch(() => undefined);

  if (!result.ok) {
    throw new Error(
      `Spree Store API request failed (${result.status}) for ${endpoint.pathname}: ${JSON.stringify(body)}`,
    );
  }

  return body as T;
}

const getSortParam = (sortKey?: string, reverse?: boolean) => {
  if (sortKey === "PRICE") return reverse ? "-price" : "price";
  if (sortKey === "CREATED_AT") return reverse ? "-updated_at" : "updated_at";
  return undefined;
};

export async function getProducts(args?: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const response = await spreeFetch<
    SpreeStorefrontResponse<SpreeResource<SpreeProductAttributes>[]>
  >({
    path: "/products",
    searchParams: {
      include: "default_variant,variants,images,option_types",
      "filter[name]": args?.query,
      sort: getSortParam(args?.sortKey, args?.reverse),
    },
  });

  const products = reshapeProducts(response);

  if (
    !args?.reverse ||
    args.sortKey === "PRICE" ||
    args.sortKey === "CREATED_AT"
  ) {
    return products;
  }

  return [...products].reverse();
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const response = await spreeFetch<
    SpreeStorefrontResponse<SpreeResource<SpreeProductAttributes>>
  >({
    path: `/products/${encodeURIComponent(handle)}`,
    searchParams: {
      include: "default_variant,variants,images,option_types",
    },
  });

  return reshapeProduct(response.data, response.included);
}
