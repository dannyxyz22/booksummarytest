"""Plan section budgets and check long summaries. No model calls or publication.

All line ranges are inclusive, 1-based, and refer to the frozen UTF-8 source.
Mechanical success is NOT a judgment of fidelity or theological accuracy.
"""

import argparse
from collections import Counter
from decimal import Decimal, ROUND_CEILING, ROUND_FLOOR, ROUND_HALF_UP
import hashlib
import json
import os
from pathlib import Path
import re
import sys


def read_text(path):
    return Path(path).read_text(encoding="utf-8-sig")


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def prose(text):
    """Approximate visible editorial text; not a general Markdown renderer."""
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"https?://\S+", "", text)
    return text


def words(text):
    return sum(any(char.isalnum() for char in token) for token in text.split())


def editorial_words(text):
    return words(prose(text))


def number(value, label):
    result = Decimal(str(value))
    if not result.is_finite():
        raise ValueError(f"{label} must be finite")
    return result


def integer(value, label):
    if type(value) is not int:
        raise ValueError(f"{label} must be an integer")
    return value


def normalize_sections(spec, lines):
    if not isinstance(spec, list) or not spec:
        raise ValueError("sections must be a nonempty JSON array")
    expected = 1
    seen = set()
    sections = []
    for section in spec:
        sid = section["id"]
        if not isinstance(sid, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", sid):
            raise ValueError("section id must be a lowercase slug")
        if sid in seen:
            raise ValueError(f"duplicate section id: {sid}")
        seen.add(sid)
        title = section["title"]
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"empty title: {sid}")
        start = integer(section["start_line"], "start_line")
        end = integer(section["end_line"], "end_line")
        if start != expected or end < start or end > len(lines):
            raise ValueError(f"{sid}: gaps, overlaps or invalid source range; expected line {expected}")
        count = words("\n".join(lines[start - 1:end]))
        if not count:
            raise ValueError(f"{sid}: empty section")
        weight = number(section.get("weight", 1), "weight")
        if weight <= 0:
            raise ValueError("weight must be positive")
        sections.append({"id": sid, "title": title, "start_line": start,
                         "end_line": end, "source_words": count, "weight": str(weight)})
        expected = end + 1
    if expected != len(lines) + 1:
        raise ValueError("sections do not cover the end of the source")
    return sections


def allocate(sections, total):
    scores = [Decimal(s["source_words"]) * Decimal(s["weight"]) for s in sections]
    exact = [score * total / sum(scores) for score in scores]
    quotas = [int(x.to_integral_value(rounding=ROUND_FLOOR)) for x in exact]
    order = sorted(range(len(exact)), key=lambda i: exact[i] - quotas[i], reverse=True)
    for i in order[:total - sum(quotas)]:
        quotas[i] += 1
    if any(q <= 0 for q in quotas):
        raise ValueError("target too small for the section map; regroup sections or increase target")
    return quotas


def create_plan(args):
    source = args.source.resolve()
    lines = read_text(source).splitlines()
    sections = normalize_sections(json.loads(read_text(args.sections)), lines)
    source_words = sum(s["source_words"] for s in sections)
    if args.target_words is not None:
        if args.ratio is not None or args.tolerance is not None:
            raise ValueError("use target-words/word-tolerance OR ratio/tolerance")
        target = args.target_words
        tolerance = args.word_tolerance if args.word_tolerance is not None else round(target * 0.10)
        minimum, maximum = target - tolerance, target + tolerance
        mode = "words"
    else:
        if args.word_tolerance is not None:
            raise ValueError("word-tolerance requires target-words")
        ratio = number(args.ratio if args.ratio is not None else "0.20", "ratio")
        tolerance = number(args.tolerance if args.tolerance is not None else "0.02", "tolerance")
        if not 0 < ratio < 1 or not 0 <= tolerance < ratio or ratio + tolerance >= 1:
            raise ValueError("require 0 < ratio < 1 and 0 <= tolerance < ratio, with ratio+tolerance < 1")
        target = int((source_words * ratio).to_integral_value(rounding=ROUND_HALF_UP))
        minimum = int((source_words * (ratio - tolerance)).to_integral_value(rounding=ROUND_CEILING))
        maximum = int((source_words * (ratio + tolerance)).to_integral_value(rounding=ROUND_FLOOR))
        mode = "ratio"
    if not 0 < minimum <= target <= maximum < source_words:
        raise ValueError("require 0 < minimum <= target <= maximum < source words")
    for section, quota in zip(sections, allocate(sections, target)):
        section["target_words"] = quota
    plan = {"version": 1, "source": os.path.relpath(source, args.output.resolve().parent),
            "source_sha256": digest(source), "source_words": source_words,
            "mode": mode, "target_words": target, "min_words": minimum,
            "max_words": maximum, "sections": sections}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # Refuse to overwrite an existing plan and its associated work.
    with args.output.open("x", encoding="utf-8") as stream:
        json.dump(plan, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    return plan


def check_plan(args):
    plan = json.loads(read_text(args.plan))
    if plan["version"] != 1:
        raise ValueError("unsupported plan version")
    source = (args.plan.resolve().parent / plan["source"]).resolve()
    if digest(source) != plan["source_sha256"]:
        raise ValueError("source changed since planning; review exclusions and regenerate a versioned plan")
    sections = normalize_sections(plan["sections"], read_text(source).splitlines())
    total = sum(s["source_words"] for s in sections)
    if total != plan["source_words"]:
        raise ValueError("source word count does not match plan")
    target, minimum, maximum = (integer(plan[key], key) for key in ("target_words", "min_words", "max_words"))
    if not 0 < minimum <= target <= maximum < total:
        raise ValueError("invalid plan budget")
    quotas = [integer(s["target_words"], "section target_words") for s in plan["sections"]]
    if any(q <= 0 for q in quotas) or sum(quotas) != target:
        raise ValueError("section budgets must be positive and sum to the total target")
    failures, warnings, counts = [], [], []
    for section, quota in zip(sections, quotas):
        draft = args.drafts / f"{section['id']}.md"
        count = editorial_words(read_text(draft)) if draft.is_file() else 0
        if not count:
            failures.append(f"missing or empty draft: {section['id']}")
        elif not quota * 0.8 <= count <= quota * 1.2:
            warnings.append(f"review local budget: {section['id']} ({count}/{quota})")
        counts.append({"id": section["id"], "words": count, "target_words": quota})
    final = read_text(args.final)
    count = editorial_words(final)
    if not minimum <= count <= maximum:
        failures.append(f"final length {count} is outside {minimum}..{maximum}")
    # Limited heuristics: findings require editorial inspection, not automatic deletion.
    if re.search(r"^#{1,6}\s+(?:batch|lote)\s*[_#-]?\s*\d", final, re.I | re.M):
        failures.append("final contains technical batch/lote headings")
    paragraphs = [" ".join(prose(p).lower().split()) for p in re.split(r"\n\s*\n", final)]
    repeated = sum(n - 1 for p, n in Counter(paragraphs).items() if words(p) >= 12 and n > 1)
    if repeated:
        warnings.append(f"repeated long paragraphs: {repeated}; check whether intentional")
    return {"mechanical_checks_passed": not failures, "semantic_review_required": True,
            "source_sha256": plan["source_sha256"], "final_sha256": digest(args.final),
            "source_words": total, "final_words": count, "ratio": count / total,
            "min_words": minimum, "max_words": maximum, "sections": counts,
            "failures": failures, "warnings": warnings}


def main():
    # Keep machine-readable output stable in Windows terminals and redirected pipes.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    plan = sub.add_parser("plan", help="Allocate a word budget across a complete source map")
    plan.add_argument("source", type=Path)
    plan.add_argument("--sections", type=Path, required=True)
    plan.add_argument("--output", type=Path, required=True)
    plan.add_argument("--ratio")
    plan.add_argument("--tolerance")
    plan.add_argument("--target-words", type=int)
    plan.add_argument("--word-tolerance", type=int)
    check = sub.add_parser("check", help="Check drafts and final length; does not certify meaning")
    check.add_argument("plan", type=Path)
    check.add_argument("--drafts", type=Path, required=True)
    check.add_argument("--final", type=Path, required=True)
    args = parser.parse_args()
    try:
        result = create_plan(args) if args.command == "plan" else check_plan(args)
    except (OSError, ValueError, KeyError, TypeError, ArithmeticError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result.get("mechanical_checks_passed", True) else 1


if __name__ == "__main__":
    raise SystemExit(main())
