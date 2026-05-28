import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playTapSound, speakIndonesian } from '../utils/audio';
import { PlacedSticker } from '../types';
import Mascot from './Mascot';
import BalloonPopGame from './mini-games/BalloonPopGame';
import FeedMonsterGame from './mini-games/FeedMonsterGame';
import HideSeekGame from './mini-games/HideSeekGame';
import StickerPlaygroundGame from './mini-games/StickerPlaygroundGame';
import { ArrowLeft } from 'lucide-react';

interface MiniGamesHubProps {
  onGameComplete: () => void;
  playgroundStickers: PlacedSticker[];
  onUpdatePlaygroundStickers: (stickers: PlacedSticker[]) => void;
}

type ActiveGame = 'hub' | 'balloon-pop' | 'feed-monster' | 'hide-seek' | 'sticker-playground';

const GAMES = [
  {
    id: 'balloon-pop' as const,
    name: 'Balon Ajaib',
    emoji: '🎈',
    color: 'border-[#FF85A1]',
    bgColor: 'bg-[#FFF0F3]',
    accentColor: 'bg-[#FF85A1]',
    description: 'Pecahkan balon yang benar!',
  },
  {
    id: 'feed-monster' as const,
    name: 'Kasih Makan Monster',
    emoji: '👾',
    color: 'border-[#c084fc]',
    bgColor: 'bg-purple-50',
    accentColor: 'bg-[#c084fc]',
    description: 'Beri makan monster yang lapar!',
  },
  {
    id: 'hide-seek' as const,
    name: 'Petualangan Cari',
    emoji: '🔍',
    color: 'border-[#20BFA9]',
    bgColor: 'bg-emerald-50',
    accentColor: 'bg-[#20BFA9]',
    description: 'Temukan yang tersembunyi!',
  },
  {
    id: 'sticker-playground' as const,
    name: 'Tempel Stiker',
    emoji: '⭐',
    color: 'border-[#f59e0b]',
    bgColor: 'bg-amber-50',
    accentColor: 'bg-amber-400',
    description: 'Kreasikan papan stikermu!',
  },
];

export default function MiniGamesHub({ onGameComplete, playgroundStickers, onUpdatePlaygroundStickers }: MiniGamesHubProps) {
  const [activeGame, setActiveGame] = useState<ActiveGame>('hub');

  useEffect(() => {
    const handleReset = () => {
      setActiveGame('hub');
    };
    window.addEventListener('reset-games-hub', handleReset);
    return () => {
      window.removeEventListener('reset-games-hub', handleReset);
    };
  }, []);

  const handleSelectGame = (gameId: ActiveGame) => {
    playTapSound();
    setActiveGame(gameId);
    const game = GAMES.find(g => g.id === gameId);
    if (game) {
      speakIndonesian(`Ayo main ${game.name}!`);
    }
  };

  const handleBackToHub = () => {
    playTapSound();
    setActiveGame('hub');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-2 select-none flex flex-col items-center">
      <AnimatePresence mode="wait">
        {activeGame === 'hub' ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center w-full"
          >
            <Mascot
              message="Pilih permainan seru yang kamu mau mainkan! 🎮"
              mood="excited"
              compact
            />

            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              {GAMES.map((game, idx) => (
                <motion.button
                  key={game.id}
                  onClick={() => handleSelectGame(game.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`bg-white rounded-2xl p-3 shadow-lg border-b-[6px] ${game.color} cursor-pointer text-center relative group w-full transition-all overflow-hidden`}
                >
                  <div className={`${game.bgColor} rounded-xl flex flex-col items-center justify-center py-4 px-2 h-full`}>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2 + idx * 0.3, ease: 'easeInOut' }}
                      className="text-4xl mb-2"
                    >
                      {game.emoji}
                    </motion.div>
                    <h3 className="text-sm font-black text-[#4A4A4A] mb-0.5 leading-tight">{game.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold">{game.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center justify-between min-h-[70dvh] md:min-h-[65dvh]"
          >
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {activeGame === 'balloon-pop' && <BalloonPopGame onGameComplete={onGameComplete} />}
              {activeGame === 'feed-monster' && <FeedMonsterGame onGameComplete={onGameComplete} />}
              {activeGame === 'hide-seek' && <HideSeekGame onGameComplete={onGameComplete} />}
              {activeGame === 'sticker-playground' && (
                <StickerPlaygroundGame
                  placedStickers={playgroundStickers}
                  onUpdatePlacedStickers={onUpdatePlaygroundStickers}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
