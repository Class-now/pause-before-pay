// Synthetic sample messages. Every sender, name, number and domain here is invented for testing.
// The scam domains are made up to show the tricks; do not visit them.
// `expect` is what the test suite checks:
//   scam samples:  level must be "medium" or "high", and listed signals / link findings must be detected
//   safe samples:  level must be "none" or "low"
//   hard samples:  known weak spots; the suite records the result but does not require a pass
export const SAMPLES = [
  // ---------------- English scams ----------------
  {
    id: "en-parcel-fee", lang: "en", kind: "scam",
    title: { en: "Parcel fee SMS (look-alike domain)", ja: "配送料のSMS（なりすましドメイン）" },
    text: "USPS: Your package is on hold due to an unpaid $1.99 shipping fee. Pay within 24 hours or it will be returned: https://usps-redelivery-help.top/track?id=US9514",
    expect: { signals: ["urgency", "brand", "offbrandlink"], links: ["brandindomain", "tld"] },
  },
  {
    id: "en-bank-otp", lang: "en", kind: "scam",
    title: { en: "Bank 'account locked' — asks for your code", ja: "銀行の「口座ロック」— コードを要求" },
    text: "Chase Alert: Unusual sign-in detected. Your account has been locked. To restore access, reply with the 6-digit verification code we just sent you and confirm your card number at chase-secure-login.com",
    expect: { signals: ["urgency", "credential", "brand", "offbrandlink"], links: ["brandindomain"] },
  },
  {
    id: "en-boss-giftcards", lang: "en", kind: "scam",
    title: { en: "'Boss' asks for gift cards", ja: "「上司」がギフトカードを頼む" },
    text: "Hi, are you free? I'm in a meeting and can't talk right now. I need you to buy 5 Apple gift cards ($100 each) for a client today. Scratch the back and send me photos of the codes. Please keep this between us for now.",
    expect: { signals: ["payment", "secrecy", "urgency"], links: [] },
  },
  {
    id: "en-crypto-invest", lang: "en", kind: "scam",
    title: { en: "Crypto 'investment mentor' DM", ja: "暗号資産の「投資の先生」DM" },
    text: "Hello friend! I made 300% returns in 2 weeks with my mentor's crypto trading group. Guaranteed profits, totally risk-free. Add me on WhatsApp and send just 500 USDT to start: wa.me/0000000000",
    expect: { signals: ["payment", "prize", "channel"], links: [] },
  },
  {
    id: "en-prize-ip", lang: "en", kind: "scam",
    title: { en: "Prize win with an IP-address link", ja: "当選通知（IPアドレスのリンク）" },
    text: "Congratulations! You have been selected as this month's winner of a free iPhone 17. Claim your prize before midnight: http://203.0.113.47/claim?u=8812",
    expect: { signals: ["prize", "urgency"], links: ["ip", "http"] },
  },
  {
    id: "en-paypal-html", lang: "en", kind: "scam",
    title: { en: "Email where link text ≠ real destination", ja: "表示と行き先が違うリンクのメール" },
    text: 'From: PayPal Service <service@paypal-billing-center.com>\nSubject: Action required: your account is limited\n\nDear customer, we noticed suspicious activity. Your account will be suspended unless you verify your information immediately.\n<a href="https://secure-paypa1-review.xyz/login">https://www.paypal.com/myaccount</a>',
    expect: { signals: ["urgency", "brand", "offbrandlink"], links: ["mismatch", "lookalike"] },
  },
  {
    id: "en-homoglyph", lang: "en", kind: "scam",
    title: { en: "Look-alike letters (Cyrillic 'а')", ja: "似た文字（キリル文字の「а」）" },
    text: "Amazon: A payment of $849.00 for MacBook Pro was placed on your account. If this wasn't you, cancel now: https://аmazon.com/cancel-order",
    expect: { signals: ["brand"], links: ["punycode", "mixedscript", "lookalike"] },
  },
  {
    id: "en-tech-support", lang: "en", kind: "scam",
    title: { en: "Fake tech support", ja: "偽のサポート" },
    text: "Microsoft Security Warning: Virus detected on your computer! Your device has been infected. Call the number below immediately and install AnyDesk so a technician can fix it. Do not shut down your PC.",
    expect: { signals: ["remote", "urgency", "brand"], links: [] },
  },
  {
    id: "en-toll-shortener", lang: "en", kind: "scam",
    title: { en: "Unpaid toll with a short link", ja: "未払いの通行料（短縮URL）" },
    text: "FINAL NOTICE: You have an unpaid toll balance of $6.80. Pay now to avoid a late fine and legal action: bit.ly/3xToll-Pay",
    expect: { signals: ["urgency", "threat"], links: ["shortener"] },
  },
  {
    id: "en-hi-mum", lang: "en", kind: "scam",
    title: { en: "'Hi Mum, new number' text", ja: "「ママ、番号変わった」メッセージ" },
    text: "Hi Mum, I dropped my phone in the sink, this is my new number. Can you do me a favour? I need to pay a bill urgently and my banking app is locked. Can you wire the money and I'll pay you back tomorrow?",
    expect: { signals: ["channel", "payment", "urgency"], links: [] },
  },
  {
    id: "en-userinfo", lang: "en", kind: "scam",
    title: { en: "'@' trick in the address", ja: "アドレス中の「@」のトリック" },
    text: "Netflix: your payment failed and your membership is on hold. Update your card details here: https://www.netflix.com@billing-update.example-renew.click/account",
    expect: { signals: ["credential", "brand", "offbrandlink"], links: ["userinfo"] },
  },

  // ---------------- Japanese scams ----------------
  {
    id: "ja-sagawa", lang: "ja", kind: "scam",
    title: { en: "Delivery 'missed you' SMS (Japanese)", ja: "不在通知SMS" },
    text: "【佐川急便】お荷物をお届けに上がりましたが不在の為持ち帰りました。下記よりご確認ください。https://sagawa-exp.co.jp.delivery-check.top/jp",
    expect: { signals: ["brand", "offbrandlink"], links: ["brandsubdomain", "tld"] },
  },
  {
    id: "ja-amazon-suspend", lang: "ja", kind: "scam",
    title: { en: "Amazon 'account suspended' (Japanese)", ja: "Amazonアカウント停止" },
    text: "Amazonプライム会員のお支払い方法に問題があります。24時間以内に情報を更新しない場合、アカウントは停止されます。ログイン情報とカード番号を入力して更新してください。\nhttps://amazon.co.jp.account-update-center.xyz/signin",
    expect: { signals: ["urgency", "credential", "brand", "offbrandlink"], links: ["brandsubdomain", "tld"] },
  },
  {
    id: "ja-tax-ip", lang: "ja", kind: "scam",
    title: { en: "'National Tax Agency' unpaid tax (Japanese)", ja: "国税庁を名乗る未納通知" },
    text: "【国税庁】未納の税金があります。本日中にお支払いがない場合、差し押さえ等の法的措置を行います。電子マネー（ギフトカード）での納付も可能です。 http://198.51.100.23/nta",
    expect: { signals: ["urgency", "threat", "payment", "brand"], links: ["ip"] },
  },
  {
    id: "ja-card-punycode", lang: "ja", kind: "scam",
    title: { en: "Card company with an xn-- domain (Japanese)", ja: "カード会社を名乗るxn--ドメイン" },
    text: "【三井住友カード】不正利用の可能性があるため、カードのご利用を一時停止しました。ご本人確認のため、暗証番号とワンタイムパスワードを入力してください。 https://xn--smb-card-hch.com/vpass",
    expect: { signals: ["urgency", "credential", "brand", "offbrandlink"], links: ["punycode"] },
  },
  {
    id: "ja-line-sidejob", lang: "ja", kind: "scam",
    title: { en: "'Easy side job' via LINE (Japanese)", ja: "LINEに誘導する副業" },
    text: "スマホだけで簡単に稼げる副業のご案内です！日給3万円以上、元本保証の投資案件もあります。詳しくはLINEで友だち追加してください。 lin.ee/xxxxABCD",
    expect: { signals: ["prize", "channel"], links: [] },
  },
  {
    id: "ja-refund-atm", lang: "ja", kind: "scam",
    title: { en: "Refund call that sends you to an ATM (Japanese)", ja: "還付金でATMへ誘導" },
    text: "市役所保険課です。医療費の還付金が3万円あります。手続きの期限は本日までです。お近くのATMで手続きできますので、キャッシュカードと口座番号をご用意のうえ、こちらの番号にお電話ください。誰にも相談しないでください、すぐに終わります。",
    expect: { signals: ["prize", "urgency", "secrecy"], links: [] },
  },
  {
    id: "ja-mercari-shortener", lang: "ja", kind: "scam",
    title: { en: "Marketplace 'payment problem' with a short link (Japanese)", ja: "フリマの支払いトラブル（短縮URL）" },
    text: "メルカリ事務局です。お客様の売上金の受け取りに問題が発生しました。至急、以下のリンクから口座情報を確認してください。 https://tinyurl.com/merc-fix-2026",
    expect: { signals: ["urgency", "brand", "offbrandlink"], links: ["shortener"] },
  },

  // ---------------- Safe (legitimate-looking) ----------------
  {
    id: "en-safe-friend", lang: "en", kind: "safe",
    title: { en: "Friend about dinner", ja: "友だちから夕食の連絡" },
    text: "Hey! Are we still on for dinner Friday at 7? I booked a table at the ramen place near the station. Let me know if you want to bring Sam too.",
    expect: {},
  },
  {
    id: "en-safe-otp", lang: "en", kind: "safe",
    title: { en: "Real one-time code text (warns you not to share it)", ja: "本物のワンタイムコード（共有しないよう注意）" },
    text: "Your sign-in code is 482913. It expires in 10 minutes. We will never ask you for this code — don't share it with anyone.",
    expect: {},
  },
  {
    id: "en-safe-order", lang: "en", kind: "safe",
    title: { en: "Order shipped (official domain, no requests)", ja: "発送のお知らせ（公式ドメイン、要求なし）" },
    text: "Your Amazon order #112-0000000-0000000 has shipped and will arrive Thursday. Track it in the Amazon app or at https://www.amazon.com/your-orders",
    expect: {},
  },
  {
    id: "en-safe-school", lang: "en", kind: "safe",
    title: { en: "School notice", ja: "学校からのお知らせ" },
    text: "Reminder from Maple Street Library: the book club meets Tuesday at 4pm in Room 2. Snacks provided. Reply STOP to opt out of reminders.",
    expect: {},
  },
  {
    id: "ja-safe-friend", lang: "ja", kind: "safe",
    title: { en: "Friend about a class (Japanese)", ja: "友だちから授業の連絡" },
    text: "明日の2限、教室が302に変わったって。レポートの締切は来週の金曜だから焦らなくて大丈夫そう。お昼一緒に食べよう！",
    expect: {},
  },
  {
    id: "ja-safe-dentist", lang: "ja", kind: "safe",
    title: { en: "Dentist appointment reminder (Japanese)", ja: "歯医者の予約リマインダー" },
    text: "さくら歯科クリニックです。11月20日（金）15:00のご予約を承っております。ご都合が悪くなった場合はお電話でご連絡ください。",
    expect: {},
  },
  {
    id: "ja-safe-code", lang: "ja", kind: "safe",
    title: { en: "Real verification code (Japanese)", ja: "本物の認証コード" },
    text: "認証コードは 731546 です。このコードは誰にも教えないでください。当社からコードをお伺いすることはありません。",
    expect: {},
  },

  // ---------------- Hard cases (known weak spots, reported honestly) ----------------
  {
    id: "hard-romance", lang: "en", kind: "hard", truth: "scam",
    title: { en: "Slow-build romance message (scam, few signals)", ja: "時間をかける恋愛詐欺（手がかりが少ない）" },
    text: "It was so lovely talking with you last night. I feel like I have known you for years. I'm working on an oil platform overseas so I can only message at odd hours. Tell me more about your day?",
    expect: {},
  },
  {
    id: "hard-real-bank", lang: "en", kind: "hard", truth: "safe",
    title: { en: "Genuine bank fraud alert (safe, but urgent-sounding)", ja: "本物の銀行の不正検知（安全だが急かす文面）" },
    text: "Chase: Did you attempt a $412.50 purchase at an electronics store? Reply YES or NO. If you don't recognize it, we'll lock your card immediately. We will never ask for your PIN or password by text.",
    expect: {},
  },
  {
    id: "hard-ja-polite", lang: "ja", kind: "hard", truth: "scam",
    title: { en: "Polite Japanese phishing with plain-looking domain", ja: "丁寧で目立たないドメインのフィッシング" },
    text: "いつもご利用ありがとうございます。会員情報の定期確認のお願いです。お手数ですが下記ページよりお手続きをお願いいたします。 https://member-info-check.jp/",
    expect: {},
  },
];
