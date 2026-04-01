import { Character } from "@/types";

export function calculateAffectionDelta(
  message: string,
  character: Character
): number {
  let delta = Math.floor(Math.random() * 6) + 5; // base 5~10 per exchange
  const lower = message.toLowerCase();

  // 좋아하는 단어가 하나라도 포함되면 큰 버프
  const hasLike = character.likeKeywords.some((keyword) =>
    lower.includes(keyword.toLowerCase())
  );
  if (hasLike) {
    delta += 25;
  }

  for (const keyword of character.dislikeKeywords) {
    if (lower.includes(keyword.toLowerCase())) {
      delta -= 8;
    }
  }

  return delta;
}

export function clampAffection(value: number): number {
  return Math.max(0, Math.min(100, value));
}
