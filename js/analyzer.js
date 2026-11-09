// Pause Before Pay — on-device message analyzer.
// Pure functions, no network, no storage. Works in the browser (ES module) and in Node (node --test).

// ---------------------------------------------------------------------------
// Brands: words that name them in a message, and the domains they really use.
// ---------------------------------------------------------------------------
export const BRANDS = [
  { id: "amazon", name: "Amazon", words: [/\bamazon\b/i, /アマゾン/, /Amazon/], tokens: ["amazon"], official: ["amazon.com", "amazon.co.jp", "amazon.co.uk", "amazon.de", "amazon.ca", "amazon.com.au", "amazonaws.com"] },
  { id: "apple", name: "Apple", words: [/\bapple\s?(id|pay|support|store)?\b/i, /\bicloud\b/i, /アップル/, /Apple\s?ID/i], tokens: ["apple", "icloud", "appleid"], official: ["apple.com", "icloud.com"] },
  { id: "paypal", name: "PayPal", words: [/\bpaypal\b/i, /ペイパル/], tokens: ["paypal"], official: ["paypal.com", "paypal.me"] },
  { id: "netflix", name: "Netflix", words: [/\bnetflix\b/i, /ネットフリックス/], tokens: ["netflix"], official: ["netflix.com"] },
  { id: "microsoft", name: "Microsoft", words: [/\bmicrosoft\b/i, /\boutlook\b/i, /\boffice ?365\b/i, /マイクロソフト/], tokens: ["microsoft", "outlook", "office365"], official: ["microsoft.com", "live.com", "outlook.com", "office.com"] },
  { id: "google", name: "Google", words: [/\bgoogle\b/i, /\bgmail\b/i, /グーグル/], tokens: ["google", "gmail"], official: ["google.com", "google.co.jp", "gmail.com", "youtube.com"] },
  { id: "usps", name: "USPS", words: [/\busps\b/i, /\bpostal service\b/i], tokens: ["usps"], official: ["usps.com"] },
  { id: "fedex", name: "FedEx", words: [/\bfedex\b/i], tokens: ["fedex"], official: ["fedex.com"] },
  { id: "dhl", name: "DHL", words: [/\bdhl\b/i], tokens: ["dhl"], official: ["dhl.com", "dhl.de", "dhl.co.jp"] },
  { id: "ups", name: "UPS", words: [/\bups\b(?! and downs)/], tokens: ["ups"], official: ["ups.com"] },
  { id: "irs", name: "IRS", words: [/\bIRS\b/, /\binternal revenue service\b/i], tokens: ["irs"], official: ["irs.gov"] },
  { id: "chase", name: "Chase", words: [/\bchase bank\b/i, /\bJPMorgan\b/i, /\bChase\b/], tokens: ["chase"], official: ["chase.com"] },
  { id: "bofa", name: "Bank of America", words: [/\bbank of america\b/i], tokens: ["bankofamerica", "bofa"], official: ["bankofamerica.com"] },
  { id: "wellsfargo", name: "Wells Fargo", words: [/\bwells fargo\b/i], tokens: ["wellsfargo"], official: ["wellsfargo.com"] },
  { id: "coinbase", name: "Coinbase", words: [/\bcoinbase\b/i], tokens: ["coinbase"], official: ["coinbase.com"] },
  { id: "binance", name: "Binance", words: [/\bbinance\b/i], tokens: ["binance"], official: ["binance.com"] },
  { id: "instagram", name: "Instagram", words: [/\binstagram\b/i, /インスタ/], tokens: ["instagram"], official: ["instagram.com"] },
  { id: "facebook", name: "Facebook / Meta", words: [/\bfacebook\b/i, /\bmeta\b/i, /フェイスブック/], tokens: ["facebook", "meta"], official: ["facebook.com", "meta.com", "fb.com"] },
  { id: "rakuten", name: "Rakuten (楽天)", words: [/楽天/, /\brakuten\b/i], tokens: ["rakuten"], official: ["rakuten.co.jp", "rakuten.com", "rakuten-card.co.jp", "rakuten-bank.co.jp"] },
  { id: "sagawa", name: "Sagawa (佐川急便)", words: [/佐川/, /\bsagawa\b/i], tokens: ["sagawa", "sagawaexp"], official: ["sagawa-exp.co.jp"] },
  { id: "yamato", name: "Yamato (ヤマト運輸)", words: [/ヤマト/, /クロネコ/, /\byamato\b/i], tokens: ["yamato", "kuronekoyamato", "kuroneko"], official: ["kuronekoyamato.co.jp", "yamato-hd.co.jp"] },
  { id: "japanpost", name: "Japan Post (日本郵便・ゆうちょ)", words: [/日本郵便/, /郵便局/, /ゆうちょ/, /\bjapan ?post\b/i], tokens: ["japanpost", "jppost", "yucho", "jpbank", "yuubin"], official: ["japanpost.jp", "jp-bank.japanpost.jp", "post.japanpost.jp"] },
  { id: "smbc", name: "SMBC (三井住友)", words: [/三井住友/, /\bSMBC\b/i, /Vpass/i], tokens: ["smbc", "vpass", "smbccard"], official: ["smbc.co.jp", "smbc-card.com"] },
  { id: "mufg", name: "MUFG (三菱UFJ)", words: [/三菱\s?UFJ/i, /\bMUFG\b/i], tokens: ["mufg"], official: ["mufg.jp", "bk.mufg.jp"] },
  { id: "mizuho", name: "Mizuho (みずほ)", words: [/みずほ/, /\bmizuho\b/i], tokens: ["mizuho"], official: ["mizuhobank.co.jp", "mizuho-fg.co.jp"] },
  { id: "aeon", name: "AEON (イオン)", words: [/イオン/, /\baeon\b/i], tokens: ["aeon"], official: ["aeon.co.jp", "aeon.com"] },
  { id: "docomo", name: "NTT docomo", words: [/ドコモ/, /\bdocomo\b/i], tokens: ["docomo"], official: ["docomo.ne.jp", "nttdocomo.co.jp"] },
  { id: "softbank", name: "SoftBank", words: [/ソフトバンク/, /\bsoftbank\b/i], tokens: ["softbank"], official: ["softbank.jp", "softbank.co.jp"] },
  { id: "au", name: "au / KDDI", words: [/\bKDDI\b/i, /\bau\s?ID\b/i], tokens: ["kddi"], official: ["au.com", "kddi.com"] },
  { id: "mercari", name: "Mercari (メルカリ)", words: [/メルカリ/, /\bmercari\b/i], tokens: ["mercari"], official: ["mercari.com", "mercari.jp"] },
  { id: "paypay", name: "PayPay", words: [/PayPay/i, /ペイペイ/], tokens: ["paypay"], official: ["paypay.ne.jp", "paypay-bank.co.jp", "paypay-card.co.jp"] },
  { id: "nta", name: "National Tax Agency (国税庁)", words: [/国税庁/, /税務署/], tokens: ["nta", "kokuzei"], official: ["nta.go.jp"] },
  { id: "ekinet", name: "えきねっと (JR East)", words: [/えきねっと/], tokens: ["ekinet", "eki-net"], official: ["eki-net.com", "jreast.co.jp"] },
  { id: "etc", name: "ETC利用照会", words: [/ETC/], tokens: ["etc", "etcmeisai"], official: ["etc-meisai.jp"] },
  { id: "line", name: "LINE", words: [/\bLINE\b/], tokens: ["line"], official: ["line.me", "line.naver.jp", "linecorp.com", "lycorp.co.jp"] },
];

// ---------------------------------------------------------------------------
// Text signals. Each rule: id, weight, patterns. Japanese has no word breaks, so its
// patterns are plain substrings; English uses word boundaries.
// ---------------------------------------------------------------------------
export const TEXT_RULES = [
  {
    id: "urgency", weight: 2,
    patterns: [
      /\burgent(ly)?\b/i, /\bimmediate(ly)?\b/i, /\bact now\b/i, /\bright away\b/i, /\bas soon as possible\b/i, /\basap\b/i,
      /\bwithin \d+ ?(hours?|hrs?|minutes?|mins?|days?)\b/i, /\b(final|last) (notice|warning|reminder)\b/i,
      /\b(will be|has been|have been|is) (suspended|locked|closed|terminated|disabled|restricted|blocked|frozen)\b/i,
      /\btoday only\b/i, /\bexpires? (today|tonight|soon)\b/i, /\bbefore (midnight|it'?s too late)\b/i, /\bdeadline\b/i,
      /至急/, /緊急/, /本日中/, /今日中/, /\d+\s?時間以内/, /直ちに/, /ただちに/, /すぐに/, /早急/,
      /(停止|凍結|利用制限|ロック|無効)(され|し|と|に|を|いた)/, /最終(通知|警告|案内)/, /期限(切れ|まで|内)/,
    ],
  },
  {
    id: "payment", weight: 4,
    patterns: [
      /\bgift ?cards?\b/i, /\b(itunes|apple|google play|amazon|steam|ebay) (gift )?cards?\b/i, /\bprepaid cards?\b/i,
      /\bbitcoin\b/i, /\bBTC\b/, /\bUSDT\b/i, /\btether\b/i, /\bcrypto(currency)?\b/i, /\bethereum\b/i, /\bcrypto ?wallet\b/i,
      /\bwire (transfer|the money|money)\b/i, /\bwestern union\b/i, /\bmoneygram\b/i, /\bzelle\b/i, /\bcash app\b/i, /\bbitcoin atm\b/i,
      /\b(scratch|read me) the (code|numbers?)\b/i, /\bsend (me )?(the )?(card )?(codes?|pins?) on the back\b/i,
      /ギフト\s?(カード|券|コード)/, /プリペイド\s?カード/, /電子マネー/, /ウェブマネー/, /Google\s?Play\s?(カード|ギフト)/i, /iTunes\s?カード/i,
      /ビットコイン/, /暗号資産/, /仮想通貨/, /USDT/, /コンビニで(購入|支払|払)/, /カード裏面の番号/,
    ],
  },
  {
    id: "credential", weight: 4,
    patterns: [
      /\bpasswords?\b/i, /\bpass ?codes?\b/i, /\bPIN( code| number)?\b/, /\bverification codes?\b/i, /\bone[- ]time (pass)?codes?\b/i,
      /\bOTP\b/i, /\b(2FA|MFA) codes?\b/i, /\bsecurity codes?\b/i, /\bCVV\b/i, /\bcard (number|details)\b/i, /\blog ?in (details|information|credentials)\b/i,
      /\bsocial security( number)?\b/i, /\bSSN\b/, /\bbank (account )?(details|login)\b/i, /\b(6|six)[- ]digit code\b/i, /\bseed phrase\b/i, /\brecovery phrase\b/i,
      /パスワード/, /暗証番号/, /認証(コード|番号)/, /確認(コード|番号)/, /ワンタイム/, /セキュリティ\s?コード/, /カード番号/, /ログイン(情報|ID)/,
      /マイナンバー/, /口座番号/, /有効期限/,
    ],
  },
  {
    id: "prize", weight: 2,
    patterns: [
      /\bcongratulations\b/i, /\byou('ve| have)? (won|been selected)\b/i, /\bwinner\b/i, /\bprize\b/i, /\blottery\b/i, /\bjackpot\b/i,
      /\bfree (iphone|gift|money|reward)\b/i, /\bguaranteed (returns?|profits?|income)\b/i, /\bdouble your (money|investment)\b/i,
      /\b\d{2,4} ?% (returns?|profit|per (week|month|day))\b/i, /\brisk[- ]free\b/i, /\bunclaimed (refund|funds|package)\b/i, /\btax refund\b/i, /\binheritance\b/i,
      /\bearn \$?\d[\d,]* (a|per) (day|week)\b/i,
      /当選/, /当たり/, /おめでとうございます/, /賞金/, /無料プレゼント/, /必ず(儲|稼)/, /元本保証/, /高配当/, /高収入/, /還付金/, /返金(手続|の手続|対象)/,
      /日給\s?\d/, /簡単に稼/, /副業/, /利回り/,
    ],
  },
  {
    id: "threat", weight: 2,
    patterns: [
      /\barrest(ed)?\b/i, /\blegal action\b/i, /\blaw ?suit\b/i, /\bwarrant\b/i, /\bpolice\b/i, /\bpenalt(y|ies)\b/i, /\b(late|pay (a |the )?)\s?fines?\b/i, /\bdeport/i,
      /\bunpaid (toll|tax|bill|fee)s?\b/i, /\boverdue\b/i,
      /逮捕/, /法的(措置|手続)/, /訴訟/, /差し?押さえ/, /差押/, /未納/, /延滞/, /滞納/, /罰金/, /強制執行/,
    ],
  },
  {
    id: "secrecy", weight: 2,
    patterns: [
      /\b(don'?t|do not) tell (anyone|anybody|your)\b/i, /\bkeep (this|it) (confidential|between us|secret|quiet)\b/i, /\bcan'?t talk (now|right now)\b/i, /\bin a meeting\b/i,
      /誰にも(言わ|話さ|相談しな)/, /内密/, /内緒/, /秘密に/,
    ],
  },
  {
    id: "channel", weight: 2,
    patterns: [
      /\b(whatsapp|telegram|signal|line|wechat)\b.{0,30}\b(me|us|add|contact|message|chat)\b/i, /\b(add|contact|message) (me|us) on (whatsapp|telegram|line|signal)\b/i,
      /\bnew (phone )?number\b/i, /\blost my phone\b/i, /\bhi (mum|mom|dad)\b/i,
      /LINE(を|で)?(追加|登録|友だち|友達)/i, /(友だち|友達)追加/, /新しい番号/, /電話番号(が|を)変わ/, /スマホ(を|が)(壊|なくし|無くし)/,
    ],
  },
  {
    id: "remote", weight: 3,
    patterns: [
      /\b(anydesk|teamviewer|quick ?support|remote access|remote desktop)\b/i, /\binstall (this|the) app\b/i, /\bcall (this number|us now|the number below)\b/i,
      /\bvirus (detected|found)\b/i, /\byour (computer|device) (is|has been) (infected|hacked)\b/i,
      /遠隔(操作|サポート)/, /ウイルス(が|に)(検出|感染)/, /アプリを(インストール|入れて)/, /サポート(窓口|センター)に(電話|連絡)/,
    ],
  },
];

// Phrases that suggest the message is *warning* about a code, not asking for it.
const SAFE_CODE_CONTEXT = [
  /\b(never|don'?t|do not|we will never|we'll never|won'?t ever|will never)\b[^.!?\n]{0,40}\b(share|give|tell|ask)/i,
  /(誰にも|絶対に|決して)[^。\n]{0,20}(教え|伝え|共有)(ない|ないで|ません)/, /(お伺いする|お聞きする|求める)ことは(ありません|ございません)/,
  /(教え|伝え)ないで/,
];
// Verbs that turn a mention of a code/password into a request for it.
const REQUEST_VERBS = [
  /\b(enter|confirm|verify|provide|send|reply with|update|submit|share|give|tell|read|forward|type|re-?enter|input)\b/i,
  /入力/, /送(って|信|付)/, /教えて/, /ご確認/, /確認(して|を|の上)/, /更新/, /登録/, /返信/, /お知らせください/, /伝えて/,
];

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------
export const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "t.ly", "shorturl.at", "x.gd",
  "reurl.cc", "rb.gy", "tiny.cc", "bl.ink", "s.id", "v.gd", "qr.ae", "lnkd.in", "shorturl.asia", "00m.in", "u0u.jp", "urx.blue",
]);
// TLDs that are cheap and disproportionately used for throwaway phishing sites (weak signal only).
export const RISKY_TLDS = new Set(["top", "xyz", "icu", "buzz", "monster", "cyou", "sbs", "cfd", "click", "rest", "shop", "bond", "vip", "work", "support", "live", "online", "site", "fun", "quest", "lol", "cn", "tk", "ml", "ga", "cf", "gq"]);
const MULTI_SUFFIXES = new Set([
  "co.jp", "ne.jp", "or.jp", "go.jp", "ac.jp", "ad.jp", "ed.jp", "gr.jp", "lg.jp",
  "co.uk", "org.uk", "ac.uk", "gov.uk", "com.au", "net.au", "org.au", "co.nz", "com.br", "com.cn", "com.tw", "co.kr", "co.in", "com.sg", "com.hk",
]);

export function registrableDomain(host) {
  const h = host.replace(/\.$/, "").toLowerCase();
  const labels = h.split(".");
  if (labels.length <= 2) return h;
  const last2 = labels.slice(-2).join(".");
  if (MULTI_SUFFIXES.has(last2)) return labels.slice(-3).join(".");
  return last2;
}

// RFC 3492 punycode decoder (for showing what an xn-- domain really displays as).
export function punycodeDecode(input) {
  const base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700;
  let n = 128, i = 0, bias = 72;
  const output = [];
  const basic = input.lastIndexOf("-");
  for (let j = 0; j < Math.max(basic, 0); j++) output.push(input.charCodeAt(j));
  const adapt = (delta, numPoints, first) => {
    delta = first ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    let k = 0;
    while (delta > ((base - tMin) * tMax) >> 1) { delta = Math.floor(delta / (base - tMin)); k += base; }
    return k + Math.floor(((base - tMin + 1) * delta) / (delta + skew));
  };
  const digit = (c) => (c - 48 < 10 ? c - 22 : c - 65 < 26 ? c - 65 : c - 97 < 26 ? c - 97 : base);
  for (let idx = basic > 0 ? basic + 1 : 0; idx < input.length;) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (idx >= input.length) throw new Error("bad punycode");
      const d = digit(input.charCodeAt(idx++));
      if (d >= base) throw new Error("bad punycode");
      i += d * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (d < t) break;
      w *= base - t;
    }
    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i %= output.length + 1;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
}

export function hostToUnicode(host) {
  return host.split(".").map((l) => {
    if (!l.startsWith("xn--")) return l;
    try { return punycodeDecode(l.slice(4)); } catch { return l; }
  }).join(".");
}

// Characters that look like Latin letters (Cyrillic, Greek, fullwidth, digits).
const CONFUSABLE = {
  "а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i", "ј": "j", "ѕ": "s", "ԁ": "d", "һ": "h", "ӏ": "l", "ո": "n", "ս": "u",
  "α": "a", "ο": "o", "ν": "v", "ι": "i", "ρ": "p", "κ": "k", "τ": "t", "ɡ": "g", "ɩ": "i", "ı": "i",
  "0": "o", "1": "l", "3": "e", "5": "s", "4": "a", "7": "t", "!": "i", "|": "l",
};
export function skeleton(s) {
  let out = "";
  for (const ch of s.normalize("NFKC").toLowerCase()) out += CONFUSABLE[ch] ?? ch;
  return out.replace(/rn/g, "m").replace(/vv/g, "w").replace(/i/g, "l");
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

const TLD_FOR_BARE = "com|net|org|jp|info|biz|io|co|me|us|uk|top|xyz|icu|buzz|shop|club|online|site|live|vip|cn|ru|tk|cc|ly|gd|at|link|app|click|support|work|bond|cfd|sbs|cyou|monster|rest|fun|quest|lol";
const URL_RE = new RegExp(
  String.raw`(?:h(?:tt|xx)ps?:\/\/|www\.)[^\s<>"'()\[\]（）「」『』、。，！？]+` +
  String.raw`|(?<![@\w.-])(?:[a-z0-9а-я](?:[a-z0-9а-я-]{0,61}[a-z0-9а-я])?\.)+(?:${TLD_FOR_BARE})(?![a-z0-9-])(?:[/?#][^\s<>"'()（）「」、。]*)?`,
  "giu",
);
const ANCHOR_RE = /<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
const MD_LINK_RE = /\[([^\]\n]{1,200})\]\((\S+?)\)/g;
const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/;

function trimUrl(raw) {
  return raw.replace(/[.,;:!?'"）)\]>]+$/u, "");
}

export function defang(url) {
  return url.replace(/^http/i, "hxxp").replace(/\./g, "[.]");
}

function parseHost(raw) {
  let s = raw.trim().replace(/^hxxp/i, "http");
  if (!/^https?:\/\//i.test(s)) s = "http://" + s;
  try {
    const u = new URL(s);
    return { url: u, host: u.hostname.toLowerCase() };
  } catch {
    return null;
  }
}

function brandForToken(token) {
  const sk = skeleton(token);
  for (const b of BRANDS) {
    for (const t of b.tokens) {
      const ts = skeleton(t);
      if (sk === ts) return { brand: b, exact: token.toLowerCase() === t };
      if (ts.length >= 6 && editDistance(sk, ts) === 1) return { brand: b, exact: false, near: true };
    }
  }
  return null;
}

// Analyze a single link. `display` is the visible text when the link came from HTML/Markdown.
export function analyzeLink(raw, display = null) {
  const findings = [];
  const parsed = parseHost(raw);
  if (!parsed) return { raw, display, host: null, findings: [{ id: "unparseable", weight: 1 }] };
  const { url, host } = parsed;
  const unicodeHost = hostToUnicode(host);
  const reg = registrableDomain(host);
  const officialFor = BRANDS.filter((b) => b.official.some((d) => reg === d || host === d || host.endsWith("." + d)));

  if (url.username || /^[^/]*@/.test(raw.replace(/^h(?:tt|xx)ps?:\/\//i, ""))) findings.push({ id: "userinfo", weight: 5, detail: host });
  if (IPV4_RE.test(host) || host.startsWith("[")) {
    const rawHost = raw.replace(/^h(?:tt|xx)ps?:\/\//i, "").split(/[/?#]/)[0].split("@").pop();
    findings.push({ id: "ip", weight: 4, detail: rawHost !== host ? `${rawHost} → ${host}` : host });
  }
  if (host.split(".").some((l) => l.startsWith("xn--"))) {
    findings.push({ id: "punycode", weight: 4, detail: `${host} → ${unicodeHost}` });
  }
  if (/[^\x00-\x7f]/.test(unicodeHost) && /[a-z]/.test(unicodeHost) && !/[぀-ヿ一-鿿]/.test(unicodeHost)) {
    findings.push({ id: "mixedscript", weight: 4, detail: unicodeHost });
  }
  if (SHORTENERS.has(reg) || SHORTENERS.has(host)) findings.push({ id: "shortener", weight: 2, detail: host });
  const tld = host.split(".").pop();
  if (RISKY_TLDS.has(tld) && !officialFor.length) findings.push({ id: "tld", weight: 1, detail: "." + tld });
  if (/^h(tt|xx)p:\/\//i.test(raw)) findings.push({ id: "http", weight: 1, detail: "http://" });

  // Brand look-alikes: compare each label/token of the hostname to the brands we know.
  if (!officialFor.length && !IPV4_RE.test(host)) {
    const uReg = hostToUnicode(reg);
    const regLabel = uReg.split(".")[0];
    const regTokens = regLabel.split("-");
    const subLabels = unicodeHost.slice(0, Math.max(0, unicodeHost.length - uReg.length)).split(".").filter(Boolean);
    const seen = new Set();
    // Tokens inside the registrable domain itself (e.g. amaz0n-verify.top, paypa1.com)
    for (const tok of [...regTokens, regLabel.replace(/-/g, "")]) {
      const hit = brandForToken(tok);
      if (!hit || seen.has(hit.brand.id)) continue;
      seen.add(hit.brand.id);
      findings.push({ id: hit.exact ? "brandindomain" : "lookalike", weight: hit.exact ? 4 : 5, brand: hit.brand.name, detail: uReg !== reg ? `${uReg} = ${reg}` : reg });
    }
    // Brand names placed in subdomains (e.g. amazon.co.jp.account-check.top)
    for (const lab of subLabels) {
      for (const tok of lab.split("-")) {
        const hit = brandForToken(tok);
        if (!hit || seen.has(hit.brand.id)) continue;
        seen.add(hit.brand.id);
        findings.push({ id: "brandsubdomain", weight: 5, brand: hit.brand.name, detail: `${host} (real site: ${reg})` });
      }
    }
    // Official domain glued in front of another domain: e.g. sagawa-exp.co.jp.delivery-check.top
    for (const b of BRANDS) {
      if (seen.has(b.id)) continue;
      if (b.official.some((d) => host.startsWith(d + ".") || host.includes("." + d + "."))) {
        seen.add(b.id);
        findings.push({ id: "brandsubdomain", weight: 5, brand: b.name, detail: `${host} (real site: ${reg})` });
      }
    }
  }

  // Display text that shows a different domain than where the link goes.
  if (display) {
    const m = display.match(new RegExp(URL_RE.source, "iu"));
    if (m) {
      const shown = parseHost(trimUrl(m[0]));
      if (shown && registrableDomain(shown.host) !== reg) findings.push({ id: "mismatch", weight: 4, detail: `${registrableDomain(shown.host)} ≠ ${reg}` });
    }
  }

  return { raw, display, host, unicodeHost, registrable: reg, official: officialFor.map((b) => b.name), findings };
}

export function extractLinks(text) {
  const links = [];
  const covered = [];
  const cover = (s, e) => covered.push([s, e]);
  const isCovered = (s) => covered.some(([a, b]) => s >= a && s < b);
  let m;
  ANCHOR_RE.lastIndex = 0;
  while ((m = ANCHOR_RE.exec(text))) {
    links.push({ raw: m[1], display: m[2].replace(/<[^>]+>/g, "").trim(), start: m.index, end: m.index + m[0].length });
    cover(m.index, m.index + m[0].length);
  }
  MD_LINK_RE.lastIndex = 0;
  while ((m = MD_LINK_RE.exec(text))) {
    if (isCovered(m.index)) continue;
    links.push({ raw: m[2], display: m[1], start: m.index, end: m.index + m[0].length });
    cover(m.index, m.index + m[0].length);
  }
  URL_RE.lastIndex = 0;
  while ((m = URL_RE.exec(text))) {
    if (isCovered(m.index)) continue;
    const raw = trimUrl(m[0]);
    links.push({ raw, display: null, start: m.index, end: m.index + raw.length });
  }
  return links.sort((a, b) => a.start - b.start);
}

function findMatches(text, patterns) {
  const out = [];
  for (const p of patterns) {
    const re = new RegExp(p.source, p.flags.includes("g") ? p.flags : p.flags + "g");
    let m;
    while ((m = re.exec(text))) {
      if (!m[0]) { re.lastIndex++; continue; }
      out.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    }
  }
  // Drop overlaps, keep the longest.
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  return out.filter((x, i) => !out.slice(0, i).some((y) => x.start < y.end && x.end > y.start));
}

function windowAround(text, start, end, size = 60) {
  return text.slice(Math.max(0, start - size), Math.min(text.length, end + size));
}

export function detectLanguage(text) {
  const ja = (text.match(/[぀-ヿ一-鿿]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return ja > en / 4 ? "ja" : "en";
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------
export function analyze(text) {
  const input = String(text ?? "").slice(0, 20000);
  const links = extractLinks(input).map((l) => ({ ...l, ...analyzeLink(l.raw, l.display) }));
  // Text without the URLs, so a domain like "verify-account.top" does not count as "verify".
  let plain = input;
  for (const l of links) plain = plain.slice(0, l.start) + " ".repeat(l.end - l.start) + plain.slice(l.end);

  const signals = [];
  for (const rule of TEXT_RULES) {
    let matches = findMatches(plain, rule.patterns);
    if (!matches.length) continue;
    let weight = rule.weight;
    let note = null;
    if (rule.id === "credential") {
      const requested = matches.filter((mm) => {
        const w = windowAround(plain, mm.start, mm.end);
        return REQUEST_VERBS.some((v) => v.test(w)) && !SAFE_CODE_CONTEXT.some((s) => s.test(w));
      });
      const warned = matches.some((mm) => SAFE_CODE_CONTEXT.some((s) => s.test(windowAround(plain, mm.start, mm.end, 80))));
      if (!requested.length) {
        if (warned) { signals.push({ id: "codewarning", weight: 0, matches, positive: true }); continue; }
        weight = 1; note = "mention";
      } else matches = requested;
    }
    signals.push({ id: rule.id, weight, matches, note });
  }

  // Brands named in the text.
  const brandHits = [];
  for (const b of BRANDS) {
    const matches = findMatches(plain, b.words);
    if (matches.length) brandHits.push({ brand: b, matches });
  }
  if (brandHits.length) {
    signals.push({ id: "brand", weight: 1, matches: brandHits.flatMap((h) => h.matches), brands: brandHits.map((h) => h.brand.name) });
  }

  // A brand is named, but a link goes somewhere that brand does not use.
  const offBrand = [];
  for (const h of brandHits) {
    for (const l of links) {
      if (!l.host) continue;
      const isOfficial = h.brand.official.some((d) => l.registrable === d || l.host === d || l.host.endsWith("." + d));
      if (!isOfficial) offBrand.push({ brand: h.brand.name, host: l.host });
    }
  }
  if (offBrand.length && links.length) {
    signals.push({ id: "offbrandlink", weight: 3, matches: [], pairs: offBrand.slice(0, 4) });
  }
  const officialLinks = links.filter((l) => l.official && l.official.length && !l.findings.some((f) => f.weight >= 4));
  if (officialLinks.length) signals.push({ id: "officiallink", weight: 0, positive: true, matches: [], hosts: officialLinks.map((l) => l.registrable) });

  // Score: each text category counts once; each link contributes its strongest finding plus 1 per extra finding (capped).
  let score = signals.reduce((s, x) => s + x.weight, 0);
  for (const l of links) {
    const ws = l.findings.map((f) => f.weight).sort((a, b) => b - a);
    if (ws.length) score += ws[0] + Math.min(2, ws.length - 1);
  }
  // Combination bonus: pressure + an ask for money or secrets is the classic shape of a scam.
  const has = (id) => signals.some((s) => s.id === id && s.weight > 0);
  const asks = has("payment") || (has("credential") && signals.find((s) => s.id === "credential").weight >= 4);
  const pressure = has("urgency") || has("threat") || has("secrecy");
  if (asks && pressure) score += 2;

  let level;
  if (score === 0) level = "none";
  else if (score <= 3) level = "low";
  else if (score <= 7) level = "medium";
  else level = "high";

  const strongCount = signals.filter((s) => s.weight >= 4).length + links.filter((l) => l.findings.some((f) => f.weight >= 4)).length;
  return {
    language: detectLanguage(input),
    level,
    score,
    strongCount,
    signals,
    links,
    brands: brandHits.map((h) => h.brand.name),
    advice: adviceFor(signals, links),
  };
}

export function adviceFor(signals, links) {
  const ids = new Set(signals.filter((s) => s.weight > 0).map((s) => s.id));
  const steps = ["noreply"];
  if (links.length) steps.push("nolink");
  if (ids.has("brand") || ids.has("offbrandlink") || links.some((l) => l.findings.some((f) => ["lookalike", "brandsubdomain", "brandindomain"].includes(f.id)))) steps.push("official");
  if (ids.has("credential")) steps.push("nocode");
  if (ids.has("payment")) steps.push("nopay");
  if (ids.has("channel") || ids.has("secrecy")) steps.push("verifyperson");
  if (ids.has("remote")) steps.push("noremote");
  if (ids.has("prize")) steps.push("toogood");
  steps.push("talk", "report");
  return steps;
}
