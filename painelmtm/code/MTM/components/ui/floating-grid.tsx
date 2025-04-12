"use client";

import { motion } from "framer-motion";

export function FloatingGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Grade animada */}
      <motion.div
        animate={{
          y: ["0%", "-50%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="absolute inset-0 bg-[linear-gradient(to_right,#2e3b51_1px,transparent_1px),linear-gradient(to_bottom,#2e3b51_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-25"
      />
    </div>
  );
}