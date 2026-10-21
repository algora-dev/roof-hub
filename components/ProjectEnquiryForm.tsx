"use client";

import { FormEvent, useState } from "react";
import { getOrCreateRoofProject, useRoofProject } from "@/lib/client/roof-project-store";
import { trackRoofHubEvent } from "@/lib/client/analytics";
import type { RequestedHelp } from "@/lib/enquiry";

const options: [RequestedHelp, string, string][] = [
  ["understand-project", "Help me understand the project", "Questions, scope, products, measurements or what to do next."],
  ["written-quote", "Help me get a written contractor quote", "Carry the RoofHub project context into a proper contractor quotation."],
  ["multiple-quotes", "Help me get comparable quotes", "Ask RoofHub about getting more than one suitable written quote."],
  ["quote-review", "Help me review a quote", "Use RoofHub context to understand an existing roofing quote and its scope."]
];

function projectSummary(project: ReturnType<typeof useRoofProject>): string[] {
  if (!project) return [];
  const values: string[] = [];
  if (project.projectType !== "unknown") values.push(project.projectType === "reroof" ? "Replacement / reroof" : "New roof");
  if (project.desiredRoof !== "undecided") values.push(project.desiredRoof.replaceAll("-", " "));
  if (project.geometry.roofShape !== "unknown") values.push(project.geometry.roofShape.replaceAll("-", " "));
  if (project.geometry.roofAreaM2) values.push(`Approx. ${Math.round(project.geometry.roofAreaM2)} m² roof area`);
  if (project.geometry.exactPitchDegrees !== null) values.push(`${project.geometry.exactPitchDegrees}° pitch`);
  else if (project.geometry.pitchBand !== "unknown") values.push(`${project.geometry.pitchBand} pitch`);
  return values;
}

export function ProjectEnquiryForm() {
  const project = useRoofProject();
  const summary = projectSummary(project);
  const [help, setHelp] = useState<RequestedHelp>("understand-project");
  const [share, setShare] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!formElement.reportValidity()) return;
    const form = new FormData(formElement);
    const currentProject = project ?? getOrCreateRoofProject("direct");
    const now = new Date().toISOString();
    setStatus("sending");
    setMessage("");
    trackRoofHubEvent("enquiry_start", { tool: currentProject.context.currentTool === "none" ? "none" : currentProject.context.currentTool, projectType: currentProject.projectType, roofSystem: currentProject.desiredRoof });
    try {
      const payload = {
        schemaVersion: 1,
        type: "roofhub-project-enquiry",
        createdAt: now,
        requestedHelp: help,
        contact: {
          name: String(form.get("name") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          location: String(form.get("location") || "").trim(),
          notes: String(form.get("notes") || "").trim()
        },
        consent: {
          contactByRoofHub: true,
          shareWithRoofingPartners: share,
          version: "project-help-v1",
          at: now
        },
        project: currentProject
      };
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "project", payload, companyWebsite: "" })
      });
      const result = await response.json() as { ok?: boolean; error?: string; reference?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "Your request could not be sent.");
      setStatus("sent");
      setMessage(result.reference ? `Sent. Reference: ${result.reference}` : "Sent. RoofHub has the project context from this tab.");
      trackRoofHubEvent("enquiry_submit", { tool: currentProject.context.currentTool === "none" ? "none" : currentProject.context.currentTool, projectType: currentProject.projectType, roofSystem: currentProject.desiredRoof });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your request could not be sent right now.");
    }
  }

  return <div className="project-help-card">
    <div className="project-help-card__intro"><p className="eyebrow">Project help</p><h2>Send the roof context once.</h2><p>If you have used a RoofHub tool in this tab, those non-sensitive project details can travel with the request. You only add contact information and anything RoofHub still needs to know.</p></div>
    {summary.length > 0 && <div className="project-context-summary"><strong>Already known in this tab</strong><ul>{summary.map(item => <li key={item}>{item}</li>)}</ul></div>}
    {status === "sent" ? <div className="project-help-success"><strong>Thanks.</strong><p>{message}</p></div> : <form className="project-help-form" onSubmit={submit}>
      <fieldset><legend>What would you like help with?</legend><div className="project-help-options">{options.map(([value,label,copy]) => <label key={value} className={help === value ? "is-selected" : ""}><input type="radio" name="requestedHelp" checked={help === value} onChange={() => setHelp(value)} /><span><strong>{label}</strong><small>{copy}</small></span></label>)}</div></fieldset>
      <div className="contact-form__grid"><label><span>Name</span><input name="name" autoComplete="name" maxLength={120} required /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label></div>
      <div className="contact-form__grid"><label><span>Phone <small>(optional)</small></span><input name="phone" autoComplete="tel" maxLength={80} /></label><label><span>Town / suburb <small>(optional)</small></span><input name="location" autoComplete="address-level2" maxLength={300} /></label></div>
      <label><span>Anything else RoofHub should know? <small>(optional)</small></span><textarea name="notes" rows={5} maxLength={8000} placeholder="For example: I already have a quote, I am pricing a build, or I need help choosing a roof system." /></label>
      <label className="project-help-share"><input type="checkbox" checked={share} onChange={event => setShare(event.target.checked)} /> <span>RoofHub may share this project with suitable roofing businesses if that is useful for the help I selected.</span></label>
      <p className="form-fine-print">Partner sharing is optional. RoofHub can contact you about this request whether or not you select it.</p>
      {message && <p role="alert" className={status === "error" ? "form-error" : "form-success"}>{message}</p>}
      <button className="button button--primary button--large" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send project to RoofHub"}</button>
    </form>}
  </div>;
}
