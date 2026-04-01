import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { characters } from "@/data/characters";

export const runtime = "nodejs";

const FALLBACK = {
  message: "뭐야 갑자기 이상하게 말했네 ㅋㅋ 다시 말해봐",
  action: "잠깐 멈칫한다",
};

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 1,
    timeout: 12_000,
  });
}

const RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "chat_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
        action: { type: "string" },
      },
      required: ["message", "action"],
      additionalProperties: false,
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, messages, userMessage, userName } = body;

    if (typeof characterId !== "string" || !characterId) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const character = characters.find((c) => c.id === characterId);
    if (!character) {
      return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다." }, { status: 404 });
    }

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

message 필드: 카카오톡 메시지 텍스트 (1~2문장, 자연스럽지만 살짝 설레는 느낌)
action 필드: 지금 하고 있는 행동 하나 (감정이 드러나게, 한 문장)

규칙:
- 한국어로만 응답
- 성적 표현 금지
- 캐릭터 성격 유지`;

    const recentMessages: OpenAI.Chat.ChatCompletionMessageParam[] = Array.isArray(messages)
      ? messages
          .slice(-10)
          .filter(
            (m: { sender: string; message: string }) =>
              typeof m.message === "string" && m.message.trim().length > 0
          )
          .map((m: { sender: string; message: string }) => ({
            role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
            content: m.message.trim(),
          }))
      : [];

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentMessages,
        { role: "user", content: userMessage },
      ],
      response_format: RESPONSE_FORMAT,
      max_tokens: 500,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";

    try {
      const parsed = JSON.parse(text);
      const message =
        typeof parsed.message === "string" && parsed.message.trim()
          ? parsed.message.trim()
          : null;

      if (!message) {
        console.error("Structured output missing message field:", text.slice(0, 200));
        return NextResponse.json(FALLBACK);
      }

      return NextResponse.json({
        message,
        action: typeof parsed.action === "string" ? parsed.action.trim() : "",
      });
    } catch {
      console.error("Structured output parse error:", text.slice(0, 200));
      return NextResponse.json(FALLBACK);
    }
  } catch (error: unknown) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI APIError:", error.status, error.code, error.message);
    } else {
      console.error("Chat API error:", error);
    }
    return NextResponse.json(FALLBACK);
  }
}
