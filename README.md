# Pause Before Pay

**Paste a suspicious SMS, email or DM (English or Japanese). Get a calm, plain-language explanation of its red flags, its link tricks, and what to do instead — entirely on your device.**

- Live demo: https://class-now.github.io/pause-before-pay/
- Built for [SafeSpace Hacks 2026](https://safespace-hacks.devpost.com/) · MIT licence

## The problem

Scam texts and phishing emails work because they arrive when you are busy and they push you to act *now*: pay a $1.99 "redelivery fee", "confirm" a one-time code, buy gift cards for "your boss". The people most often caught are not careless; they just have no quick, private way to ask "is this normal?" before tapping. Pasting the message into an online checker or a chatbot means sending a private message — sometimes with names, codes and account numbers — to a third party.

## Who it is for

Anyone who receives a message that asks for money, a code, or a click — especially older relatives, students living alone, and people in Japan who get English-language scams (or vice versa). It is designed to be something a family member can bookmark and say "paste it here first".

## What it does

1. **Red flags in the text, explained in plain words** — pressure to act fast, unusual payment (gift cards, crypto, wire, 電子マネー), requests for passwords / one-time codes / card numbers, threats (arrest, 差し押さえ), "too good to be true" offers (prizes, 還付金, guaranteed returns), secrecy, moving you to WhatsApp/LINE or a "new number", remote-access apps, and well-known brand names. Each flag is highlighted in your message.
2. **Link analysis without opening anything** — look-alike domains (`paypa1`, `amaz0n`), homoglyphs and punycode (`аmazon.com` with a Cyrillic "а" → `xn--mazon-3ve.com`), the brand placed at the *start* of a hostname (`sagawa-exp.co.jp.delivery-check.top`), brand names in unofficial domains, URL shorteners, raw IP addresses (including decimal-encoded ones), the `@` userinfo trick, link text that shows a different address than the real destination, cheap throwaway TLDs, and plain `http`. Links are shown "defanged" (`hxxps://example[.]com`) and are **never rendered as clickable** or fetched.
3. **A risk level with explicit uncertainty** — *No common signals / A few weak signals / Several warning signs / Strong warning signs*, always labelled **"Signals, not a verdict"**, with a list of what the check *cannot* know (real sender, who owns a site, scams with no visible tricks).
4. **What to do instead** — steps tailored to the flags found (don't tap; open the official app or call the number on your card; never share a code; don't pay by gift card/crypto; call the person on a number you already have), plus where to report: **Japan** — Consumer Hotline 188, police consultation #9110, the Council of Anti-Phishing Japan (info@antiphishing.jp); **US** — reportfraud.ftc.gov, forward texts to 7726, ic3.gov, reportphishing@apwg.org.
5. **English / 日本語 UI**, 28 built-in synthetic examples (scams, ordinary messages, and hard cases).

## Privacy and trust by design

- Everything runs in the page. The page sets a Content-Security-Policy of `default-src 'none'; connect-src 'none'; form-action 'none'; …`, so the browser itself refuses any fetch, beacon, WebSocket or form submission — the app *cannot* send your message anywhere. The UI says so above the text box.
- Nothing is stored (no cookies, localStorage or IndexedDB). Closing the tab erases the message.
- Message text is only ever inserted with `textContent` (no `innerHTML`), so pasted HTML cannot run.
- The test suite checks the CSP and scans the app code for `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, storage APIs, `window.open` and `innerHTML`.
- No AI model or remote API is involved at runtime; the rules are readable in [`js/analyzer.js`](js/analyzer.js).

## How to use

Open the live demo (works offline once loaded, on old phones, keyboard-only and with screen readers). Paste a message → **Check this message** (or Ctrl+Enter). Or pick an example from the list. To run locally: open `index.html` through any static server, e.g. `node scripts/serve.mjs` → http://127.0.0.1:8765/.

## Before / after example (synthetic)

> 【佐川急便】お荷物をお届けに上がりましたが不在の為持ち帰りました。下記よりご確認ください。https://sagawa-exp.co.jp.delivery-check.top/jp

**Before:** the address starts with `sagawa-exp.co.jp`, the courier's real domain, so it looks official. A busy reader taps it and is asked to "pay a redelivery fee" with their card.

**After (Pause Before Pay):** *Strong warning signs — Signals, not a verdict.*
- Link: "Sagawa is placed at the start of the address, but the real site is at the end: `delivery-check.top`"; ".top is a cheap domain ending often used for throwaway sites."
- Text: "Company name and link don't match: Sagawa → delivery-check[.]top."
- What to do instead: don't tap; check the delivery in the official app or by typing the address you already know; report to the Council of Anti-Phishing Japan; call 188 if money was lost.

The safer outcome: the user checks the tracking number in the official app instead of entering card details on a phishing page.

## Test results (honest)

`npm test` (Node's built-in `node --test`, 36 tests) checks every sample plus unit tests for punycode decoding, domain parsing, homoglyph folding, link tricks, and the no-network guarantees. `node scripts/eval.mjs --md` prints the table below.

| Measure (on the built-in synthetic set) | Result |
|---|---|
| Scam samples rated "Several warning signs" or "Strong" | **18 / 18** |
| Ordinary messages rated that high (false alarms) | **0 / 7** |
| Expected text signals detected | 51 / 52 (missed: the "boss" gift-card message says "today" but no stronger urgency word) |
| Expected link findings detected | 19 / 19 |
| Hard cases | romance scam → *no signals* (missed); polite Japanese phishing with a plain `.jp` domain → *no signals* (missed); genuine bank fraud alert → *a few weak signals* (correctly not alarming) |

**Please read these numbers carefully:** the samples were written by the same team that wrote the rules, so this is an *in-sample* check that the features work as designed — not a measurement of real-world accuracy. The hard cases are included precisely to show where the approach fails.

<details><summary>Full per-sample table</summary>

| Sample | Kind | Level | Score | Text signals | Link findings | Missed |
|---|---|---|---|---|---|---|
| en-parcel-fee | scam | high | 11 | urgency,brand,offbrandlink | tld,brandindomain | – |
| en-bank-otp | scam | high | 16 | urgency,credential,brand,offbrandlink | brandindomain | – |
| en-boss-giftcards | scam | high | 9 | payment,secrecy,brand | – | urgency |
| en-crypto-invest | scam | high | 8 | payment,prize,channel | – | – |
| en-prize-ip | scam | high | 9 | urgency,prize | ip,http | – |
| en-paypal-html | scam | high | 13 | urgency,brand,offbrandlink | tld,lookalike,mismatch | – |
| en-homoglyph | scam | high | 11 | brand,offbrandlink | punycode,mixedscript,lookalike | – |
| en-tech-support | scam | medium | 6 | urgency,remote,brand | – | – |
| en-toll-shortener | scam | medium | 6 | urgency,threat | shortener | – |
| en-hi-mum | scam | high | 10 | urgency,payment,channel | – | – |
| en-userinfo | scam | high | 14 | credential,brand,offbrandlink | userinfo,tld | – |
| ja-sagawa | scam | high | 10 | brand,offbrandlink | tld,brandsubdomain | – |
| ja-amazon-suspend | scam | high | 18 | urgency,credential,brand,offbrandlink | tld,brandsubdomain | – |
| ja-tax-ip | scam | high | 19 | urgency,payment,threat,brand,offbrandlink | ip,http | – |
| ja-card-punycode | scam | high | 19 | urgency,credential,brand,offbrandlink | punycode,mixedscript,lookalike | – |
| ja-line-sidejob | scam | medium | 5 | prize,channel,brand | – | – |
| ja-refund-atm | scam | medium | 7 | urgency,credential,prize,secrecy | – | – |
| ja-mercari-shortener | scam | high | 8 | urgency,brand,offbrandlink | shortener | – |
| en-safe-friend | safe | none | 0 | – | – | – |
| en-safe-otp | safe | none | 0 | – | – | – |
| en-safe-order | safe | low | 1 | brand | – | – |
| en-safe-school | safe | none | 0 | – | – | – |
| ja-safe-friend | safe | none | 0 | – | – | – |
| ja-safe-dentist | safe | none | 0 | – | – | – |
| ja-safe-code | safe | none | 0 | – | – | – |
| hard-romance | hard(scam) | none | 0 | – | – | – |
| hard-real-bank | hard(safe) | low | 3 | urgency,brand | – | – |
| hard-ja-polite | hard(scam) | none | 0 | – | – | – |

</details>

## Limitations

- **"No signals" does not mean safe.** Polite scams with an ordinary-looking domain and slow-build romance/investment scams can show nothing (see the hard cases).
- Rule-based pattern matching for English and Japanese only; other languages get link analysis only.
- The brand list is short (~35 companies and offices, US- and Japan-focused), and domain parsing uses a simplified public-suffix list, so some legitimate domains of those brands may be flagged as "not official".
- It cannot see the real sender, email headers, phone numbers, attachments, domain age or reputation — by design it never contacts any website.
- Real companies sometimes send urgent messages; a high level is a reason to verify independently, not proof of fraud.
- It is not a replacement for your carrier's/email provider's spam filtering or for official advice.

## Built during the hackathon

Everything in this repository was created from scratch on **2026-11-10**, inside the SafeSpace Hacks submission period (Oct 17 – Nov 22, 2026): the analyzer, the UI, the synthetic samples, the tests, and the demo tooling. No earlier code was reused.

## How it's built

Plain HTML, CSS and vanilla JavaScript modules — no build step and no runtime dependencies. `js/analyzer.js` is a pure function (`analyze(text)`) used by both the browser UI and the Node tests. It includes a small RFC 3492 punycode decoder, a confusable-character "skeleton" for look-alike detection, and an edit-distance check against brand tokens. Screenshots and the demo video are produced headlessly with Playwright (`scripts/capture.mjs`, `scripts/record-demo.mjs`) and encoded with ffmpeg.

## Credits

- **AI assistance:** designed and written with **Claude Code** (Anthropic's Claude), including the rules, UI copy (English and Japanese), samples, tests and this README. No AI runs inside the app.
- **Data:** all example messages, names, numbers and domains are **synthetic** and invented for this project — do not visit the example domains. Reporting contacts (188, #9110, antiphishing.jp, reportfraud.ftc.gov, 7726, ic3.gov, APWG) are public services listed for guidance.
- Scam patterns reflect widely published consumer-protection guidance (e.g. FTC consumer advice, Japan's National Consumer Affairs Center and the Council of Anti-Phishing Japan); no text was copied from those sources.
