/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GameMode, 
  AIDifficulty, 
  GameStatus, 
  Coin, 
  Striker, 
  PlayerStats, 
  QueenStatus,
  PracticeState,
  BoardSnapshot,
  ControlMode
} from './types/carrom';
import { 
  initializeCoins, 
  createStriker, 
  stepPhysics, 
  BOARD_SIZE, 
  isStrikerPlacementValid
} from './physics/engine';
import { calculateAIShot } from './ai/carromAI';
import { soundManager } from './audio/soundEffects';
import { CosmicBackground } from './components/CosmicBackground';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MainMenu } from './components/MainMenu';
import { CarromCanvas } from './components/CarromCanvas';
import { GameTopHUD, GameBottomControls } from './components/GameHUD';
import { PracticeTopHUD, PracticeBottomControls } from './components/PracticeHUD';
import { PracticeTipsModal } from './components/PracticeTipsModal';
import { PracticeSummaryModal } from './components/PracticeSummaryModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { LeaveGameModal } from './components/LeaveGameModal';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('welcome');
  const [mode, setMode] = useState<GameMode>('computer');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('medium');
  const [controlMode, setControlMode] = useState<ControlMode>('hand');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isTipsOpen, setIsTipsOpen] = useState(false);
  const [isPracticeSummaryOpen, setIsPracticeSummaryOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);

  // Game state
  const [coins, setCoins] = useState<Coin[]>(() => initializeCoins());
  const [striker, setStriker] = useState<Striker>(() => createStriker(true));
  const [activePlayerId, setActivePlayerId] = useState<'player1' | 'player2' | 'computer'>('player1');
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [isMoving, setIsMoving] = useState(false);
  const [foulMessage, setFoulMessage] = useState<string | null>(null);

  // Practice state
  const [practiceState, setPracticeState] = useState<PracticeState>(() => {
    let savedBest = 0;
    try {
      savedBest = Number(localStorage.getItem('cosmic_carrom_practice_best') || 0);
    } catch {
      // ignore
    }
    return {
      shotsTaken: 0,
      bestScore: savedBest,
      strictRules: true,
      showGuideLine: true,
      showCollisionPreview: true,
      selectedTargetCoinId: null,
    };
  });

  // Undo history for Practice Mode
  const [history, setHistory] = useState<BoardSnapshot[]>([]);

  // Queen cover state
  const [queenStatus, setQueenStatus] = useState<QueenStatus>({
    pocketedBy: null,
    needsCover: false,
    covered: false,
  });

  // Players with Automatic Coin Assignment
  const [player1, setPlayer1] = useState<PlayerStats>({
    id: 'player1',
    name: 'Astronaut Sol',
    score: 0,
    assignedColor: 'white',
    coinsRemaining: 9,
    redPocketed: 0,
    whitePocketed: 0,
    blackPocketed: 0,
    fouls: 0,
    avatar: 'sol',
  });

  const [player2, setPlayer2] = useState<PlayerStats>({
    id: 'player2',
    name: 'Cosmonaut Nova',
    score: 0,
    assignedColor: 'black',
    coinsRemaining: 9,
    redPocketed: 0,
    whitePocketed: 0,
    blackPocketed: 0,
    fouls: 0,
    avatar: 'nova',
  });

  const [winnerId, setWinnerId] = useState<string | null>(null);

  // Shot power parameter
  const [shotPower, setShotPower] = useState(0.5);

  // Reference to latest state for physics loop
  const gameStateRef = useRef({
    coins,
    striker,
    isMoving,
    activePlayerId,
    mode,
    difficulty,
    queenStatus,
    practiceState,
    player1,
    player2,
  });

  useEffect(() => {
    gameStateRef.current = {
      coins,
      striker,
      isMoving,
      activePlayerId,
      mode,
      difficulty,
      queenStatus,
      practiceState,
      player1,
      player2,
    };
  }, [coins, striker, isMoving, activePlayerId, mode, difficulty, queenStatus, practiceState, player1, player2]);

  // Handle Emoji reactions
  const handleTriggerEmoji = (emoji: string) => {
    setActiveEmoji(emoji);
    setTimeout(() => setActiveEmoji(null), 1800);
  };

  // Keep track of best practice score in localStorage
  useEffect(() => {
    if (mode === 'practice' && player1.score > practiceState.bestScore) {
      setPracticeState((prev) => {
        const nextBest = player1.score;
        try {
          localStorage.setItem('cosmic_carrom_practice_best', String(nextBest));
        } catch {
          // ignore
        }
        return { ...prev, bestScore: nextBest };
      });
    }
  }, [player1.score, practiceState.bestScore, mode]);

  // Turn Switcher
  const switchTurn = useCallback((penaltyMsg?: string) => {
    if (penaltyMsg) {
      setFoulMessage(penaltyMsg);
      setTimeout(() => setFoulMessage(null), 3000);
    }

    if (mode === 'practice') {
      setStriker(createStriker(true));
      return;
    }

    setTurnTimeLeft(30);

    setActivePlayerId((current) => {
      let nextId: 'player1' | 'player2' | 'computer';
      if (mode === 'computer') {
        nextId = current === 'player1' ? 'computer' : 'player1';
      } else {
        nextId = current === 'player1' ? 'player2' : 'player1';
      }

      const isBottom = nextId === 'player1';
      setStriker(createStriker(isBottom));
      soundManager.playTurnSound();
      return nextId;
    });
  }, [mode]);

  // Handle Queen respawn in center if not covered
  const returnQueenToCenter = useCallback(() => {
    setCoins((prev) =>
      prev.map((c) => {
        if (c.type === 'red') {
          return {
            ...c,
            x: BOARD_SIZE / 2,
            y: BOARD_SIZE / 2,
            vx: 0,
            vy: 0,
            isPocketed: false,
            pocketScale: 1.0,
          };
        }
        return c;
      })
    );
    setQueenStatus({
      pocketedBy: null,
      needsCover: false,
      covered: false,
    });
  }, []);

  // 30-Second Turn Countdown Timer (ONLY for competitive modes, NEVER in Practice Mode!)
  useEffect(() => {
    if (status !== 'playing' || isMoving || mode === 'practice' || isLeaveModalOpen) return;

    const timer = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          soundManager.playFoulSound();

          if (queenStatus.needsCover) {
            returnQueenToCenter();
          }

          switchTurn('FOUL! 30s Time Limit Expired!');
          return 30;
        }

        if (prev <= 6) {
          soundManager.playTimerUrgent();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, isMoving, mode, isLeaveModalOpen, switchTurn, queenStatus.needsCover, returnQueenToCenter]);

  // Start Game with Automatic Coin Assignment
  const handleStartGame = (
    selectedMode: GameMode, 
    selectedDiff?: AIDifficulty,
    p1Color: 'white' | 'black' = 'white'
  ) => {
    setMode(selectedMode);
    if (selectedDiff) setDifficulty(selectedDiff);

    setCoins(initializeCoins());
    setStriker(createStriker(true));
    setActivePlayerId('player1');
    setTurnTimeLeft(30);
    setIsMoving(false);
    setWinnerId(null);
    setQueenStatus({ pocketedBy: null, needsCover: false, covered: false });
    setFoulMessage(null);
    setHistory([]);

    const p2Color: 'white' | 'black' = p1Color === 'white' ? 'black' : 'white';

    if (selectedMode === 'practice') {
      setPracticeState((prev) => ({
        ...prev,
        shotsTaken: 0,
        selectedTargetCoinId: null,
      }));

      setPlayer1({
        id: 'player1',
        name: 'Solo Trainee',
        score: 0,
        assignedColor: 'all',
        coinsRemaining: 19,
        redPocketed: 0,
        whitePocketed: 0,
        blackPocketed: 0,
        fouls: 0,
        avatar: 'sol',
      });
    } else {
      // 2 Player or Computer Mode: Automatic Opposite Coin Assignment!
      setPlayer1({
        id: 'player1',
        name: 'Player 1',
        score: 0,
        assignedColor: p1Color,
        coinsRemaining: 9,
        redPocketed: 0,
        whitePocketed: 0,
        blackPocketed: 0,
        fouls: 0,
        avatar: 'sol',
      });

      setPlayer2({
        id: 'player2',
        name: selectedMode === 'computer' ? 'Robot Bot' : 'Player 2',
        score: 0,
        assignedColor: p2Color,
        coinsRemaining: 9,
        redPocketed: 0,
        whitePocketed: 0,
        blackPocketed: 0,
        fouls: 0,
        avatar: 'nova',
      });
    }

    setStatus('playing');
    soundManager.startAmbient();
  };

  // Shoot Handler
  const handleShoot = useCallback((angle: number, power: number) => {
    if (isMoving) return;

    if (mode === 'practice') {
      const snapshot: BoardSnapshot = {
        coins: coins.map((c) => ({ ...c })),
        striker: { ...striker },
        player1: { ...player1 },
        queenStatus: { ...queenStatus },
        shotsTaken: practiceState.shotsTaken,
      };
      setHistory((prev) => [...prev.slice(-14), snapshot]);
      setPracticeState((prev) => ({ ...prev, shotsTaken: prev.shotsTaken + 1 }));
    }

    const impulse = 350 + power * 950;
    setStriker((prev) => ({
      ...prev,
      vx: Math.cos(angle) * impulse,
      vy: Math.sin(angle) * impulse,
      angle,
      power,
      isMoving: true,
    }));
    setIsMoving(true);
  }, [isMoving, mode, coins, striker, player1, queenStatus, practiceState.shotsTaken]);

  // Undo Last Shot (Practice Mode)
  const handleUndo = useCallback(() => {
    if (isMoving || history.length === 0) return;

    const previousSnapshot = history[history.length - 1];
    setCoins(previousSnapshot.coins);
    setStriker(previousSnapshot.striker);
    setPlayer1(previousSnapshot.player1);
    setQueenStatus(previousSnapshot.queenStatus);
    setPracticeState((prev) => ({ ...prev, shotsTaken: previousSnapshot.shotsTaken }));
    setHistory((prev) => prev.slice(0, -1));
    setFoulMessage(null);
    soundManager.playTick();
  }, [isMoving, history]);

  // Reset Coins / Re-rack formation (Practice Mode)
  const handleResetCoins = useCallback(() => {
    if (isMoving) return;
    setCoins(initializeCoins());
    setStriker(createStriker(true));
    setQueenStatus({ pocketedBy: null, needsCover: false, covered: false });
    setPracticeState((prev) => ({ ...prev, selectedTargetCoinId: null }));
    setFoulMessage(null);
    soundManager.playTurnSound();
  }, [isMoving]);

  // Restart Practice (Full reset score and stats)
  const handleRestartPractice = useCallback(() => {
    if (isMoving) return;
    setCoins(initializeCoins());
    setStriker(createStriker(true));
    setQueenStatus({ pocketedBy: null, needsCover: false, covered: false });
    setPlayer1((p) => ({
      ...p,
      score: 0,
      coinsRemaining: 19,
      redPocketed: 0,
      whitePocketed: 0,
      blackPocketed: 0,
      fouls: 0,
    }));
    setPracticeState((prev) => ({
      ...prev,
      shotsTaken: 0,
      selectedTargetCoinId: null,
    }));
    setHistory([]);
    setFoulMessage(null);
    soundManager.playTurnSound();
  }, [isMoving]);

  // Safely leave active match and return to menu
  const handleConfirmLeaveGame = useCallback(() => {
    setIsLeaveModalOpen(false);
    setIsMoving(false);
    setFoulMessage(null);
    setTurnTimeLeft(30);
    setStatus('menu');
    soundManager.playTick();
  }, []);

  // Striker baseline slider change
  const handleStrikerXChange = (newX: number) => {
    if (isMoving) return;
    if (isStrikerPlacementValid(newX, striker.baselineY, coins)) {
      setStriker((prev) => ({
        ...prev,
        x: newX,
      }));
    }
  };

  // Main Physics Simulation Loop with Coin Color Restrictions & Foul Logic
  useEffect(() => {
    if (status !== 'playing' || !isMoving) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const currentCoins = [...gameStateRef.current.coins];
      const currentStriker = { ...gameStateRef.current.striker };

      const stepRes = stepPhysics(currentCoins, currentStriker, dt);

      setCoins([...currentCoins]);
      setStriker({ ...currentStriker });

      // When all pieces stop moving:
      if (!stepRes.hasMotion) {
        setIsMoving(false);
        const isPractice = gameStateRef.current.mode === 'practice';
        const strictRules = gameStateRef.current.practiceState.strictRules;
        const activeId = gameStateRef.current.activePlayerId;
        const isP1 = activeId === 'player1';

        const p1 = gameStateRef.current.player1;
        const p2 = gameStateRef.current.player2;
        const activeColor = isP1 ? p1.assignedColor : p2.assignedColor;

        let hasFoul = false;
        let foulReason = '';
        let ownCoinsPocketed = 0;
        let queenPocketedNow = false;

        // 1. Striker pocketed foul check
        if (stepRes.strikerPocketed) {
          hasFoul = true;
          foulReason = 'FOUL! Striker Pocketed (-10 pts)';
        }

        // 2. Evaluate pocketed coins
        if (stepRes.pocketedCoins.length > 0) {
          stepRes.pocketedCoins.forEach((pocketed) => {
            if (isPractice) {
              // Practice mode: all pocketed coins are legal
              ownCoinsPocketed++;
              if (pocketed.type === 'red') {
                setPlayer1((p) => ({
                  ...p,
                  score: p.score + 50,
                  redPocketed: p.redPocketed + 1,
                  coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                }));
              } else {
                setPlayer1((p) => ({
                  ...p,
                  score: p.score + (pocketed.type === 'white' ? 20 : 10),
                  whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                  blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                  coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                }));
              }
            } else {
              // Competitive modes (2P and Computer)
              if (pocketed.type === 'red') {
                queenPocketedNow = true;
                setQueenStatus({
                  pocketedBy: activeId,
                  needsCover: true,
                  covered: false,
                });
              } else if (pocketed.type === activeColor) {
                // LEGAL COIN!
                ownCoinsPocketed++;

                // Check if completing Queen cover
                if (
                  gameStateRef.current.queenStatus.needsCover &&
                  gameStateRef.current.queenStatus.pocketedBy === activeId
                ) {
                  setQueenStatus({
                    pocketedBy: activeId,
                    needsCover: false,
                    covered: true,
                  });

                  if (isP1) {
                    setPlayer1((p) => ({
                      ...p,
                      score: p.score + 50 + (pocketed.type === 'white' ? 20 : 10),
                      redPocketed: p.redPocketed + 1,
                      coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                      whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                      blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                    }));
                  } else {
                    setPlayer2((p) => ({
                      ...p,
                      score: p.score + 50 + (pocketed.type === 'white' ? 20 : 10),
                      redPocketed: p.redPocketed + 1,
                      coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                      whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                      blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                    }));
                  }
                } else {
                  // Regular legal assigned coin pocket
                  if (isP1) {
                    setPlayer1((p) => ({
                      ...p,
                      score: p.score + (pocketed.type === 'white' ? 20 : 10),
                      coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                      whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                      blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                    }));
                  } else {
                    setPlayer2((p) => ({
                      ...p,
                      score: p.score + (pocketed.type === 'white' ? 20 : 10),
                      coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                      whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                      blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                    }));
                  }
                }
              } else {
                // ILLEGAL COIN: POCKETED OPPONENT'S COIN!
                hasFoul = true;
                foulReason = `FOUL! Pocketed Opponent's ${pocketed.type.toUpperCase()} Coin (-10 pts)`;

                // Credit the pocketed coin to opponent
                if (isP1) {
                  setPlayer2((p) => ({
                    ...p,
                    score: p.score + (pocketed.type === 'white' ? 20 : 10),
                    coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                    whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                    blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                  }));
                } else {
                  setPlayer1((p) => ({
                    ...p,
                    score: p.score + (pocketed.type === 'white' ? 20 : 10),
                    coinsRemaining: Math.max(0, p.coinsRemaining - 1),
                    whitePocketed: p.whitePocketed + (pocketed.type === 'white' ? 1 : 0),
                    blackPocketed: p.blackPocketed + (pocketed.type === 'black' ? 1 : 0),
                  }));
                }
              }
            }
          });
        }

        // Apply Foul Consequences (if any foul occurred)
        if (hasFoul) {
          soundManager.playFoulSound();
          if (isPractice) {
            if (strictRules) {
              setPlayer1((p) => ({ ...p, score: Math.max(0, p.score - 10), fouls: p.fouls + 1 }));
            }
          } else {
            // Deduct 10 points penalty from active player
            if (isP1) {
              setPlayer1((p) => ({ ...p, score: Math.max(0, p.score - 10), fouls: p.fouls + 1 }));
            } else {
              setPlayer2((p) => ({ ...p, score: Math.max(0, p.score - 10), fouls: p.fouls + 1 }));
            }
          }

          // If Queen was pending cover by active player, Queen returns to center
          if (gameStateRef.current.queenStatus.needsCover) {
            returnQueenToCenter();
          }

          // Turn ends immediately on foul
          switchTurn(foulReason);
          return;
        }

        // Check if Queen was pending cover from a previous shot and wasn't covered now
        if (
          !isPractice &&
          gameStateRef.current.queenStatus.needsCover &&
          !queenPocketedNow &&
          ownCoinsPocketed === 0
        ) {
          returnQueenToCenter();
          switchTurn('Queen not covered! Queen returned to center.');
          return;
        }

        // Practice Mode: user continues shooting freely
        if (isPractice) {
          setStriker(createStriker(true));
          if (ownCoinsPocketed > 0) {
            soundManager.playTurnSound();
          }
          const remaining = currentCoins.filter((c) => !c.isPocketed).length;
          if (remaining === 0) {
            setFoulMessage('✨ Board Cleared! Click Re-rack to practice again.');
          }
          return;
        }

        // Competitive Modes: Extra turn if own coin or Queen pocketed legally, else switch turn
        if (ownCoinsPocketed > 0 || queenPocketedNow) {
          setTurnTimeLeft(30);
          const isBottom = gameStateRef.current.activePlayerId === 'player1';
          setStriker(createStriker(isBottom));
          soundManager.playTurnSound();
        } else {
          switchTurn();
        }

        // Check Win Condition (A player has 0 coins remaining, or board cleared)
        const activeP1Remaining = isP1 
          ? p1.coinsRemaining - ownCoinsPocketed 
          : p1.coinsRemaining;
        const activeP2Remaining = !isP1 
          ? p2.coinsRemaining - ownCoinsPocketed 
          : p2.coinsRemaining;

        if (activeP1Remaining <= 0) {
          setWinnerId('player1');
          setStatus('gameover');
          return;
        }
        if (activeP2Remaining <= 0) {
          setWinnerId('player2');
          setStatus('gameover');
          return;
        }

        const remainingTotal = currentCoins.filter((c) => !c.isPocketed).length;
        if (remainingTotal === 0) {
          setWinnerId(p1.score >= p2.score ? 'player1' : 'player2');
          setStatus('gameover');
        }

        return;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [status, isMoving, switchTurn, returnQueenToCenter]);

  // AI Turn Automation (ONLY in Computer mode)
  useEffect(() => {
    if (
      status !== 'playing' ||
      mode !== 'computer' ||
      activePlayerId !== 'computer' ||
      isMoving ||
      isLeaveModalOpen
    ) {
      return;
    }

    // AI targets only its legally assigned color!
    const plan = calculateAIShot(difficulty, coins, striker, player2.assignedColor as 'white' | 'black');

    const timer = setTimeout(() => {
      setStriker((prev) => ({
        ...prev,
        x: plan.baselineX,
      }));

      setTimeout(() => {
        handleShoot(plan.angle, plan.power);
      }, 350);
    }, plan.thinkingDelay);

    return () => clearTimeout(timer);
  }, [status, mode, activePlayerId, isMoving, isLeaveModalOpen, difficulty, coins, striker, player2.assignedColor, handleShoot]);

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex flex-col justify-between overflow-hidden font-['Space_Grotesk'] select-none">
      {/* Background with Stars, Sun Corona, and Shooting Stars */}
      <CosmicBackground />

      {/* 1. Welcome Screen (Initial landing page with title and START GAME button only) */}
      {status === 'welcome' && (
        <WelcomeScreen onStartGame={() => setStatus('menu')} />
      )}

      {/* 2. Main Menu (Game Mode Selection Screen with 3 options and Coin Assignment) */}
      {status === 'menu' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenRules={() => setIsRulesOpen(true)}
        />
      )}

      {/* 3. Full-Screen Gameplay UI (Top Scoreboard, Center Board, Bottom Controls Dock) */}
      {status === 'playing' && (
        <div className="fixed inset-0 h-[100dvh] w-full flex flex-col justify-between overflow-hidden z-10 py-1">
          {/* Top Scoreboard HUD with Coin Assignments */}
          {mode === 'practice' ? (
            <PracticeTopHUD
              player={player1}
              queenStatus={queenStatus}
              practiceState={practiceState}
              foulMessage={foulMessage}
              onLeaveGame={() => setIsLeaveModalOpen(true)}
            />
          ) : (
            <GameTopHUD
              mode={mode}
              difficulty={difficulty}
              player1={player1}
              player2={player2}
              activePlayerId={activePlayerId}
              turnTimeLeft={turnTimeLeft}
              queenStatus={queenStatus}
              foulMessage={foulMessage}
              onMenu={() => setStatus('menu')}
              onRestart={() => handleStartGame(mode, difficulty, player1.assignedColor as 'white' | 'black')}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onLeaveGame={() => setIsLeaveModalOpen(true)}
            />
          )}

          {/* Centered Wooden Carrom Board Canvas with Miniclip Hand Controls */}
          <CarromCanvas
            coins={coins}
            striker={striker}
            isMyTurn={
              mode === 'practice' ||
              activePlayerId === 'player1' ||
              (mode === '2players' && activePlayerId === 'player2')
            }
            isMoving={isMoving}
            onShoot={handleShoot}
            onStrikerPositionChange={handleStrikerXChange}
            activePlayerId={activePlayerId}
            showGuideLine={mode === 'practice' ? practiceState.showGuideLine : true}
            showCollisionPreview={mode === 'practice' ? practiceState.showCollisionPreview : true}
            selectedTargetCoinId={mode === 'practice' ? practiceState.selectedTargetCoinId : null}
            onSelectTargetCoin={(id) =>
              setPracticeState((p) => ({ ...p, selectedTargetCoinId: id }))
            }
            isPracticeMode={mode === 'practice'}
          />

          {/* Bottom Controls Dock with Hand-Control Mode Toggle */}
          {mode === 'practice' ? (
            <PracticeBottomControls
              practiceState={practiceState}
              onUpdatePracticeState={setPracticeState}
              strikerX={striker.x}
              onStrikerXChange={handleStrikerXChange}
              power={shotPower}
              onPowerChange={setShotPower}
              onShoot={() => handleShoot(striker.angle, shotPower)}
              canShoot={!isMoving}
              canUndo={history.length > 0}
              onUndo={handleUndo}
              onRestartPractice={handleRestartPractice}
              onResetCoins={handleResetCoins}
              onExitPractice={() => setIsPracticeSummaryOpen(true)}
              onOpenTips={() => setIsTipsOpen(true)}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onTriggerEmojiReaction={handleTriggerEmoji}
            />
          ) : (
            <GameBottomControls
              mode={mode}
              strikerX={striker.x}
              onStrikerXChange={handleStrikerXChange}
              power={shotPower}
              onPowerChange={setShotPower}
              onShoot={() => handleShoot(striker.angle, shotPower)}
              canShoot={!isMoving && (mode !== 'computer' || activePlayerId === 'player1')}
              onRestart={() => handleStartGame(mode, difficulty, player1.assignedColor as 'white' | 'black')}
              onMenu={() => setStatus('menu')}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              controlMode={controlMode}
              onToggleControlMode={() => setControlMode((c) => (c === 'hand' ? 'slider' : 'hand'))}
              onTriggerEmojiReaction={handleTriggerEmoji}
            />
          )}

          {/* Floating Quick Emoji Reactions over Board */}
          <AnimatePresence>
            {activeEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1.4, y: -40 }}
                exit={{ opacity: 0, scale: 0.8, y: -80 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl pointer-events-none z-40 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]"
              >
                {activeEmoji}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 4. Game Over Modal (For 2 Players & Computer Mode with victory/crying robot animations) */}
      {status === 'gameover' && (
        <GameOverModal
          winnerId={winnerId || 'player1'}
          player1={player1}
          player2={player2}
          mode={mode}
          difficulty={difficulty}
          onRematch={() => handleStartGame(mode, difficulty, player1.assignedColor as 'white' | 'black')}
          onMenu={() => setStatus('menu')}
        />
      )}

      {/* 5. Practice Session Summary Modal */}
      <PracticeSummaryModal
        isOpen={isPracticeSummaryOpen}
        onClose={() => setIsPracticeSummaryOpen(false)}
        onConfirmExit={() => {
          setIsPracticeSummaryOpen(false);
          setStatus('menu');
        }}
        player={player1}
        shotsTaken={practiceState.shotsTaken}
        bestScore={practiceState.bestScore}
        queenStatus={queenStatus}
      />

      {/* 6. Training Tips Modal */}
      <PracticeTipsModal
        isOpen={isTipsOpen}
        onClose={() => setIsTipsOpen(false)}
      />

      {/* 7. Official Rules & Scoring Guide Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* 8. Leave Game Confirmation Dialog */}
      <LeaveGameModal
        isOpen={isLeaveModalOpen}
        mode={mode}
        onContinue={() => setIsLeaveModalOpen(false)}
        onConfirmLeave={handleConfirmLeaveGame}
      />
    </div>
  );
}
