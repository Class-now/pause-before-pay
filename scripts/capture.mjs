// Checks the app in headless Chromium and takes the submission screenshots.
// Usage: node scripts/capture.mjs [base-url]   (no URL → serves this folder locally)
import { mkdirSync } from "node:fs";
import { chromium } from "./pw.mjs";
import { serve } from "./serve.mjs";

let base = process.argv[2];
let server = null;
if (!base) { server = await serve(8765); base = "http://127.0.0.1:8765/"; }
const out = "submission/screenshots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light", locale: "en-US" });
const page = await ctx.newPage();
const errors = [];
const requests = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("request", (r) => requests.push(r.url()));

const res = await page.goto(base + "?lang=en", { waitUntil: "networkidle" });
console.log("status", res.status());
const ok = (cond, msg) => { console.log(cond ? "PASS" : "FAIL", msg); if (!cond) process.exitCode = 1; };

// 1. Empty input → friendly error
await page.click("#check-btn");
ok(await page.isVisible("#msg-error"), "empty input shows an error message");

// 2. CSP really blocks network from the page
const blocked = await page.evaluate(async () => { try { await fetch("https://example.com/"); return false; } catch { return true; } });
ok(blocked, "fetch() to the internet is blocked by CSP");

// 3. Every sample analyses without error; check levels
const levels = await page.evaluate(async () => {
  const sel = document.getElementById("sample-select");
  const out = {};
  for (const o of sel.querySelectorAll("option[value]:not([value=''])")) {
    sel.value = o.value;
    document.getElementById("load-btn").click();
    out[o.value] = document.getElementById("verdict").className.replace("verdict lv-", "");
  }
  return out;
});
console.log(levels);
ok(levels["en-paypal-html"] === "high" && levels["en-safe-friend"] === "none", "sample levels render in the UI");
ok((await page.locator("#highlight a").count()) === 0, "no clickable links are rendered from the message");

// Screenshot 1: English high-risk email with mismatched link
await page.selectOption("#sample-select", "en-paypal-html");
await page.click("#load-btn");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${out}/1-input-and-verdict.png` });
// Screenshot 2: details (red flags + links)
await page.locator("#verdict").evaluate((n) => n.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -10));
await page.screenshot({ path: `${out}/2-red-flags-and-links.png` });
// Screenshot 3: Japanese UI, Japanese SMS, steps
await page.click("#lang-btn");
await page.selectOption("#sample-select", "ja-sagawa");
await page.click("#load-btn");
await page.selectOption("#region", "jp");
await page.locator("#t-highlight").evaluate((n) => n.scrollIntoView({ block: "start" }));
await page.evaluate(() => window.scrollBy(0, -16));
await page.screenshot({ path: `${out}/3-japanese-what-to-do.png` });
ok((await page.locator("#steps li").count()) >= 4, "Japanese advice steps rendered");

// Thumbnail 1200x800 (3:2): a poster built from real analyzer output
{
  const tp = await ctx.newPage();
  await tp.setViewportSize({ width: 1200, height: 800 });
  await tp.goto(base + "?lang=en");
  await tp.selectOption("#sample-select", "en-homoglyph");
  await tp.click("#load-btn");
  const finding = await tp.locator("#link-list > li ul li").first().textContent();
  const linkShown = await tp.locator("#link-list > li > code").first().textContent();
  await tp.setContent(`<!doctype html><html><body style="margin:0;width:1200px;height:800px;background:#1f5f4f;font-family:'Segoe UI',system-ui,sans-serif;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 80px;box-sizing:border-box">
    <div style="font-size:30px;opacity:.9;letter-spacing:.04em">SAFESPACE HACKS 2026</div>
    <div style="font-size:92px;font-weight:800;line-height:1.05;margin:10px 0 8px">Pause Before Pay</div>
    <div style="font-size:34px;opacity:.95;margin-bottom:34px">Paste a suspicious message. See the red flags. On your device.</div>
    <div style="background:#fff;color:#1d2421;border-radius:22px;padding:28px 34px;box-shadow:0 10px 40px rgba(0,0,0,.25)">
      <div style="color:#a3221b;font-weight:800;font-size:34px">Strong warning signs</div>
      <div style="font-family:Consolas,monospace;font-size:26px;margin:12px 0;background:#f6f7f4;padding:6px 12px;border-radius:8px;display:inline-block">${linkShown}</div>
      <div style="font-size:25px;line-height:1.4">${finding}</div>
      <div style="font-size:22px;margin-top:14px;color:#4c5752">Signals, not a verdict · English &amp; 日本語 · connect-src 'none'</div>
    </div></body></html>`);
  await tp.screenshot({ path: "submission/thumbnail.png" });
  await tp.close();
}

// Keyboard: Tab to the textarea and use Ctrl+Enter
await page.goto(base + "?lang=en");
await page.focus("#msg");
await page.keyboard.type("Send me the gift card codes now, urgent!");
await page.keyboard.press("Control+Enter");
ok(await page.isVisible("#results"), "keyboard (Ctrl+Enter) runs the check");

const external = requests.filter((u) => !u.startsWith(base) && !u.startsWith("data:"));
ok(external.length === 0, `no requests outside the site (${external.length})`);
ok(errors.filter((e) => !/Content Security Policy|example\.com|Failed to fetch/i.test(e)).length === 0, `no page errors ${JSON.stringify(errors)}`);
await browser.close();
if (server) server.close();
