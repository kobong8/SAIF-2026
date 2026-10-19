# 테마

- 트랙 선택 화면과 슬라이드 상단의 다크 모드 / 라이트 모드 버튼 또는 `T` 키로 전환합니다.
- 기본값은 라이트 모드이며 `kobong-site-template`의 팔레트와 `kobong-theme` localStorage 키를 사용합니다. 동일한 도메인·포트에서 선택을 공유합니다.
- 슬라이드 이동과 발표 모드 전환 시 테마가 유지됩니다. 새로고침 시 CSS를 읽기 전에 저장된 값을 복원합니다.
- 검색창이 열려 있거나 입력·한글 조합 중이면 `T` 단축키를 실행하지 않습니다. 저장소가 차단되어도 현재 페이지의 전환은 동작합니다.
- 원본 HTML은 `static/index.html`입니다. 변경 후 `python build_pages.py`로 GitHub Pages용 `index.html`을 갱신합니다. FastAPI와 정적 배포에서 동일하게 동작합니다.

로컬 검증: `node --test tests/theme.test.mjs`. 이 저장소 정책에 따라 `tests/`는 Git 추적에서 제외됩니다. 브라우저에서 모바일 레이아웃과 실제 색상은 별도 확인이 필요합니다.
