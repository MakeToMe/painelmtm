"use client";

import { useEffect, useRef } from 'react';

interface Column {
  x: number;
  chars: string[];
  speed: number;
  y: number;
}

export function MatrixRainAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const columnsRef = useRef<Column[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Caracteres tecnológicos e símbolos
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]≤≥∑∏∆∇∃∀∈∉⊂⊃∪∩∧∨¬';

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize columns
    const initColumns = () => {
      const columns: Column[] = [];
      const fontSize = 14;
      const columns_count = Math.floor(window.innerWidth / fontSize);
      
      for (let i = 0; i < columns_count; i++) {
        const column: Column = {
          x: i * fontSize,
          chars: [],
          speed: 1 + Math.random() * 2,
          y: Math.random() * window.innerHeight
        };
        
        const column_height = Math.floor(5 + Math.random() * 15);
        for (let j = 0; j < column_height; j++) {
          column.chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        
        columns.push(column);
      }
      
      columnsRef.current = columns;
    };

    // Draw animation
    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(24, 24, 27, 0.1)'; // Efeito de trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = '14px monospace';
      
      // Update and draw columns
      columnsRef.current.forEach(column => {
        // Move a coluna para baixo
        column.y += column.speed;
        
        // Se a coluna sair da tela, reseta no topo
        if (column.y > canvas.height) {
          column.y = -100;
          column.chars = [];
          const column_height = Math.floor(5 + Math.random() * 15);
          for (let j = 0; j < column_height; j++) {
            column.chars.push(chars[Math.floor(Math.random() * chars.length)]);
          }
        }

        // Desenha os caracteres da coluna
        column.chars.forEach((char, index) => {
          const y = column.y - index * 14;
          
          // Primeiro caractere mais brilhante
          if (index === 0) {
            ctx.fillStyle = 'rgba(16, 185, 129, 1)'; // Verde esmeralda brilhante
          } else {
            // Fade out gradual para os outros caracteres
            const alpha = 1 - (index / column.chars.length);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.5})`;
          }
          
          // Chance de mudar o caractere
          if (Math.random() < 0.02) {
            column.chars[index] = chars[Math.floor(Math.random() * chars.length)];
          }
          
          ctx.fillText(char, column.x, y);
        });
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Setup
    resizeCanvas();
    initColumns();
    draw();

    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initColumns();
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
      className="fixed inset-0 w-full h-full pointer-events-none opacity-50"
      style={{ zIndex: -1 }}
    />
  );
}
