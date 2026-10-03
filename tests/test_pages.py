import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import unittest
from urllib.parse import urljoin
from urllib.request import urlopen

from main import ROOT, slides


class PagesHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if not self.path.startswith('/SAIF-2026/'):
            self.send_error(404)
            return
        self.path = self.path[len('/SAIF-2026'):]
        super().do_GET()

    def log_message(self, *args):
        pass


class PagesTests(unittest.TestCase):
    def test_generated_files_match_current_content(self):
        self.assertEqual((ROOT / 'index.html').read_bytes(), (ROOT / 'static/index.html').read_bytes())
        self.assertEqual(json.loads((ROOT / 'slides.json').read_text(encoding='utf-8')), slides())
        self.assertTrue((ROOT / '.nojekyll').is_file())

    def test_static_site_under_repository_subpath(self):
        server = ThreadingHTTPServer(('127.0.0.1', 0), partial(PagesHandler, directory=str(ROOT)))
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            base = f'http://127.0.0.1:{server.server_port}/SAIF-2026/'
            with urlopen(base, timeout=5) as response:
                html = response.read().decode('utf-8')
            self.assertIn('id="slide"', html)
            for file in ('./static/style.css?v=8', './static/app.js?v=8'):
                self.assertIn(file, html)
                with urlopen(urljoin(base, file), timeout=5) as response:
                    self.assertEqual(response.status, 200)
            with urlopen(urljoin(base, './slides.json'), timeout=5) as response:
                self.assertEqual(len(json.load(response)['slides']), 79)
            js = (ROOT / 'static/app.js').read_text(encoding='utf-8')
            self.assertIn("fetch('./slides.json'", js)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


if __name__ == '__main__':
    unittest.main()
