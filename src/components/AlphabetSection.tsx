import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALPHABET_DATA } from '../data';
import { AlphabetItem } from '../types';
import { speakIndonesian, playTapSound, playBubblePopSound } from '../utils/audio';
import Mascot from './Mascot';
import { ChevronLeft, ChevronRight, Grid, Volume2, Sparkles } from 'lucide-react';

interface AlphabetSectionProps {
  onLogLetter: (letter: string) => void;
}

export default function AlphabetSection({ onLogLetter }: AlphabetSectionProps) {
  const [selectedItem, setSelectedItem] = useState<AlphabetItem | null>(null);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; color: string }[]>([]);

  const handleSelectLetter = (item: AlphabetItem) => {
    playTapSound();
    setSelectedItem(item);
    onLogLetter(item.letter);
    speakIndonesian(item.phonetic);
    
    // Generate some playful popping bubbles on the focused screen!
    const newBubbles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10, // percentage x
      y: Math.random() * 60 + 20, // percentage y
      size: Math.random() * 40 + 40, // px
      color: ['bg-pink-300', 'bg-yellow-300', 'bg-cyan-300', 'bg-purple-300', 'bg-emerald-300'][Math.floor(Math.random() * 5)]
    }));
    setBubbles(newBubbles);
  };

  const handleSpeakPhonetic = () => {
    if (selectedItem) {
      speakIndonesian(selectedItem.phonetic);
    }
  };

  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = ALPHABET_DATA.findIndex(item => item.letter === selectedItem.letter);
    const nextIndex = (currentIndex + 1) % ALPHABET_DATA.length;
    handleSelectLetter(ALPHABET_DATA[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = ALPHABET_DATA.findIndex(item => item.letter === selectedItem.letter);
    const prevIndex = (currentIndex - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length;
    handleSelectLetter(ALPHABET_DATA[prevIndex]);
  };

  const handlePopBubble = (id: number) => {
    playBubblePopSound();
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div id="alphabet-section" className="w-full max-w-5xl mx-auto px-4 py-4 select-none">
      <AnimatePresence mode="wait">
        {!selectedItem ? (
          // GRID VIEW
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center"
          >
            <Mascot message="Ketuk huruf yang ingin kamu buat bernyanyi! 🎶" mood="happy" />

            {/* Alphabet Grid */}
            <div id="alphabet-icons-grid" className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 w-full mt-6">
              {ALPHABET_DATA.map((item, idx) => (
                <motion.button
                  key={item.letter}
                  id={`btn-letter-${item.letter}`}
                  onClick={() => handleSelectLetter(item)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: Math.random() * 6 - 3 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-white rounded-[2rem] p-3 shadow-lg border-b-[8px] border-[#FFE8A3] hover:border-b-4 active:border-b-2 cursor-pointer relative overflow-hidden transition-all flex flex-col items-center justify-center"
                >
                  {/* Colorful inner background */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#FFF0F3] flex items-center justify-center text-[#FF85A1] text-3xl md:text-4xl font-black shadow-inner">
                    {item.letter}
                  </div>
                  <span className="text-[#4A4A4A] font-black text-xs md:text-sm mt-2 capitalize whitespace-nowrap">
                    {item.word}
                  </span>
                  <span className="text-xl md:text-2xl mt-1">
                    {item.emoji}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="focus"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative flex flex-col items-center justify-center w-full py-4"
          >
            {/* Playful Floating Bubbles */}
            {bubbles.map(bubble => (
              <motion.button
                key={bubble.id}
                onClick={() => handlePopBubble(bubble.id)}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.7, 1, 0.8], scale: 1, y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: Math.random() * 2 + 2, ease: 'easeInOut' }}
                whileTap={{ scale: 1.4, opacity: 0 }}
                style={{
                  position: 'absolute',
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: bubble.size * 0.9, // fuller on mobile
                  height: bubble.size * 0.9,
                }}
                className={`${bubble.color} rounded-full border-2 border-white/60 shadow-md flex items-center justify-center cursor-pointer active:scale-95 z-10`}
              >
                <Sparkles className="text-white/80 w-3.5 h-3.5" />
              </motion.button>
            ))}
 
            {/* Main Interactive Letter Plate */}
            <div className="w-[92%] max-w-md bg-white rounded-[2.5rem] border-4 border-[#FFE8A3] border-b-[10px] shadow-2xl p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
              {/* Back to Grid button top-left */}
              <button
                id="btn-back-to-alphabet-grid"
                onClick={() => { playTapSound(); setSelectedItem(null); }}
                className="absolute top-4 left-4 bg-[#FEF9F0] hover:bg-[#FFF0F3] text-[#FF85A1] rounded-xl p-2.5 flex items-center gap-1 font-black text-xs transition-all cursor-pointer border-2 border-[#FFE8A3]"
              >
                <Grid className="w-4.5 h-4.5" />
                <span>Semua</span>
              </button>
 
              {/* Speaker trigger button top-right */}
              <button
                id="btn-repeat-speech-pronounce"
                onClick={handleSpeakPhonetic}
                className="absolute top-4 right-4 bg-sky-50 hover:bg-[#E0F7FA] text-[#4CC9F0] rounded-xl p-2.5 flex items-center gap-1 font-black text-sm transition-all cursor-pointer border-2 border-[#FFE8A3]"
              >
                <Volume2 className="w-5 h-5 animate-bounce" />
              </button>
 
              {/* Big dual letters view */}
              <div 
                onClick={handleSpeakPhonetic}
                className="mt-10 flex items-baseline justify-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 select-none group"
                title="Ketuk huruf untuk dengar suara!"
              >
                <motion.span
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="text-7xl md:text-9xl font-black tracking-tight text-[#FF85A1] group-hover:text-[#e06c87]"
                >
                  {selectedItem.letter}
                </motion.span>
                <motion.span
                  initial={{ scale: 0.5, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-[#4CC9F0] group-hover:text-[#38b2ac]"
                >
                  {selectedItem.letter.toLowerCase()}
                </motion.span>
              </div>
 
              {/* Giant Emoji Illustration */}
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: [0, 1.2, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 0.5 }}
                onClick={handleSpeakPhonetic}
                className="w-36 h-36 md:w-48 md:h-48 rounded-[2rem] bg-[#FEF9F0] flex items-center justify-center my-5 border-2 border-[#FFE8A3] shadow-inner cursor-pointer relative group"
              >
                <span className="text-7xl md:text-9xl group-hover:scale-110 active:scale-95 transition-transform duration-200">
                  {selectedItem.emoji}
                </span>
                <div id="illustration-touch-target" className="absolute -bottom-2 bg-white px-3.5 py-1 rounded-full border-2 border-[#FFE8A3] text-[#FF85A1] font-black text-[10px] shadow-sm uppercase tracking-wider flex items-center gap-0.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Dengar!</span>
                </div>
              </motion.div>
 
              {/* Spelled object word */}
              <h2 
                onClick={handleSpeakPhonetic}
                className="text-3xl md:text-5xl font-black text-[#4A4A4A] tracking-tight capitalize mt-3 cursor-pointer hover:text-[#FF85A1] active:scale-95 transition-all flex items-center gap-1 group justify-center"
                title="Ketuk kata untuk dengar suara!"
              >
                {selectedItem.word}
              </h2>
              <div 
                onClick={handleSpeakPhonetic}
                className="flex items-center gap-2 mt-1.5 px-4 py-1.5 bg-[#FFF0F3] hover:bg-[#FFE8A3]/30 rounded-full border border-[#FFE8A3] cursor-pointer text-[#FF85A1] font-extrabold text-xs active:scale-95 transition-all select-none"
              >
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>Ejaan: {selectedItem.word}</span>
              </div>
 
              <p className="text-gray-500 font-bold text-base md:text-xl mt-3 tracking-wide text-center leading-relaxed">
                "{selectedItem.phonetic}"
              </p>
            </div>
 
            {/* Prev / Next Bottom Navigation */}
            <div id="focus-nav-buttons" className="flex items-center justify-between w-[92%] max-w-md mt-5 gap-4">
              <button
                id="btn-prev-letter"
                onClick={handlePrev}
                className="flex-1 bg-white border-2 border-b-6 border-gray-200 hover:border-b-2 text-gray-400 rounded-2xl p-3.5 flex items-center justify-center gap-1.5 font-black text-base shadow-md transition-all active:translate-y-0.5"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
                <span>Kembali</span>
              </button>
 
              <button
                id="btn-next-letter"
                onClick={handleNext}
                className="flex-1 bg-[#FF85A1] border-2 border-b-6 border-[#e06c87] hover:border-[#FF85A1] hover:border-b-2 text-white rounded-2xl p-3.5 flex items-center justify-center gap-1.5 font-black text-base shadow-md transition-all active:translate-y-0.5"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <p className="text-xs text-[#FF85A1] font-black mt-4 animate-pulse">
              Tip: Ketuk gelembung di layar untuk meletuskannya! 🎈
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
