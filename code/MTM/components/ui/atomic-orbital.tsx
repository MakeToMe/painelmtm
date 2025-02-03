"use client";

import { useEffect, useRef } from 'react';
import { useIsClient } from '@/hooks/use-is-client';

interface Electron {
  angle: number;
  speed: number;
  radius: number;
  orbitTilt: number;
  size: number;
  phase: number;
}

interface Nucleus {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetX: number;
  targetY: number;
}

export function AtomicOrbital() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nucleiRef = useRef<Nucleus[]>([]);
  const electronsRef = useRef<Electron[][]>([]);
  const animationFrameRef = useRef<number>();
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const getRandomPosition = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    });

    const initNuclei = () => {
      const nuclei: Nucleus[] = [];
      const nucleusCount = 8;
      
      for (let i = 0; i < nucleusCount; i++) {
        const pos = getRandomPosition();
        nuclei.push({
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          size: 6,
          targetX: pos.x,
          targetY: pos.y
        });
      }
      
      nucleiRef.current = nuclei;
    };

    const initElectrons = () => {
      const electronArrays: Electron[][] = [];
      
      nucleiRef.current.forEach(() => {
        const electrons: Electron[] = [];
        const electronCount = 3;
        
        for (let i = 0; i < electronCount; i++) {
          electrons.push({
            angle: Math.random() * Math.PI * 2,
            speed: (0.002 + Math.random() * 0.002),
            radius: 50 + Math.random() * 30,
            orbitTilt: (Math.random() * Math.PI) / 4,
            size: 2,
            phase: Math.random() * Math.PI * 2
          });
        }
        
        electronArrays.push(electrons);
      });
      
      electronsRef.current = electronArrays;
    };

    const updateNuclei = () => {
      nucleiRef.current.forEach((nucleus) => {
        const dx = nucleus.targetX - nucleus.x;
        const dy = nucleus.targetY - nucleus.y;
        
        nucleus.vx += dx * 0.001;
        nucleus.vy += dy * 0.001;
        
        nucleus.vx *= 0.98;
        nucleus.vy *= 0.98;
        
        nucleus.x += nucleus.vx;
        nucleus.y += nucleus.vy;
        
        nucleus.x = Math.max(50, Math.min(canvas.width - 50, nucleus.x));
        nucleus.y = Math.max(50, Math.min(canvas.height - 50, nucleus.y));
        
        if (Math.random() < 0.002) {
          const pos = getRandomPosition();
          nucleus.targetX = Math.max(50, Math.min(canvas.width - 50, pos.x));
          nucleus.targetY = Math.max(50, Math.min(canvas.height - 50, pos.y));
        }
      });
    };

    const updateElectrons = () => {
      electronsRef.current.forEach((electrons) => {
        electrons.forEach((electron) => {
          electron.angle += electron.speed;
        });
      });
    };

    const drawNuclei = () => {
      ctx.fillStyle = '#10b981';
      nucleiRef.current.forEach((nucleus) => {
        ctx.beginPath();
        ctx.arc(nucleus.x, nucleus.y, nucleus.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawElectrons = () => {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.6)';
      nucleiRef.current.forEach((nucleus, i) => {
        const electrons = electronsRef.current[i];
        electrons.forEach((electron) => {
          const projectedRadius = Math.abs(electron.radius * Math.cos(electron.orbitTilt));
          const x = nucleus.x + projectedRadius * Math.cos(electron.angle);
          const y = nucleus.y + electron.radius * Math.sin(electron.angle);
          
          ctx.beginPath();
          ctx.arc(x, y, electron.size, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    };

    const drawOrbits = () => {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.lineWidth = 1;
      
      nucleiRef.current.forEach((nucleus, i) => {
        const electrons = electronsRef.current[i];
        electrons.forEach((electron) => {
          const projectedRadius = Math.abs(electron.radius * Math.cos(electron.orbitTilt));
          
          ctx.beginPath();
          ctx.ellipse(
            nucleus.x,
            nucleus.y,
            projectedRadius,
            electron.radius,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        });
      });
    };

    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      updateNuclei();
      updateElectrons();
      
      drawOrbits();
      drawNuclei();
      drawElectrons();
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      resizeCanvas();
      initNuclei();
      initElectrons();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isClient]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
}
