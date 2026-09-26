// Submit canonical sitemap URLs to IndexNow after a production deploy.
// Requires indexing to be enabled so the live sitemap contains URLs.
import { readdirSync } from "node:fs";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.roofhub.co.nz").replace(/\/+$/, "");
const siteUrl = new URL(SITE);
const HOST = siteUrl.host;

const keyFile = readdirSync("public").find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error("IndexNow key file not found in public/");
  process.exit(1);
}
const key = keyFile.replace(".txt", "");

const res = await fetch(`${SITE}/sitemap.xml`, { redirect: "follow" });
if (!res.ok) {
  console.error(`Sitemap fetch failed: ${res.status}`);
  process.exit(1);
}
const xml = await res.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urls.length) {
  console.error("Sitemap is empty — indexing is probably disabled or there is nothing to submit.");
  process.exit(1);
}
const wrongHost = urls.find((url) => new URL(url).host !== HOST);
if (wrongHost) {
  console.error(`Sitemap contains a non-canonical host: ${wrongHost}`);
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls })
});

if (!response.ok) {
  console.error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}
console.log(`IndexNow: submitted ${urls.length} canonical URLs -> ${response.status}`);
