## Inspiration

Almost everyone we know has received the "your parcel could not be delivered — pay ¥200 here" text, the "your account will be suspended in 24 hours" email, or a "Hi Mum, this is my new number" message. In Japan, fake courier and card-company SMS arrive daily; in the US, toll and USPS texts do the same. The people who get caught are not careless — they are busy, and the message is built to make them act before they think. We wanted a single place you could tell a parent or a friend about: *"paste it here first."*

The second problem: most "is this a scam?" checkers ask you to upload the message to a server or a chatbot. That means handing over a private message — sometimes with names, codes and account numbers — to make yourself safer. We wanted the safety tool itself to create no new risk.

## What it does

Pause Before Pay is a free web page. You paste a suspicious SMS, email or DM in **English or Japanese** and get, entirely on your device:

- **Red flags in plain words, highlighted in your message** — pressure to act fast, gift card / crypto / wire / 電子マネー payment, requests for passwords and one-time codes, threats (arrest, 差し押さえ), too-good-to-be-true offers (prizes, 還付金, guaranteed returns), secrecy, being moved to WhatsApp/LINE or a "new number", remote-access apps, and impersonated brands.
- **Link analysis without opening anything** — look-alike domains (`paypa1`), homoglyph/punycode domains (a Cyrillic "а" in `аmazon.com` is revealed as `xn--mazon-3ve.com`), brand-in-subdomain tricks (`sagawa-exp.co.jp.delivery-check.top`), URL shorteners, IP-address hosts, the `@` userinfo trick, and link text that shows a different address than the real destination. Links are displayed defanged and are never clickable.
- **A risk level with explicit uncertainty** — always labelled "Signals, not a verdict", plus a section on what the check cannot know.
- **What to do instead** — tailored steps (open the official app you already have, never share a code, don't pay by gift card, call the person on a number you already have) and where to report: 188 / #9110 / Council of Anti-Phishing Japan, or reportfraud.ftc.gov / 7726 / IC3 in the US.

**Safer outcome, example:** a Japanese "missed delivery" SMS links to `sagawa-exp.co.jp.delivery-check.top`. Because it *starts* with the courier's real domain, it looks official. Pause Before Pay rates it "Strong warning signs", explains that the real site is the part at the end (`delivery-check.top`), notes that the courier does not use that site, and tells the user to check the tracking number in the official app instead — so the card number is never typed into a phishing page.

## How we built it

Plain HTML, CSS and vanilla JavaScript modules, with no build step, no runtime dependencies and no server. The page ships a Content-Security-Policy with `connect-src 'none'` (and `default-src 'none'`, `form-action 'none'`), so the browser itself blocks any network request from the app; the UI states this above the text box. Nothing is stored. Pasted text is only inserted with `textContent`, so pasted HTML can't run.

The analyzer (`analyze(text)`) is one pure function shared by the UI and the tests. It includes a small RFC 3492 punycode decoder, a confusable-character "skeleton" (Cyrillic/Greek letters and digits folded to Latin) plus an edit-distance check against ~35 brand tokens, a simplified public-suffix list for `.co.jp`-style domains, and bilingual phrase rules. Japanese has no word boundaries, so its rules are tuned substrings; English uses word-boundary patterns.

We wrote 28 synthetic sample messages (scams, ordinary messages, and hard cases) and a `node --test` suite that checks detections on every sample, the link-trick unit cases, and the no-network guarantees (it fails if the CSP loses `connect-src 'none'` or if app code uses `fetch`, storage APIs, `window.open` or `innerHTML`). Screenshots and the demo video were captured headlessly with Playwright.

## Challenges we ran into

- **Not crying wolf.** A real sign-in text says "your code is 482913 — never share it". A naive rule flags "code". We added context checks so a message that *warns* you not to share a code counts in its favour, and only a code that the message *asks for* is a red flag.
- **URLs inside Japanese text.** Japanese sentences run straight into URLs with no spaces and end with 「。」, so link extraction needed careful trimming.
- **Explaining uncertainty without sounding unsure of everything.** We settled on four levels, a permanent "Signals, not a verdict" tag, and a separate "What this check cannot tell you" section.

## Accomplishments that we're proud of

- On our synthetic set: 18/18 scam samples rated "several" or "strong" warning signs, 0/7 ordinary messages rated that high, and 19/19 expected link tricks detected — with the misses (a slow-build romance scam and a polite Japanese phishing message with a plain domain) shown in the app and README rather than hidden.
- The privacy promise is enforced by the browser, not just stated.
- A fully bilingual experience, including Japan-specific reporting advice.

## What we learned

The most useful output is not the score — it's the "what to do instead" list. A person who opens the official app instead of tapping the link is safe even if our score is wrong. We also learned how much a homoglyph or a brand-in-subdomain trick fools the eye until it is spelled out.

## What's next

- More languages (Korean, Chinese, Spanish) and more brands, especially local banks and couriers.
- An "explain it to my parent" mode with larger text and a single next step.
- A share-target so a phone's "Share → Pause Before Pay" can open the checker directly (still offline).
- An independent test set written by people who did not write the rules.

## Limitations

- "No signals" does not mean safe: polite scams with ordinary domains and slow-build romance/investment scams can show nothing.
- Rule-based English/Japanese only; the brand list is short; domain parsing uses a simplified suffix list.
- It cannot see the real sender, headers, attachments, or a site's age or reputation — by design it never contacts any website.
- Our accuracy numbers are in-sample on synthetic messages written by the same team, not a measure of real-world accuracy.

## Credits & AI disclosure

- Built from scratch on 2026-11-10, during the SafeSpace Hacks submission period (Oct 17 – Nov 22, 2026).
- **AI assistance:** designed and written with **Claude Code** (Anthropic's Claude) — rules, UI copy in English and Japanese, samples, tests, documentation and the demo script. No AI model runs inside the app.
- All example messages, names, numbers and domains are synthetic; please do not visit the example domains.
- Reporting contacts are public services (Consumer Hotline 188, police #9110, Council of Anti-Phishing Japan, FTC, 7726, FBI IC3, APWG).
