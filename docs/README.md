# SAIF 2026 · 팀 공유 발표

이 문서의 명령은 저장소 루트 폴더에서 실행합니다. Markdown 문서는 `docs/`에 모아 관리합니다.

SAIF 2026을 두 관점으로 읽는 발표용 웹페이지입니다. 첫 화면에서 **AI Technology(84장, 10명)** 또는 **AX Innovation(81장, 7명)**을 선택합니다. 공통 키노트 4명 × 11장은 동일한 콘텐츠를 재사용합니다. FastAPI 로컬 서버와 GitHub Pages 정적 배포를 모두 지원합니다.

편집 원칙, 출처 확인 사항, 검증 결과와 **AI Technology 84장 전체 목차·핵심 메시지**는 [Track 확장 작업 보고서](track-expansion.md)를 참고하세요.

## GitHub Pages

**https://kobong8.github.io/SAIF-2026/** 에서 Python 서버 없이 발표 화면을 열 수 있습니다.

저장소의 **Settings → Pages → Deploy from a branch → main / (root)** 설정을 사용합니다. 루트의 `index.html`, `slides.json`, `static/`가 웹페이지를 구성하고 `.nojekyll`은 Jekyll 변환을 끕니다.

내용이나 HTML을 수정한 뒤 정적 파일을 갱신하고 함께 커밋·푸시합니다.

```powershell
python build_pages.py
git add content_keynote.py content_track1.py content_track2.py tracks.py build_pages.py main.py static index.html slides.json .nojekyll docs scripts .gitignore
git commit -m "Update presentation"
git push
```

`build_pages.py`는 Python 기본 라이브러리만 사용합니다. FastAPI 설치는 로컬 서버를 실행할 때만 필요합니다.

현재 수정 작업은 `develop` 브랜치에 있습니다. Pages가 기존 문서의 `main / (root)` 설정을 사용한다면, 검토 후 `develop`의 변경을 `main`에 병합하고 푸시해야 공개 사이트에 반영됩니다. 이번 작업에서는 원격 푸시나 Pages 설정 변경을 수행하지 않았습니다.

주소는 `#/ai-technology/slide-1`, `#/ax-innovation/slide-1` 형식입니다. 해시 뒤의 경로는 서버에 전달되지 않아 저장소 하위 경로와 새로고침을 지원합니다. `#/`는 트랙 선택 화면입니다. 예전 AX 전용 `#slide-8`은 도입부 2장 추가를 보정해 같은 내용인 현재 AX 10장으로 연결됩니다.

랜딩의 `발표 정리 자료 보기`는 도입부터 시작합니다. 그 아래 `키노트 건너 뛰기`는 두 Track 모두 **05번 발표의 요약(전체 49장)**으로 바로 이동합니다. 링크 위치는 장표 번호를 고정하지 않고 05번 발표 데이터를 찾아 결정합니다.

두 Track의 첫 4장은 **핵심 질문 → 발표의 흐름 → What We Learned → Final Takeaway**로 통일했습니다. 종합 관점을 먼저 읽고 01번부터 발표별 내용을 확인하는 순서입니다.

## 설치와 실행

Windows PowerShell / Python 3.10 이상.

최초 설치 또는 의존성 변경 시:

```powershell
.\scripts\install.ps1
```

서버 실행:

```powershell
.\scripts\start.ps1
```

브라우저에서 **http://127.0.0.1:8930** 접속. 종료는 서버 터미널에서 `Ctrl+C`.

PowerShell 정책으로 `.ps1` 실행이 제한되면 다음 명령을 직접 실행합니다.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8930
```

이미 서버가 실행 중이면 해당 창에서 `Ctrl+C`로 종료한 뒤 다시 시작하세요. 내용 변경 후에도 서버를 다시 시작하고 브라우저를 새로고침합니다. `scripts/start.ps1`은 설치를 수행하지 않으며 포트가 사용 중이면 안내를 표시합니다.

같은 내부 네트워크의 팀원에게 공유하려면:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8930
```

팀원은 `http://발표자PC의내부IP:8930`으로 접속합니다. 네트워크와 방화벽에서 연결을 허용해야 합니다. 별도 로그인 기능은 없습니다.

## AX Innovation 구성

| 발표자 | 장수 | 주요 내용 |
| --- | ---: | --- |
| Richard Ho | 11 | 에이전트, 대규모 탐색·검증, Jalapeño 설계, 커널 최적화, 조직 확산 |
| David Green | 11 | Learn·Unlearn·Retool, 개인 사례, 기업 사례, 실행 통제, 평가·확산 |
| Ranjay Krishna | 11 | 공간·움직임, Sketching, 시각적 근거, 행동 계획, 현장 적용 |
| 김윤형 | 11 | 모델 구조, 지속 학습, Attention, 문맥 압축, 온디바이스 |
| Ajaz Munsiff | 11 | 사업 전략, 과제 선정, 데이터, 하이브리드 실행, 운영·성과 |
| 최상근 | 11 | 위협 모델, 프롬프트 주입, 격리 환경, 다층 방어, 운영 검증 |
| 한재준 | 11 | R&D 흐름, 연구 데이터, 시뮬레이션, 플랫폼, 팀 실행 과제 |

도입 4장과 위 발표자 7명 × 11장으로 총 81장입니다. 발표자별 77장의 내용과 순서는 유지했습니다.

각 발표의 첫 장은 핵심 개념·사례·수치·시사점을 4개 항목으로 상세히 정리한 요약입니다. 이어지는 본문 10장은 핵심 항목, 구체적인 사례·기술 설명, 핵심 메시지로 구성됩니다. 상세 요약은 화면 너비에 따라 2열 또는 1열로 표시되며, 내용이 길면 스크롤해서 읽을 수 있습니다.

## AI Technology 구성

| 순서 | 발표자 / 구분 | 장수 | 주요 내용 |
| --- | --- | ---: | --- |
| 도입 | 핵심 질문·발표 흐름·What We Learned·Final Takeaway | 4 | 실행 → 효율 → 물리 세계 → 지속 학습 |
| Keynote | Richard Ho · David Green · Ranjay Krishna · 김윤형 | 44 | 기존 공통 키노트 전체 재사용 |
| Session 1 | 황인철 | 6 | 자원 제약, Right Context, Light Computation, TTT, 하이브리드 실행 |
| Session 1 | 이윤수 | 6 | PDE · AI Models · Agent, Action Framework, UX, 프라이버시 |
| Session 2 | Timothy Hospedales | 6 | 개입 기반 예측, 장기 계획, Metro, 반응과 숙고 |
| Session 2 | Kris Hauser | 6 | 3계층 제어, 신뢰성·비용, 맞춤화, 지각 계층, 단계적 확장 |
| Session 3 | 이강욱 | 6 | 비모수적·파라미터 적응, 피드백, 프라이버시, 망각·퇴행 |
| Session 3 | Juan Carlos Niebles | 6 | 개인 기억, TrustMe, Doc-to-Atom, NB-LoRA, 기억 배치 |

05~10 강연은 각각 **요약 1장 + 본문 5장**입니다. 기술별 설명을 나누고 팀 적용 관점을 구분해 확장했습니다. 한국어 자동 자막 누락 구간은 제공 요약과 공식 프로그램을 근거로 재구성했습니다. 출처 메타데이터와 확인 사항은 데이터·문서에 보존하되 화면 하단의 `자료 근거:` 문구는 표시하지 않습니다.

## 발표 조작

- 왼쪽 발표자 목차를 펼쳐 원하는 장표로 이동합니다.
- 발표자가 바뀌면 목차가 해당 발표자 제목으로 자동 스크롤됩니다. 키노트 건너뛰기·직접 링크·발표 모드 종료에도 적용되며, 같은 발표 안에서는 현재 장표가 목차 밖으로 벗어날 때만 위치를 조정합니다.
- 모바일에서는 상단 선택 목록으로 이동합니다.
- `←` `→`, `PageUp` `PageDown`, `Space`: 이동.
- `Home` / `End`: 처음 / 마지막.
- `F`: 발표 모드와 전체 화면. `Esc`: 종료.
- 상단 `← SAIF 2026 Tracks` 또는 좌측 로고로 트랙 선택 화면에 돌아갑니다. 발표 모드에서도 상단 링크를 사용할 수 있습니다.
- 하단 숫자로 현재 발표자의 다른 장표에 바로 이동할 수 있습니다.
- 현재 장은 `#/ai-technology/slide-49`처럼 Track을 포함한 주소로 공유합니다.

타이머, 발표 대본, 자료 검색·다운로드 기능은 제공하지 않습니다. 외부 폰트·CDN·AI API 없이 동작합니다.

## 수정과 검증

`tests/`, `test/`, `__tests__/`, 테스트 파일 패턴, 테스트 캐시·보고서, `qa/`와 이미지·PDF·영상·압축 산출물은 `.gitignore`로 제외합니다. 기존 테스트 4개도 Git 추적에서 제외하고 로컬에 보존했습니다. 원본 TXT와 `.venv/`도 로컬 전용입니다. 실행·정적 빌드에 필요한 Python 코드, 의존성 목록, 실행 스크립트, HTML/CSS/JS와 `slides.json`은 계속 버전 관리합니다.

- `content_keynote.py`: 공통 키노트 01–04의 발표자 정보와 슬라이드. 수정하면 두 Track에 함께 반영됩니다.
- `content_track1.py`: Track 1 / AI Technology의 도입부 4장과 발표 05–10.
- `content_track2.py`: Track 2 / AX Innovation의 도입부 4장과 발표 05–07.
- `tracks.py`: 트랙 소개·선택 카드와 두 발표 데이터의 공통 카탈로그.
- `static/`: 화면, 스타일, 키보드 이동 기능.
- `main.py`: 웹페이지와 발표 데이터 API.
- `scripts/install.ps1`: 가상환경 생성·패키지 설치.
- `scripts/start.ps1`: 포트 점검·8930 서버 실행.

내용 파일의 `SPEAKERS`는 목차의 발표자 정보이고, `SLIDES`는 화면 순서대로 배치된 슬라이드입니다. `title`은 제목, `subtitle`은 부제, `cards`는 본문 카드, `detail`은 하단 설명, `takeaway`는 핵심 메시지입니다. `group`은 발표 번호이며 전체 페이지와 발표 안의 페이지 번호는 자동 계산됩니다.

표현을 수정한 뒤 `python build_pages.py`를 실행하세요. `slides.json`과 루트 `index.html`은 생성 파일이므로 직접 수정하지 않습니다. HTML 원본은 `static/index.html`입니다.

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
node --check static/app.js
# 로컬 검증 파일과 Playwright가 설치된 환경에서:
.\.venv\Scripts\python.exe tests/check_tracks_browser.py
```

테스트 파일은 로컬 전용이므로 새 clone에는 포함되지 않습니다. 브라우저 검증 스크립트는 설치된 Edge를 headless로 사용하며, 결과와 스크린샷은 `qa/`에 저장합니다. Playwright는 검증용으로만 설치하며 실행 의존성에 추가하지 않습니다.

로컬 API: `/health`, `/api/slides`, `/slides.json`. 발표 데이터의 `tracks`에 두 Track이 있고, 기존 호환용 `slides`·`speakers`는 AX 자료를 제공합니다. `/health`의 `slides`는 현재 AX 장수(81)입니다. 발표 화면에는 원본 자료 다운로드 기능이 없습니다.
# Track 1 주제별 목차

Track 1은 Efficient AI(05–06), Physical AI(07–08), Continual Learning(09–10)의 세 주제 아래 발표 두 개씩 구성합니다. 목차는 주제와 발표 제목으로 표시하며, 주제 아래 발표를 펼쳐 슬라이드로 이동할 수 있습니다. 페이지 이동과 키노트 건너뛰기 시 현재 주제와 발표가 자동으로 펼쳐지고 목차 스크롤이 따라갑니다. 모바일 발표 이동 메뉴도 같은 주제로 묶습니다.
