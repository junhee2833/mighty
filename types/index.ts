export type ChatMessage = {
  id: string;
  sender: "user" | "character";
  message: string;
  action?: string;
  affectionDelta?: number; // stored internally, never shown in UI
  createdAt: number;
};

export type Character = {
  id: string;
  name: string;
  profileImage: string;
  description: string;
  personality: string;
  speechStyle: string;
  funnyTrait: string;
  likeKeywords: string[];
  dislikeKeywords: string[];
  confessionLine: string;
  endingSubtitle: string;
};

export type CharacterState = {
  affection: number;
  messages: ChatMessage[];
  isCleared: boolean;
  endingShown?: boolean;
};

export type AppData = {
  [characterId: string]: CharacterState;
};
