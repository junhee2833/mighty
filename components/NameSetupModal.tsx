"use client";

import { useState } from "react";

type Props = {
  onConfirm: (name: string) => void;
};

export default function NameSetupModal({ onConfirm }: Props) {
  const [input, setInput] = useState("");

  function submit() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-2xl shadow-black/50">
        <h2 className="text-white text-lg font-semibold">이름을 입력해주세요</h2>
        <p className="text-gray-400 text-sm mt-1.5">
          캐릭터들이 당신을 이 이름으로 부르게 됩니다.
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="이름 입력"
          autoFocus
          className="mt-4 w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-600"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!input.trim()}
          className="mt-3 w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

