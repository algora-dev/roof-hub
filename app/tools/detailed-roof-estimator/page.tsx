import RoofHubEstimator from "@/components/RoofHubEstimator";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Detailed roof estimator",
  description: "Measure your roof from a plan or enter your own quantities and get a preliminary low/high cost range.",
  path: "/tools/detailed-roof-estimator",
  noIndex: true
});

export default function DetailedRoofEstimatorPage() {
  return <RoofHubEstimator />;
}
