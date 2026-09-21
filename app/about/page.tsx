import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "@/components/Icons";

export const metadata: Metadata = { title: "About RoofHub" };

export default function AboutPage() {
  return <>
    <section className="photo-hero photo-hero--inner">
      <Image className="photo-hero__image" src="/media/hero-secondary.webp" alt="Modern New Zealand home with a long-run metal roof above a mountain lake" fill priority sizes="100vw" />
      <div className="photo-hero__shade photo-hero__shade--strong" aria-hidden="true" />
      <div className="container photo-hero__content photo-hero__content--inner">
        <div className="photo-hero__copy photo-hero__copy--wide">
          <p className="eyebrow eyebrow--light">About RoofHub</p>
          <h1>A roofing research and planning layer — not another roofing contractor website.</h1>
          <p className="photo-hero__lede">The aim is to help New Zealand homeowners, property people and industry users understand a roofing project before they decide who to contact.</p>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container feature-split">
        <div className="feature-copy"><p className="eyebrow">The operating model</p><h2>Useful information first.</h2><p>RoofHub should remain useful even when someone never submits an enquiry. Pricing, measurements, guides and preliminary analysis should deliver their value before asking for personal details.</p></div>
        <ol className="process-stack process-stack--numbered"><li><span>01</span><div><strong>Arrive with a question</strong><p>Cost, size, material, condition, scope or next step.</p></div></li><li><span>02</span><div><strong>Use information or tools</strong><p>Get a clearer answer with assumptions visible.</p></div></li><li><span>03</span><div><strong>Choose whether to ask for help</strong><p>RoofHub can eventually suggest the type of specialist worth contacting.</p></div></li></ol>
      </div>
    </section>

    <section className="section section--sage">
      <div className="container about-grid">
        <div><p className="eyebrow">What RoofHub should be</p><ul className="check-list check-list--large"><li><Check/> Practical</li><li><Check/> Transparent</li><li><Check/> Evidence-aware</li><li><Check/> Nationally useful</li><li><Check/> Helpful before conversion</li></ul></div>
        <div><p className="eyebrow">What RoofHub should not pretend to be</p><ul className="plain-list"><li>An independent regulator or industry body</li><li>A certified inspection when analysis is preliminary</li><li>A formal quote when a result is only an estimate</li><li>A roofing contractor carrying out every project</li></ul></div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="principle-grid">
          <article><span>01</span><h3>Neutral information</h3><p>Editorial coverage should remain separate from provider relationships.</p></article>
          <article><span>02</span><h3>Shared roofing core</h3><p>Pricing and measurement logic should be reusable across website tools, the assistant and future agent interfaces.</p></article>
          <article><span>03</span><h3>Honest uncertainty</h3><p>Preliminary outputs should say what is known, inferred and still unresolved.</p></article>
          <article><span>04</span><h3>NZ-specific evidence</h3><p>Technical claims should be grounded in appropriate New Zealand sources before public launch.</p></article>
        </div>
      </div>
    </section>

    <section className="section section--dark"><div className="container cta-band cta-band--dark"><div><p className="eyebrow">The practical next step</p><h2>Start with tools and useful questions.</h2><p>The current build is a foundation. The real value comes as the existing roofing calculations, measurement workflows and analysis tools are integrated.</p></div><Link className="button button--primary button--large" href="/tools">Explore tools <ArrowRight /></Link></div></section>
  </>;
}
