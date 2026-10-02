"""Exercise the real renderer for every slide, including the reported failures."""
import json
from html.parser import HTMLParser
import shutil
import subprocess
import unittest

from content import SLIDES
from main import ROOT


class SlideMarkup(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.direct_children = []
        self.article_classes = []
        self.card_grids = []
        self.cards = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get("class", "").split()
        if tag == "article":
            self.article_classes = classes
        if self.stack == ["article"]:
            self.direct_children.append((tag, classes))
        if "cards" in classes:
            self.card_grids.append((tag, list(self.stack)))
        if "card" in classes:
            self.cards += 1
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if not self.stack or self.stack[-1] != tag:
            raise AssertionError(f"Unbalanced markup: {tag}")
        self.stack.pop()


class LayoutTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which("node"), "Node is needed to exercise the JavaScript renderer")
    def test_all_79_slides_keep_the_card_grid_inside_the_article(self):
        # Use the application's content() function, not a duplicate renderer.
        harness = """
const fs = require('fs');
const vm = require('vm');
const deck = JSON.parse(fs.readFileSync(0, 'utf8'));
const source = fs.readFileSync('static/app.js', 'utf8').split('function render()')[0];
const result = vm.runInNewContext(source + '\\nslides = deck; slides.map(content);', {deck});
process.stdout.write(JSON.stringify(result));
"""
        result = subprocess.run(
            [shutil.which("node"), "-e", harness], cwd=ROOT,
            input=json.dumps(SLIDES, ensure_ascii=False), capture_output=True,
            text=True, encoding="utf-8", check=True,
        )
        for slide, markup in zip(SLIDES, json.loads(result.stdout), strict=True):
            with self.subTest(group=slide["group"], page=slide["page"]):
                parser = SlideMarkup()
                parser.feed(markup)
                self.assertEqual(parser.stack, [])
                self.assertEqual(parser.article_classes, ["slide", "slide--" + slide["kind"]])
                self.assertEqual(parser.card_grids, [("div", ["article"])])
                self.assertEqual(parser.cards, len(slide["cards"]))
                self.assertEqual([tag for tag, _ in parser.direct_children], ["div", "h1", "p", "div", "section", "div"])
                for link in slide["detail"].get("links", []):
                    self.assertIn('href="' + link["url"] + '"', markup)
                    self.assertIn('rel="noopener noreferrer"', markup)

    def test_layout_variants_and_removed_print_controls(self):
        css = (ROOT / "static/style.css").read_text(encoding="utf-8")
        js = (ROOT / "static/app.js").read_text(encoding="utf-8")
        html = (ROOT / "static/index.html").read_text(encoding="utf-8")
        self.assertIn('.slide{display:block;', css)
        self.assertIn('@container (max-width:700px)', css)
        for variant in ('hero', 'metrics', 'performance', 'flow', 'closing'):
            self.assertIn('.slide--' + variant, css)
        self.assertIn('<strong>${esc(speaker.topic)}</strong><small>${esc(speaker.name)}</small>', js)
        for removed in ('printButton', 'printDeck', 'window.print', '@media print', '인쇄 / PDF'):
            self.assertNotIn(removed, js + html + css)


if __name__ == "__main__":
    unittest.main()
