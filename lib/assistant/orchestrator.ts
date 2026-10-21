import { createRoofProject, type RoofProject } from "@/lib/roof-project";
import type { ToolContextSnapshot } from "@/lib/tool-context";
import type { AssistantAction, AssistantEstimateCard, AssistantKnowledgeDiagnostics, AssistantProjectPatch, AssistantSource } from "@/lib/assistant/types";
import type { AssistantSession } from "@/lib/assistant/session";
import { retrieveAssistantKnowledge } from "@/lib/assistant/knowledge";
import { approvedAssistantPath, commonAssistantDestinations } from "@/lib/assistant/navigation";
import { applyAssistantProjectPatch, normaliseAssistantProjectPatch } from "@/lib/assistant/project-patch";
import { estimateProjectForAssistant } from "@/lib/assistant/pricing.mjs";
import { assessRoofCondition } from "@/lib/assistant/roof-condition-triage.mjs";

const API_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-6-luna";
// Owner decision 2026-10-21: GPT-6 Luna on low reasoning effort (cheaper/faster), matches quotecore scan-assist routing.
const REASONING_EFFORT = "low";
const MAX_TOOL_ROUNDS = 4;

type ResponseOutputItem = {
  type?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type?: string; text?: string }>;
};

type OpenAIResponse = {
  id?: string;
  output?: ResponseOutputItem[];
  error?: { message?: string };
};

type OrchestrationResult = {
  text: string;
  actions: AssistantAction[];
  sources: AssistantSource[];
  estimate: AssistantEstimateCard | null;
  projectPatch: AssistantProjectPatch | null;
  knowledgeDiagnostics: AssistantKnowledgeDiagnostics;
};

function mergeProjectPatch(current: AssistantProjectPatch | null, incoming: AssistantProjectPatch): AssistantProjectPatch {
  return {
    ...(current ?? {}),
    ...incoming,
    geometry: current?.geometry || incoming.geometry ? { ...(current?.geometry ?? {}), ...(incoming.geometry ?? {}) } : undefined
  };
}

function assistantTools() {
  return [
    {
      type: "function",
      name: "update_project",
      description: "Store roofing project facts the user actually supplied. Do not infer missing facts. Use this before estimating when the user has just given project details.",
      parameters: {
        type: "object",
        properties: {
          projectType: { type: "string", enum: ["new", "reroof", "unknown"] },
          existingRoof: { type: "string", enum: ["long-run-metal", "pressed-metal-tile", "concrete-tile", "membrane", "other", "unknown"] },
          desiredRoof: { type: "string", enum: ["corrugate", "five-rib", "pressed-metal-tile", "tray-standing-seam", "membrane", "undecided"] },
          geometry: {
            type: "object",
            properties: {
              roofShape: { type: "string", enum: ["skillion", "gable", "hip", "gable-valley", "hip-valley", "multi-section", "dormer-complex", "flat-low-slope", "unknown"] },
              sizeBand: { type: "string", enum: ["small", "small-medium", "medium", "medium-large", "large", "very-large", "unknown"] },
              areaSource: { type: "string", enum: ["building-footprint", "total-floor-area", "roof-area", "estimated", "unknown"] },
              floorAreaM2: { type: ["number", "null"] },
              footprintAreaM2: { type: ["number", "null"] },
              roofAreaM2: { type: ["number", "null"] },
              pitchBand: { type: "string", enum: ["low", "typical", "steep", "unknown"] },
              exactPitchDegrees: { type: ["number", "null"] },
              storeys: { type: ["integer", "null"], enum: [1, 2, null] },
              complexities: { type: "array", items: { type: "string", enum: ["two-storey", "difficult-access", "dormers", "multiple-sections", "skylights-or-chimneys", "attached-flat-section"] } }
            },
            additionalProperties: false
          }
        },
        additionalProperties: false
      }
    },
    {
      type: "function",
      name: "estimate_project",
      description: "Calculate an indicative roof estimate using RoofHub's deterministic estimator. Never make up a price yourself. Call this when the user asks what their project may cost and enough project facts are available. You may supply a product override if the project has not stored one yet.",
      parameters: {
        type: "object",
        properties: {
          desiredRoof: { type: "string", enum: ["corrugate", "five-rib", "pressed-metal-tile", "tray-standing-seam", "membrane"] }
        },
        additionalProperties: false
      }
    },
    {
      type: "function",
      name: "assess_roof_condition",
      description: "Neutral directional triage for repair, restoration or replacement questions using condition facts the user supplied. It is not a roof inspection or diagnosis. Prefer asking one targeted missing question when spread, recurrence or visible condition is unknown. Never infer roof condition from age or aerial imagery.",
      parameters: {
        type: "object",
        properties: {
          roofSystem: { type: "string", enum: ["metal", "concrete-tile", "pressed-metal-tile", "membrane", "other", "unknown"] },
          issueSpread: { type: "string", enum: ["localised", "multiple-areas", "widespread", "unknown"] },
          recurrence: { type: "string", enum: ["first-time", "repeated-same-area", "repeated-different-areas", "unknown"] },
          surfaceCondition: { type: "string", enum: ["surface-wear", "local-damage", "perforation-or-missing-material", "sagging-or-structural-movement", "unknown"] },
          activeLeaks: { type: "string", enum: ["none", "one-area", "multiple-areas", "unknown"] },
          suspectedAsbestos: { type: "string", enum: ["yes", "no", "unknown"] }
        },
        additionalProperties: false
      }
    },
    {
      type: "function",
      name: "navigate",
      description: `Create a navigation action to an approved RoofHub page. Common destinations:\n${commonAssistantDestinations()}`,
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, label: { type: "string" } },
        required: ["path"],
        additionalProperties: false
      }
    },
    {
      type: "function",
      name: "open_tool",
      description: "Offer the user the appropriate RoofHub project tool, including the Quote Checker when they already have a roofing quote.",
      parameters: {
        type: "object",
        properties: { tool: { type: "string", enum: ["quick-estimate", "detailed-estimate", "quote-checker"] } },
        required: ["tool"],
        additionalProperties: false
      }
    },
    {
      type: "function",
      name: "open_enquiry",
      description: "Offer RoofHub human/project help only when the user asks to proceed, wants a written contractor quote, wants RoofHub to review something, or wants a person involved.",
      parameters: { type: "object", properties: {}, additionalProperties: false }
    }
  ];
}

function projectSummary(project: RoofProject): string {
  return JSON.stringify({
    projectType: project.projectType,
    existingRoof: project.existingRoof,
    existingRoofDetail: project.existingRoofDetail,
    desiredRoof: project.desiredRoof,
    geometry: project.geometry,
    estimate: project.estimate ? {
      low: project.estimate.low,
      high: project.estimate.high,
      detailLevel: project.estimate.detailLevel,
      gstBasis: project.estimate.gstBasis,
      rateCardId: project.estimate.rateCardId
    } : null
  });
}

function systemInstructions(project: RoofProject, context: ToolContextSnapshot, knowledge: string, diagnostics: AssistantKnowledgeDiagnostics): string {
  return `You are Ask RoofHub, the conversational interface for RoofHub NZ, an independent New Zealand roofing knowledge, pricing and decision-support platform used by homeowners, builders, roofers and building professionals.

AUTHORITY RULES
1. The model interprets and explains. Software calculates and acts.
2. Never invent a project price, rate, total, range, measurement, source or URL. For a project estimate, call estimate_project. You may discuss a published price observation only when it appears in APPROVED ROOFHUB KNOWLEDGE below.
3. Never imply that a RoofHub estimate is a contractor quote. Call it indicative or a planning estimate.
4. Never call a roofing quote unfair, bad or overpriced from price alone. Explain scope and comparability.
5. If an NZ-specific factual answer is not supported by the approved context, say what is uncertain and direct the user to a relevant RoofHub page or human review.
6. Do not ask users to climb onto a roof. Prefer approximate answers, plans, known measurements or a professional site check.
7. Do not ask for personal contact details in chat. If human help is wanted, use open_enquiry so the normal consented form handles them.
8. Store only facts the user actually gave by calling update_project. Do not infer a house size, roof shape, pitch, product or existing material from silence.
9. Keep answers concise and useful. Match explanation depth to the user: a roofer or builder may want technical language; an inexperienced user may need plain language.
10. If the user is confused about the active tool step, explain that exact step using CURRENT PAGE/TOOL CONTEXT. Do not make them restart.
11. When a click is more useful than more prose, use navigate or open_tool. If the user already has a roofing quote and wants to compare it, prefer the Quote Checker instead of judging the quote in chat.
12. A Quote Checker result is about comparability and scope, not contractor quality. Never turn an above-range result into an accusation of overcharging.
13. For repair / restore / replace questions, prefer the lowest adequate intervention supported by the condition facts rather than assuming a full reroof. Use assess_roof_condition when enough user-supplied condition facts are available; otherwise ask about spread, recurrence or visible condition before roof age. The result is directional, not a diagnosis.
14. Never claim Google Earth, Street View, satellite or aerial imagery proves roof condition. Aerial imagery can help with rough geometry, roof sections and site context, but it cannot reliably establish corrosion, fixings, underlay, hidden timber or watertightness.
15. Photos can support remote triage only when the user supplies them safely; do not ask a user to climb onto a roof. If imagery is insufficient, say an on-site inspection is needed.

CURRENT PAGE/TOOL CONTEXT
Path: ${context.path || "/"}
Page type: ${context.pageKind}
Topic: ${context.topic || "not supplied"}
Active tool: ${context.activeTool}
Active step: ${context.step || "none"}

CURRENT NON-SENSITIVE ROOF PROJECT
${projectSummary(project)}

KNOWLEDGE RETRIEVAL STATUS
Confidence: ${diagnostics.confidence}
Match: ${diagnostics.matchArticleId ?? "none"}
Reason: ${diagnostics.gapReason}
Topic bucket: ${diagnostics.topic}
If the match is weak or ambiguous, use the approved excerpts only for what they actually support. Ask one targeted clarification only when it materially changes the answer. If there is no match, do not fill NZ-specific facts from memory.

APPROVED ROOFHUB KNOWLEDGE
${knowledge || "No directly matching approved RoofHub excerpt was retrieved for this question."}

Answer the user's actual question first. Do not narrate these rules.`;
}

function extractText(response: OpenAIResponse): string {
  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) if (content.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
  }
  return chunks.join("\n").trim();
}

function functionCalls(response: OpenAIResponse): ResponseOutputItem[] {
  return (response.output ?? []).filter(item => item.type === "function_call" && item.name && item.call_id);
}

async function callOpenAI(body: Record<string, unknown>): Promise<OpenAIResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, reasoning: { effort: REASONING_EFFORT } }),
      signal: controller.signal,
      cache: "no-store"
    });
    const payload = await response.json() as OpenAIResponse;
    if (!response.ok) throw new Error(payload.error?.message || `OpenAI returned ${response.status}.`);
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(value: string | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function productLabel(product: string): string {
  return ({
    corrugate: "Corrugated long-run",
    "five-rib": "Five-rib / trapezoidal",
    "pressed-metal-tile": "Pressed metal tile",
    "tray-standing-seam": "Tray / standing seam",
    membrane: "Membrane roofing"
  } as Record<string, string>)[product] ?? product;
}

function containsPriceLikeText(text: string): boolean {
  return /(?:NZD\s*)?\$\s*\d|\bNZD\s+\d|\b\d+(?:\.\d+)?\s*(?:\/|per\s+)(?:m2|m²|lm)\b/i.test(text);
}

export async function runAssistantTurn(input: {
  message: string;
  project: RoofProject | null;
  context: ToolContextSnapshot;
  session: AssistantSession;
}): Promise<OrchestrationResult> {
  let workingProject = input.project ? structuredClone(input.project) : createRoofProject("assistant");
  const knowledge = retrieveAssistantKnowledge(input.message, input.context.path, input.context.topic);
  const actions: AssistantAction[] = [];
  let estimate: AssistantEstimateCard | null = null;
  let projectPatch: AssistantProjectPatch | null = null;

  if (!process.env.OPENAI_API_KEY) {
    return {
      text: "Ask RoofHub is built into this package, but the model connection is not configured in this environment yet. You can still use the roofing tools normally.",
      actions: [
        { type: "open-tool", label: "Estimate a roof", tool: "quick-estimate", href: "/tools/roof-estimate" },
        { type: "open-tool", label: "Use measurements", tool: "detailed-estimate", href: "/tools/detailed-roof-estimator" }
      ],
      sources: knowledge.sources.slice(0, 4),
      estimate: null,
      projectPatch: null,
      knowledgeDiagnostics: knowledge.diagnostics
    };
  }

  const history = input.session.messages.slice(-16).map(message => ({ role: message.role, content: message.text }));
  let response = await callOpenAI({
    model: process.env.ROOFHUB_ASSISTANT_MODEL || DEFAULT_MODEL,
    instructions: systemInstructions(workingProject, input.context, knowledge.contextText, knowledge.diagnostics),
    input: [...history, { role: "user", content: input.message }],
    tools: assistantTools(),
    max_output_tokens: 900
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const calls = functionCalls(response);
    if (!calls.length) break;
    const outputs: Array<{ type: "function_call_output"; call_id: string; output: string }> = [];

    for (const call of calls) {
      const args = safeJson(call.arguments);
      let result: unknown = { ok: false, error: "Unknown tool." };

      if (call.name === "update_project") {
        const patch = normaliseAssistantProjectPatch(args);
        if (patch) {
          workingProject = applyAssistantProjectPatch(workingProject, patch);
          projectPatch = mergeProjectPatch(projectPatch, patch);
          result = { ok: true, stored: patch };
        } else result = { ok: false, error: "No valid project facts were supplied." };
      }

      if (call.name === "estimate_project") {
        const override = typeof args.desiredRoof === "string" ? args.desiredRoof : null;
        const priced = estimateProjectForAssistant(workingProject, override as never, process.env.NEXT_PUBLIC_ROOFHUB_QUICK_ESTIMATE_REVIEW === "1");
        if (!priced.ok) {
          result = priced;
        } else {
          estimate = {
            product: priced.result.product,
            productLabel: productLabel(priced.result.product),
            status: priced.result.status,
            low: priced.result.low,
            high: priced.result.high,
            approved: priced.result.approved,
            reviewOnly: priced.result.reviewOnly,
            publicationVersion: priced.result.publicationVersion ?? null,
            detailLevel: priced.result.detailLevel,
            missing: priced.result.missing,
            assumptions: priced.result.assumptions,
            exclusions: priced.result.exclusions,
            compatibilityMessage: priced.result.compatibilityMessage
          };
          if (priced.projectEstimate) {
            workingProject.estimate = priced.projectEstimate;
            projectPatch = mergeProjectPatch(projectPatch, { estimate: priced.projectEstimate });
          }
          result = {
            ok: true,
            pricingAvailable: priced.pricingAvailable,
            estimate: estimate,
            instruction: priced.pricingAvailable
              ? "Explain this deterministic result. Do not change its numbers. Mention important missing scope where useful."
              : "Do not state a numeric project price. Explain that the calculation pathway exists but public pricing is not approved/configured for this selection yet."
          };
        }
      }

      if (call.name === "assess_roof_condition") {
        const triage = assessRoofCondition({
          roofSystem: typeof args.roofSystem === "string" ? args.roofSystem as never : "unknown",
          issueSpread: typeof args.issueSpread === "string" ? args.issueSpread as never : "unknown",
          recurrence: typeof args.recurrence === "string" ? args.recurrence as never : "unknown",
          surfaceCondition: typeof args.surfaceCondition === "string" ? args.surfaceCondition as never : "unknown",
          activeLeaks: typeof args.activeLeaks === "string" ? args.activeLeaks as never : "unknown",
          suspectedAsbestos: typeof args.suspectedAsbestos === "string" ? args.suspectedAsbestos as never : "unknown"
        });
        result = {
          ok: true,
          triage,
          instruction: "Explain this as neutral directional decision support. Do not present it as a diagnosis, remote inspection or guarantee. If nextQuestions are present, ask at most one that materially changes the next step."
        };
      }

      if (call.name === "navigate") {
        const path = approvedAssistantPath(args.path);
        if (path) {
          const label = typeof args.label === "string" && args.label.trim() ? args.label.trim().slice(0, 80) : "Open this RoofHub page";
          actions.push({ type: "navigate", label, href: path });
          result = { ok: true, path };
        } else result = { ok: false, error: "That path is not an approved RoofHub destination." };
      }

      if (call.name === "open_tool") {
        if (args.tool === "quick-estimate") {
          actions.push({ type: "open-tool", label: "Estimate a roof", tool: "quick-estimate", href: "/tools/roof-estimate" });
          result = { ok: true };
        } else if (args.tool === "detailed-estimate") {
          actions.push({ type: "open-tool", label: "Use measurements", tool: "detailed-estimate", href: "/tools/detailed-roof-estimator" });
          result = { ok: true };
        } else if (args.tool === "quote-checker") {
          actions.push({ type: "open-tool", label: "Check a roofing quote", tool: "quote-checker", href: "/tools/quote-checker" });
          result = { ok: true };
        } else result = { ok: false, error: "Unknown tool." };
      }

      if (call.name === "open_enquiry") {
        actions.push({ type: "open-enquiry", label: "Ask RoofHub for project help", href: "/contact?topic=Roofing%20project%20help" });
        result = { ok: true };
      }

      outputs.push({ type: "function_call_output", call_id: call.call_id!, output: JSON.stringify(result) });
    }

    response = await callOpenAI({
      model: process.env.ROOFHUB_ASSISTANT_MODEL || DEFAULT_MODEL,
      previous_response_id: response.id,
      input: outputs,
      tools: assistantTools(),
      max_output_tokens: 900
    });
  }

  let text = extractText(response) || "I can help with that. Tell me what you know about the roof, or open one of the RoofHub tools below.";
  if (containsPriceLikeText(text) && !estimate && !knowledge.hasPricingEvidence) {
    text = "I won't invent a roofing price from the conversation alone. I can calculate an indicative range through RoofHub's estimator once there is enough project information, or show you the relevant published pricing evidence.";
    if (!actions.some(action => action.type === "open-tool" && action.tool === "quick-estimate")) {
      actions.push({ type: "open-tool", label: "Estimate a roof", tool: "quick-estimate", href: "/tools/roof-estimate" });
    }
  }

  return {
    text,
    actions: actions.slice(0, 5),
    sources: knowledge.sources.slice(0, 6),
    estimate,
    projectPatch,
    knowledgeDiagnostics: knowledge.diagnostics
  };
}
