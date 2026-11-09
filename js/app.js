// UI for Pause Before Pay. All work happens in this tab; nothing is fetched, stored or opened.
import { analyze, defang } from "./analyzer.js";
import { SAMPLES } from "./samples.js";
import { STR, SIGNAL_TEXT, LINK_TEXT, ADVICE, REPORT } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const k of kids) if (k != null) n.append(k);
  return n;
};

let lang = (navigator.language || "en").toLowerCase().startsWith("ja") ? "ja" : "en";
const qs = new URLSearchParams(location.search);
if (qs.get("lang") === "ja" || qs.get("lang") === "en") lang = qs.get("lang");
let region = lang === "ja" ? "jp" : "us";
let last = null;

function t() { return STR[lang]; }

function renderStatic() {
  const s = t();
  document.documentElement.lang = lang;
  $("t-title").textContent = s.title;
  $("t-tagline").textContent = s.tagline;
  $("t-privacy").textContent = s.privacy;
  $("lang-btn").textContent = s.langLabel;
  $("lang-btn").setAttribute("lang", lang === "ja" ? "en" : "ja");
  $("t-paste-label").textContent = s.pasteLabel;
  $("msg").placeholder = s.pastePlaceholder;
  $("check-btn").textContent = s.check;
  $("clear-btn").textContent = s.clear;
  $("t-sample-label").textContent = s.sampleLabel;
  $("load-btn").textContent = s.load;
  $("t-results").textContent = s.resultsHeading;
  $("t-signals").textContent = s.signalsHeading;
  $("t-links").textContent = s.linksHeading;
  $("t-links-note").textContent = s.linksNote;
  $("t-highlight").textContent = s.highlightHeading;
  $("t-steps").textContent = s.stepsHeading;
  $("t-report").textContent = s.reportHeading;
  $("t-region").textContent = s.regionLabel;
  $("t-uncertainty").textContent = s.uncertaintyHeading;
  $("t-limits").textContent = s.footerLimits;
  $("t-data").textContent = s.footerData;
  $("t-source").textContent = s.source;

  const sel = $("sample-select");
  const keep = sel.value;
  sel.replaceChildren(el("option", { value: "", text: s.samplePick }));
  for (const [kind, label] of [["scam", s.groupScam], ["safe", s.groupSafe], ["hard", s.groupHard]]) {
    const g = el("optgroup", { label });
    for (const x of SAMPLES.filter((y) => y.kind === kind)) g.append(el("option", { value: x.id, text: `[${x.lang === "ja" ? "JA" : "EN"}] ${x.title[lang]}` }));
    sel.append(g);
  }
  sel.value = keep;

  const reg = $("region");
  reg.replaceChildren(...Object.entries(s.regions).map(([k, v]) => el("option", { value: k, text: v })));
  reg.value = region;
  const ul = $("uncertainty");
  ul.replaceChildren(...s.uncertainty.map((x) => el("li", { text: x })));
}

function signalText(sig) {
  if (sig.id === "credential" && sig.note === "mention") return SIGNAL_TEXT.credentialMention[lang];
  return SIGNAL_TEXT[sig.id][lang];
}

function renderVerdict(r) {
  const s = t();
  const lv = s.levels[r.level];
  const order = ["none", "low", "medium", "high"];
  const idx = order.indexOf(r.level);
  const meter = el("div", { class: "meter", "aria-hidden": "true" }, ...order.map((_, i) => el("span", { class: i <= idx && idx > 0 ? "on" : "" })));
  const box = $("verdict");
  box.className = `verdict lv-${r.level}`;
  box.replaceChildren(
    el("h3", { text: lv.h }),
    meter,
    el("span", { class: "tag", text: s.notVerdict }),
    el("p", { text: lv.p }),
    el("p", { class: "small muted", text: s.scoreLine(r.score, r.strongCount) }),
  );
}

function renderSignals(r, text) {
  const s = t();
  const ul = $("signal-list");
  const shown = r.signals.filter((x) => x.id !== "credential" || x.weight > 0);
  if (!shown.length) { ul.replaceChildren(el("li", { text: s.noSignals })); return; }
  ul.replaceChildren(...shown
    .sort((a, b) => b.weight - a.weight)
    .map((sig) => {
      const [h, p] = signalText(sig);
      const cls = sig.positive ? "good" : sig.weight >= 4 ? "strong" : sig.weight >= 2 ? "mid" : "";
      let found = null;
      if (sig.matches && sig.matches.length) {
        const uniq = [...new Set(sig.matches.map((m) => m.text.trim()))].slice(0, 4);
        found = el("span", { class: "found" }, s.matchedLabel + " ", ...uniq.flatMap((u, i) => [i ? ", " : "", el("q", { text: u })]));
      } else if (sig.pairs) {
        found = el("span", { class: "found", text: sig.pairs.map((p2) => `${p2.brand} → ${defang(p2.host)}`).join(" · ") });
      } else if (sig.hosts) {
        found = el("span", { class: "found", text: sig.hosts.join(", ") });
      }
      return el("li", { class: cls }, el("strong", { text: h }), el("span", { text: p }), found ? el("br") : null, found);
    }));
}

function renderLinks(r) {
  const s = t();
  const ul = $("link-list");
  if (!r.links.length) { ul.replaceChildren(el("li", { text: s.noLinks })); return; }
  ul.replaceChildren(...r.links.map((l) => {
    const items = l.findings.sort((a, b) => b.weight - a.weight).map((f) => el("li", { text: LINK_TEXT[f.id][lang](f) }));
    if (!items.length) items.push(el("li", { text: l.official && l.official.length ? s.linkOfficial(l.official[0]) : s.linkClean }));
    else if (l.official && l.official.length && !l.findings.some((f) => f.weight >= 4)) items.push(el("li", { text: s.linkOfficial(l.official[0]) }));
    const bad = l.findings.some((f) => f.weight >= 4);
    const disp = l.display ? el("div", { class: "small muted" }, lang === "ja" ? "表示の文字: " : "Shown as: ", el("code", { text: l.display.slice(0, 120) })) : null;
    return el("li", { class: bad ? "bad" : "" }, el("code", { text: defang(l.raw) }), disp, el("ul", {}, ...items));
  }));
}

function renderHighlight(r, text) {
  const spans = [];
  for (const sig of r.signals) {
    if (sig.positive || !sig.matches || sig.weight === 0) continue;
    for (const m of sig.matches) spans.push({ ...m, cls: sig.weight >= 4 ? "strong" : "", label: signalText(sig)[0] });
  }
  for (const l of r.links) spans.push({ start: l.start, end: l.end, cls: "link", label: t().linksHeading, link: true });
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const out = [];
  let pos = 0;
  for (const sp of spans) {
    if (sp.start < pos) continue;
    out.push(document.createTextNode(text.slice(pos, sp.start)));
    const shown = sp.link ? defang(text.slice(sp.start, sp.end)) : text.slice(sp.start, sp.end);
    out.push(el("mark", { class: sp.cls, title: sp.label }, shown, el("span", { class: "vh", text: ` (${sp.label})` })));
    pos = sp.end;
  }
  out.push(document.createTextNode(text.slice(pos)));
  $("highlight").replaceChildren(...out);
}

function renderSteps(r) {
  $("steps").replaceChildren(...r.advice.map((k) => el("li", { text: ADVICE[k][lang] })));
  renderReport();
}
function renderReport() {
  $("report-list").replaceChildren(...REPORT[region].map((x) => el("li", { text: x[lang] })));
}

function run() {
  const text = $("msg").value;
  const err = $("msg-error");
  if (!text.trim()) {
    err.textContent = t().emptyError;
    err.hidden = false;
    $("msg").focus();
    return;
  }
  err.hidden = true;
  last = { text, r: analyze(text) };
  draw();
  const res = $("results");
  res.hidden = false;
  res.focus({ preventScroll: true });
  res.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}

function draw() {
  if (!last) return;
  renderVerdict(last.r);
  renderSignals(last.r, last.text);
  renderLinks(last.r);
  renderHighlight(last.r, last.text);
  renderSteps(last.r);
}

$("check-btn").addEventListener("click", run);
$("msg").addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run(); });
$("clear-btn").addEventListener("click", () => {
  $("msg").value = "";
  last = null;
  $("results").hidden = true;
  $("msg-error").hidden = true;
  $("msg").focus();
});
$("load-btn").addEventListener("click", () => {
  const x = SAMPLES.find((y) => y.id === $("sample-select").value);
  if (!x) { $("sample-select").focus(); return; }
  $("msg").value = x.text;
  run();
});
$("lang-btn").addEventListener("click", () => {
  lang = lang === "ja" ? "en" : "ja";
  renderStatic();
  draw();
});
$("region").addEventListener("change", (e) => { region = e.target.value; renderReport(); });

renderStatic();
