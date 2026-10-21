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
  if (path.startsWith("/pricing/")) return "pricing";
  if (path.startsWith("/roofing/")) return "roofing";
  if (path.startsWith("/guides/")) return "guide";
  if (path.startsWith("/tools/")) return "tool";
  return "other";
}
