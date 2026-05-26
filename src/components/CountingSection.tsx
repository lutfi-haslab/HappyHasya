import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { COUNTING_OBJECTS, STICKERS_DATA } from '../data';
import { playTapSound, playSuccessSound, playWrongSound, speakIndonesian } from '../utils/audio';
import Mascot from './Mascot';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface CountingSectionProps {
  onLogCounting: (isCorrect: boolean) => void;
  onGrantSticker: (stickerId: string) => void;
  unlockedStickers: string[];
}

interface ItemInstance {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  scale: number;
  rotate: number;
}

export default function CountingSection({ onLogCounting, onGrantSticker, unlockedStickers }: CountingSectionProps) {
  const [targetCount, setTargetCount] = useState<number>(3);
  const [targetObject, setTargetObject] = useState(COUNTING_OBJECTS[0]);
  const [items, setItems] = useState<ItemInstance[]>([]);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [rewardSticker, setRewardSticker] = useState<any | null>(null);

  const initGame = () => {
    // Generate target count between 1 and 8 for MVP (very accessible for age 3-5)
    const count = Math.floor(Math.random() * 8) + 1;
    // Select random object representing animals / food
    const objImg = COUNTING_OBJECTS[Math.floor(Math.random() * COUNTING_OBJECTS.length)];
    
    // Position items randomly inside the grass container safely
    const newItems = Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      // Grid-aligned random factors so items do not overlap too heavily
      x: 10 + (idx % 4) * 22 + (Math.random() * 8 - 4),
      y: 10 + Math.floor(idx / 4) * 35 + (Math.random() * 8 - 4),
      scale: 0.85 + Math.random() * 0.3,
      rotate: Math.random() * 40 - 20
    }));

    // Generate multiple choices (3 options)
    const choiceSet = new Set<number>();
    choiceSet.add(count);
    while (choiceSet.size < 3) {
      const option = Math.floor(Math.random() * 10) + 1;
      if (option > 0) choiceSet.add(option);
    }
    const choicesList = Array.from(choiceSet).sort((a, b) => a - b);

    setTargetCount(count);
    setTargetObject(objImg);
    setItems(newItems);
    setChoices(choicesList);
    setSelectedAnswer(null);
    setWrongAnswers([]);
    setIsWon(false);
    setRewardSticker(null);

    // Dynamic prompt speech synthesis
    const promptText = `Berapa jumlah ${objImg.phonetic} ini? Ayo bantu Hasya berhitung!`;
    speakIndonesian(promptText);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleSelectChoice = (option: number) => {
    if (isWon) return;

    if (option === targetCount) {
      // SUCCESS!
      playSuccessSound();
      setIsWon(true);
      setSelectedAnswer(option);
      onLogCounting(true);

      // Check if we can grant a new sticker reward
      const lockedStickers = STICKERS_DATA.filter(s => !unlockedStickers.includes(s.id));
      if (lockedStickers.length > 0) {
        const randomSticker = lockedStickers[Math.floor(Math.random() * lockedStickers.length)];
        onGrantSticker(randomSticker.id);
        setRewardSticker(randomSticker);
        speakIndonesian(`Hebat! Jawabannya ${targetCount}! Kamu dapat stiker Baru, ${randomSticker.name}!`);
      } else {
        // Fallback random sticker if all unlocked
        const randomSticker = STICKERS_DATA[Math.floor(Math.random() * STICKERS_DATA.length)];
        setRewardSticker(randomSticker);
        speakIndonesian(`Benar sekali! Ada ${targetCount} ${targetObject.phonetic}!`);
      }
    } else {
      // FAILURE (Mild feedback, NO punishment, enable retry)
      playWrongSound();
      setWrongAnswers(prev => [...prev, option]);
      onLogCounting(false);
      speakIndonesian("Hampir tepat! Coba hitung lagi, ya!");
    }
  };

  const getChoiceButtonStyles = (option: number) => {
    const isWrong = wrongAnswers.includes(option);
    const isCorrectAndWon = isWon && option === targetCount;

    if (isCorrectAndWon) {
      return 'bg-[#20BFA9] border-[#189E8B] text-white scale-110 shadow-xl';
    }
    if (isWrong) {
      return 'bg-gray-100 border-gray-200 text-gray-300 pointer-events-none opacity-50 line-through';
    }
    return 'bg-white border-[#FFE8A3] text-[#4A4A4A] hover:border-[#FF85A1] hover:scale-105 active:scale-95 shadow-md';
  };

  return (
    <div id="counting-game-section" className="w-full max-w-4xl mx-auto px-4 py-2 select-none flex flex-col items-center">
      {/* Friendly Instruction header */}
      <Mascot
        message={isWon 
          ? `Luar biasa! Ada ${targetCount} ${targetObject.name}! 🎉` 
          : `Berapa jumlah ${targetObject.name} yang kamu lihat? Mari hitung sama-sama!`
        }
        mood={isWon ? 'victory' : wrongAnswers.length > 0 ? 'thinking' : 'happy'}
      />

      {/* Main Play Ground Box (Garden or Playpen theme) */}
      <div className="w-full h-56 md:h-80 max-w-2xl bg-gradient-to-b from-[#E0F7FA] to-[#FFF0F3] border-4 border-[#FFE8A3] border-b-[8px] md:border-b-[12px] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden my-4 p-4 flex-shrink-0">
        {/* Soft background environment icons */}
        <div className="absolute top-4 left-6 text-sky-200/40 text-4xl font-bold">☁️</div>
        <div className="absolute top-10 right-12 text-sky-200/40 text-5xl">☁️</div>
        <div className="absolute bottom-4 left-4 text-green-200/40 text-4xl">🌱</div>
        <div className="absolute bottom-6 right-8 text-green-200/40 text-4xl">🌸</div>

        {/* Scattered/Drifting Objects */}
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0, rotate: item.rotate - 30 }}
              animate={{
                scale: item.scale * 0.85, // slightly smaller on mobile
                opacity: 1,
                rotate: item.rotate,
                y: [0, -6, 6, 0] // Organic gentle waves
              }}
              transition={{
                delay: item.id * 0.05,
                type: 'spring',
                stiffness: 100,
                y: {
                  repeat: Infinity,
                  duration: 2.5 + Math.random() * 1.5,
                  ease: 'easeInOut'
                }
              }}
              whileTap={{ scale: 1.35, rotate: item.rotate + 15 }}
              onClick={playTapSound}
              style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y * 0.8}%`, // Keep higher up in shorter container
              }}
              className="text-5xl md:text-7xl cursor-pointer select-none filter drop-shadow-md z-10"
            >
              {targetObject.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Celebration Confetti overlays inside screen */}
        {isWon && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-white/20 z-20 overflow-hidden">
            {Array.from({ length: 15 }).map((_, idx) => (
              <motion.div
                key={idx}
                initial={{ y: -50, x: Math.random() * 300 - 150, rotate: 0, opacity: 1 }}
                animate={{
                  y: 400,
                  rotate: 360,
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1.5 + Math.random() * 1.5,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                className="absolute text-3xl"
              >
                {['⭐', '✨', '🎈', '🎉', '🍒', '🍓'][idx % 6]}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Choice Panel */}
      <div id="counting-choice-panel" className="w-full max-w-sm flex flex-col items-center">
        {!isWon ? (
          <div className="flex justify-around items-center w-full gap-3">
            {choices.map((option) => (
              <motion.button
                key={option}
                id={`btn-counting-choice-${option}`}
                onClick={() => handleSelectChoice(option)}
                className={`flex-1 border-2 md:border-4 border-b-4 md:border-b-8 rounded-2xl md:rounded-[2rem] p-3 md:p-5.5 text-2xl md:text-5xl font-black flex items-center justify-center cursor-pointer transition-all active:translate-y-0.5 ${getChoiceButtonStyles(option)}`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        ) : (
          /* Dimmed unclickable options shown in background under the success modal */
          <div className="flex justify-around items-center w-full gap-3 opacity-40 pointer-events-none">
            {choices.map((option) => (
              <button
                key={option}
                disabled
                className="flex-1 border-2 border-b-4 rounded-2xl p-3 text-2xl font-black flex items-center justify-center bg-white border-gray-200 text-gray-300"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Reset/New level link under standard mode in case child gets stuck */}
      {!isWon && wrongAnswers.length > 1 && (
        <button
          onClick={initGame}
          className="mt-6 flex items-center gap-2 text-[#FF85A1] hover:text-[#e06c87] font-black text-sm border-2 border-dashed border-[#FFE8A3] rounded-2xl px-4 py-2 bg-white hover:scale-102 transition-all cursor-pointer shadow-sm active:translate-y-0.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ganti Objek Lain</span>
        </button>
      )}

      {/* FULL-SCREEN SUCCESS MODAL OVERLAY */}
      <AnimatePresence>
        {isWon && (
          <div id="counting-success-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border-4 border-[#FFE8A3] border-b-[12px] p-6 w-full max-w-xs shadow-2xl text-center flex flex-col items-center relative overflow-hidden"
            >
              {/* Confetti Animation inside Modal */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.2rem]">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: -20, x: Math.random() * 200 - 100, rotate: 0, opacity: 1 }}
                    animate={{ y: 350, rotate: 360, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.5 + Math.random() * 1, repeat: Infinity, ease: 'easeOut' }}
                    className="absolute text-2xl"
                  >
                    {['⭐', '✨', '🎈', '🎉'][idx % 4]}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[#FF85A1] font-black text-xl md:text-2xl mb-1 relative z-10">
                <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
                <span>Sangat Hebat!</span>
              </div>
              <p className="text-gray-500 font-extrabold text-xs mb-4 relative z-10 leading-relaxed">
                Ada {targetCount} {targetObject.name}!<br />Kamu pandai menghitung! 🍎
              </p>

              {rewardSticker && (
                <div id="reward-sticker-card" className="flex items-center gap-3 bg-[#FFF0F3] px-4 py-2.5 border-2 border-[#FFE8A3] rounded-2xl shadow-sm mb-5 relative z-10 w-full justify-center">
                  <span className="text-4xl animate-bounce">{rewardSticker.emoji}</span>
                  <div className="text-left">
                    <span className="text-[10px] text-[#FF85A1] font-black block uppercase tracking-wider leading-none">Stiker Baru!</span>
                    <span className="text-gray-700 font-bold text-sm md:text-base">{rewardSticker.name}</span>
                  </div>
                </div>
              )}

              <button
                id="btn-counting-next-level"
                onClick={initGame}
                className="w-full bg-[#20BFA9] text-white font-black text-lg p-3 rounded-xl border-b-4 border-[#189E8B] shadow-lg hover:border-b-2 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer relative z-10"
              >
                <span>Main Lagi!</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
