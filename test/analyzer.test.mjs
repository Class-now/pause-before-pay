import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { analyze, analyzeLink, extractLinks, punycodeDecode, registrableDomain, skeleton, defang } from "../js/analyzer.js";
import { SAMPLES } from "../js/samples.js";

const flagged = (r) => r.level === "medium" || r.level === "high";

for (const s of SAMPLES.filter((x) => x.kind === "scam")) {
  test(`scam sample is flagged: ${s.id}`, () => {
    const r = analyze(s.text);
    assert.ok(flagged(r), `${s.id}: expected medium/high, got ${r.level} (score ${r.score})`);
  });
}
for (const s of SAMPLES.filter((x) => x.kind === "safe")) {
  test(`safe sample is not flagged: ${s.id}`, () => {
    const r = analyze(s.text);
    assert.ok(!flagged(r), `${s.id}: expected none/low, got ${r.level} (score ${r.score})`);
  });
}

test("expected signals and link findings: recall over the scam set is at least 95%", () => {
  let want = 0, got = 0;
  const missed = [];
  for (const s of SAMPLES.filter((x) => x.kind === "scam")) {
    const r = analyze(s.text);
    const ids = new Set([...r.signals.filter((x) => x.weight > 0).map((x) => x.id), ...r.links.flatMap((l) => l.findings.map((f) => f.id))]);
    for (const id of [...(s.expect.signals || []), ...(s.expect.links || [])]) {
      want++;
      if (ids.has(id)) got++; else missed.push(`${s.id}:${id}`);
    }
  }
  console.log(`  detected ${got}/${want} expected signals; missed: ${missed.join(", ") || "none"}`);
  assert.ok(got / want >= 0.95, `recall ${got}/${want}`);
});

test("punycode decoding shows the real characters", () => {
  assert.equal(punycodeDecode("mazon-3ve"), "аmazon");
  assert.equal(punycodeDecode("smb-card-hch"), "smbс-card");
});

test("registrable domain handles .co.jp-style suffixes", () => {
  assert.equal(registrableDomain("sagawa-exp.co.jp.delivery-check.top"), "delivery-check.top");
  assert.equal(registrableDomain("www.amazon.co.jp"), "amazon.co.jp");
  assert.equal(registrableDomain("jp-bank.japanpost.jp"), "japanpost.jp");
});

test("skeleton folds look-alike characters", () => {
  assert.equal(skeleton("paypa1"), skeleton("paypal"));
  assert.equal(skeleton("rnicrosoft"), skeleton("microsoft"));
  assert.equal(skeleton("аmazon"), skeleton("amazon"));
});

test("link tricks", () => {
  const ids = (u, d) => analyzeLink(u, d).findings.map((f) => f.id);
  assert.ok(ids("https://amaz0n-verify.top/x").includes("lookalike"));
  assert.ok(ids("https://www.amazon.co.jp.secure-login.xyz/").includes("brandsubdomain"));
  assert.ok(ids("http://3232235777/login").includes("ip"), "decimal IP is normalised and flagged");
  assert.ok(ids("https://www.paypal.com@evil-host.example/").includes("userinfo"));
  assert.ok(ids("https://bit.ly/abc").includes("shortener"));
  assert.ok(ids("https://evil.example/", "https://www.mybank.com").includes("mismatch"));
  assert.deepEqual(ids("https://www.amazon.co.jp/gp/your-orders"), [], "official domain has no findings");
  assert.deepEqual(ids("https://www.mercari.com/jp/"), []);
});

test("link extraction trims trailing punctuation and keeps Japanese text out", () => {
  const ls = extractLinks("確認はこちら https://example-shop.top/a。よろしく。 Also see www.example.org/x).");
  assert.deepEqual(ls.map((l) => l.raw), ["https://example-shop.top/a", "www.example.org/x"]);
});

test("a code the message tells you NOT to share is not a red flag", () => {
  const r = analyze("Your verification code is 123456. Never share this code with anyone.");
  assert.equal(r.level, "none");
  assert.ok(r.signals.some((s) => s.id === "codewarning"));
});

test("defang makes links non-clickable", () => {
  assert.equal(defang("https://a.b.com/x"), "hxxps://a[.]b[.]com/x");
});

test("empty and huge input do not throw", () => {
  assert.equal(analyze("").level, "none");
  assert.doesNotThrow(() => analyze("a".repeat(50000) + " https://x.top"));
});

test("page forbids all network connections (CSP connect-src 'none')", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const csp = html.match(/Content-Security-Policy" content="([^"]+)"/)[1];
  assert.match(csp, /connect-src 'none'/);
  assert.match(csp, /default-src 'none'/);
  assert.match(csp, /form-action 'none'/);
});

test("app code never makes requests, stores data or opens links", () => {
  const dir = new URL("../js/", import.meta.url);
  for (const f of readdirSync(dir)) {
    const src = readFileSync(new URL(f, dir), "utf8");
    for (const bad of [/\bfetch\(/, /XMLHttpRequest/, /WebSocket/, /sendBeacon/, /localStorage/, /sessionStorage/, /indexedDB/, /window\.open/, /location\.href\s*=/, /\.innerHTML\s*=/]) {
      assert.doesNotMatch(src, bad, `${f} uses ${bad}`);
    }
  }
});
