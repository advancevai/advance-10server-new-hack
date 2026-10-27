import React, { useMemo } from 'react';
import { createPrng } from '../lib/engine';

interface ParticlesProps {
  count?: number;
  seed?: number;
}

export function Particles({ count = 28, seed = 1337 }: ParticlesProps) {
  const particles = useMemo(() => {
    const prng = createPrng(seed);
    // Strictly black, white, electric blue and neon cyan palette
    const colors = ['#008CFF', '#00E5FF', '#80C8FF', '#FFFFFF'];

    return Array.from({ length: count }).map((_, idx) => {
      const left = prng() * 100;
      const top = prng() * 100;
      const size = 1 + prng() * 2.8;
      const delay = prng() * 6;
      const duration = 4.5 + prng() * 4.5;
      const color = colors[idx % colors.length];

      return {
        id: idx,
        left: left.toFixed(2),
        top: top.toFixed(2),
        size: size.toFixed(2),
        delay: delay.toFixed(2),
        duration: duration.toFixed(2),
        color,
      };
    });
  }, [count, seed]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle absolute rounded-full blur-[0.6px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${parseFloat(p.size) * 4}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
