import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { STICKERS_DATA } from '../data';
import { PlacedSticker } from '../types';
import { playTapSound, playStickerSound, speakIndonesian } from '../utils/audio';
import Mascot from './Mascot';
import { Sparkles, Image, Compass, Trash2 } from 'lucide-react';

interface RewardSectionProps {
  unlockedStickersIds: string[];
  placedStickers: PlacedSticker[];
  onUpdatePlacedStickers: (stickers: PlacedSticker[]) => void;
}

export default function RewardSection({ unlockedStickersIds, placedStickers, onUpdatePlacedStickers }: RewardSectionProps) {
  const [selectedAlbumSticker, setSelectedAlbumSticker] = useState<typeof STICKERS_DATA[0] | null>(STICKERS_DATA[0]);
  const playgroundRef = useRef<HTMLDivElement | null>(null);

  // Filter stickers into unlocked / locked
  const unlockedStickers = STICKERS_DATA.filter(s => unlockedStickersIds.includes(s.id));
  const lockedStickers = STICKERS_DATA.filter(s => !unlockedStickersIds.includes(s.id));

  const handleSelectStickerFromShelf = (sticker: typeof STICKERS_DATA[0]) => {
    playStickerSound();
    speakIndonesian(sticker.name);

    const newPlaced: PlacedSticker = {
      id: Date.now(),
      stickerId: sticker.id,
      emoji: sticker.emoji,
      name: sticker.name,
      x: 10 + Math.random() * 60,
      y: 10 + Math.random() * 50
    };

    onUpdatePlacedStickers([...placedStickers, newPlaced]);
  };

  const handleTapPlacedSticker = (placed: PlacedSticker) => {
    playTapSound();
    speakIndonesian(placed.name);
  };

  const handleClearPlayground = () => {
    playTapSound();
    onUpdatePlacedStickers([]);
  };

  return (
    <div id="reward-section" className="w-full max-w-5xl mx-auto px-4 py-2 select-none flex flex-col items-center">
      {/* Friendly Indonesian instruction */}
      <Mascot
        message={unlockedStickers.length === 0
          ? "Kamu belum punya stiker. Main tebak angka untuk kumpulkan stiker lucu! 🦁🍓"
          : `Kamu punya ${unlockedStickers.length} stiker asyik! Ketuk stiker di laci untuk menempelkannya ke lembar bermain!`
        }
        mood={unlockedStickers.length > 3 ? 'excited' : 'happy'}
      />

      {/* STICKER PLAYGROUND AREA */}
      <div className="w-full max-w-2xl flex flex-col items-end mb-4">
        {placedStickers.length > 0 && (
          <button
            id="btn-clear-placed-stickers"
            onClick={handleClearPlayground}
            className="mb-2 bg-white border-2 border-[#FFE8A3] hover:border-[#FF85A1] text-[#FF85A1] font-black text-sm px-4 py-2 rounded-2xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102 shadow-md active:translate-y-0.5 z-10"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan Lembaran</span>
          </button>
        )}

        {/* The Park interactive Canvas scene */}
        <div
          ref={playgroundRef}
          id="sticker-canvas-playground"
          className="w-full h-80 bg-gradient-to-b from-[#E0F7FA] via-white to-emerald-50 border-4 border-[#FFE8A3] border-b-[12px] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex items-end"
        >
          {/* Environment visual landmarks */}
          <div className="absolute top-4 left-6 text-sky-200/50 text-4xl font-black select-none pointer-events-none">☁️</div>
          <div className="absolute top-12 right-12 text-sky-200/50 text-5xl select-none pointer-events-none">☁️</div>
          <div className="absolute top-8 left-1/3 text-amber-200/50 text-4xl select-none pointer-events-none text-amber-200">☀️</div>
          {/* Mountains */}
          <div className="absolute bottom-10 left-10 w-44 h-24 bg-[#E0F7FA] rounded-t-full opacity-45 select-none pointer-events-none z-0"></div>
          <div className="absolute bottom-10 right-16 w-36 h-20 bg-emerald-50/70 rounded-t-full opacity-45 select-none pointer-events-none z-0"></div>
          {/* Greensward ground */}
          <div className="w-full h-16 bg-gradient-to-t from-emerald-100 to-[#EBFDFA] border-t-2 border-[#72EFDD] relative z-0 flex items-center justify-around">
            <span className="text-3xl opacity-20 select-none">🌳</span>
            <span className="text-3xl opacity-20 select-none">🍄</span>
            <span className="text-3xl opacity-20 select-none">🌻</span>
            <span className="text-3xl opacity-15 select-none">🏡</span>
          </div>

          {/* Draggable Placed Stickers */}
          {placedStickers.map((placed) => (
            <motion.div
              key={placed.id}
              id={`placed-sticker-${placed.id}`}
              drag={true}
              dragConstraints={playgroundRef}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={playTapSound}
              onClick={() => handleTapPlacedSticker(placed)}
              style={{
                position: 'absolute',
                left: `${placed.x}%`,
                top: `${placed.y}%`,
                cursor: 'grab'
              }}
              whileDrag={{ scale: 1.4, rotate: 10, cursor: 'grabbing', zIndex: 100 }}
              whileTap={{ scale: 1.25 }}
              className="text-5xl md:text-6xl select-none filter drop-shadow-lg z-10 active:scale-110 p-2 touch-none"
            >
              {placed.emoji}
            </motion.div>
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-extrabold uppercase mt-1 self-center tracking-widest">
          Geser stiker dangan jari / mouse-mu! 🏃‍♂️
        </span>
      </div>

      {/* LOWER SHELF: UNLOCKED STICKERS TRAY */}
      <div className="w-full max-w-2xl bg-[#FFF0F3] rounded-[2.5rem] border-4 border-[#FFE8A3] p-5 shadow-inner mb-6">
        <div className="flex items-center gap-2 mb-3 text-[#FF85A1] font-black text-base md:text-lg border-b border-[#FFE8A3] pb-2.5">
          <Compass className="w-5 h-5 text-[#FF85A1]" />
          <span>Laci Stiker Kamu ({unlockedStickers.length} Dibuka)</span>
        </div>

        {unlockedStickers.length === 0 ? (
          <div className="py-6 text-center text-gray-400 font-extrabold text-sm">
            Laci kosong. Ayo selesaikan permainan angka untuk membuka stiker pertamamu! 🍀
          </div>
        ) : (
          <div id="unlocked-stickers-tray" className="flex gap-4 p-1 overflow-x-auto select-none no-scrollbar">
            {unlockedStickers.map((sticker) => (
              <motion.button
                key={sticker.id}
                id={`shelf-sticker-${sticker.id}`}
                onClick={() => handleSelectStickerFromShelf(sticker)}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 bg-white border-2 border-b-[6px] border-[#FFE8A3] hover:border-[#FF85A1] hover:border-b-4 rounded-[1.5rem] p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-20 shadow-xs transition-all"
              >
                <span className="text-4xl">{sticker.emoji}</span>
                <span className="text-[10px] text-center font-black text-gray-600 tracking-tight leading-none truncate max-w-full">
                  {sticker.name.split(' ')[0]} {/* Grab first word */}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* STICKER ALBUM PREVIEW (Shows collection progress) */}
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border-4 border-[#FFE8A3] border-b-[12px] p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 text-[#4A4A4A] font-black text-xl">
            <Sparkles className="w-5 h-5 text-[#FF85A1]" />
            <span>Album Koleksi Stiker ({unlockedStickers.length} / {STICKERS_DATA.length})</span>
          </div>
          <span className="text-xs text-slate-400 font-bold block sm:text-right">
            Ketuk stiker untuk lihat info & misi membukanya! 👇
          </span>
        </div>

        <div id="silhouettes-grid" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {STICKERS_DATA.map((sticker) => {
            const isUnlocked = unlockedStickersIds.includes(sticker.id);
            const isSelected = selectedAlbumSticker?.id === sticker.id;
            return (
              <button
                key={sticker.id}
                onClick={() => { playTapSound(); setSelectedAlbumSticker(sticker); }}
                className={`aspect-square rounded-[1.25rem] flex items-center justify-center relative shadow-inner border-2 select-none cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isUnlocked 
                    ? 'bg-[#FFF0F3] border-[#FFE8A3]' 
                    : 'bg-gray-100/75 border-gray-200/60'
                } ${
                  isSelected 
                    ? 'ring-4 ring-[#FF85A1] border-[#FF85A1] scale-105 shadow-md' 
                    : 'hover:border-gray-300'
                }`}
              >
                {isUnlocked ? (
                  <span className="text-2xl md:text-3xl">{sticker.emoji}</span>
                ) : (
                  <span className="text-lg md:text-xl font-black text-gray-400">?</span>
                )}
                {isUnlocked && (
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#20BFA9] rounded-full border border-white"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Album Sticker Details Box - Clear achievement specifications */}
        {selectedAlbumSticker && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-50/55 border-2 border-dashed border-[#FFE8A3] rounded-3xl flex items-center gap-4 text-left shadow-xs"
          >
            <div className="text-5xl md:text-6xl p-2.5 bg-white rounded-2xl shadow-sm border border-orange-100 flex-shrink-0">
              {selectedAlbumSticker.emoji}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-extrabold text-gray-800 text-lg md:text-xl capitalize leading-none">
                  {selectedAlbumSticker.name}
                </h4>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full text-white uppercase tracking-wider leading-none ${
                  unlockedStickersIds.includes(selectedAlbumSticker.id) 
                    ? 'bg-[#20BFA9]' 
                    : 'bg-[#FF85A1]'
                }`}>
                  {unlockedStickersIds.includes(selectedAlbumSticker.id) ? '🔓 Sudah Dibuka' : '🔒 Belum Terbuka'}
                </span>
              </div>
              
              <p className="text-gray-500 font-extrabold text-xs md:text-sm mt-2 flex items-center gap-1">
                <span>🎯 Misi:</span>
                <span className="text-[#FF85A1]">{selectedAlbumSticker.achievement}</span>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
