"use client";

import { useEffect, useRef } from 'react';

export function MatrixRain() {
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

    // Matrix characters (using numbers and symbols for a cyber look)
    const chars = '0123456789ABCDEF⚡★◆▲△○●◐◑∞∑∆≥≤⌘⌥⇧⇪';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    
    // Array to track the y position of each column
    const drops: number[] = new Array(columns).fill(1);
    
    // Array to track the opacity of each column
    const opacity: number[] = new Array(columns).fill(1);
    
    // Function to get random character
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

    const draw = () => {
      // Add semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set the text style
      ctx.font = `${fontSize}px monospace`;
      
      // Draw the characters
      for (let i = 0; i < drops.length; i++) {
        // Generate random character
        const char = getRandomChar();

        // Calculate x position
        const x = i * fontSize;
        // Calculate y position
        const y = drops[i] * fontSize;

        // Create gradient for each character
        const gradient = ctx.createLinearGradient(x, y - fontSize, x, y);
        gradient.addColorStop(0, `rgba(16, 185, 129, 0)`);
        gradient.addColorStop(0.5, `rgba(16, 185, 129, ${opacity[i]})`);
        gradient.addColorStop(1, `rgba(16, 185, 129, 0)`);
        
        ctx.fillStyle = gradient;

        // Draw the character
        ctx.fillText(char, x, y);

        // Reset when off screen and randomize opacity
        if (y > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
          opacity[i] = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
        }

        // Increment y position
        drops[i]++;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const setupCanvas = () => {
      resizeCanvas();
      // Reset drops array when canvas is resized
      const newColumns = Math.floor(canvas.width / fontSize);
      drops.length = newColumns;
      drops.fill(1);
      opacity.length = newColumns;
      opacity.fill(1);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
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
      className="fixed inset-0 w-full h-full pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  );
}
