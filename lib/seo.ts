import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.roofhub.co.nz").replace(/\/+$/, "");
export const SITE_NAME = "RoofHub NZ";
export const SITE_TAGLINE = "Know more. Build brighter.";
export const DEFAULT_DESCRIPTION =
  "Practical New Zealand roofing knowledge, planning tools and transparent project guidance.";

/** Public contact/corrections mailbox. Empty until a mailbox is confirmed. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

/**
 * Indexing is on for production deployments unless explicitly disabled,
 * and stays off for local/preview builds unless explicitly enabled.
 */
export function isIndexingEnabled(): boolean {
  if (process.env.ALLOW_INDEXING === "true") return true;
  if (process.env.ALLOW_INDEXING === "false") return false;
  return process.env.VERCEL_ENV === "production";
}

type PageMetaInput = {
  /** Plain page title (template suffix applied) or an absolute title. */
  title: string | { absolute: string };
  description: string;
  /** Canonical path, e.g. "/" or "/guides/some-guide". */
  path: string;
  noIndex?: boolean;
};

function ogTitle(title: PageMetaInput["title"]): string {
  return typeof title === "string" ? `${title} | ${SITE_NAME}` : title.absolute;
}

/** Standard page metadata: unique title/description, self-referencing canonical, OG card. */
export function pageMetadata({ title, description, path, noIndex }: PageMetaInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle(title),
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }]
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {})
  };
}
