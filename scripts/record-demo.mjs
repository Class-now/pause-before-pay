// Records the demo video headless with Playwright and converts it to H.264 mp4 with ffmpeg.
// Usage: node scripts/record-demo.mjs [base-url]   (no URL → serves this folder locally)
// Writes demo-out/raw.webm, submission/demo.mp4 and submission/transcript.md
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "./pw.mjs";
import { serve } from "./serve.mjs";

let base = process.argv[2];
let server = null;
if (!base) { server = await serve(8766); base = "http://127.0.0.1:8766/"; }
const out = "demo-out";
mkdirSync(out, { recursive: true });
mkdirSync("submission", { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: out, size: { width: 1280, height: 720 } }, colorScheme: "light", locale: "en-US" });
const page = await context.newPage();
const t0 = Date.now();
const lines = [];
const pause = (ms) => page.waitForTimeout(ms);

async function caption(text, ms) {
  lines.push({ at: ((Date.now() - t0) / 1000).toFixed(0), text });
  await page.evaluate((t) => {
    let c = document.getElementById("demo-caption");
    if (!c) {
      c = document.createElement("div");
      c.id = "demo-caption";
      c.style.cssText = "position:fixed;left:50%;bottom:22px;transform:translateX(-50%);width:1120px;background:rgba(15,23,42,.93);color:#fff;font:600 23px/1.38 'Segoe UI',system-ui,sans-serif;padding:12px 22px;border-radius:12px;z-index:99999;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.3)";
      document.body.appendChild(c);
    }
    c.textContent = t;
  }, text);
  if (ms) await pause(ms);
}
async function scrollTo(selector, offset = -12) {
  await page.locator(selector).first().evaluate((n, o) => { const y = n.getBoundingClientRect().top + window.scrollY + o; window.scrollTo({ top: y, behavior: "smooth" }); }, offset);
  await pause(900);
}
async function load(id) {
  await scrollTo("#t-paste-label", -140);
  await page.selectOption("#sample-select", id);
  await pause(500);
  await page.click("#load-btn");
  await pause(1000);
}

await page.goto(base + "?lang=en");
await caption("Pause Before Pay: before you pay, click or share a code, paste the message here.", 4500);
await scrollTo("#privacy", -90);
await caption("Everything runs on your device. The page's Content-Security-Policy sets connect-src 'none', so it cannot send your message anywhere.", 5500);

await page.focus("#msg");
await page.keyboard.type("USPS: Your package is on hold due to an unpaid $1.99 fee. Pay within 24 hours: https://usps-redelivery-help.top/track", { delay: 18 });
await caption("Example 1 (synthetic): a parcel-fee text. One tap to check.", 1500);
await page.click("#check-btn");
await pause(1200);
await caption("Strong warning signs — but always labelled 'Signals, not a verdict'.", 4000);
await scrollTo("#t-signals");
await caption("It explains each red flag in plain words: rushing you, a company name, and a link the company does not use.", 5500);
await caption("Links are never opened. They're shown defanged (hxxps, [.]) so they can't be tapped by accident.", 5000);
await scrollTo("#t-steps");
await caption("Then the safer path: don't tap; open the official app you already have; report it.", 5500);

await load("en-homoglyph");
await scrollTo("#t-links");
await caption("Example 2: 'amazon.com' — but the 'а' is Cyrillic. The xn-- form reveals the look-alike.", 6000);

await load("en-paypal-html");
await scrollTo("#t-links");
await caption("Example 3: an email whose link text says paypal.com but really goes to 'paypa1' on another domain.", 6000);

await page.click("#lang-btn");
await pause(600);
await load("ja-sagawa");
await caption("日本語にも対応。Japanese delivery-SMS scam: the real site is at the END of the address.", 5000);
await scrollTo("#t-steps");
await caption("Advice and reporting for Japan: Consumer Hotline 188, police #9110, Anti-Phishing Council.", 5500);
await page.click("#lang-btn");
await pause(600);

await load("en-safe-otp");
await caption("A real sign-in code that warns 'don't share it' shows no warning signs — the tool tries not to cry wolf.", 5500);
await scrollTo("#t-uncertainty");
await caption("It also says what it can't know: the real sender, who owns a site, or scams with no visible tricks.", 5500);

await load("hard-ja-polite");
await caption("Limitation, shown honestly: this polite phishing with a plain domain gets no warning. No signals ≠ safe.", 6000);
await scrollTo("#verdict", -80);
await pause(2500);
await caption("On 25 synthetic samples: 18/18 scams flagged, 0/7 ordinary messages flagged; 3 hard cases documented.", 5500);
await caption("Pause Before Pay — free, on-device, open source. Made for SafeSpace Hacks 2026 with Claude Code.", 4500);

const total = (Date.now() - t0) / 1000;
await context.close();
await browser.close();
if (server) server.close();
const vid = readdirSync(out).find((f) => f.endsWith(".webm") && f !== "raw.webm");
if (vid) renameSync(join(out, vid), join(out, "raw.webm"));
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(out, "raw.webm"), "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-an", "-movflags", "+faststart", "submission/demo.mp4"], { stdio: "inherit" });
writeFileSync("submission/transcript.md", `# Demo video transcript (on-screen captions, no audio)\n\nLength: about ${total.toFixed(0)} s. All messages shown are synthetic.\n\n${lines.map((l) => `- [${l.at}s] ${l.text}`).join("\n")}\n`);
console.log("recorded", total.toFixed(1), "s; mp4", (statSync("submission/demo.mp4").size / 1e6).toFixed(2), "MB");
