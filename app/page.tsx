"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { characters } from "@/data/characters";
import { clearAppData, getCharacterState } from "@/lib/storage";
import { getUserName, setUserName } from "@/lib/user";
import CharacterCard from "@/components/CharacterCard";
import NameSetupModal from "@/components/NameSetupModal";
import { CharacterState } from "@/types";

const featured = characters[1]; // 박서진

export default function Home() {
  const router = useRouter();
  const [states, setStates] = useState<Record<string, CharacterState>>({});
  const [showNameModal, setShowNameModal] = useState(false);

  useEffect(() => {
    const loaded: Record<string, CharacterState> = {};
    for (const c of characters) loaded[c.id] = getCharacterState(c.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStates(() => loaded);
  }, []);

  useEffect(() => {
    const saved = getUserName();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!saved) setShowNameModal(true);
  }, []);

  const clearedCount = Object.values(states).filter((s) => s.isCleared).length;

  return (
    <div className="min-h-screen bg-gray-950 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-md border-b border-gray-800/60">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-white text-xl font-bold tracking-tight">💕 두근두근 상팔 💕</span>
          <div className="flex items-center gap-2">
            {clearedCount > 0 && (
              <span className="text-xs text-pink-400 font-medium bg-pink-950/50 border border-pink-800/50 px-2.5 py-1 rounded-full">
                {clearedCount}/{characters.length} 클리어
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                const ok = window.confirm("모든 인물의 호감도와 대화 내용을 초기화할까요?");
                if (!ok) return;
                clearAppData();
                const cleared: Record<string, CharacterState> = {};
                for (const c of characters) {
                  cleared[c.id] = { affection: 0, messages: [], isCleared: false };
                }
                setStates(cleared);
              }}
              className="text-xs text-gray-300 font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700/60 px-3 py-1 rounded-full transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4">
        {/* Banner */}
        <div
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/chat/${featured.id}`)}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push(`/chat/${featured.id}`);
            }
          }}
          className="mt-4 rounded-2xl overflow-hidden relative cursor-pointer group"
          style={{
            background: "linear-gradient(135deg, #431407 0%, #7c2d12 40%, #1c1917 100%)",
          }}
        >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)",
              }}
            />
            <div className="relative flex items-center justify-between px-5 py-5">
              <div className="flex-1">
                <span className="inline-block text-amber-400/80 text-[10px] font-semibold uppercase tracking-[0.15em] mb-2">
                  상팔 미연시: 두근두근 상팔
                </span>
                <h2 className="text-white text-lg font-bold leading-snug">
                  호감도 100을 달성하면
                  <br />
                  해당 인물과의 데이트권을 드립니다.
                </h2>
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                  아래 인스타로 인증샷을 보내주세요.
                </p>
                <a
                  href="https://www.instagram.com/leedam_jh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs bg-white/10 group-hover:bg-white/15 border border-white/15 text-white px-3 py-1.5 rounded-full transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  인증샷 보내기
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
              <div className="text-7xl leading-none ml-4 select-none transition-transform group-hover:scale-110 duration-300">
                🌟
              </div>
            </div>
        </div>

        {/* Grid header */}
        <div className="mt-6 mb-3 flex items-center justify-between">
          <span className="text-white font-semibold text-sm">캐릭터</span>
          <span className="text-gray-600 text-xs">{characters.length}명</span>
        </div>

        {/* Character grid */}
        <div className="grid grid-cols-2 gap-3">
          {characters.map((c) => (
            <CharacterCard
              key={c.id}
              character={c}
              state={states[c.id] ?? { affection: 0, messages: [], isCleared: false }}
            />
          ))}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">
          상팔에서 당신의 최애를 찾아보세요.
        </p>
      </div>

      {showNameModal && (
        <NameSetupModal
          onConfirm={(name) => {
            const ok = setUserName(name);
            if (ok) setShowNameModal(false);
          }}
        />
      )}
    </div>
  );
}
