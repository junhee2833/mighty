import Image from "next/image";
import { Character } from "@/types";

type Props = {
  character: Character;
  onMainMenu: () => void;
};

export default function SuccessModal({ character, onMainMenu }: Props) {
  const isImage =
    character.profileImage.startsWith("/") || character.profileImage.endsWith(".png");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-700/70 bg-gray-900 shadow-2xl shadow-black/60 p-6">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase font-semibold text-pink-400/90">
            SUCCESS ENDING
          </p>
          <h2 className="mt-2 text-white text-2xl font-bold">호감도 100 달성</h2>
          <p className="mt-2 text-gray-400 text-sm leading-relaxed">
            {character.endingSubtitle}
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
            {isImage ? (
              <Image
                src={character.profileImage}
                alt={character.name}
                width={112}
                height={112}
                className="w-28 h-28 object-cover"
              />
            ) : (
              <span className="text-6xl leading-none">{character.profileImage}</span>
            )}
          </div>
          <p className="mt-3 text-white font-semibold">{character.name}</p>
        </div>

        <div className="mt-5 rounded-xl border border-pink-500/20 bg-pink-500/5 px-4 py-4">
          <p className="text-center text-pink-100 text-lg leading-relaxed font-medium">
            “{character.confessionLine}”
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onMainMenu}
            className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 text-sm transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
