export const KNOWN_SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
  "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
  "bl.ink", "rb.gy", "clck.ru", "shorturl.asia", "shorten.asia",
  "snip.ly", "v.gd", "x.co", "surl.li", "dub.sh",
]);

export const SUSPICIOUS_TLDS = new Set([
  ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club",
  ".work", ".click", ".loan", ".win", ".bid", ".info", ".buzz",
  ".rest", ".cam", ".icu", ".cyou", ".monster", ".fun",
  ".site", ".online", ".store", ".space", ".digital",
]);

export const KNOWN_SHORTENER_PATTERNS = [
  /bit\.ly\//i, /tinyurl\.com\//i, /t\.co\//i, /ow\.ly\//i,
  /cutt\.ly\//i, /rb\.gy\//i, /short\.gy\//i, /dub\.sh\//i,
];

export const IMPERSONATED_BRANDS: Record<string, string[]> = {
  paypal:    ["paypal.com"],
  amazon:    ["amazon.com", "amazon.in", "amazon.co.uk"],
  google:    ["google.com", "gmail.com", "accounts.google.com"],
  microsoft: ["microsoft.com", "live.com", "outlook.com", "microsoftonline.com", "office.com"],
  apple:     ["apple.com", "icloud.com", "appleid.apple.com"],
  netflix:   ["netflix.com"],
  facebook:  ["facebook.com", "fb.com"],
  instagram: ["instagram.com"],
  whatsapp:  ["whatsapp.com"],
  irs:       ["irs.gov"],
  dhl:       ["dhl.com"],
  fedex:     ["fedex.com"],
  ups:       ["ups.com"],
  sbi:       ["sbi.co.in", "onlinesbi.sbi"],
  hdfc:      ["hdfcbank.com", "hdfc.com"],
  icici:     ["icicibank.com"],
  paytm:     ["paytm.com"],
  gpay:      ["pay.google.com"],
  phonepe:   ["phonepe.com"],
  binance:   ["binance.com"],
  coinbase:  ["coinbase.com"],
};

// Common typosquatting patterns for popular brands
const TYPOSQUAT_PATTERNS: Array<{ pattern: RegExp; brand: string }> = [
  { pattern: /paypa[^l]/, brand: "PayPal" },
  { pattern: /amazom\./, brand: "Amazon" },
  { pattern: /arnazon\./, brand: "Amazon" },
  { pattern: /mircosoft\./, brand: "Microsoft" },
  { pattern: /micros0ft\./, brand: "Microsoft" },
  { pattern: /g00gle\./, brand: "Google" },
  { pattern: /goggle\./, brand: "Google" },
  { pattern: /appl[e]?\.net/, brand: "Apple" },
  { pattern: /netfl1x\./, brand: "Netflix" },
  { pattern: /nflx\./, brand: "Netflix" },
  { pattern: /faceb0ok\./, brand: "Facebook" },
  { pattern: /whatsapp-/, brand: "WhatsApp" },
  { pattern: /instagram-/, brand: "Instagram" },
];

// Payment-themed URL keywords (high-risk)
const PAYMENT_URL_KEYWORDS = [
  "payment", "pay-now", "checkout", "billing", "invoice",
  "wallet", "topup", "recharge", "credit-card", "card-verify",
];

// Phishing path patterns
const CREDENTIAL_KEYWORDS = [
  "login", "signin", "sign-in", "verify", "secure",
  "update-account", "confirm-identity", "account-verify",
  "bank-login", "net-banking",
];

// Fake/free hosting domains often used for phishing
const SUSPICIOUS_HOSTS = new Set([
  "000webhostapp.com", "weebly.com", "wix.com", "sites.google.com",
  "web.app", "firebaseapp.com", "pages.dev", "netlify.app",
  "vercel.app", "glitch.me", "replit.co", "github.io",
]);

function normalizeUrl(url: string): string {
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
}

function emptyResult() {
  return {
    isScam: false,
    score: 0,
    category: "Other",
    risk: "Low",
    confidence: 0.5,
    reasons: ["No strong phishing indicators found in this URL"],
    recommendation: "This URL appears safe, but always verify before sharing personal information.",
    explanation: "No suspicious patterns detected in the URL structure.",
    source: "url_heuristics",
  };
}

export function analyzeUrlHeuristics(url: string) {
  if (!url || typeof url !== "string") return emptyResult();

  const normalized = normalizeUrl(url.trim());
  let parsed: URL;

  try {
    parsed = new URL(normalized);
  } catch {
    return {
      isScam: true,
      score: 60,
      category: "Phishing",
      risk: "Medium",
      confidence: 0.7,
      reasons: ["URL could not be parsed — malformed or deliberately obfuscated structure"],
      recommendation: "Do not visit this URL. Malformed URLs are a common phishing tactic.",
      explanation: "This URL has an invalid or malformed structure, which is a common red flag for phishing links.",
      source: "url_heuristics",
    };
  }

  const host = parsed.hostname.toLowerCase();
  const fullUrlLower = normalized.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  if (!host) return emptyResult();

  let score = 0;
  const reasons: string[] = [];
  let category = "Other";

  // 1. Known URL shorteners
  if (KNOWN_SHORTENERS.has(host)) {
    score += 20;
    reasons.push("URL shortener used — hides the real destination from the victim");
    category = "Phishing";
  }

  // 2. Suspicious TLDs
  for (const tld of SUSPICIOUS_TLDS) {
    if (host.endsWith(tld)) {
      score += 20;
      reasons.push(`Suspicious domain extension (${tld}) — commonly used for disposable phishing sites`);
      category = "Phishing";
      break;
    }
  }

  // 3. Brand impersonation check
  for (const [brand, realDomains] of Object.entries(IMPERSONATED_BRANDS)) {
    if (realDomains.length === 0) continue;
    if (fullUrlLower.includes(brand)) {
      const isReal = realDomains.some((d) => host === d || host.endsWith(`.${d}`));
      if (!isReal) {
        score += 35;
        reasons.push(`Mentions '${brand}' but doesn't use ${brand}'s official domain — likely impersonation`);
        category = "Phishing";
        break;
      }
    }
  }

  // 4. Typosquatting
  for (const { pattern, brand } of TYPOSQUAT_PATTERNS) {
    if (pattern.test(host)) {
      score += 35;
      reasons.push(`Domain appears to be a typosquatted version of '${brand}' — designed to trick users`);
      category = "Phishing";
      break;
    }
  }

  // 5. Raw IP address
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    score += 35;
    reasons.push("URL uses a raw IP address — legitimate services always use domain names");
    category = "Phishing";
  }

  // 6. @ symbol trick
  if (normalized.includes("@")) {
    score += 25;
    reasons.push("URL contains '@' symbol — a technique to disguise the real destination domain");
    category = "Phishing";
  }

  // 7. Excessive subdomains
  const subdomainCount = (host.match(/\./g) || []).length;
  if (subdomainCount >= 4) {
    score += 15;
    reasons.push("Unusually deep subdomain structure — commonly used to bury a fake domain");
  }

  // 8. Hyphens
  const hyphenCount = (host.match(/-/g) || []).length;
  if (hyphenCount >= 3) {
    score += 15;
    reasons.push("Domain contains an unusually high number of hyphens — typical of phishing domains");
  }

  // 9. Digits in domain
  const digitCount = (host.match(/\d/g) || []).length;
  if (digitCount >= 4) {
    score += 10;
    reasons.push("Domain contains many digits — unusual for legitimate websites");
  }

  // 10. Credential harvesting keywords in path
  const matchedCredential = CREDENTIAL_KEYWORDS.filter((kw) => path.includes(kw));
  if (matchedCredential.length >= 2) {
    score += 20;
    reasons.push(`Path contains credential-harvesting keywords: ${matchedCredential.slice(0, 3).join(", ")}`);
    category = "Phishing";
  }

  // 11. Payment keywords in path/domain
  const matchedPayment = PAYMENT_URL_KEYWORDS.filter((kw) => fullUrlLower.includes(kw));
  if (matchedPayment.length >= 2) {
    score += 15;
    reasons.push("URL references payment or billing pages — could be a fake payment portal");
    category = "Phishing";
  }

  // 12. HTTP (no HTTPS)
  if (parsed.protocol === "http:") {
    score += 10;
    reasons.push("Uses insecure HTTP instead of HTTPS — legitimate sites use HTTPS");
  }

  // 13. Punycode / Unicode spoofing
  if (host.startsWith("xn--")) {
    score += 30;
    reasons.push("Domain uses punycode encoding — may be a unicode spoofing attack");
    category = "Phishing";
  }

  // 14. Suspicious free hosting (lower score, context dependent)
  for (const suspHost of SUSPICIOUS_HOSTS) {
    if (host.endsWith(suspHost) && host !== suspHost) {
      score += 15;
      reasons.push(`Hosted on a free/public platform (${suspHost}) — unusual for official services`);
      break;
    }
  }

  // 15. Very long URL
  if (normalized.length > 200) {
    score += 10;
    reasons.push("Unusually long URL — may be designed to hide the true destination");
  }

  score = Math.min(score, 100);

  if (reasons.length === 0) {
    reasons.push("No significant phishing indicators detected in this URL's structure");
  }

  const risk = score >= 70 ? "High" : score >= 35 ? "Medium" : "Low";
  const confidence = Math.min(0.95, 0.4 + (score / 100) * 0.55);

  const explanations: Record<string, string> = {
    High: "This URL shows multiple strong indicators of a phishing or scam link. Avoid clicking or sharing this link.",
    Medium: "This URL has some suspicious characteristics. Verify the website's authenticity before entering any information.",
    Low: "This URL appears relatively safe, but always check the domain carefully before entering personal details.",
  };

  const recommendations: Record<string, string> = {
    High: "Do not visit this URL. Block and report the sender immediately.",
    Medium: "Verify this link through official channels before clicking. Do not enter personal information.",
    Low: "Proceed with caution and verify the URL matches the official website of the organization.",
  };

  return {
    isScam: score >= 40,
    score,
    category: score > 0 ? category : "Other",
    risk,
    confidence: Number(confidence.toFixed(2)),
    reasons,
    explanation: explanations[risk],
    recommendation: recommendations[risk],
    source: "url_heuristics",
  };
}
