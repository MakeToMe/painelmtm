"use client";

import { useEffect, useState } from 'react';

export function CyberBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: -1 }}>
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Grade de fundo */}
        <defs>
          <pattern
            id="grid"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Círculos pulsantes */}
        {Array.from({ length: 5 }).map((_, i) => (
          <circle
            key={i}
            cx={20 + i * 15}
            cy={20 + i * 15}
            r="1"
            fill="rgba(16, 185, 129, 0.5)"
            className="animate-pulse-slow"
            style={{
              animationDelay: `${i * 0.5}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}

        {/* Linhas diagonais animadas */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 15}
            x2="100"
            y2={i * 15 - 50}
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="0.5"
            className="animate-line-flow"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </svg>

      {/* Overlay gradiente */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.8) 100%)',
        }}
      />

      <style jsx>{`
        @keyframes lineFlow {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-line-flow {
          animation: lineFlow 8s infinite linear;
        }

        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(2);
          }
        }
      `}</style>
    </div>
  );
}
