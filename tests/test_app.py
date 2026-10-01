import json
import unittest
from collections import Counter

from content import SLIDES, SPEAKERS
from main import ROOT, app, slides


class PresentationTests(unittest.TestCase):
    def test_every_speaker_has_five_slides(self):
        counts = Counter(s["group"] for s in SLIDES)
        self.assertEqual(len(SPEAKERS), 7)
        self.assertEqual(len(SLIDES), 37)
        self.assertEqual(counts[0], 2)
        for group in range(1, 8):
            self.assertEqual(counts[group], 5)
            self.assertEqual([s["page"] for s in SLIDES if s["group"] == group], [1, 2, 3, 4, 5])
        self.assertEqual(SLIDES[1]["title"], "요약")

    def test_slides_have_substantive_unique_content(self):
        self.assertEqual(len({s["title"] for s in SLIDES}), len(SLIDES))
        for s in SLIDES:
            self.assertGreaterEqual(len(s["cards"]), 3)
            self.assertTrue(all(len(c["points"]) >= 2 for c in s["cards"]))
            self.assertGreater(len(s["detail"]["text"]), 60)

    def test_removed_material_is_not_exposed(self):
        public_text = json.dumps(slides(), ensure_ascii=False)
        for filename in ("index.html", "app.js"):
            public_text += (ROOT / "static" / filename).read_text(encoding="utf-8")
        for removed in ("스크립트", "원문 확인", "원문확인", "1차 요약", "전사", "30분", "timerButton", "sourcesButton", "notesButton", "api/transcript"):
            # 전사 AI 전환 describes enterprise transformation, not transcription.
            if removed == "전사":
                self.assertNotIn("전사문", public_text)
            else:
                self.assertNotIn(removed, public_text)
        paths = {route.path for route in app.routes}
        self.assertNotIn("/api/transcript", paths)
        self.assertNotIn("/sources/{source}", paths)


if __name__ == "__main__":
    unittest.main()
