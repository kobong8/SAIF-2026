"""One catalog for the local API and the generated GitHub Pages data."""
from copy import deepcopy
from content_keynote import SLIDES as KEYNOTE_SLIDES, SPEAKERS as KEYNOTE_SPEAKERS
from content_track1 import SLIDES as TRACK1_SLIDES, SPEAKERS as TRACK1_SPEAKERS
from content_track2 import SLIDES as TRACK2_SLIDES, SPEAKERS as TRACK2_SPEAKERS


def compose_slides(track_slides, track_speakers):
    """Insert shared keynotes after the intro and assign display numbers."""
    slides = deepcopy([s for s in track_slides if s['group'] == 0] + KEYNOTE_SLIDES
                      + [s for s in track_slides if s['group'] != 0])
    pages = {}
    speakers = {speaker['id']: speaker for speaker in KEYNOTE_SPEAKERS + track_speakers}
    for index, slide in enumerate(slides, 1):
        group = slide['group']
        if group:
            speaker = speakers[group]
            slide['speaker'] = speaker['name']
            slide['section'] = f"{group:02d} · {speaker['name']} · {speaker['affiliation']}"
        pages[group] = pages.get(group, 0) + 1
        numbered = {'id': index}
        for key, value in slide.items():
            if key == 'nav':
                numbered['page'] = pages[group]
            numbered[key] = value
        slides[index - 1] = numbered
    return slides


SLIDES = compose_slides(TRACK2_SLIDES, TRACK2_SPEAKERS)
AI_SLIDES = compose_slides(TRACK1_SLIDES, TRACK1_SPEAKERS)
AX_SPEAKERS = KEYNOTE_SPEAKERS + TRACK2_SPEAKERS
AI_SPEAKERS = KEYNOTE_SPEAKERS + TRACK1_SPEAKERS


def presentation_data():
    return {
        "title": "삼성 AI 포럼 2026",
        # Preserve the existing API shape for consumers of the AX presentation.
        "speakers": AX_SPEAKERS,
        "slides": SLIDES,
        "tracks": {
            "ai-technology": {
                "name": "AI Technology", "label": "Keynote + Track 1",
                "question": "AI 기술은 어디까지 발전하고 있는가?",
                "summary": "목표를 수행하는 에이전트에서 출발해, 제한된 기기의 효율과 물리 세계의 행동을 살펴봅니다. 개인의 경험을 기억하고 기존 능력을 보존하며 배우는 기술로 이어집니다.",
                "conclusion": "다음 도약은 효율적인 실행, 현실에서의 검증, 경험을 보존하는 지속 학습을 함께 설계하는 데 있습니다.",
                "themes": "Efficient AI · Physical AI · Continual Learning",
                "speakers": AI_SPEAKERS, "slides": AI_SLIDES,
                "sessions": [
                    {"id": "efficient-ai", "name": "Efficient AI", "groups": [5, 6], "descriptions": [
                        "제한된 자원 안에서 최적의 사용자 경험을 구현하는 Efficient AI의 설계 원칙과 삼성의 기술적 접근을 소개",
                        "On-Device AI Platform의 3대 구성 요소인 Personal Data Engine (PDE), AI Models, Agent를 소개",
                    ]},
                    {"id": "physical-ai", "name": "Physical AI", "groups": [7, 8], "descriptions": [
                        "빠르게 변화하는 월드 모델의 동향을 조망하고, 삼성리서치의 초기 성과와 함께 그 가능성을 실현하기 위한 로드맵을 소개",
                        "로봇 파운데이션 모델의 현위치와 삼성 RX사업추진실의 전략",
                    ]},
                    {"id": "continual-learning", "name": "Continual Learning", "groups": [9, 10], "descriptions": [
                        "사용 경험을 토대로 스스로 성장하는 Self-evolving AI 기술과 삼성전자에서의 활용 방안을 소개",
                        "신뢰할 수 있는 메모리 편집, 효율적인 지식 컴파일, 망각 없는 지속 학습을 위한 세 가지 새로운 기법",
                    ]},
                ],
            },
            "ax-innovation": {
                "name": "AX Innovation", "label": "Keynote + Track 2",
                "question": "발전한 AI를 실제 산업에 어떻게 적용할 것인가?",
                "summary": "개인의 업무 위임을 팀과 기업의 성과로 확장합니다. 사업 목표와 데이터, 안전한 에이전트 운영을 연결하고 반도체 R&D의 탐색·판단·실행 흐름에 적용합니다.",
                "conclusion": "가치 있는 업무를 맡기고 결과를 검증하며, 데이터와 운영 책임을 갖춘 실행 방식을 조직의 자산으로 축적해야 합니다.",
                "themes": "Business Value · Trusted Agents · AI-native R&D",
                "speakers": AX_SPEAKERS, "slides": SLIDES,
            },
        },
    }
