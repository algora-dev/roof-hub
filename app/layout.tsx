import type { Metadata } from "next";
import "./globals.css";
import "./evidence.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PreviewBanner } from "@/components/PreviewBanner";
import { Analytics } from "@/components/Analytics";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL, isIndexingEnabled } from "@/lib/seo";

const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Roofing pricing, guides & tools`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  icons: { icon: "/brand/roofhub-icon.png" },
  robots: isIndexingEnabled()
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true, nosnippet: true, nocache: true },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }]
  },
  ...(googleVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {})
        }
      }
    : {})
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RoofHub NZ",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/roofhub-mark-black.png`,
  description: DEFAULT_DESCRIPTION
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoofHub NZ",
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: "en-NZ",
  publisher: { "@type": "Organization", name: "RoofHub NZ", url: SITE_URL }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NZ">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }} />
        <PreviewBanner />
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
