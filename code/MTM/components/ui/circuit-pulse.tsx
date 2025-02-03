"use client";

import { useEffect, useRef } from 'react';

interface Pulse {
  x: number;
  y: number;
  pathIndex: number;
  progress: number;
  size: number;
}

export function CircuitPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulsesRef = useRef<Pulse[]>([]);
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

    // Define circuit paths
    const createPaths = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      return [
        // Horizontal paths
        { points: [[0, height * 0.3], [width, height * 0.3]] },
        { points: [[0, height * 0.7], [width, height * 0.7]] },
        // Vertical paths
        { points: [[width * 0.2, 0], [width * 0.2, height]] },
        { points: [[width * 0.8, 0], [width * 0.8, height]] },
        // Diagonal paths
        { points: [[0, 0], [width, height]] },
        { points: [[0, height], [width, 0]] },
        // Curved paths
        { points: [[0, height * 0.5], [width * 0.5, height * 0.2], [width, height * 0.5]] },
        { points: [[0, height * 0.5], [width * 0.5, height * 0.8], [width, height * 0.5]] },
      ];
    };

    // Initialize pulses
    const initPulses = () => {
      const paths = createPaths();
      const pulses: Pulse[] = [];
      const pulseCount = 12; // Number of pulses
      
      for (let i = 0; i < pulseCount; i++) {
        pulses.push({
          x: 0,
          y: 0,
          pathIndex: Math.floor(Math.random() * paths.length),
          progress: Math.random(),
          size: Math.random() * 2 + 2
        });
      }
      
      pulsesRef.current = pulses;
    };

    const drawPath = (points: number[][], progress: number) => {
      if (points.length < 2) return { x: 0, y: 0 };

      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);

      if (points.length === 2) {
        // Linear path
        ctx.lineTo(points[1][0], points[1][1]);
        
        // Calculate position along line
        const x = points[0][0] + (points[1][0] - points[0][0]) * progress;
        const y = points[0][1] + (points[1][1] - points[0][1]) * progress;
        return { x, y };
      } else {
        // Curved path
        ctx.quadraticCurveTo(points[1][0], points[1][1], points[2][0], points[2][1]);
        
        // Calculate position along curve
        const t = progress;
        const x = Math.pow(1-t, 2) * points[0][0] + 
                 2 * (1-t) * t * points[1][0] + 
                 Math.pow(t, 2) * points[2][0];
        const y = Math.pow(1-t, 2) * points[0][1] + 
                 2 * (1-t) * t * points[1][1] + 
                 Math.pow(t, 2) * points[2][1];
        return { x, y };
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const paths = createPaths();

      // Draw circuit paths
      paths.forEach(path => {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1;
        drawPath(path.points, 1);
        ctx.stroke();
      });

      // Update and draw pulses
      pulsesRef.current.forEach(pulse => {
        const path = paths[pulse.pathIndex];
        const pos = drawPath(path.points, pulse.progress);
        
        // Update pulse position
        pulse.x = pos.x;
        pulse.y = pos.y;
        pulse.progress += 0.005;

        // Reset pulse when it reaches the end
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          pulse.pathIndex = Math.floor(Math.random() * paths.length);
        }

        // Draw pulse
        const gradient = ctx.createRadialGradient(
          pulse.x, pulse.y, 0,
          pulse.x, pulse.y, pulse.size * 4
        );
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw pulse core
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const setupCanvas = () => {
      resizeCanvas();
      initPulses();
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // Start animation
    draw();

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
      className="fixed inset-0 w-full h-full pointer-events-none opacity-50"
      style={{ zIndex: 0 }}
    />
  );
}
