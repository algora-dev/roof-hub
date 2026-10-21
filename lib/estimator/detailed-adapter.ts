"use client";

import type {
  ApexPayload,
  Estimate,
  EstimatorHandle,
  MeasurementGroup,
  MountOptions,
  Project,
  RateCard
} from "@/components/roofhub-types";

export type DetailedEstimatorModule = {
  mountRoofHub(element: HTMLElement, options?: MountOptions): EstimatorHandle;
  newProject(): Project;
  newEntry(group?: MeasurementGroup, basis?: "plan" | "actual", extra?: Record<string, unknown>): unknown;
  calculateEstimate(project: Project, card?: RateCard): Estimate;
  fromApexTakeoff(payload: ApexPayload, options?: { units?: "metric" | "imperial" }): unknown;
  applyApexTakeoff(project: Project, payload: ApexPayload, options?: { units?: "metric" | "imperial" }): Project;
  DEFAULT_RATE_CARD: RateCard;
};

export async function loadDetailedEstimatorModule(assetBase = "/roofhub-estimator"): Promise<DetailedEstimatorModule> {
  if (typeof window === "undefined") throw new Error("The detailed estimator runtime is browser-only.");
  const base = new URL(assetBase.replace(/\/$/, "") + "/", window.location.origin);
  if (base.origin !== window.location.origin) {
    throw new Error("Serve the estimator assets from this website's own origin.");
  }
  const moduleUrl = new URL("src/index.mjs", base).href;
  return import(/* webpackIgnore: true */ moduleUrl) as Promise<DetailedEstimatorModule>;
}
