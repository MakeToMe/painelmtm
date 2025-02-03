import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-emerald-500/10">
        <video
          src="https://28e2b3682e19b5e1f5912ae0a91b7ad2.cdn.bubble.io/f1734894816871x723590672066902500/avatar_mtm.mp4"
          className="w-full h-full object-cover"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
        />
      </div>
      <div className="bg-zinc-800/50 backdrop-blur-sm text-gray-100 rounded-lg p-3 relative">
        <div 
          className="absolute top-3 -left-1.5 w-4 h-4 bg-zinc-800/50 backdrop-blur-sm"
          style={{
            clipPath: 'polygon(0 50%, 100% 0, 100% 100%)'
          }}
        />
        <div className="flex space-x-1 relative z-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-emerald-500 rounded-full"
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
