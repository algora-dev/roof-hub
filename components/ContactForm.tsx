"use client";

import { FormEvent, useEffect, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const [topic, setTopic] = useState("General enquiry");
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTopic = params.get("topic");
    const allowed = ["General enquiry", "Report a correction", "Suggest a source", "Roofing quote enquiry", "Tool feedback"];
    if (requestedTopic && allowed.includes(requestedTopic)) setTopic(requestedTopic);
    const path = params.get("page");
    // Only a same-site path is accepted as contextual metadata, never a redirect.
    if (path && /^\/(?!\/)[a-z0-9/-]*$/i.test(path) && path.length <= 300) {
      setPageUrl(new URL(path, window.location.origin).href);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setState("sending");
    setMessage("");
    const data = new FormData(form);
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "contact",
          name: data.get("name"),
          email: data.get("email"),
          topic: data.get("topic"),
          pageUrl: data.get("pageUrl"),
          message: data.get("message"),
          companyWebsite: data.get("companyWebsite")
        })
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "The message could not be sent.");
      setState("sent");
      setMessage("Thanks. Your message has been received.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "The message could not be sent. Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form__grid">
        <label><span>Name</span><input name="name" autoComplete="name" maxLength={120} required /></label>
        <label><span>Email</span><input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      </div>
      <div className="contact-form__grid">
        <label><span>What is this about?</span><select name="topic" value={topic} onChange={event => setTopic(event.target.value)}><option>General enquiry</option><option>Report a correction</option><option>Suggest a source</option><option>Roofing quote enquiry</option><option>Tool feedback</option></select></label>
        <label><span>Page URL <small>(optional)</small></span><input name="pageUrl" value={pageUrl} onChange={event => setPageUrl(event.target.value)} type="url" inputMode="url" placeholder="https://www.roofhub.co.nz/..." maxLength={1000} /></label>
      </div>
      <label><span>Message</span><textarea name="message" rows={7} minLength={10} maxLength={8000} required placeholder="Tell us what you need, what looks wrong, or the source you want us to review." /></label>
      <label className="contact-form__honeypot" aria-hidden="true"><span>Company website</span><input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label>
      <div className="contact-form__actions">
        <button className="button button--primary button--large" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send message"}</button>
        <p className={`contact-form__status ${state === "error" ? "is-error" : ""}`} role="status">{message}</p>
      </div>
    </form>
  );
}
