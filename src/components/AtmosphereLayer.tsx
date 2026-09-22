import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  color: string;
  pulseSpeed: number;
  pulsePhase: number;
}

interface AtmosphereLayerProps {
  colorAccent?: string;
  vignetteStrength?: number;
}

export const AtmosphereLayer: React.FC<AtmosphereLayerProps> = ({
  colorAccent = '#10b981',
  vignetteStrength = 0.75,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particleCount = prefersReducedMotion ? 0 : isMobile ? 22 : 55;

    const particles: Particle[] = [];
    const colors = [
      'rgba(16, 185, 129,', // emerald
      'rgba(52, 211, 153,', // light emerald
      'rgba(212, 175, 55,', // aged gold dust
      'rgba(5, 150, 105,',  // dark emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -(Math.random() * 0.45 + 0.15), // gently rising like lair embers
        opacity: Math.random() * 0.5 + 0.1,
        maxOpacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width;
      mouseRef.current.targetY = e.clientY / height;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const render = () => {

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle mouse-influenced ambient lantern / green glow
      if (!isMobile && !prefersReducedMotion) {
        const glowX = mouseRef.current.x * width;
        const glowY = mouseRef.current.y * height;
        const grad = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, width * 0.45);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.035)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floating subterranean particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.speedX + (mouseRef.current.x - 0.5) * 0.2;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;

        // Wrap around bounds
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentOpacity = Math.max(
          0.05,
          p.maxOpacity * (0.6 + 0.4 * Math.sin(p.pulsePhase))
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${currentOpacity})`;
        ctx.shadowColor = colorAccent;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [colorAccent]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Cinematic Vignette Overlay with dynamic intensity */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(1, 4, 2, ${vignetteStrength * 0.7}) 75%, rgba(1, 4, 2, ${vignetteStrength}) 100%)`,
          pointerEvents: 'none',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Fine Film Grain Texture Overlay for that ancient filmic aesthetic */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.045,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};
