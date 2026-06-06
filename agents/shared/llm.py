"""Thin Anthropic SDK wrapper. Keeps model selection + tool-use plumbing in one place."""
from __future__ import annotations

import base64
import os
from pathlib import Path
from typing import Any

import anthropic

# Per system: latest models are Opus 4.8 / Sonnet 4.6 / Haiku 4.5.
REVIEWER_MODEL = "claude-sonnet-4-6"  # vision-capable, fast, cheap enough for daily runs
MANAGER_MODEL = "claude-opus-4-8"     # better at ranking / multi-constraint reasoning


def client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def image_block(path: Path | str) -> dict[str, Any]:
    """Encode a local PNG as an Anthropic image content block."""
    data = base64.standard_b64encode(Path(path).read_bytes()).decode("ascii")
    return {
        "type": "image",
        "source": {"type": "base64", "media_type": "image/png", "data": data},
    }


def call_with_tool(
    *,
    model: str,
    system: str,
    messages: list[dict[str, Any]],
    tool_name: str,
    tool_description: str,
    input_schema: dict[str, Any],
    max_tokens: int = 4096,
) -> dict[str, Any]:
    """Force structured output by giving the model a single tool it MUST call.

    Returns the tool input dict from the model's first tool_use block.
    Raises RuntimeError if the model didn't call the tool (rare with tool_choice).
    """
    tools = [{
        "name": tool_name,
        "description": tool_description,
        "input_schema": input_schema,
    }]
    resp = client().messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        tools=tools,
        tool_choice={"type": "tool", "name": tool_name},
        messages=messages,
    )
    for block in resp.content:
        if getattr(block, "type", None) == "tool_use" and block.name == tool_name:
            return dict(block.input)
    raise RuntimeError(f"Model {model} did not invoke required tool {tool_name!r}")
