"use client";

import { motion } from "framer-motion";
import { Server, Cloud, Database } from "lucide-react";

const serverIcons = [Server, Cloud, Database];

export function HardwareGlobe() {
  return (
    <div className="relative w-full h-full">
      {/* Base globe container with gradient background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent" />
      
      {/* Animated data packets */}
      {[0, 1].map((pathIndex) => (
        <motion.div
          key={`path-${pathIndex}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <motion.circle
              r="4"
              fill="rgb(16 185 129)"
              initial={{ 
                opacity: 0,
                pathLength: 0,
                cx: pathIndex === 0 ? 100 : 200,
                cy: pathIndex === 0 ? 200 : 100
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                cx: pathIndex === 0 ? [100, 300] : [200, 200],
                cy: pathIndex === 0 ? [200, 200] : [100, 300]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: pathIndex * 1
              }}
            />
            <path
              d={pathIndex === 0 
                ? "M100,200 C150,150 250,250 300,200" 
                : "M200,100 C150,150 250,250 200,300"
              }
              stroke="rgb(16 185 129 / 0.3)"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
        </motion.div>
      ))}

      {/* Server nodes */}
      {[
        { x: "25%", y: "25%", icon: 0 },
        { x: "75%", y: "25%", icon: 1 },
        { x: "50%", y: "50%", icon: 2 },
        { x: "25%", y: "75%", icon: 0 },
        { x: "75%", y: "75%", icon: 1 },
      ].map((position, index) => {
        const Icon = serverIcons[position.icon];
        return (
          <motion.div
            key={index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: position.x, top: position.y }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: index * 0.1,
            }}
          >
            {/* Outer glow */}
            <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-md" />
            
            {/* Icon container */}
            <div className="relative w-12 h-12 bg-zinc-900/90 rounded-xl border border-emerald-500/50 backdrop-blur-sm flex items-center justify-center group hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-emerald-500 group-hover:text-emerald-400 transition-colors duration-300" />
            </div>

            {/* Pulse effect */}
            <div className="absolute inset-0 -z-10">
              <motion.div
                className="w-full h-full rounded-xl bg-emerald-500/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}