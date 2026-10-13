import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { PlayerStats, GameMode, AIDifficulty } from '../types/carrom';
import { Trophy, RotateCcw, Menu, Sparkles, Crown, PartyPopper } from 'lucide-react';
import { soundManager } from '../audio/soundEffects';
import { WinnerParticleExplosion } from './WinnerParticleExplosion';
import { triggerImpactHaptic, triggerSubtleTickHaptic } from '../utils/haptics';

interface GameOverModalProps {
  winnerId: string;
  player1: PlayerStats;
  player2: PlayerStats;
  mode: GameMode;
  difficulty?: AIDifficulty;
  onRematch: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winnerId,
  player1,
  player2,
  mode,
  difficulty,
  onRematch,
  onMenu,
}) => {
  const [explosionKey, setExplosionKey] = useState(0);
  const isP1Winner = winnerId === 'player1';
  const is2PlayerMode = mode === '2players';
  const isComputerMode = mode === 'computer';

  // Human victory: either P1 in AI mode, or either player in 2-Player mode
  const isHumanVictory = is2PlayerMode || isP1Winner;
  const winningPlayerName = isP1Winner
    ? player1.name
    : isComputerMode
    ? 'Robot Bot'
    : player2.name;

  useEffect(() => {
    triggerImpactHaptic();

    if (isHumanVictory || (mode === 'practice' && player1.score > 0)) {
      soundManager.playVictorySound();
      // Confetti burst
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#38bdf8', '#f43f5e', '#a855f7', '#34d399', '#fde047'],
      });
    } else {
      soundManager.playDefeatSound();
    }
  }, [isHumanVictory, mode, player1.score]);

  const handleRetriggerExplosion = () => {
    soundManager.playVictorySound();
    triggerImpactHaptic();
    setExplosionKey((prev) => prev + 1);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#38bdf8', '#34d399', '#f43f5e'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-5 sm:p-7 text-center shadow-[0_0_60px_rgba(79,70,229,0.35)] overflow-hidden my-auto"
      >
        {/* Glow backdrop */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
            isHumanVictory ? 'bg-amber-500/25' : 'bg-rose-500/25'
          }`}
        />

        {isHumanVictory ? (
          /* ================= HUMAN VICTORY (P1 in AI mode OR either player in 2P mode) ================= */
          <div className="relative z-10 flex flex-col items-center">
            {/* Winner Celebratory Animation with PARTICLE EXPLOSION OVER WINNER'S AREA */}
            <div className="relative flex items-center justify-center gap-5 sm:gap-6 mb-5">
              {/* Main Winner Area with Particle Explosion Trigger */}
              <div
                key={`winner-explosion-${explosionKey}`}
                onClick={handleRetriggerExplosion}
                className="relative flex flex-col items-center cursor-pointer group"
                title="Click for celebratory fireworks burst!"
              >
                {/* FRAMER-MOTION PARTICLE EXPLOSION BURST DIRECTLY OVER WINNER'S AREA */}
                <WinnerParticleExplosion particleCount={55} />

                <motion.div
                  animate={{
                    y: [-8, 8, -8],
                    rotate: [-10, 10, -10],
                    scale: [1, 1.08, 1],
                  }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-emerald-400 p-1 shadow-[0_0_35px_rgba(245,158,11,0.7)] group-hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-slate-900 rounded-[20px] flex items-center justify-center relative overflow-hidden">
                      <span className="text-4xl sm:text-5xl">🤖</span>
                      {/* Golden Sunglasses */}
                      <div className="absolute top-6 sm:top-7 w-12 sm:w-14 h-3.5 bg-amber-400 rounded-sm shadow-md flex items-center justify-center">
                        <span className="text-[8px] font-black text-slate-950">🕶️ CHAMP</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Champion Badge */}
                <div className="relative z-10 flex items-center gap-1 mt-2 text-xs font-bold text-amber-300 font-['Orbitron'] bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>{winningPlayerName}</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 font-['Rajdhani']">
                  Tap to replay fireworks ✨
                </span>
              </div>

              {/* In Computer Mode: Computer Robot Humorously Crying */}
              {isComputerMode && (
                <motion.div
                  animate={{
                    rotate: [-4, 4, -4],
                    y: [2, -2, 2],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="relative flex flex-col items-center opacity-85"
                >
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 p-1 shadow-md">
                    <div className="w-full h-full bg-slate-900 rounded-[12px] flex items-center justify-center relative overflow-hidden">
                      <span className="text-3xl">😭</span>
                      {/* Animated crying tears */}
                      <motion.div
                        animate={{ y: [0, 18], opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="absolute top-7 left-3 text-cyan-400 text-xs font-bold"
                      >
                        💧
                      </motion.div>
                      <motion.div
                        animate={{ y: [0, 18], opacity: [1, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        className="absolute top-7 right-3 text-cyan-400 text-xs font-bold"
                      >
                        💧
                      </motion.div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-rose-400 mt-1.5 font-['Orbitron']">
                    WAAAH! 💔
                  </span>
                  <span className="text-[9px] text-slate-400">System Meltdown</span>
                </motion.div>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>COSMIC VICTORY!</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-['Orbitron'] text-white mb-1.5 tracking-tight">
              {is2PlayerMode ? `${winningPlayerName.toUpperCase()} WINS!` : 'YOU DEFEATED ME!'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-['Rajdhani'] max-w-sm mb-5">
              {is2PlayerMode
                ? `Sensational carrom match! ${winningPlayerName} conquered the board with superior precision.`
                : 'Magnificent shot accuracy! The computer robot has suffered a humorous system meltdown.'}
            </p>
          </div>
        ) : (
          /* ================= USER DEFEAT (AI WON IN COMPUTER MODE) ================= */
          <div className="relative z-10 flex flex-col items-center">
            {/* Smug Computer Robot Taunt Animation WITH PARTICLE EFFECT OVER ROBOT */}
            <div className="relative mb-5">
              {/* Particle explosion over AI winner */}
              <WinnerParticleExplosion particleCount={40} />

              <motion.div
                animate={{
                  rotate: [-6, 6, -6],
                  y: [-6, 6, -6],
                }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10"
              >
                <div className="w-26 h-26 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-1 shadow-[0_0_35px_rgba(244,63,94,0.5)]">
                  <div className="w-full h-full bg-slate-900 rounded-[20px] flex items-center justify-center relative overflow-hidden">
                    <span className="text-5xl">🤖</span>
                    {/* Pointing finger overlay */}
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], x: [0, 4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute bottom-1 right-2 text-2xl"
                    >
                      🫵
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* THE EXACT USER-SPECIFIED PROMINENT DEFEAT MESSAGE */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border border-rose-500/40 mb-3 shadow-lg w-full">
              <h2 className="text-2xl sm:text-4xl font-black font-['Orbitron'] text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.6)]">
                Defeat Me If Possible! 🫵
              </h2>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-['Rajdhani'] mb-5 max-w-sm">
              The AI Astronaut master proved too accurate this round. Sharpen your aim and challenge again!
            </p>
          </div>
        )}

        {/* Match Summary Scores WITH PARTICLE EXPLOSION OVER WINNING PLAYER'S CARD */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
          {/* Player 1 Summary Card */}
          <div
            className={`relative p-2.5 rounded-xl transition overflow-visible ${
              isP1Winner
                ? 'bg-cyan-950/50 border border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'bg-slate-900/40 border border-slate-800/80'
            }`}
          >
            {isP1Winner && (
              <WinnerParticleExplosion particleCount={25} className="scale-75" />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold truncate font-['Rajdhani']">
                {player1.name}
              </span>
              {isP1Winner && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> WINNER
                </span>
              )}
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Orbitron'] text-cyan-300 block mt-0.5">
              {player1.score} <span className="text-xs font-normal text-slate-400">pts</span>
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              ♛{player1.redPocketed} • ⚪{player1.whitePocketed} • ⚫{player1.blackPocketed}
            </div>
          </div>

          {/* Player 2 / AI Summary Card */}
          <div
            className={`relative p-2.5 rounded-xl transition overflow-visible ${
              !isP1Winner
                ? 'bg-amber-950/50 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/40 border border-slate-800/80'
            }`}
          >
            {!isP1Winner && (
              <WinnerParticleExplosion particleCount={25} className="scale-75" />
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold truncate font-['Rajdhani']">
                {isComputerMode ? 'Astronaut Bot' : player2.name}
              </span>
              {!isP1Winner && (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> WINNER
                </span>
              )}
            </div>
            <span className="text-xl sm:text-2xl font-black font-['Orbitron'] text-amber-300 block mt-0.5">
              {player2.score} <span className="text-xs font-normal text-slate-400">pts</span>
            </span>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              ♛{player2.redPocketed} • ⚪{player2.whitePocketed} • ⚫{player2.blackPocketed}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              triggerSubtleTickHaptic();
              onRematch();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black font-['Orbitron'] text-sm hover:brightness-110 active:scale-95 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              triggerSubtleTickHaptic();
              onMenu();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-['Orbitron'] text-sm transition active:scale-95 flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>MENU</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
