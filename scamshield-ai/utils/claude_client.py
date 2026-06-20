"""
Claude API client wrapper for LLM-based scam analysis.

Isolated in its own module so main.py doesn't need to know HOW we talk to
Claude — just that calling `analyze_with_claude(text)` returns a parsed dict.
"""

import json
import os
import logging

from anthropic import Anthropic, APIError, APIConnectionError, APITimeoutError

from prompts.scam_analysis_prompt import (
    SCAM_ANALYSIS_SYSTEM_PROMPT,
    build_scam_analysis_user_prompt,
)

logger = logging.getLogger("scamshield.claude_client")

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
MAX_TOKENS = 500

_client = None


def get_client() -> Anthropic:
    """Lazily creates a single shared Anthropic client instance."""
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY environment variable is not set. "
                "Add it to scamshield-ai/.env"
            )
        _client = Anthropic(api_key=api_key)
    return _client


def _extract_json(raw_text: str) -> dict:
    """
    Extracts a JSON object from the model's raw text response.
    Claude is instructed to return JSON only, but this defends against
    accidental markdown code fences or stray whitespace.
    """
    cleaned = raw_text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()

    return json.loads(cleaned)


def analyze_with_claude(user_input: str) -> dict | None:
    """
    Sends the input text to Claude for scam analysis.

    Returns a dict matching the {isScam, score, category, risk, reasons} shape,
    or None if the call fails or the response can't be parsed — callers should
    fall back to the rule-based result in that case rather than erroring out.
    """
    try:
        client = get_client()
        response = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=MAX_TOKENS,
            system=SCAM_ANALYSIS_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": build_scam_analysis_user_prompt(user_input),
                }
            ],
        )

        raw_text = "".join(
            block.text for block in response.content if block.type == "text"
        )

        parsed = _extract_json(raw_text)

        # Basic shape validation — if Claude returns something malformed,
        # treat it as a failure so the caller falls back gracefully.
        required_keys = {"isScam", "score", "category", "risk", "reasons"}
        if not required_keys.issubset(parsed.keys()):
            logger.warning("Claude response missing required keys: %s", parsed)
            return None

        return parsed

    except (APIError, APIConnectionError, APITimeoutError) as exc:
        logger.warning("Claude API call failed: %s", exc)
        return None
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Failed to parse Claude response as JSON: %s", exc)
        return None
    except RuntimeError as exc:
        logger.warning("Claude client misconfigured: %s", exc)
        return None
