#!/usr/bin/env python3
"""
Generate TTS audio files for Teotihuacan Tour POIs.
Uses edge-tts (Microsoft Edge TTS) — free, no API key required.
Produces natural-sounding narration in ES/EN/PT.
"""

import asyncio
import json
import os
import sys

import edge_tts

# Natural-sounding voices per language
VOICES = {
    "es": "es-MX-DaliaNeural",       # Mexican Spanish female — warm, guide-like
    "en": "en-US-JennyNeural",        # US English female — clear narrator
    "pt": "pt-BR-FranciscaNeural",    # Brazilian Portuguese female — natural
}

LANGS = ["es", "en", "pt"]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POIS_PATH = os.path.join(BASE_DIR, "public", "data", "pois.json")
AUDIO_DIR = os.path.join(BASE_DIR, "public", "audio")


async def generate_audio(text: str, voice: str, output_path: str) -> bool:
    """Generate a single MP3 file using edge-tts."""
    try:
        communicate = edge_tts.Communicate(text, voice, rate="-5%", pitch="+0Hz")
        await communicate.save(output_path)
        return True
    except Exception as e:
        print(f"  ERROR: {e}", file=sys.stderr)
        return False


async def main():
    with open(POIS_PATH, "r", encoding="utf-8") as f:
        pois = json.load(f)

    results = []
    errors = []

    for poi in pois:
        slug = poi["slug"]
        descriptions = poi["shortDescription"]

        for lang in LANGS:
            text = descriptions.get(lang)
            if not text:
                errors.append(f"{slug}/{lang}: no description found")
                continue

            voice = VOICES[lang]
            out_dir = os.path.join(AUDIO_DIR, lang)
            os.makedirs(out_dir, exist_ok=True)
            out_path = os.path.join(out_dir, f"{slug}.mp3")

            print(f"Generating: {lang}/{slug}.mp3 ...", end=" ", flush=True)
            ok = await generate_audio(text, voice, out_path)

            if ok:
                size_kb = os.path.getsize(out_path) / 1024
                print(f"OK ({size_kb:.0f} KB)")
                results.append(f"public/audio/{lang}/{slug}.mp3")
            else:
                print("FAILED")
                errors.append(f"{slug}/{lang}: generation failed")

    # Summary report
    report = {
        "script_path": "scripts/generate-tts.py",
        "tts_service": "edge-tts (Microsoft Edge Neural TTS)",
        "api_key_needed": False,
        "files_generated": results,
        "files_count": len(results),
        "errors": errors,
        "status": "complete" if not errors else "partial",
    }

    print("\n" + json.dumps(report, indent=2, ensure_ascii=False))
    return report


if __name__ == "__main__":
    report = asyncio.run(main())
    sys.exit(0 if report["status"] == "complete" else 1)
