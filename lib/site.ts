export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.roofhub.co.nz").replace(/\/+$/, "");
export const SITE_HOST = new URL(SITE_URL).host;
export const SITE_NAME = "RoofHub NZ";
export const SITE_TAGLINE = "Know more. Build brighter.";
export const DEFAULT_DESCRIPTION =
  "Independent New Zealand roofing knowledge, pricing, guides and estimating tools for homeowners, builders, roofers and building professionals.";

/**
 * One explicit switch controls search indexing across metadata, middleware,
 * robots and sitemap generation. Production does not silently opt itself in.
 */
export function isIndexingEnabled(): boolean {
  return process.env.ALLOW_INDEXING === "true";
}

/** Only the canonical public hostname should ever be indexable. */
export function isCanonicalHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return host.toLowerCase().split(":")[0] === SITE_HOST.toLowerCase().split(":")[0];
}
