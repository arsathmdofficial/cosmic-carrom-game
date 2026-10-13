import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Target, Award, ShieldAlert, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { PlayerStats, QueenStatus } from '../types/carrom';

interface PracticeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  player: PlayerStats;
  shotsTaken: number;
  bestScore: number;
  queenStatus: QueenStatus;
}

export const PracticeSummaryModal: React.FC<PracticeSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
  player,
  shotsTaken,
  bestScore,
  queenStatus,
}) => {
  const totalCoinsPocketed = player.redPocketed + player.whitePocketed + player.blackPocketed;
  const potEfficiency = shotsTaken > 0 ? Math.round((totalCoinsPocketed / shotsTaken) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-indigo-500/30 p-6 sm:p-8 text-white shadow-[0_0_60px_rgba(79,70,229,0.3)] text-center"
          >
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-cyan-400 p-0.5 mx-auto mb-4 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron'] text-white mb-1">
              Practice Session Summary
            </h2>
            <p className="text-xs text-slate-400 font-['Rajdhani'] mb-6">
              Review your training stats before exiting
            </p>

            {/* Main Score & Best Score Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left">
                <span className="text-xs text-slate-400 font-['Rajdhani'] block">SESSION SCORE</span>
                <span className="text-3xl font-black font-['Orbitron'] text-cyan-300">
                  {player.score}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">points</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-left">
                <span className="text-xs text-amber-300 font-['Rajdhani'] flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  BEST SCORE
                </span>
                <span className="text-3xl font-black font-['Orbitron'] text-amber-300">
                  {Math.max(bestScore, player.score)}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-0.5 font-mono">record</span>
              </div>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-5 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block">Shots Taken</span>
                <span className="text-lg font-bold font-mono text-white">{shotsTaken}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Coins Pocketed</span>
                <span className="text-lg font-bold font-mono text-emerald-400">{totalCoinsPocketed}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Pot Efficiency</span>
                <span className="text-lg font-bold font-mono text-cyan-300">{potEfficiency}%</span>
              </div>
            </div>

            {/* Coins Breakdown */}
            <div className="flex items-center justify-around p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs mb-6 font-mono">
              <div className="flex items-center gap-1.5 text-rose-300">
                <span className="text-base">♛</span>
                <span>{player.redPocketed} Red (50pts)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <span className="text-base">⚪</span>
                <span>{player.whitePocketed} White (20pts)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="text-base">⚫</span>
                <span>{player.blackPocketed} Black (10pts)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onClose}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold font-['Orbitron'] text-xs text-white hover:brightness-110 active:scale-95 transition shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Keep Practicing</span>
              </button>

              <button
                onClick={onConfirmExit}
                className="w-full sm:flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:border-rose-500 text-slate-300 hover:text-rose-300 border border-slate-700 font-bold font-['Orbitron'] text-xs active:scale-95 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Menu</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
