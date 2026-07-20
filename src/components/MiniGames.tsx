import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import { Trophy, RefreshCw, Star, Info, Gamepad2, Timer, Award, CheckCircle } from 'lucide-react';

interface GameScoreResult {
  reward: number;
  xp: number;
  leveledUp: boolean;
}

export default function MiniGames() {
  const { currentUser, playGameAndSubmitScore, error, clearMessages } = usePayWorth();
  const [selectedGame, setSelectedGame] = useState<'snake' | 'memory' | 'reaction' | null>(null);
  const [gameResult, setGameResult] = useState<GameScoreResult | null>(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Keep track of limits
  const snakePlays = currentUser?.gamesPlayedToday['snake'] || 0;
  const memoryPlays = currentUser?.gamesPlayedToday['memory'] || 0;
  const reactionPlays = currentUser?.gamesPlayedToday['reaction'] || 0;

  const handleGameFinished = async (gameId: string, score: number) => {
    try {
      const res = await playGameAndSubmitScore(gameId, score);
      if (res.success) {
        setGameResult({
          reward: res.reward,
          xp: res.xp,
          leveledUp: res.leveledUp,
        });
      } else {
        setGameResult({
          reward: 0,
          xp: 0,
          leveledUp: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Gamepad2 className="text-emerald-400 w-6 h-6" /> Game Arcade Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Prove human-reflex integrity, earn PayWorth Coins, and gain level XP. Limited to 5 rewarding sessions per game daily.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGame ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Snake Game Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-300" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium tracking-wider uppercase">
                    Retro Arcade
                  </span>
                  <h3 className="text-lg font-medium text-white mt-2">Liquid Snake Particle</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Steer the liquid particle collector, consume tokens, and avoid crashing into custom glass walls.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Plays Today</span>
                  <span className="text-sm font-semibold text-white">{snakePlays}/5</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Up to +10 PWC & +50 XP
                </span>
                <button
                  onClick={() => {
                    clearMessages();
                    setGameResult(null);
                    setSelectedGame('snake');
                  }}
                  disabled={snakePlays >= 5}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {snakePlays >= 5 ? 'Limit Reached' : 'Launch Engine'}
                </button>
              </div>
            </div>

            {/* Memory Card Match */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all duration-300" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium tracking-wider uppercase">
                    Cognitive Test
                  </span>
                  <h3 className="text-lg font-medium text-white mt-2">Crystal Memory Match</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Match identical refractive crystals in the shortest moves possible to test mental calculation speed.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Plays Today</span>
                  <span className="text-sm font-semibold text-white">{memoryPlays}/5</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] text-purple-300 font-mono flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Up to +8 PWC & +40 XP
                </span>
                <button
                  onClick={() => {
                    clearMessages();
                    setGameResult(null);
                    setSelectedGame('memory');
                  }}
                  disabled={memoryPlays >= 5}
                  className="bg-purple-500 hover:bg-purple-400 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {memoryPlays >= 5 ? 'Limit Reached' : 'Launch Engine'}
                </button>
              </div>
            </div>

            {/* Reaction Speed Bubble */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all duration-300" />
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium tracking-wider uppercase">
                    Anti-Bot Guard
                  </span>
                  <h3 className="text-lg font-medium text-white mt-2">Refraction Click latency</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs">
                    Click the reactive glass capsule instantly as it shifts refractive state. Proofs bot immunity.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Plays Today</span>
                  <span className="text-sm font-semibold text-white">{reactionPlays}/5</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Up to +5 PWC & +30 XP
                </span>
                <button
                  onClick={() => {
                    clearMessages();
                    setGameResult(null);
                    setSelectedGame('reaction');
                  }}
                  disabled={reactionPlays >= 5}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {reactionPlays >= 5 ? 'Limit Reached' : 'Launch Engine'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-950/40 border border-white/10 rounded-3xl p-6 backdrop-blur-lg relative"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest font-mono">
                Active Session: {selectedGame.toUpperCase()}
              </span>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setGameResult(null);
                }}
                className="text-xs text-slate-400 hover:text-white font-medium bg-white/5 px-2.5 py-1 rounded-lg hover:bg-white/10"
              >
                Quit Game
              </button>
            </div>

            {/* Render selected game */}
            {selectedGame === 'snake' && (
              <SnakeGame onFinished={(score) => handleGameFinished('snake', score)} />
            )}
            {selectedGame === 'memory' && (
              <MemoryGame onFinished={(score) => handleGameFinished('memory', score)} />
            )}
            {selectedGame === 'reaction' && (
              <ReactionGame onFinished={(score) => handleGameFinished('reaction', score)} />
            )}

            {/* Render results dialog overlay */}
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold text-sm">Legitimacy Audit Completed!</h4>
                {gameResult.reward > 0 ? (
                  <p className="text-xs text-slate-300 mt-1">
                    Your interactive session was recorded on our ledger. Earned{' '}
                    <span className="text-emerald-400 font-semibold">{gameResult.reward} PWC</span> and{' '}
                    <span className="text-indigo-400 font-semibold">+{gameResult.xp} XP</span>.
                  </p>
                ) : (
                  <p className="text-xs text-slate-300 mt-1">
                    Session finished but no rewards earned (either limit exceeded or score was insufficient). Keep practicing!
                  </p>
                )}
                {gameResult.leveledUp && (
                  <div className="mt-2 text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-1 rounded-lg inline-block">
                    🎉 Level Up Achieved!
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setGameResult(null);
                  }}
                  className="mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-1.5 rounded-lg"
                >
                  Return to Arcade
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================================
   SNAKE GAME COMPONENT
   ========================================================================== */
function SnakeGame({ onFinished }: { onFinished: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Snake config
  const GRID_SIZE = 15;
  const CELL_COUNT = 16;
  const initialSnake = [
    { x: 8, y: 8 },
    { x: 8, y: 9 },
    { x: 8, y: 10 },
  ];
  const snakeRef = useRef(initialSnake);
  const directionRef = useRef({ x: 0, y: -1 }); // Going Up
  const foodRef = useRef({ x: 4, y: 4 });
  const gameIntervalRef = useRef<number | null>(null);

  const spawnFood = () => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * CELL_COUNT),
        y: Math.floor(Math.random() * CELL_COUNT),
      };
      // Check collision with snake
      const hit = snakeRef.current.some((segment) => segment.x === newFood!.x && segment.y === newFood!.y);
      if (!hit) break;
    }
    foodRef.current = newFood;
  };

  const resetGame = () => {
    snakeRef.current = [
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
    ];
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    spawnFood();
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const head = snakeRef.current[0];
      const dir = directionRef.current;
      const newHead = { x: head.x + dir.x, y: head.y + dir.y };

      // Collision checks with bounds
      if (newHead.x < 0 || newHead.x >= CELL_COUNT || newHead.y < 0 || newHead.y >= CELL_COUNT) {
        handleGameOver();
        return;
      }

      // Collision check with self
      if (snakeRef.current.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        handleGameOver();
        return;
      }

      // Move snake
      const newSnake = [newHead, ...snakeRef.current];
      // Check food
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => s + 10);
        spawnFood();
      } else {
        newSnake.pop();
      }
      snakeRef.current = newSnake;

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid subtle background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < CELL_COUNT; i++) {
        for (let j = 0; j < CELL_COUNT; j++) {
          ctx.fillRect(i * GRID_SIZE + 1, j * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
      }

      // Draw food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
        foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw Snake with beautiful liquid emerald color
      snakeRef.current.forEach((segment, idx) => {
        ctx.fillStyle = idx === 0 ? '#10b981' : 'rgba(16, 185, 129, 0.6)';
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      });
    };

    gameIntervalRef.current = window.setInterval(gameLoop, 150);

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    onFinished(score);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (dir.y === 0) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (dir.y === 0) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (dir.x === 0) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (dir.x === 0) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handleDirectChange = (x: number, y: number) => {
    if (!isPlaying) return;
    const dir = directionRef.current;
    if (x !== 0 && dir.x === 0) directionRef.current = { x, y: 0 };
    if (y !== 0 && dir.y === 0) directionRef.current = { x: 0, y };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 px-1">
        <span className="text-xs text-slate-400">Score: <strong className="text-white">{score}</strong></span>
        <span className="text-xs text-slate-400">Target score: <strong className="text-emerald-400">30+ Points</strong></span>
      </div>

      <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/40">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_COUNT}
          height={GRID_SIZE * CELL_COUNT}
          className="block"
        />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            {gameOver ? (
              <>
                <h4 className="text-red-400 font-semibold mb-1">Crash Detected!</h4>
                <p className="text-xs text-slate-300 mb-4">Total score gathered: {score} points.</p>
              </>
            ) : (
              <>
                <Gamepad2 className="w-10 h-10 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Liquid Snake Canvas</h4>
                <p className="text-[11px] text-slate-400 mb-4 max-w-[200px]">
                  Use screen arrows or keyboard keys to steer. Prove bot-free motor response.
                </p>
              </>
            )}
            <button
              onClick={resetGame}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              {gameOver ? 'Try Again' : 'Start Session'}
            </button>
          </div>
        )}
      </div>

      {/* Screen Controller (for mobile layout support) */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-36">
        <div />
        <button
          onClick={() => handleDirectChange(0, -1)}
          className="bg-white/10 hover:bg-white/20 active:scale-90 text-white font-bold p-3 rounded-xl border border-white/5 flex items-center justify-center"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => handleDirectChange(-1, 0)}
          className="bg-white/10 hover:bg-white/20 active:scale-90 text-white font-bold p-3 rounded-xl border border-white/5 flex items-center justify-center"
        >
          ◀
        </button>
        <div className="bg-white/5 rounded-xl flex items-center justify-center text-[10px] text-slate-500 font-mono">
          PAD
        </div>
        <button
          onClick={() => handleDirectChange(1, 0)}
          className="bg-white/10 hover:bg-white/20 active:scale-90 text-white font-bold p-3 rounded-xl border border-white/5 flex items-center justify-center"
        >
          ▶
        </button>
        <div />
        <button
          onClick={() => handleDirectChange(0, 1)}
          className="bg-white/10 hover:bg-white/20 active:scale-90 text-white font-bold p-3 rounded-xl border border-white/5 flex items-center justify-center"
        >
          ▼
        </button>
        <div />
      </div>
    </div>
  );
}

/* ==========================================================================
   MEMORY GAME COMPONENT
   ========================================================================== */
interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function MemoryGame({ onFinished }: { onFinished: (score: number) => void }) {
  const SYMBOLS = ['💎', '⭐️', '👑', '🔥', '🍀', '🍎', '🎁', '⚡️'];
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const initGame = () => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .map((sym, idx) => ({
        id: idx,
        symbol: sym,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setSelectedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
  };

  const handleCardClick = (id: number) => {
    if (!isPlaying || selectedCards.length >= 2) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    // Flip card
    const updated = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(updated);

    const nextSelection = [...selectedCards, id];
    setSelectedCards(nextSelection);

    if (nextSelection.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextSelection;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);

          // Check Win Condition
          setCards((prev) => {
            const won = prev.every((c) => c.isMatched || c.id === firstId || c.id === secondId);
            if (won) {
              setIsWon(true);
              setIsPlaying(false);
              // Max score is 50, based on performance moves: Score = Math.max(10, 80 - Moves * 3)
              const finalScore = Math.max(10, 80 - (moves + 1) * 3);
              onFinished(finalScore);
            }
            return prev;
          });
        }, 500);
      } else {
        // Flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 px-1">
        <span className="text-xs text-slate-400">Moves: <strong className="text-white">{moves}</strong></span>
        <span className="text-xs text-slate-400">Goal: <strong className="text-purple-400">Match All Cards</strong></span>
      </div>

      {!isPlaying ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center w-full max-w-[280px]">
          <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-white text-sm font-semibold mb-1">
            {isWon ? 'Perfect Match Complete!' : 'Crystal Memory Match'}
          </h4>
          <p className="text-[11px] text-slate-400 mb-4">
            {isWon
              ? `Matches finished in ${moves} moves.`
              : 'Reveal matches with minimum moves to prove human logical coordination.'}
          </p>
          <button
            onClick={initGame}
            className="bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all shadow-md"
          >
            {isWon ? 'Play Again' : 'Start Match'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 w-full max-w-[280px]">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`h-16 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300 transform font-sans text-xl ${
                card.isFlipped || card.isMatched
                  ? 'bg-purple-500/20 border-purple-500/40 rotate-180 text-white'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95'
              }`}
            >
              <span className={`select-none ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
                {card.symbol}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   REACTION SPEED GAME COMPONENT
   ========================================================================== */
function ReactionGame({ onFinished }: { onFinished: (score: number) => void }) {
  const [gameState, setGameState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [latency, setLatency] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const startTest = () => {
    setGameState('waiting');
    setLatency(null);
    const delay = 1500 + Math.random() * 3000; // 1.5 to 4.5 seconds

    timerRef.current = window.setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      // Too early, trigger penalty warning (prevents autoclickers spamming)
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('idle');
      alert('Too Early! Wait until the container capsule flashes green. Anti-cheat triggered.');
      return;
    }

    if (gameState === 'ready') {
      const clickTime = Date.now();
      const ms = clickTime - startTime;
      setLatency(ms);
      setGameState('result');
      // Score calculation: faster latency gives more score. Under 250ms is excellent human.
      // Maximum score is 50. Score = Math.max(10, Math.floor(10000 / ms))
      const calculatedScore = Math.max(10, Math.min(50, Math.floor(10000 / ms)));
      onFinished(calculatedScore);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 px-1">
        <span className="text-xs text-slate-400">Response Speed</span>
        <span className="text-xs text-slate-400">Standard Human: <strong className="text-amber-400">200–280ms</strong></span>
      </div>

      <div
        onClick={handleClick}
        className={`w-full max-w-[280px] h-48 rounded-3xl border flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-all duration-300 ${
          gameState === 'idle'
            ? 'bg-white/5 border-white/10 hover:bg-white/10'
            : gameState === 'waiting'
            ? 'bg-red-500/10 border-red-500/20'
            : gameState === 'ready'
            ? 'bg-emerald-500/20 border-emerald-500/40 ring-4 ring-emerald-500/10'
            : 'bg-white/5 border-white/10'
        }`}
      >
        {gameState === 'idle' && (
          <>
            <Timer className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="text-white font-semibold text-sm">Latency Trigger Box</h4>
            <p className="text-[10px] text-slate-400 mb-4">Click anywhere inside this card to initiate the test sequence.</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startTest();
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Start Calibration
            </button>
          </>
        )}

        {gameState === 'waiting' && (
          <>
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
            <h4 className="text-red-400 font-bold text-lg uppercase tracking-wider mb-2">CALIBRATING...</h4>
            <p className="text-[11px] text-slate-300">Wait... Click IMMEDIATELY when the card turns bright green.</p>
          </>
        )}

        {gameState === 'ready' && (
          <>
            <h4 className="text-emerald-400 font-extrabold text-2xl uppercase tracking-widest animate-pulse mb-1">TAP NOW!</h4>
            <p className="text-xs text-emerald-300">FAST!</p>
          </>
        )}

        {gameState === 'result' && latency !== null && (
          <>
            <Trophy className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
            <h4 className="text-white font-semibold text-sm">Calibration Clear</h4>
            <p className="text-2xl font-mono text-amber-400 font-extrabold mt-1">{latency} ms</p>
            <p className="text-[10px] text-slate-400 mt-2">
              {latency < 200
                ? '⚡️ Exceptional Reflex Velocity!'
                : latency < 300
                ? '🟢 Sound Human Response Range.'
                : '🟡 Response delay noted.'}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startTest();
              }}
              className="mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-semibold px-4 py-1.5 rounded-lg"
            >
              Re-Calibrate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
