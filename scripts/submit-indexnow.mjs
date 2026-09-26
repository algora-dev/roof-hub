// Submit live sitemap URLs to IndexNow. Run after a deploy that ships new/changed pages:
//   node scripts/submit-indexnow.mjs
import { readdirSync } from "node:fs";

const SITE = "https://www.roofhub.co.nz";
const HOST = "www.roofhub.co.nz";

const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("IndexNow key file not found in public/");
  process.exit(1);
}
const key = keyFile.replace(".txt", "");

const res = await fetch(`${SITE}/sitemap.xml`);
if (!res.ok) {
  console.error(`Sitemap fetch failed: ${res.status}`);
  process.exit(1);
}
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) {
  console.error("Sitemap is empty — indexing disabled or nothing to submit.");
  process.exit(1);
}

const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls })
});
console.log(`IndexNow: submitted ${urls.length} URLs -> ${r.status}`);
