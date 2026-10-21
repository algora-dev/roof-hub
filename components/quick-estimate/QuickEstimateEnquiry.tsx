"use client";

import { FormEvent, useState } from "react";
import { getRoofProject } from "@/lib/client/roof-project-store";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import type { RequestedHelp } from "@/lib/enquiry";
import styles from "./QuickRoofEstimate.module.css";

export function QuickEstimateEnquiry({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [share, setShare] = useState(false);
  const [help, setHelp] = useState<RequestedHelp>("written-quote");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const project = getRoofProject();
    if (!project) {
      setStatus("error");
      setMessage("Your roof project is not available in this tab. Return to the estimate and try again.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    if (!name || !email) {
      setStatus("error");
      setMessage("Please provide your name and email.");
      return;
    }
    setStatus("sending");
    setMessage("");
    trackRoofHubEvent("enquiry_start", { tool: "quick-estimate", projectType: project.projectType, roofSystem: project.desiredRoof });
    try {
      const now = new Date().toISOString();
      const payload = {
        schemaVersion: 1,
        type: "roofhub-project-enquiry",
        createdAt: now,
        requestedHelp: help,
        contact: {
          name,
          email,
          phone: String(form.get("phone") || "").trim(),
          location: String(form.get("location") || "").trim(),
          notes: String(form.get("notes") || "").trim()
        },
        consent: {
          contactByRoofHub: true,
          shareWithRoofingPartners: share,
          version: "quick-estimate-enquiry-v1",
          at: now
        },
        project
      };
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "project", payload, companyWebsite: "" })
      });
      const result = await response.json() as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Your request could not be sent.");
      setStatus("sent");
      setMessage(result.reference ? `Sent. Reference: ${result.reference}` : "Sent. RoofHub can now review the project details you entered.");
      trackRoofHubEvent("enquiry_submit", { tool: "quick-estimate", projectType: project.projectType, roofSystem: project.desiredRoof });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your request could not be sent right now.");
    }
  }

  return <section className={styles.enquiryPanel} aria-labelledby="quick-enquiry-title">
    <div className={styles.enquiryHead}>
      <div><p className={styles.eyebrow}>Optional next step</p><h2 id="quick-enquiry-title">Get help with a written roofing quote</h2><p>Your roof details carry through. You do not need to type them again.</p></div>
      <button type="button" className={styles.textButton} onClick={onClose}>Close</button>
    </div>
    {status === "sent" ? <div className={styles.successBox}><strong>Thanks.</strong><p>{message}</p></div> : <form onSubmit={submit} className={styles.enquiryForm}>
      <fieldset className={styles.helpChoices}><legend>What would you like RoofHub to help with?</legend>
        {([
          ["understand-project", "Help me understand this project"],
          ["written-quote", "Help me get a written quote"],
          ["multiple-quotes", "Help me get 2–3 comparable quotes"],
          ["quote-review", "Help me review a quote I already have"]
        ] as [RequestedHelp, string][]).map(([value, label]) => <label key={value}><input type="radio" name="help" checked={help === value} onChange={() => setHelp(value)} /> {label}</label>)}
      </fieldset>
      <div className={styles.formGrid}>
        <label>Name<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label>Phone <span>optional</span><input name="phone" autoComplete="tel" maxLength={80} /></label>
        <label>Town / suburb <span>optional</span><input name="location" autoComplete="address-level2" maxLength={300} /></label>
      </div>
      <label className={styles.fullLabel}>Anything else RoofHub should know? <span>optional</span><textarea name="notes" rows={4} maxLength={8000} /></label>
      <label className={styles.checkRow}><input type="checkbox" checked={share} onChange={event => setShare(event.target.checked)} /> RoofHub may share this project with suitable roofing businesses if that helps with the option I selected.</label>
      <p className={styles.privacyNote}>RoofHub can contact you about this request. Partner sharing is optional and controlled by the checkbox above.</p>
      {message && <p role="alert" className={status === "error" ? styles.errorBox : styles.infoBox}>{message}</p>}
      <button className={styles.primaryButton} type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send project to RoofHub"}</button>
    </form>}
  </section>;
}
