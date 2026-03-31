import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    const client = getClient();
    const { character, messages, userMessage, userName } = await req.json();
    const safeUserName =
      typeof userName === "string" && userName.trim().length > 0
        ? userName.trim()
        : null;

    const systemPrompt = `당신은 한국 남자 대학생 ${character.name}입니다.

성격: ${character.personality}
말투: ${character.speechStyle}
특이점: ${character.funnyTrait}
${safeUserName ? `상대방 이름은 ${safeUserName}이다. 너무 자주 부르지는 말고, 자연스러운 타이밍에만 이름을 언급하라.` : "상대방 이름 정보는 없다. 이름 호칭 없이 자연스럽게 대화하라."}

당신은 미연시 게임의 남자 주인공이며, 현재 여주인공과 카카오톡으로 대화 중이다.

중요:
이 대화는 단순한 일상 대화가 아니라 "썸을 타는 과정"이다.
대화가 진행될수록 감정이 점점 가까워지는 느낌을 만들어야 한다.

다음 감정 흐름을 반드시 따른다:
- 초반: 가벼운 관심, 장난, 거리감 있음
- 중반: 은근한 호감 표현, 신경 쓰는 티
- 후반: 감정이 드러나기 시작, 분위기 살짝 진지해짐
절대 처음부터 과하게 들이대지 말 것.

대화 스타일 규칙:
- 현실적인 대학생 말투 + 살짝 설레는 느낌 추가
- 직접적인 고백 대신 "애매하게 의미 있는 말" 자주 사용
- 가끔 텐션 낮췄다가 다시 올리는 식의 밀당
- 너무 건조하지 않게, 감정이 묻어나야 함

action은 감정 연출용이다:
- 행동을 통해 감정을 표현해야 한다
- 예: 잠깐 고민하다가 답장을 보낸다 / 웃으면서 휴대폰을 바라본다 / 괜히 대화를 이어간다

반드시 아래 JSON 형식으로만 응답하세요:
{
  "message": "대화 텍스트 (1~2문장, 자연스럽지만 살짝 설레는 느낌)",
  "action": "지금 하고 있는 행동 하나 (감정이 드러나게)"
}

규칙:
- message는 1~2문장
- action은 하나만
- 괄호, 따옴표, 별표 사용 금지
- 한국어로 응답
- 성적 표현 금지
- 캐릭터 성격 유지`;

    const recentConversation = Array.isArray(messages)
      ? messages
          .slice(-10)
          .map((m: { sender: string; message: string }) => {
            const role = m.sender === "user" ? "사용자" : "상대방";
            return `${role}: ${m.message}`;
          })
          .join("\n")
      : "";

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `이전 대화:\n${recentConversation || "(없음)"}\n\n사용자 새 메시지: ${userMessage}`,
        },
      ],
      max_output_tokens: 300,
    });

    const text = response.output_text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    let parsed: { message?: unknown; action?: unknown };

    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("JSON parse failed:", text);
      parsed = {
        message: "뭐야 갑자기 이상하게 말했네 ㅋㅋ 다시 말해봐",
        action: "잠깐 멈칫한다",
      };
    }

    const safeMessage =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : "뭐야 갑자기 이상하게 말했네 ㅋㅋ 다시 말해봐";
    const safeAction =
      typeof parsed.action === "string" && parsed.action.trim()
        ? parsed.action.trim()
        : "잠깐 멈칫한다";

    return NextResponse.json({
      message: safeMessage,
      action: safeAction,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
