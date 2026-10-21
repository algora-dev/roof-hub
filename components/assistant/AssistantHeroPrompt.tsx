"use client";

import { FormEvent, useState } from "react";
import { openRoofHubAssistant } from "@/lib/assistant/events";

export function AssistantHeroPrompt() {
  const [value, setValue] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const prompt = value.trim();
    openRoofHubAssistant({ prompt, send: Boolean(prompt) });
  }

  return <form className="hero-assistant" onSubmit={submit}>
    <div className="hero-assistant__label"><span>Ask RoofHub</span><small>Roofing questions, pricing, products or help with a tool</small></div>
    <div className="hero-assistant__input-row">
      <input value={value} onChange={event => setValue(event.target.value)} placeholder="Ask a roofing question..." aria-label="Ask RoofHub a roofing question" />
      <button type="submit" className="button button--primary">Ask RoofHub</button>
    </div>
    <div className="hero-assistant__prompts">
      <button type="button" onClick={() => openRoofHubAssistant({ prompt: "Roughly what could a roof like mine cost?", send: true })}>Estimate a roof</button>
      <button type="button" onClick={() => openRoofHubAssistant({ prompt: "What's the difference between corrugated and five-rib roofing?", send: true })}>Corrugated vs five-rib</button>
      <button type="button" onClick={() => openRoofHubAssistant({ prompt: "I already have a roofing quote. What should I check?", send: true })}>Check a quote</button>
    </div>
  </form>;
}
