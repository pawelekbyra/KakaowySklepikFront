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
  SpreeStoreResponse,
} from "./types";

const apiUrl = process.env.SPREE_API_URL?.replace(/\/$/, "") || "";
const publishableKey = process.env.SPREE_PUBLISHABLE_KEY;
const storePath = "/api/v3/store";
const PRODUCT_EXPAND =
  "default_variant,variants,media,primary_media,option_types";

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

  const url = new URL(`${apiUrl}${storePath}${path}`);

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
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(publishableKey ? { "X-Spree-Api-Key": publishableKey } : {}),
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
  if (sortKey === "CREATED_AT")
    return reverse ? "-available_on" : "available_on";
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
    SpreeStoreResponse<SpreeResource<SpreeProductAttributes>[]>
  >({
    path: "/products",
    searchParams: {
      expand: PRODUCT_EXPAND,
      "q[name_cont]": args?.query,
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
    SpreeStoreResponse<SpreeResource<SpreeProductAttributes>>
  >({
    path: `/products/${encodeURIComponent(handle)}`,
    searchParams: {
      expand: PRODUCT_EXPAND,
    },
  });

  return reshapeProduct(response.data, response.included);
}
