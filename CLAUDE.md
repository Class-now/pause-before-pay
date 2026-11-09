# pause-before-pay

SafeSpace Hacks 2026 (Devpost) entry. Static, on-device scam-message checker (EN/JA). Started 2026-11-10 by a contest-pm sub-agent; brief: `C:\For Claude\contest-pm\docs\pm\student-hacks-1110-build-brief.md`.

- App: `index.html` + `style.css` + `js/` (analyzer.js = pure logic, samples.js = synthetic samples, i18n.js = strings, app.js = UI). No build, no deps. CSP `connect-src 'none'`.
- Tests: `npm test` (node --test). Eval table for README: `node scripts/eval.mjs --md`.
- Capture: `PLAYWRIGHT_FROM="C:/For Claude/intern-pilot" node scripts/capture.mjs [url]` (screenshots + checks), `... node scripts/record-demo.mjs [url]` (demo.mp4 + transcript).
- Live: https://class-now.github.io/pause-before-pay/ (GitHub Pages, main /).
- Submission material: `submission/` (story, tagline, transcript, screenshots, thumbnail; demo.mp4 is gitignored). Devpost submission is done by contest-pm.
