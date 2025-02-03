"use client";

import { useIsClient } from "@/hooks/use-is-client";

export function ChatHeader() {
  const isClient = useIsClient();

  return (
    <div className="p-4 border-b border-zinc-800/50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-emerald-500/10">
          {isClient && (
            <video
              src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1734894816871x723590672066902500/avatar_mtm.mp4"
              className="w-full h-full object-cover"
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
            />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-500">
            Assistente Virtual
          </h3>
          <p className="text-sm text-gray-400">
            Online - Resposta instantânea
          </p>
        </div>
      </div>
    </div>
  );
}