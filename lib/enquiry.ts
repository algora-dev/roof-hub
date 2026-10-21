import { parseRoofProject, type RoofProject } from "@/lib/roof-project";

export const PROJECT_ENQUIRY_SCHEMA_VERSION = 1 as const;

export type RequestedHelp = "understand-project" | "written-quote" | "multiple-quotes" | "quote-review";

export type ProjectEnquiryPayload = {
  schemaVersion: typeof PROJECT_ENQUIRY_SCHEMA_VERSION;
  type: "roofhub-project-enquiry";
  createdAt: string;
  requestedHelp: RequestedHelp;
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    notes: string;
  };
  consent: {
    contactByRoofHub: true;
    shareWithRoofingPartners: boolean;
    version: string;
    at: string;
  };
  project: RoofProject;
};

export type LeadEnvelope = {
  schemaVersion: 1;
  receivedAt: string;
  requestedHelp: RequestedHelp;
  contact: ProjectEnquiryPayload["contact"];
  consent: ProjectEnquiryPayload["consent"];
  project: RoofProject;
};

const requestedHelpValues = new Set<RequestedHelp>(["understand-project", "written-quote", "multiple-quotes", "quote-review"]);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function parseProjectEnquiryPayload(value: unknown): ProjectEnquiryPayload | null {
  const input = record(value);
  if (!input || input.schemaVersion !== PROJECT_ENQUIRY_SCHEMA_VERSION || input.type !== "roofhub-project-enquiry") return null;
  const contact = record(input.contact);
  const consent = record(input.consent);
  const project = parseRoofProject(input.project);
  if (!contact || !consent || !project) return null;

  const name = text(contact.name, 120);
  const email = text(contact.email, 254);
  if (!name || !isValidEmail(email)) return null;
  const requestedHelp = typeof input.requestedHelp === "string" && requestedHelpValues.has(input.requestedHelp as RequestedHelp)
    ? input.requestedHelp as RequestedHelp
    : null;
  if (!requestedHelp || consent.contactByRoofHub !== true) return null;

  return {
    schemaVersion: PROJECT_ENQUIRY_SCHEMA_VERSION,
    type: "roofhub-project-enquiry",
    createdAt: text(input.createdAt, 40) || new Date().toISOString(),
    requestedHelp,
    contact: {
      name,
      email,
      phone: text(contact.phone, 80),
      location: text(contact.location, 300),
      notes: text(contact.notes, 8000)
    },
    consent: {
      contactByRoofHub: true,
      shareWithRoofingPartners: consent.shareWithRoofingPartners === true,
      version: text(consent.version, 80) || "project-enquiry-v1",
      at: text(consent.at, 40) || new Date().toISOString()
    },
    project
  };
}

export function toLeadEnvelope(payload: ProjectEnquiryPayload): LeadEnvelope {
  return {
    schemaVersion: 1,
    receivedAt: new Date().toISOString(),
    requestedHelp: payload.requestedHelp,
    contact: payload.contact,
    consent: payload.consent,
    project: payload.project
  };
}
