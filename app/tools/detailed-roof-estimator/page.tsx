import type { Metadata } from "next";
import RoofHubEstimator from "@/components/RoofHubEstimator";

export const metadata: Metadata = {
  title: "Detailed roof estimator",
  description: "Measure your roof from a plan or enter your own quantities and get a preliminary low/high cost range.",
  robots: { index: false, follow: false }, // Preview pricing stays out of search until the rate card is approved.
};

export default function DetailedRoofEstimatorPage() {
  return <RoofHubEstimator />;
}
