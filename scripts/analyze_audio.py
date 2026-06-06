from __future__ import annotations

import json
import math
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import soundfile as sf


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
ASSETS_DIR = ROOT / "assets"
DOCS_DIR = ROOT / "docs"
TMP_DIR = ROOT / "source" / "audio"


def run(command: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )


def ffprobe(path: Path) -> dict[str, Any]:
    result = run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_format",
            "-show_streams",
            "-print_format",
            "json",
            str(path),
        ]
    )
    return json.loads(result.stdout)


def loudnorm(path: Path) -> dict[str, str]:
    result = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-i",
            str(path),
            "-af",
            "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
            "-f",
            "null",
            "-",
        ],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
    )
    match = re.search(r"\{\s*\"input_i\".*?\}", result.stderr, re.S)
    return json.loads(match.group(0)) if match else {}


def make_wav(source: Path, wav_path: Path) -> None:
    run(
        [
            "ffmpeg",
            "-hide_banner",
            "-y",
            "-i",
            str(source),
            "-ac",
            "1",
            "-ar",
            "16000",
            "-vn",
            str(wav_path),
        ]
    )


def dbfs(value: float) -> float:
    if value <= 0:
        return -120.0
    return 20 * math.log10(value)


def hms(seconds: float) -> str:
    seconds = max(0, float(seconds))
    minutes, sec = divmod(int(round(seconds)), 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{sec:02d}"
    return f"{minutes:02d}:{sec:02d}"


def activity_blocks(mask: np.ndarray, hop_seconds: float) -> list[dict[str, Any]]:
    blocks: list[tuple[float, float]] = []
    start: int | None = None
    for index, active in enumerate(mask):
        if active and start is None:
            start = index
        elif not active and start is not None:
            blocks.append((start * hop_seconds, index * hop_seconds))
            start = None
    if start is not None:
        blocks.append((start * hop_seconds, len(mask) * hop_seconds))

    merged: list[tuple[float, float]] = []
    for start_s, end_s in blocks:
        if not merged or start_s - merged[-1][1] > 1.5:
            merged.append((start_s, end_s))
        else:
            merged[-1] = (merged[-1][0], end_s)

    cleaned = [(start_s, end_s) for start_s, end_s in merged if end_s - start_s >= 2.0]
    return [
        {
            "start": round(start_s, 2),
            "end": round(end_s, 2),
            "start_label": hms(start_s),
            "end_label": hms(end_s),
            "duration": round(end_s - start_s, 2),
        }
        for start_s, end_s in cleaned
    ]


def analyze_signal(wav_path: Path) -> tuple[dict[str, Any], list[dict[str, Any]], list[float]]:
    audio, sr = sf.read(wav_path, dtype="float32", always_2d=False)
    if audio.ndim > 1:
        audio = audio.mean(axis=1)

    duration = len(audio) / sr
    frame_size = max(1, int(sr * 0.5))
    frame_count = len(audio) // frame_size
    trimmed = audio[: frame_count * frame_size]
    frames = trimmed.reshape(frame_count, frame_size) if frame_count else np.empty((0, frame_size))
    rms = np.sqrt(np.mean(np.square(frames), axis=1)) if frame_count else np.array([])
    rms_db = np.array([dbfs(float(v)) for v in rms])
    threshold = max(float(np.percentile(rms_db, 30) + 7.0), -45.0) if len(rms_db) else -45.0
    mask = rms_db > threshold
    blocks = activity_blocks(mask, 0.5)

    peak = float(np.max(np.abs(audio))) if len(audio) else 0.0
    whole_rms = float(np.sqrt(np.mean(np.square(audio)))) if len(audio) else 0.0
    clip_samples = int(np.sum(np.abs(audio) >= 0.98)) if len(audio) else 0

    spectral_centroids = []
    if frame_count:
        window = np.hanning(frame_size)
        freq = np.fft.rfftfreq(frame_size, 1 / sr)
        stride = max(1, frame_count // 240)
        for frame in frames[::stride]:
            mag = np.abs(np.fft.rfft(frame * window))
            total = float(np.sum(mag))
            if total > 0:
                spectral_centroids.append(float(np.sum(freq * mag) / total))

    envelope_points = 720
    bucket_size = max(1, len(audio) // envelope_points)
    envelope = []
    for index in range(0, len(audio), bucket_size):
        bucket = audio[index : index + bucket_size]
        envelope.append(round(float(np.max(np.abs(bucket))) if len(bucket) else 0.0, 5))
    envelope = envelope[:envelope_points]

    active_seconds = sum(block["duration"] for block in blocks)
    metrics = {
        "analysis_sample_rate": sr,
        "duration_seconds": round(duration, 3),
        "duration_label": hms(duration),
        "peak_dbfs": round(dbfs(peak), 2),
        "rms_dbfs": round(dbfs(whole_rms), 2),
        "clip_like_samples": clip_samples,
        "activity_threshold_dbfs": round(threshold, 2),
        "active_seconds": round(active_seconds, 2),
        "active_ratio": round(active_seconds / duration, 3) if duration else 0,
        "activity_block_count": len(blocks),
        "mean_spectral_centroid_hz": round(float(np.mean(spectral_centroids)), 1)
        if spectral_centroids
        else None,
        "p10_frame_dbfs": round(float(np.percentile(rms_db, 10)), 2) if len(rms_db) else None,
        "p50_frame_dbfs": round(float(np.percentile(rms_db, 50)), 2) if len(rms_db) else None,
        "p90_frame_dbfs": round(float(np.percentile(rms_db, 90)), 2) if len(rms_db) else None,
    }
    return metrics, blocks, envelope


def transcribe(wav_path: Path) -> dict[str, Any]:
    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        return {"available": False, "error": f"faster_whisper import failed: {exc}", "segments": []}

    model_name = "small"
    try:
        model = WhisperModel(model_name, device="cpu", compute_type="int8")
        segments, info = model.transcribe(
            str(wav_path),
            language="ja",
            vad_filter=True,
            vad_parameters={"min_silence_duration_ms": 500},
            beam_size=5,
        )
        rows = []
        full_text_parts = []
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue
            rows.append(
                {
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "start_label": hms(segment.start),
                    "end_label": hms(segment.end),
                    "text": text,
                }
            )
            full_text_parts.append(text)
        return {
            "available": True,
            "model": model_name,
            "language": getattr(info, "language", "ja"),
            "language_probability": round(float(getattr(info, "language_probability", 0.0)), 4),
            "duration": round(float(getattr(info, "duration", 0.0)), 3),
            "segments": rows,
            "full_text": "\n".join(full_text_parts),
        }
    except Exception as exc:
        return {"available": False, "error": str(exc), "segments": []}


def summarize_transcript(segments: list[dict[str, Any]]) -> dict[str, Any]:
    text = "\n".join(segment["text"] for segment in segments)
    keyword_candidates = [
        "体育館",
        "西原",
        "予約",
        "バドミントン",
        "バスケ",
        "バレー",
        "メンバー",
        "サイト",
        "GitHub",
        "Pages",
        "Moguri",
        "もぐり",
        "料金",
        "会議室",
        "イベント",
        "共有",
    ]
    keywords = [word for word in keyword_candidates if word.lower() in text.lower()]
    return {
        "character_count": len(text),
        "keyword_hits": keywords,
        "review_note": "Whisper transcription is machine-generated; member review is still required before publishing as final notes.",
    }


def write_waveform_svg(envelope: list[float], duration_label: str) -> None:
    width = 1200
    height = 260
    mid = height / 2
    max_value = max(envelope) if envelope else 1
    points = []
    for index, value in enumerate(envelope):
        x = (index / max(1, len(envelope) - 1)) * width
        y_top = mid - (value / max_value) * (height * 0.42)
        y_bottom = mid + (value / max_value) * (height * 0.42)
        points.append(f"M{x:.2f},{y_top:.2f} L{x:.2f},{y_bottom:.2f}")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="Audio waveform, duration {duration_label}">
  <rect width="{width}" height="{height}" fill="#f7f4ec"/>
  <line x1="0" y1="{mid:.2f}" x2="{width}" y2="{mid:.2f}" stroke="#d8d0bd" stroke-width="2"/>
  <path d="{' '.join(points)}" stroke="#1f6f78" stroke-width="2.2" stroke-linecap="round"/>
  <text x="24" y="42" fill="#263238" font-family="Arial, sans-serif" font-size="24">Moguri audio waveform / {duration_label}</text>
</svg>
"""
    (ASSETS_DIR / "waveform.svg").write_text(svg, encoding="utf-8")


def write_transcript(transcription: dict[str, Any]) -> None:
    lines = [
        "# Audio Transcript",
        "",
        "Machine-generated transcript. Review before treating as final.",
        "",
    ]
    if not transcription.get("available"):
        lines.append(f"Transcription unavailable: {transcription.get('error', 'unknown error')}")
    else:
        for segment in transcription.get("segments", []):
            lines.append(f"- `{segment['start_label']}-{segment['end_label']}` {segment['text']}")
    (DOCS_DIR / "transcript.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_private_transcript_json(transcription: dict[str, Any]) -> None:
    (DATA_DIR / "audio-transcript-private.json").write_text(
        json.dumps(transcription, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def write_analysis_js(data: dict[str, Any]) -> None:
    js = "window.MOGURI_AUDIO_ANALYSIS = "
    js += json.dumps(data, ensure_ascii=False, indent=2)
    js += ";\n"
    (DATA_DIR / "audio-analysis.js").write_text(js, encoding="utf-8")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("usage: python scripts/analyze_audio.py source/audio/2.m4a")

    source = (ROOT / sys.argv[1]).resolve()
    if not source.exists():
        raise SystemExit(f"audio not found: {source}")

    DATA_DIR.mkdir(exist_ok=True)
    ASSETS_DIR.mkdir(exist_ok=True)
    DOCS_DIR.mkdir(exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    wav_path = TMP_DIR / "2.analysis.wav"
    make_wav(source, wav_path)
    probe = ffprobe(source)
    loudness = loudnorm(source)
    signal, blocks, envelope = analyze_signal(wav_path)
    transcription = transcribe(wav_path)
    transcript_summary = summarize_transcript(transcription.get("segments", []))
    segment_count = len(transcription.get("segments", []))

    stream = probe.get("streams", [{}])[0]
    fmt = probe.get("format", {})
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source_audio": {
            "local_path": "source/audio/2.m4a",
            "public_dropbox_url": "https://www.dropbox.com/scl/fi/dpdjhbh9eltkmtqnawxtc/2.m4a?rlkey=75pgvtqsuphonbvx8uaoyhhk2&st=7s2hl6vb&dl=0",
            "size_bytes": int(fmt.get("size", 0)),
            "format_name": fmt.get("format_name"),
            "codec_name": stream.get("codec_name"),
            "sample_rate": int(stream.get("sample_rate", 0)),
            "channels": int(stream.get("channels", 0)),
            "bit_rate": int(fmt.get("bit_rate", 0)),
            "creation_time": fmt.get("tags", {}).get("creation_time"),
        },
        "signal": signal,
        "loudness": loudness,
        "activity_blocks": blocks,
        "transcription": {
            "available": transcription.get("available", False),
            "model": transcription.get("model"),
            "language": transcription.get("language"),
            "language_probability": transcription.get("language_probability"),
            "duration": transcription.get("duration"),
            "segment_count": segment_count,
            "error": transcription.get("error"),
            "public_text_policy": "Full machine transcript is kept local-only until the member group approves publication.",
        },
        "transcript_summary": transcript_summary,
    }

    (DATA_DIR / "audio-analysis.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_analysis_js(data)
    write_waveform_svg(envelope, signal["duration_label"])
    write_transcript(transcription)
    write_private_transcript_json(transcription)
    print(json.dumps({"ok": True, "duration": signal["duration_label"], "segments": segment_count}, ensure_ascii=False))


if __name__ == "__main__":
    main()
