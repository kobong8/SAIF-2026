import json
import unittest
from collections import Counter

from content import SLIDES, SPEAKERS, PROGRAM, speaker_metadata
from main import ROOT, app, slides


class PresentationTests(unittest.TestCase):
    def test_every_speaker_has_eleven_slides(self):
        counts = Counter(s["group"] for s in SLIDES)
        self.assertEqual(len(SPEAKERS), 7)
        self.assertEqual(len(SLIDES), 79)
        self.assertEqual(counts[0], 2)
        for group in range(1, 8):
            self.assertEqual(counts[group], 11)
            self.assertEqual([s["page"] for s in SLIDES if s["group"] == group], list(range(1, 12)))
            chapters = [s for s in SLIDES if s["group"] == group]
            self.assertEqual(chapters[0]["nav"], "요약")
            self.assertEqual(sum(s["nav"] == "요약" for s in chapters), 1)
        self.assertEqual(SLIDES[1]["title"], "요약")
        for speaker, (title, subtitle, affiliation) in zip(speaker_metadata(), PROGRAM, strict=True):
            self.assertEqual(speaker["topic"], title)
            self.assertEqual(speaker["affiliation"], affiliation)
            summary = next(s for s in SLIDES if s["group"] == speaker["id"])
            self.assertEqual(summary["subtitle"], subtitle)
            self.assertEqual(summary["title"], f"{title} · 요약")
            self.assertIn(affiliation, summary["section"])

    def test_slides_have_substantive_unique_content(self):
        self.assertEqual(len({s["title"] for s in SLIDES}), len(SLIDES))
        for s in SLIDES:
            self.assertGreaterEqual(len(s["cards"]), 3)
            self.assertTrue(all(len(c["points"]) >= 2 for c in s["cards"]))
            self.assertGreater(len(s["detail"]["text"]), 60)

    def test_requested_emphasis_and_chapter_endings(self):
        groups = {group: [s for s in SLIDES if s["group"] == group] for group in range(1, 8)}
        self.assertEqual([s["id"] for s in SLIDES], list(range(1, 80)))
        openai = json.dumps(groups[1], ensure_ascii=False)
        for text in ("챗봇은 질문에 답하고", "64%", "합산 출력 토큰", "108배", "영업·채용 41배", "26배", "개발 5배", "Plugins & Skills", "9% → 21%", "3% → 19%"):
            self.assertIn(text, openai)
        self.assertEqual(groups[2][-1]["nav"], "성공은 고객 경험")
        self.assertIn("얼마나 많은 토큰", groups[2][-1]["takeaway"])
        krishna = json.dumps(groups[3], ensure_ascii=False)
        for text in ("사진의 깊이가 어려운 이유", "겹친 쿠키", "깊이 지도", "Sketching"):
            self.assertIn(text, krishna)
        blog = groups[6][-1]
        self.assertEqual(blog["nav"], "Claude 기술 블로그")
        self.assertEqual(len(blog["detail"]["links"]), 3)
        self.assertTrue(all(link["url"].startswith("https://www.anthropic.com/engineering") for link in blog["detail"]["links"]))

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
