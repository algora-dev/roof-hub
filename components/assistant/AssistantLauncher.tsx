"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { assistantSessionFetch, resetAssistantClientSession } from "@/lib/assistant/client-session";
import { ASSISTANT_OPEN_EVENT, type AssistantOpenDetail } from "@/lib/assistant/events";
import type { AssistantAction, AssistantEstimateCard, AssistantMessage, AssistantSource, AssistantTurnResponse } from "@/lib/assistant/types";
import { applyAssistantProjectPatch } from "@/lib/assistant/project-patch";
import { getOrCreateRoofProject, getRoofProject, setRoofProject } from "@/lib/client/roof-project-store";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import { setToolContext, useToolContext } from "@/lib/client/tool-context-store";
import styles from "./AssistantLauncher.module.css";

const UI_STORAGE_KEY = "roofhub.smart-assistant.messages.v1";

type Turn = {
  message: AssistantMessage;
  actions: AssistantAction[];
  sources: AssistantSource[];
  estimate: AssistantEstimateCard | null;
};

const starters = [
  { title: "Estimate a roof", copy: "Start with rough information or use measurements you already have.", prompt: "Help me work out a ballpark roof estimate." },
  { title: "Ask a roofing question", copy: "Products, pitch, measurements, reroofing, pricing evidence and more.", prompt: "I have a roofing question." },
  { title: "Check a quote", copy: "Understand what a roofing quote should include and why prices differ.", prompt: "I already have a roofing quote. Help me understand what I should check." },
  { title: "Find the right tool", copy: "Tell RoofHub what you are trying to do and it can point you there.", prompt: "Which RoofHub tool should I use?" }
];

function readTurns(): Turn[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.sessionStorage.getItem(UI_STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.slice(-20) : [];
  } catch {
    return [];
  }
}

function saveTurns(turns: Turn[]) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(UI_STORAGE_KEY, JSON.stringify(turns.slice(-20))); } catch { /* optional */ }
}

function money(value: number): string {
  return new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD", maximumFractionDigits: 0 }).format(value);
}

function EstimateCard({ estimate }: { estimate: AssistantEstimateCard }) {
  const hasPrice = estimate.low !== null && estimate.high !== null;
  return <div className={styles.estimate}>
    <div className={styles.estimateHead}><strong>{estimate.productLabel}</strong><span className={styles.pill}>{estimate.status === "complete" ? "configured scope" : estimate.status}</span></div>
    {hasPrice ? <>
      <div className={styles.price}>{money(estimate.low!)} <span>to</span> {money(estimate.high!)}</div>
      <p>{estimate.approved ? "Indicative RoofHub range, incl. GST." : estimate.reviewOnly ? "Calibration preview only. The current rate card is not approved for public pricing." : "Indicative range."}</p>
    </> : <p>{estimate.compatibilityMessage || "RoofHub is not publishing a numeric price for this selection yet."}</p>}
    {estimate.missing.length > 0 && <details><summary>What still needs checking</summary><ul>{estimate.missing.slice(0, 8).map(item => <li key={item}>{item}</li>)}</ul></details>}
  </div>;
}

export function AssistantLauncher() {
  const router = useRouter();
  const pathname = usePathname();
  const toolContext = useToolContext();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pendingAutoSend = useRef<string | null>(null);

  useEffect(() => {
    setTurns(readTurns());
    setHydrated(true);
  }, []);

  useEffect(() => {
    setToolContext({ path: pathname });
  }, [pathname]);

  useEffect(() => saveTurns(turns), [turns]);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [open, turns, busy]);

  const context = useMemo(() => ({ ...toolContext, path: pathname }), [toolContext, pathname]);

  const send = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setOpen(true);
    setBusy(true);
    setError("");
    setDraft("");
    const userMessage: AssistantMessage = { id: `local-${Date.now()}`, role: "user", text: message, createdAt: new Date().toISOString() };
    setTurns(current => [...current, { message: userMessage, actions: [], sources: [], estimate: null }]);
    trackRoofHubEvent("assistant_question", { tool: "assistant", path: pathname, step: context.step });
    try {
      const response = await assistantSessionFetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, project: getRoofProject(), context })
      });
      const payload = await response.json() as AssistantTurnResponse | { ok: false; error: string };
      if (!response.ok || !payload.ok) throw new Error("error" in payload ? payload.error : "Ask RoofHub could not respond.");
      if (payload.projectPatch) {
        const currentProject = getOrCreateRoofProject("assistant");
        setRoofProject(applyAssistantProjectPatch(currentProject, payload.projectPatch));
        trackRoofHubEvent("assistant_project_update", { tool: "assistant", path: pathname });
      }
      if (payload.estimate) trackRoofHubEvent("assistant_estimate", { tool: "assistant", path: pathname, detailLevel: payload.estimate.detailLevel });
      setTurns(current => [...current, { message: payload.message, actions: payload.actions, sources: payload.sources, estimate: payload.estimate }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ask RoofHub could not respond.");
    } finally {
      setBusy(false);
    }
  }, [busy, context, pathname]);

  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<AssistantOpenDetail>).detail ?? {};
      setOpen(true);
      trackRoofHubEvent("assistant_open", { tool: "assistant", path: pathname, ctaLocation: "page" });
      if (detail.prompt) setDraft(detail.prompt);
      if (detail.prompt && detail.send) pendingAutoSend.current = detail.prompt;
    }
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen);
  }, [pathname]);

  useEffect(() => {
    const prompt = pendingAutoSend.current;
    if (!prompt || busy) return;
    pendingAutoSend.current = null;
    void send(prompt);
  }, [busy, open, send]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function startFresh() {
    setTurns([]);
    setError("");
    setDraft("");
    try { window.sessionStorage.removeItem(UI_STORAGE_KEY); } catch { /* optional */ }
    resetAssistantClientSession();
  }

  function actionClick(action: AssistantAction) {
    if (action.type === "quick-reply") {
      void send(action.message);
      return;
    }
    setOpen(false);
    router.push(action.href);
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(draft);
    }
  }

  if (!hydrated) return null;

  return <>
    {open && <div className={styles.backdrop} onMouseDown={() => setOpen(false)} aria-hidden="true" />}
    {open && <section className={styles.panel} role="dialog" aria-modal="true" aria-label="Ask RoofHub">
      <header className={styles.header}>
        <div className={styles.headerTitle}><span className={styles.headerMark}>RH</span><div><strong>Ask RoofHub</strong><span>NZ roofing knowledge, pricing and tools</span></div></div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} type="button" onClick={startFresh} title="Start a new conversation" aria-label="Start a new conversation">↻</button>
          <button className={styles.iconButton} type="button" onClick={() => setOpen(false)} aria-label="Close Ask RoofHub">✕</button>
        </div>
      </header>
      <div className={styles.body}>
        {turns.length === 0 ? <div className={styles.opening}>
          <div className={styles.introCard}><strong>Ask instead of searching.</strong><p>I can explain RoofHub information, help with an estimate, work with the roof details already in this tab, find the right page, or help you understand the step you are on.</p></div>
          {context.activeTool !== "none" && <div className={styles.contextNote}>You're currently in the <strong>{context.activeTool.replaceAll("-", " ")}</strong>{context.step ? <> at <strong>{context.step.replaceAll("-", " ")}</strong></> : null}. Ask me what this step means without leaving the tool.</div>}
          <div className={styles.promptGrid}>{starters.map(item => <button key={item.title} type="button" className={styles.prompt} onClick={() => void send(item.prompt)}><strong>{item.title}</strong><span>{item.copy}</span></button>)}</div>
        </div> : <div className={styles.thread}>
          {turns.map((turn, index) => turn.message.role === "user"
            ? <div key={`${turn.message.id}-${index}`} className={`${styles.message} ${styles.user}`}>{turn.message.text}</div>
            : <div key={`${turn.message.id}-${index}`} className={`${styles.message} ${styles.assistant}`}><div className={styles.assistantCard}>{turn.message.text}{turn.estimate && <EstimateCard estimate={turn.estimate} />}{turn.actions.length > 0 && <div className={styles.actions}>{turn.actions.map((action, actionIndex) => <button key={`${action.type}-${actionIndex}`} type="button" className={`${styles.action} ${actionIndex === 0 ? styles.actionPrimary : ""}`} onClick={() => actionClick(action)}>{action.label}</button>)}</div>}{turn.sources.length > 0 && <details className={styles.sources}><summary>RoofHub sources used</summary><div className={styles.sourceLinks}>{turn.sources.map(source => source.kind === "external" ? <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a> : <Link key={source.href} href={source.href} onClick={() => setOpen(false)}>{source.label}</Link>)}</div></details>}</div></div>)}
          {busy && <div className={`${styles.message} ${styles.assistant}`}><div className={styles.assistantCard}><span className={styles.thinking}>Checking RoofHub knowledge and project context...</span></div></div>}
          {error && <div className={styles.error}>{error}</div>}
        </div>}
        <div ref={bottomRef} />
      </div>
      <div className={styles.composer}>
        <form onSubmit={event => { event.preventDefault(); void send(draft); }}>
          <textarea value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={keyDown} placeholder={context.activeTool !== "none" ? "Ask about this step..." : "Ask a roofing question..."} aria-label="Message Ask RoofHub" />
          <button type="submit" className={styles.send} disabled={busy || !draft.trim()} aria-label="Send message">→</button>
        </form>
        <p className={styles.disclaimer}>RoofHub can explain and calculate indicative information, but a contractor must confirm final scope, site conditions and quotation.</p>
      </div>
    </section>}
    <button className={styles.launcher} type="button" onClick={() => { setOpen(true); trackRoofHubEvent("assistant_open", { tool: "assistant", path: pathname, ctaLocation: "launcher" }); }} aria-label="Open Ask RoofHub">
      <span className={styles.launcherMark}>RH</span><span className={styles.launcherCopy}><strong>Ask RoofHub</strong><span>Roofing answers &amp; pricing help</span></span>
    </button>
  </>;
}
