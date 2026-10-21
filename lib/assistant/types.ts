import type { RoofProject } from "@/lib/roof-project";
import type { ToolContextSnapshot } from "@/lib/tool-context";

export type AssistantRole = "user" | "assistant";

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
  createdAt: string;
};

export type AssistantSource = {
  label: string;
  href: string;
  kind: "roofhub" | "external";
};

export type AssistantEstimateCard = {
  product: string;
  productLabel: string;
  status: "complete" | "partial" | "unpriced" | "incompatible" | "error";
  low: number | null;
  high: number | null;
  approved: boolean;
  reviewOnly: boolean;
  publicationVersion: string | null;
  detailLevel: "basic" | "improved" | "detailed";
  missing: string[];
  assumptions: string[];
  exclusions: string[];
  compatibilityMessage: string;
};

export type AssistantAction =
  | { type: "navigate"; label: string; href: string }
  | { type: "open-tool"; label: string; tool: "quick-estimate" | "detailed-estimate" | "quote-checker"; href: string }
  | { type: "open-enquiry"; label: string; href: string }
  | { type: "quick-reply"; label: string; message: string };

export type AssistantProjectPatch = Partial<Pick<RoofProject,
  "projectType" | "existingRoof" | "existingRoofDetail" | "desiredRoof" | "estimate"
>> & {
  geometry?: Partial<RoofProject["geometry"]>;
};

export type AssistantTurnRequest = {
  message: string;
  project: RoofProject | null;
  context: ToolContextSnapshot;
};

export type AssistantTurnResponse = {
  ok: true;
  message: AssistantMessage;
  actions: AssistantAction[];
  sources: AssistantSource[];
  estimate: AssistantEstimateCard | null;
  projectPatch: AssistantProjectPatch | null;
  sessionId: string;
};

export type AssistantErrorResponse = {
  ok: false;
  error: string;
  code?: string;
};
