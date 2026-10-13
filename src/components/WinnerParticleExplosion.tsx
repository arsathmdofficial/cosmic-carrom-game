import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  shape: 'circle' | 'star' | 'diamond' | 'ring';
  duration: number;
  delay: number;
  char?: string;
}

interface WinnerParticleExplosionProps {
  className?: string;
  particleCount?: number;
}

const PARTICLE_COLORS = [
  '#f59e0b', // Amber Gold
  '#fbbf24', // Yellow Gold
  '#38bdf8', // Neon Cyan
  '#34d399', // Emerald
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#ffffff', // Starlight White
  '#ec4899', // Pink
];

const ICONS = ['✨', '★', '✦', '✧', '⭐', '💎'];

export const WinnerParticleExplosion: React.FC<WinnerParticleExplosionProps> = ({
  className = '',
  particleCount = 50,
}) => {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      // Golden spiral and radial distribution for natural fireworks spread
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 60 + Math.random() * 150;
      const x = Math.cos(angle) * distance;
      // Slight upward bias for celebratory fountain feel
      const y = Math.sin(angle) * distance - (15 + Math.random() * 30);
      const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      const shapes: ('circle' | 'star' | 'diamond' | 'ring')[] = ['circle', 'star', 'diamond', 'ring'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const char = shape === 'star' ? ICONS[Math.floor(Math.random() * ICONS.length)] : undefined;

      return {
        id: i,
        x,
        y,
        scale: 0.6 + Math.random() * 1.1,
        rotation: (Math.random() - 0.5) * 720,
        color,
        shape,
        duration: 0.8 + Math.random() * 0.7,
        delay: Math.random() * 0.25,
        char,
      };
    });
  }, [particleCount]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center z-30 ${className}`}>
      {/* 1. Primary Radiant Shockwave Ring */}
      <motion.div
        initial={{ scale: 0.1, opacity: 0.9, borderWidth: '6px' }}
        animate={{ scale: 2.8, opacity: 0, borderWidth: '0px' }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="absolute w-32 h-32 rounded-full border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.8)]"
      />

      {/* 2. Secondary High-Energy Cyan Flare Ring */}
      <motion.div
        initial={{ scale: 0.2, opacity: 0.8 }}
        animate={{ scale: 3.5, opacity: 0 }}
        transition={{ duration: 1.1, delay: 0.08, ease: 'easeOut' }}
        className="absolute w-28 h-28 rounded-full border-2 border-cyan-400 shadow-[0_0_30px_rgba(56,189,248,0.7)]"
      />

      {/* 3. Golden Core Flash */}
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: [1, 2.2, 0], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 blur-xl"
      />

      {/* 4. Burst Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: p.x,
            y: p.y,
            scale: [0, p.scale, p.scale * 0.8, 0],
            opacity: [1, 1, 0.9, 0],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.15, 0.85, 0.35, 1],
          }}
          className="absolute"
        >
          {p.shape === 'star' && p.char ? (
            <span
              style={{
                color: p.color,
                textShadow: `0 0 10px ${p.color}`,
              }}
              className="text-base select-none font-black"
            >
              {p.char}
            </span>
          ) : p.shape === 'diamond' ? (
            <div
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 12px ${p.color}`,
              }}
              className="w-3 h-3 rotate-45 rounded-xs"
            />
          ) : p.shape === 'ring' ? (
            <div
              style={{
                borderColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }}
              className="w-3.5 h-3.5 rounded-full border-2 bg-transparent"
            />
          ) : (
            <div
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 14px ${p.color}`,
              }}
              className="w-3 h-3 rounded-full"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
