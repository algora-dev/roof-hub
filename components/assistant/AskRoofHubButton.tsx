"use client";

import { openRoofHubAssistant } from "@/lib/assistant/events";
import { trackRoofHubEvent } from "@/lib/client/analytics";

export function AskRoofHubButton({
  prompt,
  label = "Ask RoofHub",
  className = "button button--secondary"
}: {
  prompt?: string;
  label?: string;
  className?: string;
}) {
  return <button type="button" className={className} onClick={() => {
    trackRoofHubEvent("cta_click", { tool: "assistant", ctaLocation: "contextual-assistant" });
    openRoofHubAssistant({ prompt, send: false });
  }}>{label}</button>;
}
