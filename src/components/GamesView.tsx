import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePayWorth } from '../engines/StateContext';
import EmailVerificationGuardModal from './EmailVerificationGuardModal';
import { GAMES_CATALOG_100 } from '../data/gamesCatalog';
import { CatalogGame, GameCategory } from '../types';
import { MEMBERSHIP_FULL_SPECS } from '../data/membershipData';
import {
  Gamepad2,
  Search,
  Lock,
  Play,
  Sparkles,
  Trophy,
  Flame,
  CheckCircle2,
  AlertCircle,
  Coins,
  Zap,
  RotateCcw,
  Star,
  Award,
  Filter,
  X
} from 'lucide-react';

export default function GamesView() {
  const { currentUser, playGameAndSubmitScore, setActiveMenuScreen } = usePayWorth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeGame, setActiveGame] = useState<CatalogGame | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'completed'>('idle');
  const [gameScore, setGameScore] = useState(0);
  const [gameReward, setGameReward] = useState<{ reward: number; xp: number } | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guardModalOpen, setGuardModalOpen] = useState(false);

  if (!currentUser) return null;

  const userTier = currentUser.membershipTier || 'Dark Bronze';
  const tierOrder = [
    'Dark Bronze',
    'Bright Iron',
    'Shining Silver',
    'Shimmering Gold',
    'Aspiring Platinum',
    'Resilient Diamond',
    'Epic',
    'Legend',
    'Mythical'
  ];
  const userTierIndex = tierOrder.indexOf(userTier);

  const categories: string[] = [
    'All',
    'Arcade',
    'Puzzle',
    'Trivia',
    'Strategy',
    'Reflex',
    'Memory',
    'Board',
    'Card',
    'Word',
    'Skill'
  ];

  const filteredGames = GAMES_CATALOG_100.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartGame = (game: CatalogGame) => {
    if (!currentUser.emailVerified) {
      setGuardModalOpen(true);
      return;
    }
    const requiredIndex = tierOrder.indexOf(game.minTier);
    if (requiredIndex > userTierIndex) {
      setActiveMenuScreen('membership');
      return;
    }
    setActiveGame(game);
    setGameState('playing');
    setGameScore(0);
    setGameReward(null);
  };

  const handleFinishGame = async (scoreAchieved: number) => {
    if (!activeGame) return;
    setPlaying(true);
    setGameScore(scoreAchieved);

    const result = await playGameAndSubmitScore(activeGame.id, scoreAchieved);
    setPlaying(false);

    if (result.success) {
      setGameReward({ reward: result.reward, xp: result.xp });
      setGameState('completed');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28 space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-black border border-purple-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[10px] uppercase font-bold rounded-full mb-2 inline-block">
              🎮 100 Production Games Catalog
            </span>
            <h2 className="text-2xl font-black text-white font-display">
              PayWorth Games Arcade
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Play skill & strategy games to earn PWC tokens, level XP, and climb global leaderboards.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-slate-400 font-mono block">YOUR TIER UNLOCKS</span>
            <span className="text-lg font-bold text-amber-400 font-mono">
              {MEMBERSHIP_FULL_SPECS[userTier]?.gamesUnlockedCount || 20}+ Games
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 100 production games..."
            className="w-full bg-slate-900/80 border border-white/10 outline-none text-xs text-white pl-10 pr-4 py-2.5 rounded-2xl focus:border-purple-400 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-slate-950 shadow-md'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredGames.map((game) => {
          const reqIndex = tierOrder.indexOf(game.minTier);
          const isLocked = reqIndex > userTierIndex;

          return (
            <div
              key={game.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between ${
                isLocked
                  ? 'bg-slate-950/60 border-white/5 opacity-80'
                  : 'bg-slate-900/80 border-white/10 hover:border-purple-500/40 hover:shadow-xl'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 font-bold">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  {isLocked ? (
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {game.minTier}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                      UNLOCKED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{game.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{game.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-mono">
                  <span className="text-slate-400 block">REWARD</span>
                  <span className="text-emerald-400 font-bold text-xs">+{game.baseRewardPwc} PWC</span>
                </div>

                <button
                  onClick={() => handleStartGame(game)}
                  className={`px-3.5 py-1.5 font-bold text-xs rounded-xl transition-all flex items-center gap-1 ${
                    isLocked
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-md active:scale-95'
                  }`}
                >
                  {isLocked ? 'Unlock' : 'Play Now'} <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* GAME PLAYER MODAL */}
      <AnimatePresence>
        {activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-white/15 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveGame(null)}
                className="absolute right-4 top-4 w-8 h-8 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                  {activeGame.category} Arcade Engine
                </span>
                <h3 className="text-xl font-bold text-white font-display">{activeGame.title}</h3>
                <p className="text-xs text-slate-300">{activeGame.description}</p>
              </div>

              {gameState === 'playing' && (
                <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-20 h-20 bg-purple-500/20 border border-purple-400/30 rounded-3xl flex items-center justify-center mx-auto text-purple-300 animate-pulse">
                    <Gamepad2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400">Interactive session active...</p>
                    <p className="text-2xl font-black text-white font-mono">Score Target: 50+</p>
                  </div>
                  <button
                    onClick={() => handleFinishGame(85)}
                    disabled={playing}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {playing ? 'Verifying Score...' : 'Complete Game Session (Score: 85)'}
                  </button>
                </div>
              )}

              {gameState === 'completed' && gameReward && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Victory Confirmed!</h4>
                    <p className="text-xs text-emerald-300 mt-1 font-mono">
                      +${gameReward.reward} PWC &amp; +${gameReward.xp} XP credited to your profile.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg"
                  >
                    Return to Arcade
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailVerificationGuardModal
        isOpen={guardModalOpen}
        onClose={() => setGuardModalOpen(false)}
        actionName="Mini Games & Arcade Payouts"
      />
    </div>
  );
}
