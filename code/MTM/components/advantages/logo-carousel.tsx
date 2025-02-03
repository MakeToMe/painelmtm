"use client";

import { motion } from "framer-motion";
import { AppLogo } from "./app-logos-data";

interface LogoCarouselProps {
  logos: AppLogo[];
}

export function LogoCarousel({ logos }: LogoCarouselProps) {
  return (
    <div className="relative flex overflow-hidden">
      <motion.div
        animate={{
          x: [0, -50 * logos.length]
        }}
        transition={{
          duration: logos.length * 3,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
          repeatDelay: 0
        }}
        className="flex items-center whitespace-nowrap px-4"
      >
        {[...logos, ...logos].map((logo, index) => (
          <div
            key={`${logo.name}-${index}`}
            className="flex flex-col items-center mx-8"
          >
            <div className="w-24 h-24 bg-zinc-800/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src={logo.logo}
                  alt={logo.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <span className="mt-3 text-sm text-gray-400">
              {logo.name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}