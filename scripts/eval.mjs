// Runs the analyzer over every built-in sample and prints a results table (used for the README).
// Usage: node scripts/eval.mjs [--md]
import { analyze } from "../js/analyzer.js";
import { SAMPLES } from "../js/samples.js";

const md = process.argv.includes("--md");
const rows = [];
let expectedSignals = 0, foundSignals = 0, expectedLinks = 0, foundLinks = 0;
const counts = { scam: { n: 0, flagged: 0 }, safe: { n: 0, flagged: 0 }, hard: { n: 0 } };

for (const s of SAMPLES) {
  const r = analyze(s.text);
  const sigIds = new Set(r.signals.filter((x) => x.weight > 0).map((x) => x.id));
  const linkIds = new Set(r.links.flatMap((l) => l.findings.map((f) => f.id)));
  const missSig = (s.expect.signals || []).filter((id) => !sigIds.has(id));
  const missLink = (s.expect.links || []).filter((id) => !linkIds.has(id));
  expectedSignals += (s.expect.signals || []).length;
  foundSignals += (s.expect.signals || []).length - missSig.length;
  expectedLinks += (s.expect.links || []).length;
  foundLinks += (s.expect.links || []).length - missLink.length;
  const flagged = r.level === "medium" || r.level === "high";
  counts[s.kind].n++;
  if (s.kind !== "hard") counts[s.kind].flagged += flagged ? 1 : 0;
  rows.push({ id: s.id, kind: s.kind + (s.truth ? `(${s.truth})` : ""), level: r.level, score: r.score, signals: [...sigIds].join(","), links: [...linkIds].join(","), missing: [...missSig, ...missLink].join(",") });
}

if (md) {
  console.log("| Sample | Kind | Level | Score | Text signals | Link findings | Missed |");
  console.log("|---|---|---|---|---|---|---|");
  for (const r of rows) console.log(`| ${r.id} | ${r.kind} | ${r.level} | ${r.score} | ${r.signals || "–"} | ${r.links || "–"} | ${r.missing || "–"} |`);
} else {
  console.table(rows);
}
console.log(`\nScam samples flagged medium/high: ${counts.scam.flagged}/${counts.scam.n}`);
console.log(`Safe samples flagged medium/high (false alarms): ${counts.safe.flagged}/${counts.safe.n}`);
console.log(`Expected text signals detected: ${foundSignals}/${expectedSignals}`);
console.log(`Expected link findings detected: ${foundLinks}/${expectedLinks}`);
console.log(`Hard cases (reported, not required): ${rows.filter((r) => r.kind.startsWith("hard")).map((r) => `${r.id}=${r.level}`).join(", ")}`);
