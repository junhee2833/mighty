import { ChatMessage, Character } from "@/types";
import Image from "next/image";

type Props = {
  message: ChatMessage;
  character: Character;
};

export default function ChatBubble({ message, character }: Props) {
  const isImage = character.profileImage.startsWith("/") || character.profileImage.endsWith(".png");
  const actionText =
    message.action?.trim().replace(/^\*+/, "").replace(/\*+$/, "") ?? "";
  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] bg-violet-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-base shrink-0 leading-none overflow-hidden">
        {isImage ? (
          <Image
            src={character.profileImage}
            alt={character.name}
            width={32}
            height={32}
            className="w-8 h-8 object-cover"
          />
        ) : (
          <span>{character.profileImage}</span>
        )}
      </div>

      <div className="max-w-[72%] space-y-1">
        {/* Action — gray italic above bubble */}
        {actionText && (
          <p className="text-gray-500 text-xs italic px-1 leading-relaxed">
            {actionText}
          </p>
        )}
        {/* Dialogue bubble */}
        <div className="bg-gray-800 text-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-700/50">
          <p className="text-sm leading-relaxed">{message.message}</p>
        </div>
      </div>
    </div>
  );
}
