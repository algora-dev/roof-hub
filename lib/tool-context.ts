export type RoofHubTool = "none" | "quick-estimate" | "detailed-estimate" | "quote-checker";

export type ToolContextSnapshot = {
  path: string;
  pageKind: "home" | "pricing" | "roofing" | "guide" | "tool" | "other";
  topic: string;
  activeTool: RoofHubTool;
  step: string;
  updatedAt: string;
};

export function pageKindForPath(path: string): ToolContextSnapshot["pageKind"] {
  if (path === "/") return "home";
  if (path === "/pricing" || path.startsWith("/pricing/")) return "pricing";
  if (path === "/roofing" || path.startsWith("/roofing/")) return "roofing";
  if (path === "/guides" || path.startsWith("/guides/")) return "guide";
  if (path === "/tools" || path.startsWith("/tools/")) return "tool";
  return "other";
}
