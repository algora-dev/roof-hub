import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PreviewBanner } from "@/components/PreviewBanner";

const indexingEnabled = process.env.ALLOW_INDEXING === "true";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://roofhub.co.nz";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "RoofHub NZ — Roofing knowledge, pricing & tools", template: "%s | RoofHub NZ" },
  description: "Practical New Zealand roofing knowledge, planning tools and transparent project guidance.",
  icons: { icon: "/brand/roofhub-icon.png" },
  robots: indexingEnabled
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true, nosnippet: true, nocache: true },
  openGraph: { title: "RoofHub NZ", description: "Know more. Build brighter.", type: "website", url: siteUrl }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NZ"><body><PreviewBanner /><Header /><main>{children}</main><Footer /></body></html>;
}
