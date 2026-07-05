const spreeApiUrl = process.env.SPREE_API_URL;
const spreeImageRemotePattern = spreeApiUrl
  ? (() => {
      const url = new URL(spreeApiUrl);

      return {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port,
        pathname: "/**",
      };
    })()
  : undefined;

export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      ...(spreeImageRemotePattern ? [spreeImageRemotePattern] : []),
    ],
  },
};
