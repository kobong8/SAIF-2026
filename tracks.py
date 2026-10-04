"""One catalog for the local API and the generated GitHub Pages data."""
from content import SLIDES, speaker_metadata
from content_technology import SLIDES as AI_SLIDES, SPEAKERS as AI_SPEAKERS


def presentation_data():
    return {
        "title": "삼성 AI 포럼 2026",
        # Preserve the existing API shape for consumers of the AX presentation.
        "speakers": speaker_metadata(),
        "slides": SLIDES,
        "tracks": {
            "ai-technology": {
                "name": "AI Technology", "label": "Keynote + Track 1",
                "question": "AI 기술은 어디까지 발전하고 있는가?",
                "summary": "목표를 수행하는 에이전트에서 출발해, 제한된 기기의 효율과 물리 세계의 행동을 살펴봅니다. 개인의 경험을 기억하고 기존 능력을 보존하며 배우는 기술로 이어집니다.",
                "conclusion": "다음 도약은 효율적인 실행, 현실에서의 검증, 경험을 보존하는 지속 학습을 함께 설계하는 데 있습니다.",
                "themes": "Efficient AI · Physical AI · Continual Learning",
                "speakers": AI_SPEAKERS, "slides": AI_SLIDES,
            },
            "ax-innovation": {
                "name": "AX Innovation", "label": "Keynote + Track 2",
                "question": "발전한 AI를 실제 산업에 어떻게 적용할 것인가?",
                "summary": "개인의 업무 위임을 팀과 기업의 성과로 확장합니다. 사업 목표와 데이터, 안전한 에이전트 운영을 연결하고 반도체 R&D의 탐색·판단·실행 흐름에 적용합니다.",
                "conclusion": "가치 있는 업무를 맡기고 결과를 검증하며, 데이터와 운영 책임을 갖춘 실행 방식을 조직의 자산으로 축적해야 합니다.",
                "themes": "Business Value · Trusted Agents · AI-native R&D",
                "speakers": speaker_metadata(), "slides": SLIDES,
            },
        },
    }
