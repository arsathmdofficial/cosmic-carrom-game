import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles, Flame, Trophy, Disc } from 'lucide-react';
import { soundManager } from '../audio/soundEffects';

interface WelcomeScreenProps {
  onStartGame: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartGame }) => {
  const [isZoomingIn, setIsZoomingIn] = useState(false);

  const handleStartClick = () => {
    soundManager.playVictorySound();
    setIsZoomingIn(true);
    // Smooth cinematic zoom-in transition into the game world
    setTimeout(() => {
      onStartGame();
    }, 650);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Anime Speed Lines / Cosmic Radial Energy Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#1e1b4b_0%,#0f172a_50%,#020617_100%)]" />

      {/* Radiant Glowing Sun & Solar Flare in Center */}
      <motion.div
        animate={{
          scale: isZoomingIn ? 4 : [1, 1.15, 1],
          opacity: isZoomingIn ? 0 : [0.6, 0.9, 0.6],
          rotate: isZoomingIn ? 45 : 360,
        }}
        transition={{
          scale: { duration: isZoomingIn ? 0.65 : 4, repeat: isZoomingIn ? 0 : Infinity, ease: 'easeInOut' },
          opacity: { duration: 3, repeat: isZoomingIn ? 0 : Infinity },
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/30 via-rose-500/25 to-cyan-500/25 blur-3xl pointer-events-none"
      />

      {/* Floating Decorative Carrom Coins & Starlight Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Red Queen Coin floating */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[18%] left-[12%] sm:left-[22%] w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-amber-400 p-0.5 shadow-[0_0_25px_rgba(244,63,94,0.7)]"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-500 to-rose-900 border-2 border-amber-300 flex items-center justify-center text-amber-200 text-lg font-black">
            ♛
          </div>
        </motion.div>

        {/* White Coin floating */}
        <motion.div
          animate={{
            y: [12, -14, 12],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[22%] left-[15%] sm:left-[20%] w-12 h-12 rounded-full bg-gradient-to-tr from-slate-200 to-white p-0.5 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
        >
          <div className="w-full h-full rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-slate-400" />
          </div>
        </motion.div>

        {/* Black Coin floating */}
        <motion.div
          animate={{
            y: [-10, 14, -10],
            rotate: [0, 90, 180],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[26%] right-[14%] sm:right-[22%] w-12 h-12 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-950 p-0.5 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
        >
          <div className="w-full h-full rounded-full bg-slate-900 border-2 border-indigo-400/50 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border border-indigo-500/40" />
          </div>
        </motion.div>
      </div>

      {/* Main Center Content (Transforms with Cinematic Zoom-In when START is clicked) */}
      <motion.div
        animate={{
          scale: isZoomingIn ? 2.5 : 1,
          opacity: isZoomingIn ? 0 : 1,
          filter: isZoomingIn ? 'blur(12px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto"
      >
        {/* Carrom Emblem Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 p-1 shadow-[0_0_50px_rgba(245,158,11,0.6)]">
            <div className="w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden border border-amber-400/30">
              {/* Gloss shine */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <Disc className="w-14 h-14 text-amber-400 animate-spin" style={{ animationDuration: '14s' }} />
              <div className="text-[10px] font-black uppercase font-['Orbitron'] tracking-widest text-amber-300 mt-1">
                PRO EDITION
              </div>
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-amber-300 animate-pulse" />
        </motion.div>

        {/* EXACT REQUIRED WELCOME TITLE */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-widest uppercase mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>REALISTIC MOBILE ARENA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-['Orbitron'] tracking-tight text-white mb-3 drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
            Welcome to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.8)]">
              Carrom Game
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base font-['Rajdhani'] font-semibold max-w-sm mx-auto mb-10">
            Professional carrom physics, authentic wooden board, realistic coins, and thrilling gameplay.
          </p>
        </motion.div>

        {/* PROMINENT "START GAME" BUTTON */}
        <motion.button
          onClick={handleStartClick}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: [1, 1.05, 1], opacity: 1 }}
          transition={{
            scale: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 0.5, delay: 0.4 },
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          className="relative group w-64 sm:w-72 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 font-black font-['Orbitron'] text-xl tracking-wider shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:shadow-[0_0_60px_rgba(245,158,11,0.9)] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          {/* Animated Glow Border */}
          <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-300 to-rose-400 blur-sm opacity-70 group-hover:opacity-100 transition duration-300 -z-10" />
          <Play className="w-6 h-6 fill-slate-950" />
          <span>START GAME</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
