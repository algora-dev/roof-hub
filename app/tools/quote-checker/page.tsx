import QuoteChecker from "@/components/quote-checker/QuoteChecker";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Roofing Quote Checker NZ",
  description: "Check a New Zealand roofing quote against your RoofHub project range and compare GST, product and scope without judging a quote from price alone.",
  path: "/tools/quote-checker",
  noIndex: true
});

export default function QuoteCheckerPage() {
  return <main><QuoteChecker /></main>;
}
