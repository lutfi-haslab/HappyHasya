import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MINI_GAME_STICKER_THEMES } from '../../data';
import { PlacedSticker } from '../../types';
import { playTapSound, playStickerSound, speakIndonesian } from '../../utils/audio';
import { Trash2, X } from 'lucide-react';

interface StickerPlaygroundGameProps {
  placedStickers: PlacedSticker[];
  onUpdatePlacedStickers: (stickers: PlacedSticker[]) => void;
}

const SCENES = [
  {
    id: 'safari',
    name: 'Taman Safari',
    emoji: '🏞️',
    bgClass: 'from-sky-200 via-sky-100 to-green-150',
    decorations: ['🌳', '🌻', '🍄', '🏡'],
    skyColor: 'text-amber-500',
    cloudsColor: 'opacity-35 text-white',
  },
  {
    id: 'space',
    name: 'Luar Angkasa',
    emoji: '🚀',
    bgClass: 'from-indigo-950 via-slate-900 to-purple-950',
    decorations: ['🛸', '🪐', '💫', '☄️'],
    skyColor: 'text-yellow-250',
    cloudsColor: 'opacity-40 text-indigo-400',
  },
  {
    id: 'sea',
    name: 'Bawah Laut',
    emoji: '🌊',
    bgClass: 'from-cyan-300 via-blue-200 to-indigo-300',
    decorations: ['🐠', '🐡', '🦑', '🐚'],
    skyColor: 'text-cyan-100',
    cloudsColor: 'opacity-30 text-teal-400',
  },
  {
    id: 'dino',
    name: 'Dunia Dino',
    emoji: '🦕',
    bgClass: 'from-amber-200 via-orange-100 to-yellow-100',
    decorations: ['🦕', '🌴', '🌋', '🦖'],
    skyColor: 'text-orange-400',
    cloudsColor: 'opacity-25 text-orange-400',
  }
];

export default function StickerPlaygroundGame({ placedStickers, onUpdatePlacedStickers }: StickerPlaygroundGameProps) {
  const [activeTheme, setActiveTheme] = useState<string>('hewan');
  const [deleteMode, setDeleteMode] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string>('safari');
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  const currentTheme = MINI_GAME_STICKER_THEMES[activeTheme];
  const allThemes = Object.entries(MINI_GAME_STICKER_THEMES);
  const activeScene = SCENES.find(s => s.id === activeSceneId) || SCENES[0];

  const handlePlaceSticker = (emoji: string) => {
    playStickerSound();
    const newSticker: PlacedSticker = {
      id: Date.now(),
      stickerId: `pg_${emoji}`,
      emoji,
      name: emoji,
      x: 10 + Math.random() * 60,
      y: 10 + Math.random() * 50,
    };
    onUpdatePlacedStickers([...placedStickers, newSticker]);
    speakIndonesian(`Menempel stiker ${emoji}! Cantik sekali!`);
  };

  const handleTapPlaced = (sticker: PlacedSticker) => {
    if (deleteMode) {
      playTapSound();
      onUpdatePlacedStickers(placedStickers.filter(s => s.id !== sticker.id));
      speakIndonesian('Stiker berhasil dihapus!');
    } else {
      playTapSound();
      speakIndonesian(`Itu stiker ${sticker.emoji}!`);
    }
  };

  const handleClear = () => {
    playTapSound();
    onUpdatePlacedStickers([]);
    setDeleteMode(false);
    speakIndonesian('Lembaran stiker dibersihkan! Mulai dari awal!');
  };

  const toggleDeleteMode = () => {
    playTapSound();
    setDeleteMode(prev => !prev);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-1 select-none flex flex-col items-center">
      {/* Header Info Bar */}
      <div className="flex items-center gap-2 mb-3 w-full flex-wrap">
        <div className="bg-amber-400 text-white font-black text-lg px-3.5 py-1.5 rounded-2xl shadow-md border-b-4 border-amber-500">
          ⭐ {placedStickers.length} Stiker
        </div>

        {placedStickers.length > 0 && (
          <div className="flex gap-1.5 ml-auto">
            <button
              onClick={toggleDeleteMode}
              className={`font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all border-2 border-b-4 ${
                deleteMode
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'bg-white border-[#FFE8A3] text-red-400 hover:border-red-300'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>{deleteMode ? 'Batal Hapus' : 'Hapus Stiker'}</span>
            </button>
            <button
              onClick={handleClear}
              className="bg-white border-2 border-b-4 border-[#FFE8A3] text-[#FF85A1] font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        )}
      </div>

      {deleteMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-red-50 border-2 border-red-200 rounded-2xl px-3 py-1.5 mb-2.5 text-center"
        >
          <span className="text-xs font-black text-red-500">Mode Hapus Aktif! Ketuk stiker di papan untuk menghapus! 🗑️</span>
        </motion.div>
      )}

      {/* Background Scene Selector */}
      <div className="w-full mb-3 bg-white/95 px-3 py-2 rounded-[1.8rem] border-3 border-[#FFE8A3] shadow-md flex items-center justify-between gap-1 flex-wrap xs:flex-nowrap">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider pl-1 flex-shrink-0">Latar Papan:</span>
        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
          {SCENES.map((scene) => (
            <button
              key={scene.id}
              onClick={() => { playTapSound(); setActiveSceneId(scene.id); speakIndonesian(`Papan bermain diganti tema ${scene.name}!`); }}
              className={`px-2.5 py-1 rounded-xl font-black text-[10px] border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSceneId === scene.id
                  ? 'bg-amber-400 border-amber-400 border-b-4 text-white shadow-sm'
                  : 'bg-white border-[#FFE8A3] text-gray-500 hover:border-amber-300 active:translate-y-0.5'
              }`}
            >
              <span>{scene.emoji}</span>
              <span>{scene.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sticker themes choosing tabs */}
      <div className="flex gap-1.5 mb-3 w-full overflow-x-auto no-scrollbar">
        {allThemes.map(([key, theme]) => (
          <button
            key={key}
            onClick={() => { playTapSound(); setActiveTheme(key); }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-2xl font-black text-[11px] border-2 transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
              activeTheme === key
                ? 'bg-[#FF85A1] border-[#FF85A1] border-b-4 text-white shadow-md'
                : 'bg-white border-[#FFE8A3] text-gray-500 hover:border-[#FF85A1]/30 active:translate-y-0.5'
            }`}
          >
            <span className="text-sm">{theme.emoji}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>

      {/* Sticker Playground Board */}
      <div
        ref={playgroundRef}
        className={`w-full h-[40dvh] md:h-[35dvh] bg-gradient-to-b ${activeScene.bgClass} border-4 border-[#FFE8A3] border-b-[10px] rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-all duration-500`}
      >
        {/* Floating Clouds/Stars/Bubbles based on theme */}
        <div className={`absolute top-4 left-6 text-3xl ${activeScene.cloudsColor} select-none pointer-events-none animate-pulse`}>
          {activeSceneId === 'space' ? '⭐' : activeSceneId === 'sea' ? '🫧' : '☁️'}
        </div>
        <div className={`absolute top-9 right-9 text-4xl ${activeScene.cloudsColor} select-none pointer-events-none animate-pulse`}>
          {activeSceneId === 'space' ? '✨' : activeSceneId === 'sea' ? '🫧' : '☁️'}
        </div>
        <div className={`absolute top-2 right-1/4 text-2xl ${activeScene.skyColor} opacity-40 select-none pointer-events-none`}>
          {activeSceneId === 'space' ? '🌙' : activeSceneId === 'sea' ? '🐙' : '☀️'}
        </div>

        {/* Bottom scene decorations based on theme */}
        <div className="absolute bottom-0 w-full h-14 bg-gradient-to-t from-white/10 to-transparent flex items-center justify-around z-0">
          {activeScene.decorations.map((dec, i) => (
            <span key={i} className="text-2xl opacity-40 animate-bounce" style={{ animationDelay: `${i * 0.4}s` }}>
              {dec}
            </span>
          ))}
        </div>

        {/* Placed Stickers */}
        {placedStickers.map((sticker) => (
          <motion.div
            key={sticker.id}
            drag={!deleteMode}
            dragConstraints={playgroundRef}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={playTapSound}
            onClick={() => handleTapPlaced(sticker)}
            style={{ position: 'absolute', left: `${sticker.x}%`, top: `${sticker.y}%` }}
            whileDrag={{ scale: 1.4, rotate: 10, cursor: 'grabbing', zIndex: 100 }}
            whileTap={{ scale: deleteMode ? 0.5 : 1.25 }}
            className={`text-5xl select-none filter drop-shadow-2xl z-10 p-2 touch-none ${
              deleteMode ? 'cursor-pointer' : 'cursor-grab'
            } ${deleteMode ? 'hover:opacity-60' : ''}`}
          >
            {sticker.emoji}
          </motion.div>
        ))}

        {placedStickers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-gray-500 font-black text-sm text-center px-4"
            >
              Ketuk stiker di bawah untuk menempelkannya ke papan! 👇
            </motion.p>
          </div>
        )}
      </div>

      {/* Select Sticker Tray */}
      <div className="w-full mt-4 bg-[#FFF0F3] rounded-[2rem] border-3 border-[#FFE8A3] p-4 shadow-inner">
        <div className="flex items-center gap-2 mb-2 text-[#FF85A1] font-black text-xs pl-1">
          <span>{currentTheme.emoji}</span>
          <span>Pilih Stiker {currentTheme.name}:</span>
        </div>
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
          {currentTheme.stickers.map((emoji, idx) => (
            <motion.button
              key={idx}
              onClick={() => handlePlaceSticker(emoji)}
              whileHover={{ scale: 1.2, y: -4 }}
              whileTap={{ scale: 0.85 }}
              className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white border-3 border-b-6 border-[#FFE8A3] rounded-2xl flex items-center justify-center text-3xl shadow-md cursor-pointer hover:border-[#FF85A1]/40"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
