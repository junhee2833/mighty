"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Character, CharacterState } from "@/types";

// Written out in full so Tailwind includes these at build time
const THEMES: Record<
  string,
  { gradient: string; accentText: string; barColor: string; badgeBase: string }
> = {
  junhyuk: {
    gradient: "linear-gradient(160deg, #2e1065 0%, #1e1b4b 60%, #111827 100%)",
    accentText: "text-violet-400",
    barColor: "bg-violet-500",
    badgeBase: "bg-violet-950/80 text-violet-300 border-violet-800/60",
  },
  seojin: {
    gradient: "linear-gradient(160deg, #431407 0%, #7c2d12 60%, #111827 100%)",
    accentText: "text-amber-400",
    barColor: "bg-amber-500",
    badgeBase: "bg-amber-950/80 text-amber-300 border-amber-800/60",
  },
  dohyun: {
    gradient: "linear-gradient(160deg, #042f2e 0%, #134e4a 60%, #111827 100%)",
    accentText: "text-teal-400",
    barColor: "bg-teal-500",
    badgeBase: "bg-teal-950/80 text-teal-300 border-teal-800/60",
  },
  yuna: {
    gradient: "linear-gradient(160deg, #312e81 0%, #1e1b4b 55%, #020617 100%)",
    accentText: "text-indigo-300",
    barColor: "bg-indigo-400",
    badgeBase: "bg-indigo-950/80 text-indigo-200 border-indigo-800/60",
  },
  minho: {
    gradient: "linear-gradient(160deg, #022c22 0%, #166534 55%, #052e16 100%)",
    accentText: "text-emerald-300",
    barColor: "bg-emerald-500",
    badgeBase: "bg-emerald-950/80 text-emerald-200 border-emerald-800/60",
  },
  hyeri: {
    gradient: "linear-gradient(160deg, #4a044e 0%, #86198f 55%, #020617 100%)",
    accentText: "text-fuchsia-300",
    barColor: "bg-fuchsia-500",
    badgeBase: "bg-fuchsia-950/80 text-fuchsia-200 border-fuchsia-800/60",
  },
};

const DEFAULT_THEME = THEMES.junhyuk;

type Props = {
  character: Character;
  state: CharacterState;
};

export default function CharacterCard({ character, state }: Props) {
  const router = useRouter();
  const theme = THEMES[character.id] ?? DEFAULT_THEME;
  const isImage = character.profileImage.startsWith("/") || character.profileImage.endsWith(".png");
  const isMinho = character.id === "minho";

  function handleNavigate() {
    if (isMinho) {
      window.alert("현빈이는 현재 군대에 있어 연락할 수 없습니다. 충성🪖🪖");
      return;
    }
    router.push(`/chat/${character.id}`);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      className="block"
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      <div
        className={`bg-gray-900 rounded-2xl overflow-hidden border transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] cursor-pointer ${
          state.isCleared
            ? "border-pink-800/50 shadow-lg shadow-pink-950/30"
            : "border-gray-800 hover:border-gray-700"
        }`}
      >
        {/* Portrait */}
        <div
          className="relative flex items-center justify-center h-44"
          style={{ background: theme.gradient }}
        >
          {isImage ? (
            <Image
              src={character.profileImage}
              alt={character.name}
              width={112}
              height={112}
              className="w-24 h-24 rounded-full object-cover border border-white/10 shadow-lg shadow-black/40"
            />
          ) : (
            <span className="text-7xl select-none leading-none">{character.profileImage}</span>
          )}

          {/* Affection badge — bottom left */}
          <div
            className={`absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full border backdrop-blur-sm text-xs font-medium ${theme.badgeBase}`}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-pink-400 shrink-0">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {state.affection}
          </div>

          {/* Cleared badge — top right */}
          {state.isCleared && (
            <div className="absolute top-2.5 right-2.5 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none tracking-wide">
              CLEAR
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-3.5 py-3">
          <p className="text-white text-sm font-semibold leading-tight">
            {character.name}
          </p>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
            {character.description}
          </p>

          {/* Affection bar */}
          <div className="mt-2.5 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                state.isCleared ? "bg-pink-500" : theme.barColor
              }`}
              style={{ width: `${state.affection}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
