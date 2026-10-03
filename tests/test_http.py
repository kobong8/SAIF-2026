import json
import socket
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen

import uvicorn

from main import app


class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.sock = socket.socket()
        cls.sock.bind(("127.0.0.1", 0))
        cls.base = f"http://127.0.0.1:{cls.sock.getsockname()[1]}"
        cls.server = uvicorn.Server(uvicorn.Config(app, log_level="error"))
        cls.thread = threading.Thread(target=cls.server.run, kwargs={"sockets": [cls.sock]}, daemon=True)
        cls.thread.start()
        deadline = time.monotonic() + 5
        while not cls.server.started:
            if time.monotonic() > deadline:
                cls.server.should_exit = True
                cls.thread.join(timeout=5)
                cls.sock.close()
                raise RuntimeError("Temporary test server did not start")
            time.sleep(0.02)

    @classmethod
    def tearDownClass(cls):
        cls.server.should_exit = True
        cls.thread.join(timeout=5)
        cls.sock.close()

    def test_current_deck_and_static_assets(self):
        with urlopen(self.base + "/api/slides", timeout=5) as response:
            data = json.load(response)
        self.assertEqual(len(data["slides"]), 79)
        self.assertEqual(len(data["speakers"]), 7)
        for path in ("/", "/static/app.js?v=8", "/static/style.css?v=8", "/slides.json", "/health"):
            with self.subTest(path=path), urlopen(self.base + path, timeout=5) as response:
                self.assertEqual(response.status, 200)
                self.assertTrue(response.read())

    def test_original_material_is_not_served(self):
        for path in ("/api/transcript", "/sources/transcript", "/sources/summary"):
            with self.subTest(path=path), self.assertRaises(HTTPError) as error:
                urlopen(self.base + path, timeout=5)
            self.assertEqual(error.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
