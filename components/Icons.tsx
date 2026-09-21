import type { SVGProps } from "react";

const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ArrowRight(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M5 12h14M14 7l5 5-5 5"/></svg>; }
export function Calculator(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2M8 19h2M14 19h2"/></svg>; }
export function Measure(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M4 18 18 4l2 2L6 20H4v-2Z"/><path d="m13 7 4 4M10 10l2 2M7 13l2 2"/></svg>; }
export function Camera(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M5 7h3l1-2h6l1 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/></svg>; }
export function Book(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"/></svg>; }
export function Shield(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M12 3 19 6v5c0 4.8-2.9 8-7 10-4.1-2-7-5.2-7-10V6l7-3Z"/><path d="m9 12 2 2 4-4"/></svg>; }
export function Layers(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>; }
export function MenuIcon(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="M4 7h16M4 12h16M4 17h16"/></svg>; }
export function CloseIcon(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>; }
export function Search(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>; }
export function Check(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="m5 12 4 4L19 6"/></svg>; }
export function Spark(props: SVGProps<SVGSVGElement>) { return <svg {...base} {...props}><path d="m12 3 1.1 3.4L16.5 8l-3.4 1.1L12 12.5l-1.1-3.4L7.5 8l3.4-1.6L12 3ZM18 14l.7 2.1L21 17l-2.3.9L18 20l-.7-2.1L15 17l2.3-.9L18 14ZM6 14l.7 2.1L9 17l-2.3.9L6 20l-.7-2.1L3 17l2.3-.9L6 14Z"/></svg>; }
