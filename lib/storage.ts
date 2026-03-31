import { AppData, CharacterState } from "@/types";

const STORAGE_KEY = "april_fools_love_sim_data";

export function getAppData(): AppData {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCharacterState(characterId: string): CharacterState {
  const data = getAppData();
  return data[characterId] ?? {
    affection: 0,
    messages: [],
    isCleared: false,
    endingShown: false,
  };
}

export function saveCharacterState(
  characterId: string,
  state: CharacterState
): void {
  const data = getAppData();
  data[characterId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAppData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
