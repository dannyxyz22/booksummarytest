"""Behavioral checks for editorial planning; fixtures do not test literary quality."""

import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "editorial_plan.py"
spec = importlib.util.spec_from_file_location("editorial_plan", SCRIPT)
planner = importlib.util.module_from_spec(spec)
sys.dont_write_bytecode = True
spec.loader.exec_module(planner)


class EditorialPlanTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "source.txt"
        self.source.write_text("\n".join(
            " ".join(f"orig{line}-{word}" for word in range(100))
            for line in range(10)), encoding="utf-8")
        self.sections = self.root / "sections.json"
        self.write_sections([
            {"id": "cap-01", "title": "Razão e fé", "start_line": 1, "end_line": 5},
            {"id": "cap-02", "title": "Conclusão", "start_line": 6, "end_line": 10},
        ])
        self.plan = self.root / "plan.json"
        self.drafts = self.root / "summaries"
        self.drafts.mkdir()
        self.parts = [" ".join(f"texto{part}-{i}" for i in range(100)) for part in range(2)]
        for i, part in enumerate(self.parts, 1):
            (self.drafts / f"cap-0{i}.md").write_text(part, encoding="utf-8")
        self.final = self.drafts / "final.md"
        self.final.write_text("\n\n".join(self.parts), encoding="utf-8")

    def write_sections(self, value):
        self.sections.write_text(json.dumps(value), encoding="utf-8")

    def run_cli(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), *map(str, args)],
                              capture_output=True, text=True, encoding="utf-8")

    def make_plan(self, *extra):
        return self.run_cli("plan", self.source, "--sections", self.sections,
                            "--output", self.plan, *extra)

    def check(self):
        return self.run_cli("check", self.plan, "--drafts", self.drafts, "--final", self.final)

    def test_plan_and_check_preserve_budget_without_claiming_fidelity(self):
        result = self.make_plan()
        self.assertEqual(result.returncode, 0, result.stderr)
        plan = json.loads(result.stdout)
        self.assertEqual((plan["min_words"], plan["target_words"], plan["max_words"]), (180, 200, 220))
        self.assertEqual(sum(s["target_words"] for s in plan["sections"]), 200)
        result = self.check()
        self.assertEqual(result.returncode, 0, result.stderr)
        checked = json.loads(result.stdout)
        self.assertTrue(checked["mechanical_checks_passed"])
        # Even meaningless synthetic text cannot be certified by word counts.
        self.assertTrue(checked["semantic_review_required"])

    def test_weights_redistribute_and_round_without_losing_words(self):
        sections = [{"source_words": 10, "weight": "1"},
                    {"source_words": 10, "weight": "2"},
                    {"source_words": 10, "weight": "1"}]
        allocated = planner.allocate(sections, 11)
        self.assertEqual(sum(allocated), 11)
        self.assertGreater(allocated[1], allocated[0])

    def test_gaps_overlaps_and_missing_end_are_rejected(self):
        for start, end in [(7, 10), (5, 10), (6, 9)]:
            with self.subTest(start=start, end=end):
                self.write_sections([
                    {"id": "a", "title": "A", "start_line": 1, "end_line": 5},
                    {"id": "b", "title": "B", "start_line": start, "end_line": end}])
                self.assertNotEqual(self.make_plan().returncode, 0)
                self.assertFalse(self.plan.exists())

    def test_missing_draft_fails_even_when_global_length_passes(self):
        self.assertEqual(self.make_plan().returncode, 0)
        (self.drafts / "cap-02.md").unlink()
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn("missing or empty draft", result.stdout)

    def test_short_final_fails(self):
        self.assertEqual(self.make_plan().returncode, 0)
        self.final.write_text("Resumo muito curto.", encoding="utf-8")
        self.assertEqual(self.check().returncode, 1)

    def test_source_change_invalidates_plan(self):
        self.assertEqual(self.make_plan().returncode, 0)
        with self.source.open("a", encoding="utf-8") as stream:
            stream.write("\nOutra passagem.")
        result = self.check()
        self.assertEqual(result.returncode, 1)
        self.assertIn("source changed", result.stderr)

    def test_plan_cannot_overwrite_existing_work(self):
        self.assertEqual(self.make_plan().returncode, 0)
        original = self.plan.read_bytes()
        self.assertEqual(self.make_plan().returncode, 1)
        self.assertEqual(self.plan.read_bytes(), original)

    def test_explicit_word_target_and_invalid_option_combinations(self):
        result = self.make_plan("--target-words", "300", "--word-tolerance", "15")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["min_words"], 285)
        for options in [("--ratio", "NaN"), ("--ratio", "0.2", "--tolerance", "-1"),
                        ("--word-tolerance", "10"), ("--target-words", "300", "--ratio", "0.2")]:
            with self.subTest(options=options):
                invalid = self.make_plan(*options)
                self.assertEqual(invalid.returncode, 1)
                self.assertNotIn("File exists", invalid.stderr)

    def test_technical_headings_fail_but_duplicates_are_review_warnings(self):
        self.assertEqual(self.make_plan().returncode, 0)
        self.final.write_text("## Batch 1\n\n" + "\n\n".join(self.parts), encoding="utf-8")
        self.assertEqual(self.check().returncode, 1)
        self.final.write_text(self.parts[0] + "\n\n" + self.parts[0], encoding="utf-8")
        result = json.loads(self.check().stdout)
        self.assertTrue(result["mechanical_checks_passed"])
        self.assertTrue(any("repeated" in warning for warning in result["warnings"]))

    def test_visible_word_count_ignores_link_destinations_and_video(self):
        text = "https://youtu.be/abcdefghijk\n\n# Fé e razão\n\n[graça atual](book:graca) e caridade.\n<!-- nota técnica -->"
        self.assertEqual(planner.editorial_words(text), 7)

    def test_duplicate_ids_and_unsafe_ids_fail(self):
        for sid in ["a", "../outside"]:
            self.write_sections([
                {"id": "a", "title": "A", "start_line": 1, "end_line": 5},
                {"id": sid, "title": "B", "start_line": 6, "end_line": 10}])
            self.assertEqual(self.make_plan().returncode, 1)

    def test_tampered_section_budget_fails(self):
        self.assertEqual(self.make_plan().returncode, 0)
        value = json.loads(self.plan.read_text(encoding="utf-8"))
        value["sections"][0]["target_words"] = 1
        self.plan.write_text(json.dumps(value), encoding="utf-8")
        self.assertEqual(self.check().returncode, 1)


if __name__ == "__main__":
    unittest.main()
