import QuickRoofEstimate from "@/components/quick-estimate/QuickRoofEstimate";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Quick roof estimate",
  description: "Build an indicative NZ roof estimate from approximate shape, size, pitch and roofing product. No measurements or sign-up required to start.",
  path: "/tools/roof-estimate",
  noIndex: true
});

export default function RoofEstimatePage() {
  return <main className="section section--white"><QuickRoofEstimate /></main>;
}
