import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  isIndexingEnabled
} from "@/lib/site";

export { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, isIndexingEnabled };

type PageMetaInput = {
  title: string | { absolute: string };
  description: string;
  path: string;
  noIndex?: boolean;
};

function ogTitle(title: PageMetaInput["title"]): string {
  return typeof title === "string" ? `${title} | ${SITE_NAME}` : title.absolute;
}

/** Standard page metadata: unique title/description, self-referencing canonical, OG card. */
export function pageMetadata({ title, description, path, noIndex }: PageMetaInput): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  const indexingEnabled = isIndexingEnabled();
  const robots = !indexingEnabled
    ? { index: false, follow: false, noarchive: true, nosnippet: true, nocache: true }
    : noIndex
      ? { index: false, follow: true, noarchive: true, nosnippet: true, nocache: true }
      : { index: true, follow: true };
  return {
    title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title: ogTitle(title),
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }]
    }
  };
}
