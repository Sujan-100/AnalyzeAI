import os
import time
from typing import Optional

import google.generativeai as genai
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

USE_OPENROUTER = False
if OPENROUTER_API_KEY:
    USE_OPENROUTER = True
elif GEMINI_API_KEY and GEMINI_API_KEY.startswith("sk-or-"):
    OPENROUTER_API_KEY = GEMINI_API_KEY
    USE_OPENROUTER = True

if GEMINI_API_KEY and not USE_OPENROUTER:
    genai.configure(api_key=GEMINI_API_KEY)


def _openrouter_generate(prompt: str, model: str) -> str:
    if not OPENROUTER_API_KEY:
        return "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in .env."

    # Keep outputs bounded to avoid 402 credit errors.
    max_tokens = 800

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_tokens": max_tokens,
        },
        timeout=60,
    )

    if response.status_code != 200:
        return f"OpenRouter error: {response.status_code} {response.text}"

    data = response.json()
    choices = data.get("choices") or []
    if not choices:
        return "OpenRouter error: empty response"

    message = choices[0].get("message") or {}
    return (message.get("content") or "").strip() or "OpenRouter error: empty content"



def generate_gemini_response(prompt: str) -> str:
    if USE_OPENROUTER:
        models_to_try = ["google/gemini-2.5-pro", "google/gemini-1.5-flash"]
        for model_name in models_to_try:
            result = _openrouter_generate(prompt, model_name)
            if "OpenRouter error" in result and "429" in result:
                time.sleep(2)
                continue
            return result
        return "All OpenRouter Gemini models failed."

    if not GEMINI_API_KEY:
        return "GEMINI_API_KEY is not configured. Add it to .env to enable chatbot responses."

    models_to_try = ["gemini-2.5-pro", "gemini-1.5-flash"]

    for model_name in models_to_try:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "quota" in error_str.lower():
                time.sleep(2)
                continue
            raise

    return "All Gemini models failed. Check API key or quota."
