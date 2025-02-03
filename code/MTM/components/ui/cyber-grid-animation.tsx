"use client";

import { useEffect, useRef } from 'react';

export function CyberGridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    let time = 0;
    const cellSize = 60; // Aumentei o tamanho das células
    const speed = 0.002; // Aumentei a velocidade

    const drawGrid = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Draw vertical lines
      for (let x = 0; x <= width; x += cellSize) {
        const offset = Math.sin(x * 0.05 + time) * 15; // Aumentei a amplitude
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + offset, height);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + Math.sin(x * 0.01 + time) * 0.1})`; // Aumentei a opacidade base
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = 0; y <= height; y += cellSize) {
        const offset = Math.sin(y * 0.05 + time) * 15; // Aumentei a amplitude
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y + offset);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + Math.sin(y * 0.01 + time) * 0.1})`; // Aumentei a opacidade base
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Add glowing points at intersections
      for (let x = 0; x <= width; x += cellSize) {
        for (let y = 0; y <= height; y += cellSize) {
          const offsetX = Math.sin(x * 0.05 + time) * 15;
          const offsetY = Math.sin(y * 0.05 + time) * 15;
          const intensity = (Math.sin(time * 3 + x * 0.1 + y * 0.1) + 1) * 0.5; // Aumentei a frequência da pulsação
          
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, 3, 0, Math.PI * 2); // Aumentei o tamanho dos pontos
          ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + intensity * 0.6})`; // Aumentei a opacidade
          ctx.fill();

          // Add glow effect
          const gradient = ctx.createRadialGradient(
            x + offsetX, y + offsetY, 0,
            x + offsetX, y + offsetY, 15 // Aumentei o raio do glow
          );
          gradient.addColorStop(0, `rgba(16, 185, 129, ${0.3 * intensity})`);
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
          
          ctx.beginPath();
          ctx.arc(x + offsetX, y + offsetY, 15, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      time += speed;
      animationFrameRef.current = requestAnimationFrame(drawGrid);
    };

    const setupCanvas = () => {
      resizeCanvas();
      drawGrid();
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    return () => {
      window.removeEventListener('resize', setupCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-40" // Aumentei a opacidade geral
      style={{ zIndex: 0 }}
    />
  );
}
