'use client';

import { motion } from 'framer-motion';

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const Star = ({ x, y, size = 2, delay = 0 }: { x: string; y: string; size?: number; delay?: number }) => (
  <motion.div
    className="absolute bg-white rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
    }}
    animate={{
      scale: [1, randomRange(1.2, 2), 1],
      opacity: [randomRange(0.2, 0.4), randomRange(0.7, 1), randomRange(0.2, 0.4)],
    }}
    transition={{
      duration: randomRange(1, 4),
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut",
    }}
  />
);

const generatePoints = (count: number) => {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: randomRange(0, 100),
      y: randomRange(0, 100),
    });
  }
  return points;
};

const ConnectingLines = ({ points }: { points: { x: number; y: number }[] }) => {
  const connections = points.flatMap((point, i) => 
    points.slice(i + 1).map((nextPoint, j) => {
      const distance = Math.sqrt(
        Math.pow(point.x - nextPoint.x, 2) + 
        Math.pow(point.y - nextPoint.y, 2)
      );
      
      // Só conecta pontos que estão a uma distância máxima entre si
      if (distance > 30) return null;
      
      return {
        id: `${i}-${j}`,
        point1: point,
        point2: nextPoint,
        distance,
      };
    }).filter(Boolean)
  );

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {connections.map((connection) => {
        if (!connection) return null;
        const opacity = Math.max(0.1, 1 - connection.distance / 30);
        
        return (
          <motion.line
            key={connection.id}
            x1={`${connection.point1.x}%`}
            y1={`${connection.point1.y}%`}
            x2={`${connection.point2.x}%`}
            y2={`${connection.point2.y}%`}
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth={randomRange(0.5, 1)}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, opacity, 0.1],
            }}
            transition={{
              duration: randomRange(3, 6),
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </svg>
  );
};

export function HeroAnimation() {
  const points = generatePoints(50); // 50 pontos

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Background com gradiente sutil */}
      <div className="absolute inset-0">
        {/* Círculo principal à direita */}
        <motion.div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
            transform: 'translate(20%, -50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: randomRange(4, 6),
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pontos e linhas conectoras */}
        <div className="absolute inset-0">
          <ConnectingLines points={points} />
          {points.map((point, i) => (
            <Star
              key={i}
              x={`${point.x}%`}
              y={`${point.y}%`}
              size={randomRange(1.5, 3)}
              delay={randomRange(0, 2)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
