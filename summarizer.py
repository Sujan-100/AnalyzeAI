import os
import re

import google.generativeai as genai
import requests
import torch
from dotenv import load_dotenv
from transformers import pipeline

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN")

USE_OPENROUTER = False
if OPENROUTER_API_KEY:
    USE_OPENROUTER = True
elif GEMINI_API_KEY and GEMINI_API_KEY.startswith("sk-or-"):
    OPENROUTER_API_KEY = GEMINI_API_KEY
    USE_OPENROUTER = True

if GEMINI_API_KEY and not USE_OPENROUTER:
    genai.configure(api_key=GEMINI_API_KEY)


def _openrouter_summarize(prompt: str) -> str:
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
            "model": "google/gemini-2.5-pro",
            "messages": [
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
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


def summarize_text(model_name, text):
    """
    Summarize text using Gemini API or local Hugging Face models (BART / T5).
    Optimized for concise summaries and reduced length warnings.
    """

    if "gemini" in model_name.lower():
        system_instruction_prompt = (
            "You are an expert legal assistant. Provide a concise, bulleted summary of the following legal text."
            "Do not include introductory phrases like 'Based on the provided text' or 'The document states'."
            "\n\nLegal Document:\n\n"
        )
        full_prompt = system_instruction_prompt + text

        if USE_OPENROUTER:
            return _openrouter_summarize(full_prompt)

        if not GEMINI_API_KEY:
            return "Gemini error: GEMINI_API_KEY not configured in environment."

        try:
            model = genai.GenerativeModel("models/gemini-2.5-pro")
            response = model.generate_content(contents=full_prompt)
            return response.text.strip()
        except Exception as e:
            return f"Gemini error: {str(e)}"

    try:
        if model_name.lower() == "bart":
            model_id = "facebook/bart-large-cnn"
        elif model_name.lower() == "t5":
            model_id = "t5-small"
        else:
            return "Local summarization error: Unsupported model name"

        pipeline_kwargs = {
            "task": "summarization",
            "model": model_id,
            "device": 0 if torch.cuda.is_available() else -1,
        }
        if HUGGINGFACE_API_KEY:
            pipeline_kwargs["token"] = HUGGINGFACE_API_KEY

        summarizer = pipeline(**pipeline_kwargs)

        text = re.sub(r"\s+", " ", text).strip()
        if len(text) > 4000:
            text = text[:4000]

        sentences = re.split(r"(?<=[.!?]) +", text)
        chunks, current_chunk = [], ""
        max_chunk_size = 500

        for sentence in sentences:
            if len(current_chunk) + len(sentence) <= max_chunk_size:
                current_chunk += sentence + " "
            else:
                chunks.append(current_chunk.strip())
                current_chunk = sentence + " "

        if current_chunk:
            chunks.append(current_chunk.strip())

        chunks = chunks[:5]
        summarized_chunks = []

        for chunk in chunks:
            chunk_words = len(chunk.split())
            dynamic_max_tokens = max(15, min(40, int(chunk_words * 0.20)))

            summary = summarizer(
                chunk,
                max_new_tokens=dynamic_max_tokens,
                min_length=10,
                do_sample=False,
                early_stopping=True,
            )
            summarized_chunks.append(summary[0]["summary_text"].strip())

        final_summary = " ".join(summarized_chunks)
        return final_summary[:1000] + "..." if len(final_summary) > 1000 else final_summary

    except Exception as e:
        if USE_OPENROUTER:
            fallback_prompt = f"Summarize briefly:\n\n{text}"
            return f"(Local Model Failed. Fallback to OpenRouter)\n{_openrouter_summarize(fallback_prompt)}"

        if not GEMINI_API_KEY:
            return f"Critical Failure: Local summarization error ({str(e)}) and GEMINI_API_KEY is missing."

        try:
            model = genai.GenerativeModel("models/gemini-2.5-pro")
            response = model.generate_content(f"Summarize briefly:\n\n{text}")
            return f"(Local Model Failed. Fallback to Gemini)\n{response.text.strip()}"
        except Exception as fallback_e:
            return f"Critical Failure: Local summarization error ({str(e)}) and Gemini fallback error ({str(fallback_e)})"
