import { NextResponse } from "next/server";
import { parseRoofProject } from "@/lib/roof-project";
import { pageKindForPath, type ToolContextSnapshot } from "@/lib/tool-context";
import type { AssistantErrorResponse, AssistantTurnRequest, AssistantTurnResponse } from "@/lib/assistant/types";
import { assistantClientSessionKeyFromRequest, assistantScopedSessionId } from "@/lib/assistant/session-scope";
import { checkAssistantSessionGuard, getAssistantSession, saveAssistantSession } from "@/lib/assistant/session";
import { checkAssistantIpRateLimit, clientIpFromHeaders } from "@/lib/assistant/rate-limit";
import { runAssistantTurn } from "@/lib/assistant/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function error(error: string, status: number, code?: string) {
  return NextResponse.json<AssistantErrorResponse>({ ok: false, error, code }, { status });
}

function cleanContext(value: unknown): ToolContextSnapshot {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const path = typeof raw.path === "string" && raw.path.startsWith("/") ? raw.path.slice(0, 240) : "/";
  const activeTool = ["none", "quick-estimate", "detailed-estimate", "quote-checker"].includes(String(raw.activeTool))
    ? raw.activeTool as ToolContextSnapshot["activeTool"] : "none";
  return {
    path,
    pageKind: pageKindForPath(path),
    topic: typeof raw.topic === "string" ? raw.topic.trim().slice(0, 240) : "",
    activeTool,
    step: typeof raw.step === "string" ? raw.step.trim().slice(0, 120) : "",
    updatedAt: new Date().toISOString()
  };
}

export async function POST(request: Request) {
  const sessionKey = assistantClientSessionKeyFromRequest(request);
  const sessionId = sessionKey ? assistantScopedSessionId(sessionKey) : null;
  if (!sessionId) return error("The assistant session could not be established. Refresh the page and try again.", 400, "invalid_session");

  const ipGuard = checkAssistantIpRateLimit(clientIpFromHeaders(request.headers));
  if (!ipGuard.ok) return error(ipGuard.error, 429, "ip_rate_limit");

  let payload: AssistantTurnRequest;
  try {
    payload = await request.json() as AssistantTurnRequest;
  } catch {
    return error("Invalid assistant request.", 400, "invalid_json");
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const project = payload.project ? parseRoofProject(payload.project) : null;
  if (payload.project && !project) return error("The roof project data was invalid.", 400, "invalid_project");
  const context = cleanContext(payload.context);

  const session = await getAssistantSession(sessionId);
  const guard = checkAssistantSessionGuard(session, message);
  if (!guard.ok) return error(guard.error, guard.status, "session_limit");

  try {
    const result = await runAssistantTurn({ message, project, context, session });
    const now = new Date().toISOString();
    const userMessage = { id: `user-${crypto.randomUUID()}`, role: "user" as const, text: message, createdAt: now };
    const assistantMessage = { id: `assistant-${crypto.randomUUID()}`, role: "assistant" as const, text: result.text, createdAt: new Date().toISOString() };
    session.messages.push(userMessage, assistantMessage);
    session.turnCount += 1;
    await saveAssistantSession(session);

    return NextResponse.json<AssistantTurnResponse>({
      ok: true,
      message: assistantMessage,
      actions: result.actions,
      sources: result.sources,
      estimate: result.estimate,
      projectPatch: result.projectPatch,
      knowledgeDiagnostics: result.knowledgeDiagnostics,
      sessionId
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("[roofhub-assistant] turn failed", cause);
    return error("Ask RoofHub couldn't complete that response. The normal RoofHub tools are still available.", 503, "assistant_unavailable");
  }
}
