# SAIF 2026 · 팀 공유 발표

이 문서의 명령은 저장소 루트 폴더에서 실행합니다. Markdown 문서는 `docs/`에 모아 관리합니다.

FastAPI로 실행되는 발표용 웹페이지입니다. 표지와 요약 2장, 발표자 7명 × 11장(발표 요약 1장 + 본문 10장)으로 **총 79장**입니다.

## GitHub Pages

**https://kobong8.github.io/SAIF-2026/** 에서 Python 서버 없이 발표 화면을 열 수 있습니다.

저장소의 **Settings → Pages → Deploy from a branch → main / (root)** 설정을 사용합니다. 루트의 `index.html`, `slides.json`, `static/`가 웹페이지를 구성하고 `.nojekyll`은 Jekyll 변환을 끕니다.

내용이나 HTML을 수정한 뒤 정적 파일을 갱신하고 함께 커밋·푸시합니다.

```powershell
python build_pages.py
git add content.py content_expanded.py static index.html slides.json .nojekyll
git commit -m "Update presentation"
git push
```

`build_pages.py`는 Python 기본 라이브러리만 사용합니다. FastAPI 설치는 로컬 서버를 실행할 때만 필요합니다.

## 설치와 실행

Windows PowerShell / Python 3.10 이상.

최초 설치 또는 의존성 변경 시:

```powershell
.\install.ps1
```

서버 실행:

```powershell
.\start.ps1
```

브라우저에서 **http://127.0.0.1:8930** 접속. 종료는 서버 터미널에서 `Ctrl+C`.

PowerShell 정책으로 `.ps1` 실행이 제한되면 다음 명령을 직접 실행합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8930
```

이미 서버가 실행 중이면 해당 창에서 `Ctrl+C`로 종료한 뒤 다시 시작하세요. 내용 변경 후에도 서버를 다시 시작하고 브라우저를 새로고침합니다. `start.ps1`은 설치를 수행하지 않으며 포트가 사용 중이면 안내를 표시합니다.

같은 내부 네트워크의 팀원에게 공유하려면:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8930
```

팀원은 `http://발표자PC의내부IP:8930`으로 접속합니다. 네트워크와 방화벽에서 연결을 허용해야 합니다. 별도 로그인 기능은 없습니다.

## 구성

| 발표자 | 장수 | 주요 내용 |
| --- | ---: | --- |
| Richard Ho | 11 | 에이전트, 대규모 탐색·검증, Jalapeño 설계, 커널 최적화, 조직 확산 |
| David Green | 11 | Learn·Unlearn·Retool, 개인 사례, 기업 사례, 실행 통제, 평가·확산 |
| Ranjay Krishna | 11 | 공간·움직임, Sketching, 시각적 근거, 행동 계획, 현장 적용 |
| 김윤형 | 11 | 모델 구조, 지속 학습, Attention, 문맥 압축, 온디바이스 |
| Ajaz Munsiff | 11 | 사업 전략, 과제 선정, 데이터, 하이브리드 실행, 운영·성과 |
| 최상근 | 11 | 위협 모델, 프롬프트 주입, 격리 환경, 다층 방어, 운영 검증 |
| 한재준 | 11 | R&D 흐름, 연구 데이터, 시뮬레이션, 플랫폼, 팀 실행 과제 |

각 발표의 첫 장은 핵심 개념·사례·수치·시사점을 4개 항목으로 상세히 정리한 요약입니다. 이어지는 본문 10장은 핵심 항목, 구체적인 사례·기술 설명, 핵심 메시지로 구성됩니다. 상세 요약은 화면 너비에 따라 2열 또는 1열로 표시되며, 내용이 길면 스크롤해서 읽을 수 있습니다.

## 발표 조작

- 왼쪽 발표자 목차를 펼쳐 원하는 장표로 이동합니다.
- 모바일에서는 상단 선택 목록으로 이동합니다.
- `←` `→`, `PageUp` `PageDown`, `Space`: 이동.
- `Home` / `End`: 처음 / 마지막.
- `F`: 발표 모드와 전체 화면. `Esc`: 종료.
- 하단 숫자로 현재 발표자의 다른 장표에 바로 이동할 수 있습니다.
- `#slide-8`처럼 주소를 공유하면 해당 장부터 열립니다.

타이머, 발표 대본, 자료 검색·다운로드 기능은 제공하지 않습니다. 외부 폰트·CDN·AI API 없이 동작합니다.

## 수정과 검증

`qa/`와 이미지·PDF·영상·압축 산출물은 `.gitignore`로 제외합니다. 검토용 파일은 로컬에 보관하고, 커밋에는 코드와 텍스트 자료를 포함합니다.

- `content.py`, `content_expanded.py`: 발표 내용과 발표자 목록.
- `static/`: 화면, 스타일, 키보드 이동 기능.
- `main.py`: 웹페이지와 발표 데이터 API.
- `install.ps1`: 가상환경 생성·패키지 설치.
- `start.ps1`: 포트 점검·8930 서버 실행.

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
node --check static/app.js
```

로컬 API: `/health`, `/api/slides`, `/slides.json`. 발표 화면에는 원본 자료 다운로드 기능이 없습니다.
