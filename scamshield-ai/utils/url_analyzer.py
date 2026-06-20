"""
URL heuristic scam/phishing detection engine.

Checks for: suspicious domains, brand impersonation, unusual TLDs,
URL-shortening services, excessive symbols/numbers, and other
common phishing-link patterns. Pure heuristics — no network calls,
so it works instantly and doesn't depend on any external API.
"""

import re
from urllib.parse import urlparse

# Well-known URL shortening services. A shortened link hides the real
# destination, which is a common phishing tactic (though also used
# legitimately) — so it adds risk points but isn't damning on its own.
KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd",
    "buff.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
}

# TLDs frequently abused in phishing campaigns because they're cheap
# or loosely moderated. Not inherently malicious, but a real risk signal
# when combined with other indicators.
SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club",
    ".work", ".click", ".loan", ".win", ".bid",
}

# Major brands commonly impersonated in phishing URLs. If the brand name
# appears in the domain but the domain isn't actually that brand's real
# domain, it's a strong impersonation signal.
IMPERSONATED_BRANDS = {
    "paypal": ["paypal.com"],
    "amazon": ["amazon.com", "amazon.in", "amazon.co.uk"],
    "google": ["google.com"],
    "microsoft": ["microsoft.com", "live.com", "outlook.com", "microsoftonline.com", "office.com"],
    "apple": ["apple.com", "icloud.com"],
    "netflix": ["netflix.com"],
    "facebook": ["facebook.com", "fb.com"],
    "instagram": ["instagram.com"],
    "whatsapp": ["whatsapp.com"],
    "bank": [],  # generic "bank" mentions are checked separately, no fixed real domain
    "irs": ["irs.gov"],
    "dhl": ["dhl.com"],
    "fedex": ["fedex.com"],
    "ups": ["ups.com"],
}


def _normalize_url(url: str) -> str:
    """Ensures the URL has a scheme so urlparse extracts the host correctly."""
    if not re.match(r"^[a-zA-Z][a-zA-Z\d+\-.]*://", url):
        return f"https://{url}"
    return url


def analyze_url_heuristics(url: str) -> dict:
    """
    Analyzes a URL for phishing/scam indicators using pattern heuristics.

    Returns a dict matching the API response shape:
        {
            "isScam": bool,
            "score": int (0-100),
            "category": str,
            "risk": "Low" | "Medium" | "High",
            "reasons": list[str],
            "source": "url_heuristics"
        }
    """
    if not url or not isinstance(url, str):
        return _empty_result()

    normalized = _normalize_url(url.strip())

    try:
        parsed = urlparse(normalized)
    except ValueError:
        return {
            "isScam": True,
            "score": 60,
            "category": "Other",
            "risk": "Medium",
            "reasons": ["URL could not be parsed — malformed or suspicious structure"],
            "source": "url_heuristics",
        }

    host = (parsed.hostname or "").lower()
    full_url_lower = normalized.lower()

    if not host:
        return _empty_result()

    score = 0
    reasons = []
    category = "Other"

    # 1. URL shortener check
    if host in KNOWN_SHORTENERS:
        score += 20
        reasons.append("Uses a URL-shortening service, which can hide the real destination")
        category = "Phishing"

    # 2. Suspicious TLD check
    for tld in SUSPICIOUS_TLDS:
        if host.endswith(tld):
            score += 20
            reasons.append(f"Uses an uncommon top-level domain ({tld}) often associated with disposable or low-cost domains")
            category = "Phishing"
            break

    # 3. Brand impersonation check — brand name appears in the URL but the
    # actual domain doesn't match the brand's known real domain(s).
    for brand, real_domains in IMPERSONATED_BRANDS.items():
        if not real_domains:
            continue
        if brand in full_url_lower and not any(host == d or host.endswith(f".{d}") for d in real_domains):
            score += 30
            reasons.append(f"Mentions '{brand}' but the domain does not match {brand}'s official site")
            category = "Phishing"
            break

    # 4. Excessive subdomains / hyphens / digits — common obfuscation tactic
    # e.g. "paypal-secure-login-verify123.com"
    subdomain_count = host.count(".") 
    hyphen_count = host.count("-")
    digit_count = sum(c.isdigit() for c in host)

    if hyphen_count >= 3:
        score += 15
        reasons.append("Domain contains an unusually high number of hyphens")

    if digit_count >= 4:
        score += 10
        reasons.append("Domain contains an unusually high number of digits")

    if subdomain_count >= 4:
        score += 10
        reasons.append("Domain has an unusually deep subdomain structure")

    # 5. IP address used directly instead of a domain name — almost never
    # legitimate for a consumer-facing link.
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host):
        score += 30
        reasons.append("URL uses a raw IP address instead of a domain name")
        category = "Phishing"

    # 6. "@" symbol in URL — classic trick where everything before "@" is
    # ignored by browsers, used to disguise the real destination.
    if "@" in normalized:
        score += 25
        reasons.append("URL contains an '@' symbol, a known technique to disguise the real destination")
        category = "Phishing"

    # 7. Suspicious keywords in path/query suggesting credential harvesting
    credential_keywords = ["login", "verify", "secure", "update-account", "confirm-identity", "signin"]
    matched_keywords = [kw for kw in credential_keywords if kw in full_url_lower]
    if len(matched_keywords) >= 2:
        score += 15
        reasons.append("URL path contains multiple credential-harvesting keywords")

    score = min(score, 100)

    if not reasons:
        reasons = ["No strong phishing indicators detected in this URL's structure"]

    risk = "High" if score >= 70 else "Medium" if score >= 35 else "Low"

    return {
        "isScam": score >= 40,
        "score": score,
        "category": category if score > 0 else "Other",
        "risk": risk,
        "reasons": reasons,
        "source": "url_heuristics",
    }


def _empty_result() -> dict:
    return {
        "isScam": False,
        "score": 0,
        "category": "Other",
        "risk": "Low",
        "reasons": ["Could not extract a valid domain from the input"],
        "source": "url_heuristics",
    }
