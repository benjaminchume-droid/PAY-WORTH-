import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import {
  Trophy, RefreshCw, Star, Info, Gamepad2, Timer, Award, CheckCircle,
  Zap, Crosshair, Brain, ShieldAlert, Cpu, Layers, Disc, Sparkles,
  Hash, Play, Activity, Check, Flame, ChevronRight, Lock, Eye, AlertTriangle
} from 'lucide-react';

interface GameScoreResult {
  reward: number;
  xp: number;
  leveledUp: boolean;
}

interface GameDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  maxReward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
  iconName: string;
}

const ALL_GAMES: GameDefinition[] = [
  {
    id: 'snake',
    title: 'Liquid Snake Particle',
    category: 'Retro Arcade',
    description: 'Steer the liquid particle collector, consume tokens, and avoid crashing into custom glass walls.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Medium',
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    iconName: 'Gamepad2'
  },
  {
    id: 'memory',
    title: 'Crystal Memory Match',
    category: 'Cognitive Test',
    description: 'Match identical refractive crystals in the shortest moves possible to test mental calculation speed.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Easy',
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    iconName: 'Brain'
  },
  {
    id: 'reaction',
    title: 'Refraction Click Latency',
    category: 'Anti-Bot Guard',
    description: 'Click the reactive glass capsule instantly as it shifts refractive state. Proofs bot immunity.',
    maxReward: 'Up to +40 PWC & +30 XP',
    difficulty: 'Easy',
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    iconName: 'Timer'
  },
  {
    id: 'binary_pulse',
    title: 'Binary Pulse Beat',
    category: 'Reflex/Tempo',
    description: 'Tap the glowing pulse at the precise millisecond it overlaps with the container\'s perimeter.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Hard',
    color: 'text-pink-400 border-pink-500/20 bg-pink-500/5',
    iconName: 'Activity'
  },
  {
    id: 'math_refactor',
    title: 'Math Refactor Speed',
    category: 'Cognitive Challenge',
    description: 'Solve dynamic arithmetic calculations correctly under rapid sliding pressure.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Medium',
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    iconName: 'Hash'
  },
  {
    id: 'color_refract',
    title: 'Color Swatch Stroop',
    category: 'Cognitive/Visual',
    description: 'Match the text representation of a color with its actual physical refracted pigment swatch.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
    iconName: 'Sparkles'
  },
  {
    id: 'pattern_replicator',
    title: 'Pattern Replicator',
    category: 'Cognitive Sequence',
    description: 'Repeat the sequence of light and sound flashes in correct logical progression.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Hard',
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    iconName: 'Layers'
  },
  {
    id: 'meteor_shield',
    title: 'Meteor Shield Vector',
    category: 'Reflex/Defense',
    description: 'Tap incoming high-velocity meteorites before they penetrate the glass atmospheric grid.',
    maxReward: 'Up to +40 PWC & +45 XP',
    difficulty: 'Medium',
    color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    iconName: 'ShieldAlert'
  },
  {
    id: 'hex_decoder',
    title: 'Hexadecimal Decoder',
    category: 'Cognitive/Logic',
    description: 'Scan byte sequences rapidly and identify the odd non-conforming hex cluster.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Hard',
    color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    iconName: 'Cpu'
  },
  {
    id: 'bubble_pop',
    title: 'Refractive Bubble Pop',
    category: 'Reflex/Pop',
    description: 'Pop rising translucent bubbles before they reach full expansion and shatter.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
    iconName: 'Disc'
  },
  {
    id: 'quantum_flip',
    title: 'Quantum Coin Flip',
    category: 'Skill/Timing',
    description: 'Press stop precisely when the coin aligns horizontally to secure high performance rewards.',
    maxReward: 'Up to +40 PWC & +35 XP',
    difficulty: 'Medium',
    color: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
    iconName: 'Trophy'
  },
  {
    id: 'grid_pathfinder',
    title: 'Grid Pathfinder',
    category: 'Cognitive/Maze',
    description: 'Memorize a short sequence through the layout grid and trace it back perfectly.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Medium',
    color: 'text-lime-400 border-lime-500/20 bg-lime-500/5',
    iconName: 'Crosshair'
  },
  {
    id: 'speed_typist',
    title: 'Speed Typist Pulse',
    category: 'Skill/Words',
    description: 'Type fast-scrolling security hash key strings correctly under intense time stress.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Medium',
    color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    iconName: 'Gamepad2'
  },
  {
    id: 'block_tower',
    title: 'Glass Block Tower',
    category: 'Reflex/Balance',
    description: 'Stack moving glass blocks precisely atop one another to assemble the highest tower.',
    maxReward: 'Up to +40 PWC & +45 XP',
    difficulty: 'Medium',
    color: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5',
    iconName: 'Layers'
  },
  {
    id: 'precision_aim',
    title: 'Target Precision Tracker',
    category: 'Reflex/Aim',
    description: 'Tap erratic moving targets that hop across the refracting field.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Medium',
    color: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
    iconName: 'Crosshair'
  },
  {
    id: 'frequency_tuner',
    title: 'Frequency Wave Tuner',
    category: 'Reflex/Sound',
    description: 'Adjust a slider to synchronize a liquid sine-wave frequency perfectly with a target wave template.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    iconName: 'Timer'
  },
  {
    id: 'word_decrypt',
    title: 'Word Decrypt Crypt',
    category: 'Cognitive/Words',
    description: 'Unscramble key security keywords from their randomized letter matrices.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5',
    iconName: 'Brain'
  },
  {
    id: 'odd_tile',
    title: 'Odd Tile Spotter',
    category: 'Cognitive/Vision',
    description: 'Spot the single color tile of a slightly different shade inside an expanding grid.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
    iconName: 'Sparkles'
  },
  {
    id: 'elastic_bounce',
    title: 'Elastic Paddle Bounce',
    category: 'Reflex/Paddle',
    description: 'Slide a bottom paddle to keep a bouncing liquid droplet inside the glass chamber.',
    maxReward: 'Up to +40 PWC & +50 XP',
    difficulty: 'Hard',
    color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
    iconName: 'Activity'
  },
  {
    id: 'captcha_shards',
    title: 'Captcha Shards Solver',
    category: 'Skill/Verification',
    description: 'Locate and click only the tiles that contain pure high-contrast crystal refraction fragments.',
    maxReward: 'Up to +40 PWC & +40 XP',
    difficulty: 'Easy',
    color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    iconName: 'ShieldAlert'
  }
];

export default function MiniGames() {
  const { currentUser, playGameAndSubmitScore, selectGameForLineup, error, clearMessages } = usePayWorth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameScoreResult | null>(null);
  const [timeToMidnight, setTimeToMidnight] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Daily selections & counts
  const selectedGames = currentUser?.selectedGamesToday || [];
  const gamesPlayedToday = currentUser?.gamesPlayedToday || ({} as Record<string, number>);
  const totalPlaysToday = Object.values(gamesPlayedToday).reduce((sum: number, val: number) => sum + val, 0) as number;

  // Midnight reset clock countdown
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeToMidnight(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const renderGameIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Gamepad2': return <Gamepad2 className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Timer': return <Timer className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Hash': return <Hash className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'Disc': return <Disc className={className} />;
      case 'Crosshair': return <Crosshair className={className} />;
      default: return <Trophy className={className} />;
    }
  };

  const filteredGamesList = ALL_GAMES.filter(g => 
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 font-sans text-white">
      {/* Upper Information Stats */}
      <div className="mb-6 bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-lg">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Gamepad2 className="text-emerald-400 w-6 h-6 animate-pulse" /> PayWorth Games Hub
          </h1>
          <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300 flex items-center gap-1">
            <Timer className="w-3 h-3 text-emerald-400" /> Reset in: {timeToMidnight}
          </span>
        </div>
        
        {/* Play capacity progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Daily Play Capacity</span>
            <span className="font-semibold text-white">{totalPlaysToday}/25 Sessions Played</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500" 
              style={{ width: `${(totalPlaysToday / 25) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Each game is limited to 5 high-rewarding sessions daily to guarantee security and fair distribution.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGame ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Daily Lineup Tracker */}
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              <h3 className="text-sm font-semibold tracking-wide text-slate-300 uppercase mb-3 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Today's 5 Game Lineup
              </h3>

              {/* Selection Slots */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[0, 1, 2, 3, 4].map((index) => {
                  const gameId = selectedGames[index];
                  const game = ALL_GAMES.find(g => g.id === gameId);
                  
                  if (game) {
                    const plays = gamesPlayedToday[game.id] || 0;
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="aspect-square bg-white/10 border border-white/20 rounded-2xl flex flex-col items-center justify-center p-1.5 relative group cursor-pointer hover:border-emerald-400/40 transition-colors"
                        onClick={() => {
                          clearMessages();
                          setGameResult(null);
                          setSelectedGame(game.id);
                        }}
                      >
                        {renderGameIcon(game.iconName, 'w-5 h-5 text-emerald-400')}
                        <span className="text-[9px] text-center font-medium truncate w-full mt-1.5 text-slate-200">
                          {game.title.split(' ')[0]}
                        </span>
                        <span className="text-[8px] font-mono px-1 py-0.2 bg-black/40 rounded-full mt-0.5 text-slate-400">
                          {plays}/5
                        </span>
                        {plays >= 5 && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </motion.div>
                    );
                  }

                  return (
                    <div 
                      key={index} 
                      className="aspect-square bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-2 text-slate-500"
                    >
                      <Lock className="w-4 h-4 text-slate-600 mb-1" />
                      <span className="text-[8px] uppercase tracking-wider font-mono">Empty</span>
                    </div>
                  );
                })}
              </div>

              {selectedGames.length < 5 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex gap-2.5 items-start text-xs text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Lineup Unfinished</span>
                    You must select exactly 5 games from the catalog below to activate today's interactive session rewards. ({selectedGames.length}/5 selected)
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex gap-2.5 items-start text-xs text-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Lineup Fully Locked</span>
                    Your daily selection is initialized! Click any active game card above or below to launch the engine and compete.
                  </div>
                </div>
              )}
            </div>

            {/* Game Catalog Search */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold tracking-tight">Available Skill-Games (20)</h3>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs outline-none focus:border-emerald-500/40 w-36 transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex gap-2 items-center">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  {error}
                </div>
              )}

              {/* Games Grid Catalog */}
              <div className="grid grid-cols-1 gap-3.5">
                {filteredGamesList.map((game) => {
                  const isSelected = selectedGames.includes(game.id);
                  const playCount = gamesPlayedToday[game.id] || 0;
                  const canSelect = selectedGames.length < 5;

                  return (
                    <div 
                      key={game.id} 
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-white/20 transition-all"
                    >
                      {/* Decorative refraction circle */}
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/2 rounded-full blur-xl group-hover:bg-white/5 transition-all duration-300" />
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3">
                          <div className={`p-3 rounded-xl border self-start ${game.color}`}>
                            {renderGameIcon(game.iconName, 'w-5 h-5')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-white">{game.title}</h4>
                              <span className="text-[9px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
                                {game.difficulty}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                              {game.category}
                            </span>
                            <p className="text-xs text-slate-300 mt-1 max-w-xs leading-normal">
                              {game.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] text-slate-400 block font-mono">Session Limit</span>
                            <span className="text-xs font-bold text-emerald-400 font-mono">{playCount}/5 Plays</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-400" /> {game.maxReward}
                        </span>

                        {isSelected ? (
                          <button
                            onClick={() => {
                              clearMessages();
                              setGameResult(null);
                              setSelectedGame(game.id);
                            }}
                            disabled={playCount >= 5 || totalPlaysToday >= 25}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" /> {playCount >= 5 ? 'Limit Reached' : 'Launch Game'}
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              clearMessages();
                              await selectGameForLineup(game.id);
                            }}
                            disabled={!canSelect}
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-medium px-4 py-1.5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {canSelect ? 'Add to Lineup' : 'Lineup Locked'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                  🎮 {ALL_GAMES.find(g => g.id === selectedGame)?.title.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedGame(null);
                  setGameResult(null);
                  clearMessages();
                }}
                className="text-xs text-slate-400 hover:text-white font-medium bg-white/5 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                Quit Session
              </button>
            </div>

            {/* Error alerts during gameplay */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-mono">
                {error}
              </div>
            )}

            {/* Game Engines Selector */}
            <div className="min-h-[220px] flex items-center justify-center">
              {selectedGame === 'snake' && (
                <SnakeGame onFinished={(score) => handleGameFinished('snake', score)} />
              )}
              {selectedGame === 'memory' && (
                <MemoryGame onFinished={(score) => handleGameFinished('memory', score)} />
              )}
              {selectedGame === 'reaction' && (
                <ReactionGame onFinished={(score) => handleGameFinished('reaction', score)} />
              )}
              {/* Universal challenging gameplay templates for other 17 games */}
              {selectedGame !== 'snake' && selectedGame !== 'memory' && selectedGame !== 'reaction' && (
                <UniversalGameEngine 
                  gameId={selectedGame} 
                  gameDef={ALL_GAMES.find(g => g.id === selectedGame)!}
                  onFinished={(score) => handleGameFinished(selectedGame, score)} 
                />
              )}
            </div>

            {/* Results dialog overlay */}
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center"
              >
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-white font-semibold text-sm">Session Validation Completed!</h4>
                {gameResult.reward > 0 ? (
                  <p className="text-xs text-slate-300 mt-1 leading-normal">
                    Interactive session verified on PayWorth ledgers. Earned{' '}
                    <span className="text-emerald-400 font-bold">{gameResult.reward} PWC</span> and{' '}
                    <span className="text-indigo-400 font-bold">+{gameResult.xp} XP</span>.
                  </p>
                ) : (
                  <p className="text-xs text-slate-300 mt-1 leading-normal">
                    Session complete, but rewards not credited (either played under 0 performance score, limit exceeded, or verification failure). Keep practicing!
                  </p>
                )}
                {gameResult.leveledUp && (
                  <div className="mt-2 text-xs bg-indigo-500/20 text-indigo-300 font-bold px-2 py-1 rounded-lg inline-block animate-bounce">
                    🎉 Level Up Achieved!
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    setGameResult(null);
                    clearMessages();
                  }}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-all"
                >
                  Return to Arcade Hub
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
   SNAKE GAME COMPONENT (Refactored & Perfected)
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

      // Bounds check
      if (newHead.x < 0 || newHead.x >= CELL_COUNT || newHead.y < 0 || newHead.y >= CELL_COUNT) {
        handleGameOver();
        return;
      }

      // Self check
      if (snakeRef.current.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
        handleGameOver();
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];
      // Food check
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => s + 30); // 30 score per food (payouts of up to 40 PWC, score of 400 yields 40 PWC max)
        spawnFood();
      } else {
        newSnake.pop();
      }
      snakeRef.current = newSnake;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      for (let i = 0; i < CELL_COUNT; i++) {
        for (let j = 0; j < CELL_COUNT; j++) {
          ctx.fillRect(i * GRID_SIZE + 1, j * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        }
      }

      // Draw food
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * GRID_SIZE + GRID_SIZE / 2,
        foodRef.current.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw Snake segments
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
      <div className="flex justify-between w-full mb-3 px-1 text-xs">
        <span className="text-slate-400">Score: <strong className="text-white">{score}</strong></span>
        <span className="text-slate-400">PWC Potential: <strong className="text-emerald-400">+{Math.min(40, Math.floor(score / 10))} PWC</strong></span>
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
                <p className="text-xs text-slate-300 mb-4">You gathered {score} points total.</p>
              </>
            ) : (
              <>
                <Gamepad2 className="w-10 h-10 text-emerald-400 mb-2" />
                <h4 className="text-white font-semibold mb-1">Liquid Snake Canvas</h4>
                <p className="text-[11px] text-slate-400 mb-4 max-w-[200px]">
                  Use keyboard keys or gamepad buttons below to steer particle node.
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

      {/* Controller pad */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-32">
        <div />
        <button
          onClick={() => handleDirectChange(0, -1)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl border border-white/5 active:scale-90 transition-transform"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => handleDirectChange(-1, 0)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl border border-white/5 active:scale-90 transition-transform"
        >
          ◀
        </button>
        <div className="bg-white/5 rounded-xl flex items-center justify-center text-[9px] text-slate-500 font-mono font-bold">
          PAD
        </div>
        <button
          onClick={() => handleDirectChange(1, 0)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl border border-white/5 active:scale-90 transition-transform"
        >
          ▶
        </button>
        <div />
        <button
          onClick={() => handleDirectChange(0, 1)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl border border-white/5 active:scale-90 transition-transform"
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
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedCards([]);

          setCards((prev) => {
            const won = prev.every((c) => c.isMatched || c.id === firstId || c.id === secondId);
            if (won) {
              setIsWon(true);
              setIsPlaying(false);
              // Max score is 400 (corresponds to 40 PWC)
              const finalScore = Math.max(100, 400 - (moves + 1) * 12);
              onFinished(finalScore);
            }
            return prev;
          });
        }, 400);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-3 px-1 text-xs">
        <span className="text-slate-400">Moves: <strong className="text-white">{moves}</strong></span>
        <span className="text-slate-400">Goal: <strong className="text-purple-400">Match All Cards</strong></span>
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
              : 'Reveal matches in minimum moves to verify human spatial cognitive ability.'}
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
    const delay = 1500 + Math.random() * 2500;

    timerRef.current = window.setTimeout(() => {
      setGameState('ready');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('idle');
      alert('Too Early! Wait until container flashes green. Anti-cheat protection active.');
      return;
    }

    if (gameState === 'ready') {
      const clickTime = Date.now();
      const ms = clickTime - startTime;
      setLatency(ms);
      setGameState('result');
      // Score: max 400 points
      const calculatedScore = Math.max(80, Math.min(400, Math.floor(100000 / ms)));
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
      <div className="flex justify-between w-full mb-3 px-1 text-xs">
        <span className="text-slate-400">Response Speed</span>
        <span className="text-slate-400">Target Range: <strong className="text-amber-400">180–270ms</strong></span>
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
            <p className="text-[10px] text-slate-400 mb-4">Click inside this box to initiate calibration cycle.</p>
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
            <p className="text-[11px] text-slate-300">Wait... Click IMMEDIATELY when card turns bright green.</p>
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
                : latency < 280
                ? '🟢 Sound Human Response Range.'
                : '🟡 Response latency delay noted.'}
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

/* ==========================================================================
   UNIVERSAL GAME ENGINE (Challenging Sub-Games for the remaining 17 games)
   ========================================================================== */
interface UniversalGameEngineProps {
  gameId: string;
  gameDef: GameDefinition;
  onFinished: (score: number) => void;
}

function UniversalGameEngine({ gameId, gameDef, onFinished }: UniversalGameEngineProps) {
  // Determine template based on game characteristics
  // Categories: 'Reflex/Tempo' | 'Cognitive Challenge' | 'Cognitive/Visual' | 'Cognitive Sequence' | 'Reflex/Defense' | 'Cognitive/Logic' | 'Reflex/Pop' | 'Skill/Timing' | 'Cognitive/Maze' | 'Skill/Words' | 'Reflex/Balance' | 'Reflex/Aim' | 'Reflex/Sound' | 'Cognitive/Words' | 'Cognitive/Vision' | 'Reflex/Paddle' | 'Skill/Verification'

  let template: 'math' | 'timing' | 'typing' | 'color' = 'math';
  if (['binary_pulse', 'quantum_flip', 'block_tower', 'frequency_tuner', 'elastic_bounce'].includes(gameId)) {
    template = 'timing';
  } else if (['speed_typist', 'word_decrypt', 'hex_decoder'].includes(gameId)) {
    template = 'typing';
  } else if (['color_refract', 'odd_tile', 'captcha_shards', 'pattern_replicator', 'meteor_shield', 'bubble_pop', 'grid_pathfinder', 'precision_aim'].includes(gameId)) {
    template = 'color';
  }

  if (template === 'math') {
    return <MathGameEngine gameDef={gameDef} onFinished={onFinished} />;
  } else if (template === 'timing') {
    return <TimingGameEngine gameDef={gameDef} onFinished={onFinished} />;
  } else if (template === 'typing') {
    return <TypingGameEngine gameDef={gameDef} onFinished={onFinished} />;
  } else {
    return <ColorStroopGameEngine gameDef={gameDef} onFinished={onFinished} />;
  }
}

/* 1. MATH SPEED CHALLENGE ENGINE */
function MathGameEngine({ gameDef, onFinished }: { gameDef: GameDefinition; onFinished: (score: number) => void }) {
  const [round, setRound] = useState(1);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState<'+' | '-' | '*'>('+');
  const [options, setOptions] = useState<number[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [isFinished, setIsFinished] = useState(false);

  const generateProblem = () => {
    let n1 = Math.floor(Math.random() * 20) + 1;
    let n2 = Math.floor(Math.random() * 15) + 1;
    const ops: ('+' | '-' | '*')[] = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    
    if (op === '*') {
      n1 = Math.floor(Math.random() * 9) + 2;
      n2 = Math.floor(Math.random() * 9) + 2;
    }

    const correct = op === '+' ? n1 + n2 : op === '-' ? n1 - n2 : n1 * n2;
    setNum1(n1);
    setNum2(n2);
    setOperation(op);
    setCorrectAnswer(correct);

    // Generate incorrect answers close to correct
    const incorrect1 = correct + (Math.random() > 0.5 ? 2 : -2);
    const incorrect2 = correct + (Math.random() > 0.5 ? 5 : -5);
    const uniqueOptions = Array.from(new Set([correct, incorrect1, incorrect2])).sort(() => Math.random() - 0.5);
    
    // Fallback if set deduped correct answer
    if (uniqueOptions.length < 3) {
      setOptions([correct, correct + 3, correct - 3].sort(() => Math.random() - 0.5));
    } else {
      setOptions(uniqueOptions);
    }

    setTimeLeft(8);
  };

  const startNewGame = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setIsPlaying(true);
    generateProblem();
  };

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    if (timeLeft <= 0) {
      // Time-out, go next
      handleAnswer(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying, isFinished]);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 50); // max 400 score across 8 rounds
    }

    if (round < 8) {
      setRound((r) => r + 1);
      generateProblem();
    } else {
      setIsPlaying(false);
      setIsFinished(true);
      onFinished(score + (correct ? 50 : 0));
    }
  };

  return (
    <div className="w-full max-w-[280px] bg-slate-900/50 p-5 border border-white/10 rounded-2xl text-center">
      {!isPlaying ? (
        <div>
          <Brain className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-white font-semibold text-sm mb-1">{gameDef.title}</h4>
          <p className="text-[10px] text-slate-400 mb-4 leading-normal">
            {isFinished 
              ? `Session complete. Gathered score: ${score} points.` 
              : `Solve 8 rapid arithmetic computations under high pressure.`}
          </p>
          <button
            onClick={startNewGame}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isFinished ? 'Challenge Again' : 'Launch Engine'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Round {round}/8</span>
            <span className="font-semibold text-blue-400 font-mono">Timer: {timeLeft}s</span>
          </div>

          <div className="text-3xl font-extrabold font-mono tracking-wide text-white py-4 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
            {num1} {operation} {num2} = ?
          </div>

          <div className="grid grid-cols-3 gap-2">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt === correctAnswer)}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-2.5 rounded-xl border border-white/5 transition-all text-sm font-mono"
              >
                {opt}
              </button>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 block font-mono">
            Accumulated score: {score} pts
          </span>
        </div>
      )}
    </div>
  );
}

/* 2. TIMING AND BEAT ALIGNMENT CHALLENGE ENGINE */
function TimingGameEngine({ gameDef, onFinished }: { gameDef: GameDefinition; onFinished: (score: number) => void }) {
  const [round, setRound] = useState(1);
  const [pulseSize, setPulseSize] = useState(10);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isGrowing, setIsGrowing] = useState(true);
  
  const pulseRef = useRef(10);
  const speedRef = useRef(2);

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    
    const interval = setInterval(() => {
      if (isGrowing) {
        pulseRef.current += speedRef.current;
        if (pulseRef.current >= 100) {
          setIsGrowing(false);
        }
      } else {
        pulseRef.current -= speedRef.current;
        if (pulseRef.current <= 10) {
          setIsGrowing(true);
        }
      }
      setPulseSize(pulseRef.current);
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, isFinished, isGrowing]);

  const startNewGame = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setFeedback('');
    setIsPlaying(true);
    pulseRef.current = 10;
    speedRef.current = 1.5 + Math.random() * 2.5; // randomized speed per play
  };

  const handleTap = () => {
    // Perfect range is between 82 and 94
    const dist = Math.abs(pulseSize - 88);
    let pts = 0;
    if (dist < 4) {
      pts = 80;
      setFeedback('🎯 PERFECT MATCH! +80');
    } else if (dist < 8) {
      pts = 40;
      setFeedback('🟢 SECURED! +40');
    } else {
      pts = 10;
      setFeedback('🔴 MISSED TIMING! +10');
    }

    setScore((s) => s + pts);

    if (round < 5) {
      setRound((r) => r + 1);
      // Speed increase
      speedRef.current = 1.5 + Math.random() * 2.5;
      setIsGrowing(true);
      pulseRef.current = 10;
    } else {
      setIsPlaying(false);
      setIsFinished(true);
      onFinished(score + pts);
    }
  };

  return (
    <div className="w-full max-w-[280px] bg-slate-900/50 p-5 border border-white/10 rounded-2xl text-center">
      {!isPlaying ? (
        <div>
          <Activity className="w-10 h-10 text-pink-400 mx-auto mb-2 animate-pulse" />
          <h4 className="text-white font-semibold text-sm mb-1">{gameDef.title}</h4>
          <p className="text-[10px] text-slate-400 mb-4 leading-normal">
            {isFinished 
              ? `Completed! Total score registered: ${score} points.` 
              : `Tap precisely when the pulsing ring aligns inside the static dotted target frame.`}
          </p>
          <button
            onClick={startNewGame}
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isFinished ? 'Play Again' : 'Launch Engine'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Attempt {round}/5</span>
            <span className="font-bold text-pink-400 font-mono">Current: {score} pts</span>
          </div>

          {/* Pulse Graphic Box */}
          <div className="h-32 border border-white/5 bg-black/40 rounded-2xl flex items-center justify-center relative overflow-hidden">
            {/* STATIC TARGET BOUNDARY RING */}
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-pink-500/30 flex items-center justify-center absolute" />
            
            {/* PERFECT HIT INDICATOR GAUGE */}
            <div className="w-[88px] h-[88px] rounded-full border border-emerald-500/20 absolute" />

            {/* DYNAMIC PULSING RING */}
            <div 
              className="rounded-full bg-gradient-to-tr from-pink-500/10 to-indigo-500/40 border border-pink-400 transition-all duration-[16ms] absolute"
              style={{ 
                width: `${pulseSize}%`, 
                height: `${pulseSize}%`,
                maxWidth: '120px',
                maxHeight: '120px'
              }}
            />
          </div>

          {feedback && (
            <p className="text-xs font-semibold text-slate-300 font-mono h-4">{feedback}</p>
          )}

          <button
            onClick={handleTap}
            className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-400 hover:to-indigo-400 text-white font-bold py-3 rounded-xl shadow-md transform active:scale-95 transition-transform"
          >
            TAP TRIGGER NOW
          </button>
        </div>
      )}
    </div>
  );
}

/* 3. KEYSTROKE AND TYPING CONFORMITY CHALLENGE ENGINE */
function TypingGameEngine({ gameDef, onFinished }: { gameDef: GameDefinition; onFinished: (score: number) => void }) {
  const WORD_POOL = ['LEDGER', 'REACTIVE', 'REFRACT', 'SECURITY', 'PAYWORTH', 'HASHKEY', 'CRYSTAL', 'SKILL', 'LOGIC', 'FIDELITY'];
  const [round, setRound] = useState(1);
  const [targetWord, setTargetWord] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(12);

  const getWord = () => {
    let w = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    if (gameDef.id === 'word_decrypt') {
      // Scramble it to display
      const scrambled = w.split('').sort(() => Math.random() - 0.5).join('');
      setTargetWord(`${scrambled} (Clue: ${w.length} letters)`);
      // Keep real matching word
      (targetWord as any) = w; 
    } else {
      setTargetWord(w);
    }
    setTypedInput('');
    setTimeLeft(12);
  };

  const startNewGame = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setIsPlaying(true);
    getWord();
  };

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    if (timeLeft <= 0) {
      handleNextRound(0);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying, isFinished]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setTypedInput(val);

    // Determine correct key word based on scramble clue
    const correctWord = gameDef.id === 'word_decrypt' 
      ? WORD_POOL.find(w => w.split('').sort().join('') === targetWord.split(' ')[0].split('').sort().join('')) || ''
      : targetWord;

    if (val === correctWord) {
      const addedPoints = Math.max(20, timeLeft * 8);
      handleNextRound(addedPoints);
    }
  };

  const handleNextRound = (pts: number) => {
    setScore((s) => s + pts);

    if (round < 5) {
      setRound((r) => r + 1);
      getWord();
    } else {
      setIsPlaying(false);
      setIsFinished(true);
      onFinished(score + pts);
    }
  };

  return (
    <div className="w-full max-w-[280px] bg-slate-900/50 p-5 border border-white/10 rounded-2xl text-center">
      {!isPlaying ? (
        <div>
          <Cpu className="w-10 h-10 text-cyan-400 mx-auto mb-2 animate-pulse" />
          <h4 className="text-white font-semibold text-sm mb-1">{gameDef.title}</h4>
          <p className="text-[10px] text-slate-400 mb-4 leading-normal">
            {isFinished 
              ? `Finished typing hashes. Score gathered: ${score} points.` 
              : `Type the target key strings correctly within the short countdown.`}
          </p>
          <button
            onClick={startNewGame}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isFinished ? 'Try Again' : 'Launch Engine'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Word {round}/5</span>
            <span className="font-semibold text-cyan-400 font-mono">Timer: {timeLeft}s</span>
          </div>

          <div className="py-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block mb-1">Target Hash</span>
            <span className="text-xl font-extrabold text-white tracking-widest font-mono">
              {targetWord}
            </span>
          </div>

          <input
            type="text"
            value={typedInput}
            onChange={handleInputChange}
            placeholder="Type code here..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center text-white font-mono tracking-widest outline-none focus:border-cyan-400/50 text-base"
            autoFocus
          />

          <p className="text-[10px] text-slate-400 font-mono">Accumulated: {score} pts</p>
        </div>
      )}
    </div>
  );
}

/* 4. COGNITIVE/VISUAL STROOP SELECTION CHALLENGE ENGINE */
function ColorStroopGameEngine({ gameDef, onFinished }: { gameDef: GameDefinition; onFinished: (score: number) => void }) {
  const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
  const COLOR_TAILWINDS = ['text-red-400', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-purple-400'];
  const COLOR_BG_VALS = ['bg-red-500/20', 'bg-blue-500/20', 'bg-green-500/20', 'bg-yellow-500/20', 'bg-purple-500/20'];

  const [round, setRound] = useState(1);
  const [wordIdx, setWordIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [isMatchMode, setIsMatchMode] = useState(true); // asks either match pigment or text word
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(6);

  const generateRound = () => {
    const wIdx = Math.floor(Math.random() * COLOR_NAMES.length);
    // 60% chance color index is mismatched
    const cIdx = Math.random() > 0.4 
      ? Math.floor(Math.random() * COLOR_NAMES.length) 
      : wIdx;

    setWordIdx(wIdx);
    setColorIdx(cIdx);
    setIsMatchMode(Math.random() > 0.5);
    setTimeLeft(6);
  };

  const startNewGame = () => {
    setRound(1);
    setScore(0);
    setIsFinished(false);
    setIsPlaying(true);
    generateRound();
  };

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    if (timeLeft <= 0) {
      handleAnswer(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isPlaying, isFinished]);

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 50); // max 400 pts
    }

    if (round < 8) {
      setRound((r) => r + 1);
      generateRound();
    } else {
      setIsPlaying(false);
      setIsFinished(true);
      onFinished(score + (correct ? 50 : 0));
    }
  };

  return (
    <div className="w-full max-w-[280px] bg-slate-900/50 p-5 border border-white/10 rounded-2xl text-center">
      {!isPlaying ? (
        <div>
          <Sparkles className="w-10 h-10 text-teal-400 mx-auto mb-2 animate-bounce" />
          <h4 className="text-white font-semibold text-sm mb-1">{gameDef.title}</h4>
          <p className="text-[10px] text-slate-400 mb-4 leading-normal">
            {isFinished 
              ? `Calibration success! Total score registered: ${score} points.` 
              : `Spot mismatches between words and their colored refractive displays.`}
          </p>
          <button
            onClick={startNewGame}
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isFinished ? 'Launch calibration' : 'Launch Engine'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Round {round}/8</span>
            <span className="font-semibold text-teal-400 font-mono">Timer: {timeLeft}s</span>
          </div>

          <div className="py-2.5 bg-white/5 border border-white/5 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-2">
              {isMatchMode ? 'WHAT COLOR IS THE WORD?' : 'WHAT TEXT VALUE IS SPELLED?'}
            </span>
            <span className={`text-2xl font-extrabold tracking-widest font-sans ${COLOR_TAILWINDS[colorIdx]}`}>
              {COLOR_NAMES[wordIdx]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {COLOR_NAMES.map((name, index) => {
              const isCorrect = isMatchMode 
                ? index === colorIdx 
                : index === wordIdx;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(isCorrect)}
                  className="bg-white/5 hover:bg-white/10 text-xs text-white font-bold py-2 rounded-xl border border-white/5 transition-all"
                >
                  {name}
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 font-mono">Refractive score: {score} pts</p>
        </div>
      )}
    </div>
  );
}
