import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Play, AlertTriangle } from 'lucide-react';
import { GameMode } from '../types/carrom';

interface LeaveGameModalProps {
  isOpen: boolean;
  mode: GameMode;
  onContinue: () => void;
  onConfirmLeave: () => void;
}

export const LeaveGameModal: React.FC<LeaveGameModalProps> = ({
  isOpen,
  mode,
  onContinue,
  onConfirmLeave,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-amber-500/30 p-5 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center relative overflow-hidden"
          >
            {/* Header Icon */}
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title & Required Message */}
            <h3 className="text-xl font-black font-['Orbitron'] text-white tracking-wide mb-2">
              Leave Game?
            </h3>
            <p className="text-sm font-['Rajdhani'] font-semibold text-slate-300 leading-relaxed mb-6">
              Are you sure you want to leave this game?
            </p>

            {/* Subtext info based on mode */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 mb-6 text-xs text-slate-400 font-mono">
              {mode === 'practice' ? (
                <span>Your best score and settings are saved automatically.</span>
              ) : mode === 'computer' ? (
                <span>Current match progress with AI will be safely cancelled.</span>
              ) : (
                <span>The 2-player match will safely end without an unfair penalty.</span>
              )}
            </div>

            {/* Required Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onContinue}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-['Orbitron'] text-xs sm:text-sm tracking-wider shadow-lg active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Continue Playing</span>
              </button>

              <button
                type="button"
                onClick={onConfirmLeave}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 border border-rose-500/50 text-rose-300 font-bold font-['Orbitron'] text-xs sm:text-sm tracking-wider active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Leave Game</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
