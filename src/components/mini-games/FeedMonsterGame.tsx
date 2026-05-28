import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playChompSound, playSuccessSound, playTapSound, speakIndonesian } from '../../utils/audio';

interface FeedMonsterGameProps {
  onGameComplete: () => void;
}

interface FoodItem {
  id: string;
  value: string;
  emoji: string;
  color: string;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '123456789'.split('');
const MIXED_POOL = [...LETTERS, ...NUMBERS];
type GameMode = 'letters' | 'numbers' | 'mixed';

const FOOD_EMOJIS = ['🍎', '🍊', '🍇', '🍓', '🍌', '🥝', '🍑', '🫐'];
const MONSTER_COLORS = ['#7A0010', '#3D0066', '#003A66', '#1E3300', '#5C4300'];

export default function FeedMonsterGame({ onGameComplete }: FeedMonsterGameProps) {
  const [mode, setMode] = useState<GameMode>('mixed');
  const [target, setTarget] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);
  const [monsterMood, setMonsterMood] = useState<'hungry' | 'eating' | 'happy' | 'wrong'>('hungry');
  const [feedAnim, setFeedAnim] = useState(false);
  const [monsterColor] = useState(MONSTER_COLORS[Math.floor(Math.random() * MONSTER_COLORS.length)]);
  const [activeFeedingFood, setActiveFeedingFood] = useState<FoodItem | null>(null);

  const generateRound = useCallback(() => {
    const pool = MIXED_POOL;

    const targetValue = pool[Math.floor(Math.random() * pool.length)];
    const usedValues = new Set<string>([targetValue]);
    while (usedValues.size < 3) {
      usedValues.add(pool[Math.floor(Math.random() * pool.length)]);
    }

    const values = Array.from(usedValues).sort(() => Math.random() - 0.5);
    const newFoods: FoodItem[] = values.map((value, idx) => ({
      id: `fm_${value}_${idx}_${Math.floor(Math.random() * 1000000)}`,
      value,
      emoji: FOOD_EMOJIS[idx % FOOD_EMOJIS.length],
      color: ['bg-[#FFF0F3]', 'bg-[#E0F7FA]', 'bg-[#EBFDFA]'][idx],
    }));

    setTarget(targetValue);
    setFoods(newFoods);
    setIsWon(false);
    setMonsterMood('hungry');
    setFeedAnim(false);
    setActiveFeedingFood(null);

    const isLetter = LETTERS.includes(targetValue);
    speakIndonesian(`Ayo, berikan makanan dengan ${isLetter ? 'huruf' : 'angka'} ${targetValue} ke monster!`);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleTapFood = (food: FoodItem) => {
    if (isWon || activeFeedingFood) return;

    const isTargetLetter = LETTERS.includes(target);
    const isFoodLetter = LETTERS.includes(food.value);

    if (food.value === target) {
      playChompSound();
      setActiveFeedingFood(food);
      setFeedAnim(true);
      setMonsterMood('eating');

      setTimeout(() => {
        setMonsterMood('happy');
        playSuccessSound();
        setIsWon(true);
        setScore(prev => prev + 1);
        onGameComplete();
        speakIndonesian(`GRRRR! Nyam nyam nyam! Enak sekali! Monster sangat suka ${isTargetLetter ? 'huruf' : 'angka'} ${target}!`);
      }, 700);

      setTimeout(() => {
        generateRound();
      }, 2300);
    } else {
      playTapSound();
      setMonsterMood('wrong');
      speakIndonesian(`Aduh, monster tidak mau makan ${isFoodLetter ? 'huruf' : 'angka'} ${food.value}. Tolong beri ${isTargetLetter ? 'huruf' : 'angka'} ${target}! 😊`);
      
      setTimeout(() => {
        setMonsterMood('hungry');
      }, 1500);
    }
  };

  const isTargetLetter = LETTERS.includes(target);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-1 select-none flex flex-col items-center">
      {/* Premium Kid Target Bar */}
      <div className="flex items-center justify-between w-full mb-3 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-[2rem] border-3 border-[#FFE8A3] shadow-md gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-white font-black text-lg md:text-xl px-3.5 py-2 rounded-2xl shadow-md border-b-4 border-amber-500 flex items-center gap-1.5">
            <span>👾</span>
            <span>{score}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Cari Makanan:</span>
            <span className="text-3xl font-black text-[#c084fc] drop-shadow-sm leading-none mt-1">
              {target}
            </span>
          </div>
        </div>

        {/* Mascot Speech Dialogue */}
        <div className="flex items-center gap-2 bg-[#FAF5FF] px-4 py-2 rounded-2xl border-2 border-[#c084fc]/20">
          <span className="text-xl animate-bounce">🦖</span>
          <span className="text-xs font-black text-[#c084fc] leading-none">
            "Beri monster makanan {isTargetLetter ? 'huruf' : 'angka'} {target}!"
          </span>
        </div>
      </div>

      <div className="w-full h-[40dvh] bg-gradient-to-b from-purple-950 via-slate-900 to-indigo-950 border-4 border-[#FFE8A3] border-b-[10px] rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-4 left-6 text-2xl opacity-10 select-none pointer-events-none">💀</div>
        <div className="absolute top-8 right-8 text-3xl opacity-15 select-none pointer-events-none">☄️</div>
        <div className="absolute top-2 right-1/3 text-2xl opacity-10 select-none pointer-events-none">🕸️</div>

        {/* Interactive Monster */}
        <div className="flex-1 flex items-center justify-center relative">
          <motion.div
            animate={
              monsterMood === 'eating'
                ? { scale: [1, 1.25, 1.1, 1.25, 1], rotate: [0, -6, 6, -3, 0] }
                : monsterMood === 'happy'
                ? { scale: [1, 1.2, 1], y: [0, -14, 0] }
                : monsterMood === 'wrong'
                ? { x: [0, -12, 12, -8, 8, -4, 4, 0], rotate: [0, -3, 3, -2, 2, 0] }
                : { y: [0, -6, 0] }
            }
            transition={
              monsterMood === 'happy'
                ? { repeat: Infinity, duration: 0.7, ease: 'easeInOut' }
                : monsterMood === 'wrong'
                ? { duration: 0.5 }
                : monsterMood === 'eating'
                ? { duration: 0.6 }
                : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
            }
            className="relative"
          >
            {/* The Monster Outer Wrapper for Correct Layering */}
            <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center select-none">
              {/* Monster Spikey Wings/Ears (Layered BEHIND the body) */}
              <div
                className="absolute -left-5 top-8 w-9 h-14 bg-slate-950 border-4 border-slate-950 rounded-l-[1rem] z-0"
                style={{ transform: 'rotate(-25deg)' }}
              ></div>
              <div
                className="absolute -right-5 top-8 w-9 h-14 bg-slate-950 border-4 border-slate-950 rounded-r-[1rem] z-0"
                style={{ transform: 'rotate(25deg)' }}
              ></div>

              {/* Scary Horns at the top (Layered BEHIND the body) */}
              <div className="absolute -top-5 left-5 w-6 h-10 bg-slate-950 rounded-t-full origin-bottom -rotate-12 border-4 border-slate-950 z-0"></div>
              <div className="absolute -top-5 right-5 w-6 h-10 bg-slate-950 rounded-t-full origin-bottom rotate-12 border-4 border-slate-950 z-0"></div>

              {/* The Monster Body - Rounded Premium Egg/Blob Shape */}
              <div
                className="w-full h-full rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border-4 border-slate-950 relative transition-all duration-300 ring-4 ring-[#7A0010]/30 z-10 overflow-hidden"
                style={{ backgroundColor: monsterColor }}
              >
                {/* Monster Eyes - Reptilian Glowing Yellow slit pupil */}
                <div className="flex gap-5 md:gap-7 mb-2 z-20 mt-1">
                  {/* Left Eye */}
                  <motion.div
                    animate={monsterMood === 'happy' ? { scaleY: [1, 0.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.3, repeatDelay: 1 }}
                    className="w-9 h-10 md:w-10 md:h-11 bg-yellow-400 border-3 border-slate-950 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    {monsterMood === 'wrong' ? (
                      <span className="text-slate-950 text-base font-black">X</span>
                    ) : monsterMood === 'happy' ? (
                      <span className="text-slate-950 text-base font-black">^</span>
                    ) : (
                      /* Slit pupil */
                      <div className="w-1.5 h-7 bg-slate-950 rounded-full"></div>
                    )}
                  </motion.div>
                  
                  {/* Right Eye */}
                  <motion.div
                    animate={monsterMood === 'happy' ? { scaleY: [1, 0.05, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.3, repeatDelay: 1 }}
                    className="w-9 h-10 md:w-10 md:h-11 bg-yellow-400 border-3 border-slate-950 rounded-full flex items-center justify-center overflow-hidden"
                  >
                    {monsterMood === 'wrong' ? (
                      <span className="text-slate-950 text-base font-black">X</span>
                    ) : monsterMood === 'happy' ? (
                      <span className="text-slate-950 text-base font-black">^</span>
                    ) : (
                      /* Slit pupil */
                      <div className="w-1.5 h-7 bg-slate-950 rounded-full"></div>
                    )}
                  </motion.div>
                </div>

                {/* Monster Mouth - Scary with big white fangs */}
                <motion.div
                  animate={
                    monsterMood === 'eating'
                      ? { scaleY: 2.2, scaleX: 1.3, height: '40px' }
                      : monsterMood === 'happy'
                      ? { scaleX: 1.2 }
                      : monsterMood === 'wrong'
                      ? { scaleY: 0.3, scaleX: 0.8 }
                      : { scaleY: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className="w-14 h-8 md:w-18 md:h-10 bg-slate-950 rounded-b-full flex items-center justify-center overflow-hidden relative border-t-2 border-slate-950 z-20"
                >
                  {/* Tongue */}
                  <div className="w-8 h-4 bg-rose-500 rounded-full absolute bottom-0"></div>
                  
                  {/* Upper Fangs */}
                  <div className="absolute top-0 left-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-white"></div>
                  <div className="absolute top-0 right-2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[8px] border-t-white"></div>
                  
                  {/* Lower Fangs */}
                  <div className="absolute bottom-0 left-4 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-white"></div>
                  <div className="absolute bottom-0 right-4 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-white"></div>
                </motion.div>
              </div>
            </div>

            {/* Tap feedback animations */}
            {feedAnim && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 0, y: -45, scale: 1.8 }}
                transition={{ duration: 0.7 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl pointer-events-none"
              >
                💥
              </motion.div>
            )}

            {monsterMood === 'happy' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], y: [-10, -25, -10] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-2xl pointer-events-none animate-bounce"
              >
                💀👍
              </motion.div>
            )}

            {monsterMood === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-black bg-red-950 border-2 border-red-500 text-red-400 px-3 py-1 rounded-full pointer-events-none shadow"
              >
                GRRRRR! 🦖❌
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Flying Food Overlay (satisfying animation) */}
        <AnimatePresence>
          {activeFeedingFood && (
            <motion.div
              initial={{ scale: 0.8, x: 0, y: 150, rotate: 0 }}
              animate={{ scale: [1, 1.5, 0.4], x: 0, y: -25, rotate: 360 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="absolute z-30 text-5xl pointer-events-none"
            >
              {activeFeedingFood.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food Choice Tray */}
        <div className="w-full px-4 pb-4 flex justify-center gap-3.5 z-10">
          <AnimatePresence>
            {foods.map((food) => {
              const isFeeding = activeFeedingFood?.id === food.id;
              return (
                <motion.button
                  key={food.id}
                  onClick={() => handleTapFood(food)}
                  whileHover={{ scale: isFeeding ? 0 : 1.15, y: -6 }}
                  whileTap={{ scale: 0.85 }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={isFeeding ? { scale: 0, opacity: 0 } : { y: 0, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`${food.color} border-4 border-slate-950 border-b-[8px] rounded-[2rem] p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-lg active:translate-y-0.5 transition-all min-w-[85px]`}
                >
                  <span className="text-4xl">{food.emoji}</span>
                  <span className="text-2xl font-black text-slate-950">{food.value}</span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
