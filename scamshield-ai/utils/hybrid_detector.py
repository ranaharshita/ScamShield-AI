"""
Hybrid scam detector: combines the rule-based engine and Claude LLM analysis
into a single final result.

Strategy:
  1. Always run the rule-based check first (fast, free, no network needed).
  2. Attempt the Claude LLM analysis.
  3. If Claude succeeds: blend scores (LLM-weighted) and merge reasons from both.
  4. If Claude fails for any reason: fall back to the rule-based result alone,
     so the API never hard-fails just because the LLM call had trouble.
"""

from utils.rule_engine import run_rule_based_check
from utils.claude_client import analyze_with_claude

# Weight given to the LLM score vs. the rule-based score when both are available.
# LLM gets more weight since it understands context the keyword matcher can't.
LLM_WEIGHT = 0.7
RULE_WEIGHT = 0.3


def _risk_from_score(score: int) -> str:
    if score >= 70:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"


def run_hybrid_analysis(text: str) -> dict:
    """
    Runs the full hybrid scam detection pipeline on the given text.

    Returns a dict matching the API response shape:
        {
            "isScam": bool,
            "score": int (0-100),
            "category": str,
            "risk": "Low" | "Medium" | "High",
            "reasons": list[str],
            "source": "hybrid" | "rule_based_only"
        }
    """
    rule_result = run_rule_based_check(text)
    llm_result = analyze_with_claude(text)

    if llm_result is None:
        # Claude unavailable — fall back to rule-based result only.
        score = rule_result["score"]
        return {
            "isScam": score >= 40,
            "score": score,
            "category": rule_result["category"],
            "risk": _risk_from_score(score),
            "reasons": rule_result["reasons"] or ["No strong scam indicators detected"],
            "source": "rule_based_only",
        }

    # Both available — blend scores, merge reasons (dedup, LLM reasons first
    # since they're typically more specific to the message).
    llm_score = max(0, min(100, int(llm_result.get("score", 0))))
    rule_score = rule_result["score"]
    blended_score = round(LLM_WEIGHT * llm_score + RULE_WEIGHT * rule_score)
    blended_score = max(0, min(100, blended_score))

    combined_reasons = list(llm_result.get("reasons", []))
    for reason in rule_result["reasons"]:
        if reason not in combined_reasons:
            combined_reasons.append(reason)

    if not combined_reasons:
        combined_reasons = ["No strong scam indicators detected"]

    return {
        "isScam": bool(llm_result.get("isScam", blended_score >= 50)),
        "score": blended_score,
        "category": llm_result.get("category") or rule_result["category"],
        "risk": llm_result.get("risk") or _risk_from_score(blended_score),
        "reasons": combined_reasons[:6],  # cap to keep the UI tidy
        "source": "hybrid",
    }
