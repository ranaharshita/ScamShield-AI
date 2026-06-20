"""
Rule-based scam detection engine.

Fast, deterministic, keyword/pattern scoring that runs BEFORE the LLM call.
Serves two purposes:
  1. Instant baseline score with zero network dependency.
  2. Fallback if the Claude API is unavailable or rate-limited — the app
     still returns a usable result instead of failing outright.

This is intentionally simple (string/regex matching) — hackathon-scoped,
not a production NLP pipeline.
"""

import re

# Scam keyword categories. Each category contributes points and, if matched,
# a human-readable reason string. Keywords are matched case-insensitively
# against the raw input text.
KEYWORD_CATEGORIES = {
    "urgency": {
        "keywords": [
            "urgent",
            "immediately",
            "act now",
            "limited offer",
            "expires today",
            "final notice",
            "last chance",
        ],
        "points": 15,
        "reason": "Urgency tactics detected",
    },
    "threats_or_account_action": {
        "keywords": [
            "account suspended",
            "account blocked",
            "bank blocked",
            "account locked",
            "will be deactivated",
            "account suspension",
            "legal action",
        ],
        "points": 20,
        "reason": "Threatening or account-suspension language detected",
    },
    "credential_request": {
        "keywords": [
            "otp",
            "one time password",
            "verify now",
            "verify your account",
            "confirm your password",
            "enter your pin",
            "share your otp",
        ],
        "points": 25,
        "reason": "Suspicious request for OTP, password, or PIN",
    },
    "reward_or_prize": {
        "keywords": [
            "claim prize",
            "claim your prize",
            "you have won",
            "you've won",
            "lottery",
            "congratulations",
            "free gift",
            "cash reward",
        ],
        "points": 30,
        "reason": "Suspicious reward or prize claim detected",
    },
    "payment_request": {
        "keywords": [
            "click here",
            "pay now",
            "processing fee",
            "send payment",
            "wire transfer",
            "gift card",
            "advance fee",
            "pay a",
            "small fee",
        ],
        "points": 25,
        "reason": "Suspicious payment or action request detected",
    },
    "authority_impersonation": {
        "keywords": [
            "income tax department",
            "this is the police",
            "courier department",
            "customs department",
            "from the bank",
            "official notice",
        ],
        "points": 15,
        "reason": "Possible impersonation of an authority or institution",
    },
    "delivery_scam": {
        "keywords": [
            "redelivery fee",
            "delivery failed",
            "package delivery failed",
            "package will be returned",
            "shipment on hold",
            "customs fee",
            "update your delivery address",
            "missed delivery",
        ],
        "points": 25,
        "reason": "Suspicious delivery or shipping fee request detected",
    },
    "job_scam": {
        "keywords": [
            "work from home job",
            "no experience needed",
            "no experience required",
            "registration fee",
            "send your bank details",
            "earn per week",
            "per week",
            "easy money",
            "part time job offer",
        ],
        "points": 25,
        "reason": "Suspicious job offer pattern detected (unrealistic pay, upfront fee, or unsolicited offer)",
    },
}

# Category label heuristics — used to guess a scam "category" from
# whichever keyword groups fired most, before/alongside the LLM's own
# categorization.
CATEGORY_HINTS = {
    "credential_request": "OTP Fraud",
    "reward_or_prize": "Lottery Scam",
    "payment_request": "Delivery Scam",
    "threats_or_account_action": "Phishing",
    "authority_impersonation": "Phishing",
    "urgency": "Phishing",
    "delivery_scam": "Delivery Scam",
    "job_scam": "Job Scam",
}


def run_rule_based_check(text: str) -> dict:
    """
    Scans input text against keyword categories and returns a baseline
    score, suggested category, and matched reasons.

    Returns:
        {
            "score": int (0-100),
            "category": str,
            "reasons": list[str],
            "matched_categories": list[str]
        }
    """
    if not text or not isinstance(text, str):
        return {"score": 0, "category": "Other", "reasons": [], "matched_categories": []}

    normalized = text.lower()

    score = 0
    reasons = []
    matched_categories = []

    for category_name, config in KEYWORD_CATEGORIES.items():
        for keyword in config["keywords"]:
            if keyword in normalized:
                score += config["points"]
                reasons.append(config["reason"])
                matched_categories.append(category_name)
                break  # only count each category once, even if multiple keywords match

    # Extra signal: excessive exclamation marks or all-caps shouting,
    # common in scam messaging.
    if len(re.findall(r"!", text)) >= 3:
        score += 5
        reasons.append("Excessive use of exclamation marks")

    caps_words = re.findall(r"\b[A-Z]{4,}\b", text)
    if len(caps_words) >= 2:
        score += 5
        reasons.append("Excessive use of capital letters")

    # Combo bonus: reward/prize claim + payment request together is the
    # textbook advance-fee fraud pattern ("you won, now pay a fee to claim it").
    if "reward_or_prize" in matched_categories and "payment_request" in matched_categories:
        score += 15
        reasons.append("Classic advance-fee scam pattern: prize claim combined with a payment request")

    # Combo bonus: a "job offer" that also asks for money or bank details
    # upfront is the defining trait of a job scam, not a real employer.
    if "job_scam" in matched_categories and (
        "payment_request" in matched_categories or "credential_request" in matched_categories
    ):
        score += 15
        reasons.append("Job offer combined with a request for money or personal/bank details")

    score = min(score, 100)

    # Guess category from the highest-weighted matched category.
    category = "Other"
    if matched_categories:
        best = max(
            matched_categories,
            key=lambda c: KEYWORD_CATEGORIES[c]["points"],
        )
        category = CATEGORY_HINTS.get(best, "Other")

    return {
        "score": score,
        "category": category,
        "reasons": reasons,
        "matched_categories": matched_categories,
    }
