"use client";

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  phase: number;
  speed: number;
}

export function DigitalGridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize grid points
    const initPoints = () => {
      const points: Point[] = [];
      const gridSize = 50; // Espaçamento entre os pontos
      
      for (let x = 0; x < window.innerWidth; x += gridSize) {
        for (let y = 0; y < window.innerHeight; y += gridSize) {
          points.push({
            x,
            y,
            size: 2,
            baseSize: 2,
            phase: Math.random() * Math.PI * 2,
            speed: 0.02 + Math.random() * 0.03
          });
        }
      }
      
      pointsRef.current = points;
    };

    // Draw animation
    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(24, 24, 27, 0.15)'; // Cor do fundo com trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw points
      pointsRef.current.forEach(point => {
        // Atualiza a fase para a pulsação
        point.phase += point.speed;
        
        // Calcula o tamanho atual baseado na pulsação
        point.size = point.baseSize + Math.sin(point.phase) * 1;

        // Desenha o ponto com gradiente
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size * 2
        );
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)'); // Verde esmeralda no centro
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Desenha linhas entre pontos próximos
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.lineWidth = 0.5;

      pointsRef.current.forEach((point, i) => {
        pointsRef.current.slice(i + 1).forEach(otherPoint => {
          const dx = point.x - otherPoint.x;
          const dy = point.y - otherPoint.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (100 - distance) / 100;
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.1})`;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(otherPoint.x, otherPoint.y);
            ctx.stroke();
          }
        });
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Setup
    resizeCanvas();
    initPoints();
    draw();

    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initPoints();
    });

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    />
  );
}
