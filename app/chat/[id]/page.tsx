"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { characters } from "@/data/characters";
import { getCharacterState, saveCharacterState } from "@/lib/storage";
import { getUserName } from "@/lib/user";
import { calculateAffectionDelta, clampAffection } from "@/lib/affection";
import { ChatMessage, Character, CharacterState } from "@/types";
import ChatBubble from "@/components/ChatBubble";
import SuccessModal from "@/components/SuccessModal";

const THEMES: Record<string, { gradient: string; barColor: string }> = {
  junhyuk: { gradient: "linear-gradient(160deg, #2e1065 0%, #1e1b4b 60%, #111827 100%)", barColor: "bg-violet-500" },
  seojin:  { gradient: "linear-gradient(160deg, #431407 0%, #7c2d12 60%, #111827 100%)", barColor: "bg-amber-500" },
  dohyun:  { gradient: "linear-gradient(160deg, #042f2e 0%, #134e4a 60%, #111827 100%)", barColor: "bg-teal-500" },
  yuna:    { gradient: "linear-gradient(160deg, #312e81 0%, #1e1b4b 55%, #020617 100%)", barColor: "bg-indigo-400" },
  minho:   { gradient: "linear-gradient(160deg, #022c22 0%, #166534 55%, #052e16 100%)", barColor: "bg-emerald-500" },
  hyeri:   { gradient: "linear-gradient(160deg, #4a044e 0%, #86198f 55%, #020617 100%)", barColor: "bg-fuchsia-500" },
};
const DEFAULT_THEME = THEMES.junhyuk;

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const character = characters.find((c) => c.id === id);
  const theme = THEMES[id ?? ""] ?? DEFAULT_THEME;
  const isImage = character?.profileImage.startsWith("/") || character?.profileImage.endsWith(".png");

  const [state, setState] = useState<CharacterState>({ affection: 0, messages: [], isCleared: false });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasShownSuccessRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!character) return;
    const loaded = getCharacterState(character.id);
    setState(loaded);
    stateRef.current = loaded;
    if (loaded.endingShown || loaded.isCleared) hasShownSuccessRef.current = true;
  }, [character]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">캐릭터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  async function sendMessage() {
    if (!character || !input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      message: userText,
      createdAt: Date.now(),
    };

    const snapshot = stateRef.current;
    const messagesWithUser = [...snapshot.messages, userMessage];
    setState((prev) => ({ ...prev, messages: messagesWithUser }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          messages: snapshot.messages.slice(-10).map((m) => ({
            sender: m.sender,
            message: m.message,
          })),
          userMessage: userText,
          userName: getUserName() ?? undefined,
        }),
      });

      if (!res.ok) throw new Error("API 오류");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const delta = snapshot.isCleared ? 0 : calculateAffectionDelta(userText, character);
      const newAffection = snapshot.isCleared
        ? snapshot.affection
        : clampAffection(snapshot.affection + delta);

      const charMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "character",
        message: data.message ?? "",
        action: data.action ?? undefined,
        affectionDelta: delta, // stored internally, never shown
        createdAt: Date.now(),
      };

      const newMessages = [...messagesWithUser, charMessage];
      const justCleared = !snapshot.isCleared && newAffection >= 100;
      const isCleared = snapshot.isCleared || newAffection >= 100;
      const endingShown = snapshot.endingShown || justCleared;

      const newState: CharacterState = {
        affection: newAffection,
        messages: newMessages,
        isCleared,
        endingShown,
      };
      setState(newState);
      saveCharacterState(character.id, newState);

      if (justCleared && !snapshot.endingShown && !hasShownSuccessRef.current) {
        hasShownSuccessRef.current = true;
        setShowSuccess(true);
      }
    } catch (e) {
      console.error(e);
      setError("응답을 받아오지 못했습니다. 다시 시도해주세요.");
      setState((prev) => ({
        ...prev,
        messages: prev.messages.filter((m) => m.id !== userMessage.id),
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800/60 shrink-0">
        <div className="px-4 h-14 flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xl shrink-0 border border-gray-700/80 overflow-hidden"
            style={{ background: theme.gradient }}
          >
            {isImage ? (
              <Image
                src={character.profileImage}
                alt={character.name}
                width={36}
                height={36}
                className="w-9 h-9 object-cover"
              />
            ) : (
              <span className="leading-none">{character.profileImage}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{character.name}</span>
              {state.isCleared && (
                <span className="text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded-full leading-none">
                  CLEAR
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden max-w-22.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    state.isCleared ? "bg-pink-500" : theme.barColor
                  }`}
                  style={{ width: `${state.affection}%` }}
                />
              </div>
              <span className="text-gray-500 text-[11px] tabular-nums">{state.affection} / 100</span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-pink-400">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-xs font-semibold tabular-nums text-pink-400">{state.affection}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 max-w-lg mx-auto w-full">
        {state.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-10 gap-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl border border-gray-800 overflow-hidden"
              style={{ background: theme.gradient }}
            >
              {isImage ? (
                <Image
                  src={character.profileImage}
                  alt={character.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                />
              ) : (
                <span className="leading-none">{character.profileImage}</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base">{character.name}</p>
              <p className="text-gray-500 text-xs mt-1">{character.description}</p>
            </div>
            <p className="text-gray-700 text-xs bg-gray-900 border border-gray-800 px-4 py-2 rounded-full">
              첫 메시지를 보내보세요
            </p>
          </div>
        )}

        {state.messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} character={character as Character} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-end gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0 border border-gray-700/80 overflow-hidden"
              style={{ background: theme.gradient }}
            >
              {isImage ? (
                <Image
                  src={character.profileImage}
                  alt={character.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover"
                />
              ) : (
                <span className="leading-none">{character.profileImage}</span>
              )}
            </div>
            <div className="bg-gray-800 border border-gray-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-900/50 px-3 py-1.5 rounded-full">
              {error}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-900/95 backdrop-blur-md border-t border-gray-800/60 px-4 py-3 shrink-0">
        <div className="flex gap-2 items-center max-w-lg mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-600 disabled:opacity-50 transition-all"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-35 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          character={character}
          onMainMenu={() => {
            setShowSuccess(false);
            router.push("/");
          }}
        />
      )}
    </div>
  );
}
