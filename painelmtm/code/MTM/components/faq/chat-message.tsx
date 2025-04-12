"use client";

import { User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: string;
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            <User className="w-6 h-6 text-zinc-400" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-500/10">
            <video
              src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1734894816871x723590672066902500/avatar_mtm.mp4"
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <span className="text-sm text-gray-400 mb-1">
          {isUser ? 'Você' : 'Make To Me'}
        </span>
        <div className={`p-4 rounded-2xl ${
          isUser 
            ? 'bg-emerald-500/10 text-emerald-100 rounded-tr-sm' 
            : 'bg-zinc-800/50 text-gray-200 rounded-tl-sm'
        }`}>
          <p className="leading-relaxed">{content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
      </div>
    </div>
  );
}