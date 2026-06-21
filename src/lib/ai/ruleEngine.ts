export const KEYWORD_CATEGORIES: Record<string, { keywords: string[]; points: number; reason: string }> = {
  urgency: {
    keywords: [
      "urgent", "urgently", "immediately", "act now", "limited offer",
      "expires today", "final notice", "last chance", "deadline",
      "respond within 24 hours", "within 48 hours", "time sensitive",
      "don't delay", "act immediately", "respond asap", "respond immediately",
      "account will be closed", "account will be terminated",
    ],
    points: 15,
    reason: "Urgency tactics used to pressure victims into acting without thinking",
  },

  threats_or_account_action: {
    keywords: [
      "account suspended", "account blocked", "bank blocked", "account locked",
      "will be deactivated", "account suspension", "legal action", "arrested",
      "warrants have been issued", "case filed against you", "cyber crime",
      "your number has been blocked", "sim card blocked", "account will be closed",
      "your device has been", "hacked", "compromised account",
    ],
    points: 20,
    reason: "Threatening or account-suspension language designed to create panic",
  },

  credential_request: {
    keywords: [
      "otp", "one time password", "one-time password", "verify now",
      "verify your account", "confirm your password", "enter your pin",
      "share your otp", "send your otp", "tell me the otp", "what is the otp",
      "give me the code", "verification code", "confirm otp", "enter otp",
      "share the 6 digit", "share the 4 digit", "bank password",
      "net banking password", "internet banking pin",
    ],
    points: 30,
    reason: "Suspicious request for OTP, PIN, or password — legitimate services never ask for this",
  },

  reward_or_prize: {
    keywords: [
      "claim prize", "claim your prize", "you have won", "you've won",
      "lottery", "congratulations you", "free gift", "cash reward",
      "lucky winner", "selected as a winner", "prize money", "jackpot",
      "you are eligible", "claim your reward", "redeem your prize",
      "kbc lottery", "kbc winner", "you have been selected",
    ],
    points: 30,
    reason: "Unsolicited prize or lottery claim — a hallmark of advance-fee fraud",
  },

  payment_request: {
    keywords: [
      "pay now", "processing fee", "send payment", "wire transfer",
      "gift card", "advance fee", "small fee", "nominal fee",
      "registration fee", "activation fee", "delivery charges",
      "customs duty", "tax payment", "release fee", "handling fee",
      "send rs", "send inr", "transfer the amount", "google play card",
      "itunes card", "amazon gift card", "pay via upi",
    ],
    points: 25,
    reason: "Request for an advance fee or payment using untraceable methods",
  },

  authority_impersonation: {
    keywords: [
      "income tax department", "this is the police", "courier department",
      "customs department", "from the bank", "official notice", "rbi",
      "reserve bank of india", "sebi", "government of india", "ministry",
      "narcotics control", "enforcement directorate", "ed officer",
      "cbi officer", "cyber crime department", "i am calling from",
      "call from amazon", "call from microsoft", "call from apple",
    ],
    points: 20,
    reason: "Impersonation of a government authority, bank, or institution",
  },

  delivery_scam: {
    keywords: [
      "redelivery fee", "delivery failed", "package delivery failed",
      "package will be returned", "shipment on hold", "customs fee",
      "update your delivery address", "missed delivery", "parcel seized",
      "fedex", "dhl delivery", "india post parcel", "your package",
      "courier failed", "re-schedule delivery",
    ],
    points: 20,
    reason: "Fake delivery notification requesting payment or personal details",
  },

  job_scam: {
    keywords: [
      "work from home job", "no experience needed", "no experience required",
      "send your bank details", "earn per week", "easy money",
      "part time job offer", "earn rs daily", "earn per day",
      "simple typing job", "data entry job", "earn from mobile",
      "join our team", "whatsapp job", "telegram job", "pay after joining",
      "you have been selected for", "interview call letter",
    ],
    points: 25,
    reason: "Fake job offer with unrealistic pay or upfront fee requirement",
  },

  crypto_scam: {
    keywords: [
      "bitcoin", "crypto investment", "cryptocurrency", "guaranteed returns",
      "double your investment", "100% returns", "200% returns",
      "trading bot", "forex trading", "binance", "coinbase", "crypto wallet",
      "send bitcoin", "send eth", "ethereum investment", "defi returns",
      "nft giveaway", "crypto airdrop",
    ],
    points: 25,
    reason: "Cryptocurrency or investment scam pattern with promises of guaranteed returns",
  },

  investment_scam: {
    keywords: [
      "guaranteed profit", "guaranteed return", "risk free investment",
      "risk-free investment", "safe investment", "high returns",
      "monthly returns", "weekly returns", "profit guaranteed",
      "sebi registered", "rbi approved", "government scheme",
      "mutual fund scam", "stock tip", "insider tip", "penny stock",
      "pig butchering", "wealth management team",
    ],
    points: 25,
    reason: "Investment scam promising guaranteed or unrealistic returns",
  },

  upi_fraud: {
    keywords: [
      "upi", "upi id", "google pay", "gpay", "phonepe", "paytm",
      "scan qr", "scan qr code", "qr code payment", "collect request",
      "approve the payment request", "upi payment request",
      "enter upi pin", "enter mpin", "upi pin", "upi scam",
      "payment request sent", "approve to receive money",
    ],
    points: 25,
    reason: "UPI fraud attempt — scammers send collect requests disguised as money transfer",
  },

  bank_impersonation: {
    keywords: [
      "your bank account", "sbi", "hdfc", "icici", "axis bank",
      "kotak bank", "yes bank", "bank of india", "union bank",
      "kyc update", "kyc verification", "kyc pending", "kyc expired",
      "link your aadhaar", "aadhaar link", "pan card update",
      "net banking", "internet banking", "mobile banking alert",
    ],
    points: 20,
    reason: "Bank impersonation — fake KYC or account alerts from supposed bank officials",
  },

  romance_scam: {
    keywords: [
      "i love you", "we have a connection", "i am a soldier",
      "i am stationed", "send me money", "help me transfer",
      "oil rig", "inheritance money", "i need your help",
      "dating site", "met online", "let's move to whatsapp",
    ],
    points: 20,
    reason: "Romance or relationship scam indicators detected",
  },
};

const CATEGORY_HINTS: Record<string, string> = {
  credential_request: "OTP Fraud",
  reward_or_prize: "Lottery Scam",
  payment_request: "Delivery Scam",
  threats_or_account_action: "Phishing",
  authority_impersonation: "Phishing",
  urgency: "Phishing",
  delivery_scam: "Delivery Scam",
  job_scam: "Job Scam",
  crypto_scam: "Investment Scam",
  investment_scam: "Investment Scam",
  upi_fraud: "UPI Fraud",
  bank_impersonation: "Phishing",
  romance_scam: "Romance Scam",
};

export function runRuleBasedCheck(text: string) {
  if (!text || typeof text !== "string") {
    return { score: 0, category: "Other", reasons: [], matched_categories: [] };
  }

  const normalized = text.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  const matched_categories: string[] = [];

  for (const [categoryName, config] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of config.keywords) {
      if (normalized.includes(keyword)) {
        score += config.points;
        if (!reasons.includes(config.reason)) {
          reasons.push(config.reason);
        }
        if (!matched_categories.includes(categoryName)) {
          matched_categories.push(categoryName);
        }
        break;
      }
    }
  }

  // Stylistic red flags
  const exclamationMatches = text.match(/!/g);
  if (exclamationMatches && exclamationMatches.length >= 3) {
    score += 5;
    reasons.push("Excessive use of exclamation marks creates artificial urgency");
  }

  const capsWords = text.match(/\b[A-Z]{4,}\b/g);
  if (capsWords && capsWords.length >= 2) {
    score += 5;
    reasons.push("Excessive use of capital letters — a pressure tactic");
  }

  // Combo bonuses for compound scam patterns
  if (matched_categories.includes("reward_or_prize") && matched_categories.includes("payment_request")) {
    score += 20;
    reasons.push("Classic advance-fee fraud: prize claim combined with a payment request");
  }

  if (matched_categories.includes("job_scam") &&
    (matched_categories.includes("payment_request") || matched_categories.includes("credential_request"))) {
    score += 15;
    reasons.push("Fraudulent job offer combined with a request for money or personal details");
  }

  if (matched_categories.includes("upi_fraud") && matched_categories.includes("urgency")) {
    score += 15;
    reasons.push("Urgent UPI payment request — scammers rush victims to approve collect requests");
  }

  if (matched_categories.includes("crypto_scam") && matched_categories.includes("investment_scam")) {
    score += 15;
    reasons.push("Cryptocurrency investment scam with guaranteed returns — a common pig-butchering tactic");
  }

  if (matched_categories.includes("authority_impersonation") && matched_categories.includes("threats_or_account_action")) {
    score += 20;
    reasons.push("Official-sounding threats from impersonated authorities — a classic intimidation scam");
  }

  score = Math.min(score, 100);

  let category = "Other";
  if (matched_categories.length > 0) {
    const best = matched_categories.reduce((a, b) =>
      KEYWORD_CATEGORIES[a].points > KEYWORD_CATEGORIES[b].points ? a : b
    );
    category = CATEGORY_HINTS[best] || "Other";
  }

  return {
    score,
    category,
    reasons,
    matched_categories,
  };
}
