import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playDiscoverSound, playSuccessSound, playTapSound, speakIndonesian } from '../../utils/audio';

interface HideSeekGameProps {
  onGameComplete: () => void;
}

interface HiddenItem {
  id: string;
  value: string;
  x: number;
  y: number;
  found: boolean;
  hidingBehindEmoji: string;
  hidingBehindName: string;
  peekDirection: 'left' | 'right' | 'top' | 'bottom';
}

const SCENE_OBJECTS = [
  { emoji: '🌳', name: 'pohon' },
  { emoji: '🌿', name: 'semak' },
  { emoji: '🪨', name: 'batu' },
  { emoji: '🌸', name: 'bunga' },
  { emoji: '🍄', name: 'jamur' },
  { emoji: '☁️', name: 'awan' },
];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '123456789'.split('');
const MIXED_POOL = [...LETTERS, ...NUMBERS];
type GameMode = 'letters' | 'numbers' | 'mixed';

export default function HideSeekGame({ onGameComplete }: HideSeekGameProps) {
  const [mode, setMode] = useState<GameMode>('mixed');
  const [target, setTarget] = useState('');
  const [targetObjectName, setTargetObjectName] = useState('semak');
  const [hiddenItems, setHiddenItems] = useState<HiddenItem[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);

  const prevTargetRef = useRef('');
  const prevObjectNameRef = useRef('');

  const generateRound = useCallback(() => {
    const pool = MIXED_POOL;
    
    // Prevent consecutive target repetition
    let targetValue = '';
    do {
      targetValue = pool[Math.floor(Math.random() * pool.length)];
    } while (targetValue === prevTargetRef.current);
    prevTargetRef.current = targetValue;

    const count = 5;
    const usedValues = new Set<string>([targetValue]);
    while (usedValues.size < count) {
      usedValues.add(pool[Math.floor(Math.random() * pool.length)]);
    }

    // Spaced layout coordinates to prevent overlapping inside h-[40dvh] canvas
    const positions = [
      { x: 8, y: 15 }, { x: 38, y: 12 }, { x: 68, y: 16 },
      { x: 14, y: 42 }, { x: 50, y: 45 },
      { x: 22, y: 64 }, { x: 62, y: 62 },
    ].sort(() => Math.random() - 0.5).slice(0, count);

    const directions: Array<'left' | 'right' | 'top' | 'bottom'> = ['left', 'right', 'top', 'bottom'];
    
    // Prevent consecutive object name repetition
    let shuffledObjects = [];
    do {
      shuffledObjects = [...SCENE_OBJECTS].sort(() => Math.random() - 0.5);
    } while (shuffledObjects[0].name === prevObjectNameRef.current);
    prevObjectNameRef.current = shuffledObjects[0].name;

    const newItems: HiddenItem[] = Array.from(usedValues).map((value, idx) => {
      const obj = shuffledObjects[idx % shuffledObjects.length];
      return {
        id: `hs_${value}_${idx}_${Math.floor(Math.random() * 1000000)}`,
        value,
        x: positions[idx].x,
        y: positions[idx].y,
        found: false,
        hidingBehindEmoji: obj.emoji,
        hidingBehindName: obj.name,
        peekDirection: directions[Math.floor(Math.random() * directions.length)],
      };
    });

    setTarget(targetValue);
    setTargetObjectName(shuffledObjects[0].name);
    setHiddenItems(newItems);
    setIsWon(false);

    const isLetter = LETTERS.includes(targetValue);
    speakIndonesian(`Ayo teman kecil, cari ${isLetter ? 'huruf' : 'angka'} ${targetValue} yang tersembunyi di balik ${shuffledObjects[0].name}!`);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleDiscover = (item: HiddenItem) => {
    if (item.found || isWon) return;

    playDiscoverSound();
    setHiddenItems(prev => prev.map(h => h.id === item.id ? { ...h, found: true } : h));

    const isTargetLetter = LETTERS.includes(target);
    const isItemLetter = LETTERS.includes(item.value);

    if (item.value === target) {
      setTimeout(() => {
        playSuccessSound();
        setIsWon(true);
        setScore(prev => prev + 1);
        onGameComplete();
        speakIndonesian(`Horeee! Ketemu! ${isTargetLetter ? 'Huruf' : 'Angka'} ${target} berhasil ditemukan! Kamu pintar sekali!`);
      }, 400);

      setTimeout(() => {
        generateRound();
      }, 2200);
    } else {
      speakIndonesian(`Wah, ini ${isItemLetter ? 'huruf' : 'angka'} ${item.value}! Ayo cari lagi ${isTargetLetter ? 'huruf' : 'angka'} ${target} di balik ${targetObjectName}! 😊`);
    }
  };

  const getPeekTransform = (dir: string) => {
    switch (dir) {
      case 'left': return '-translate-x-2';
      case 'right': return 'translate-x-2';
      case 'top': return '-translate-y-2';
      default: return 'translate-y-2';
    }
  };

  const isTargetLetter = LETTERS.includes(target);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-1 select-none flex flex-col items-center">
      {/* Premium Kid Target Bar */}
      <div className="flex items-center justify-between w-full mb-3 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-[2rem] border-3 border-[#FFE8A3] shadow-md gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-white font-black text-lg md:text-xl px-3.5 py-2 rounded-2xl shadow-md border-b-4 border-amber-500 flex items-center gap-1.5">
            <span>🔍</span>
            <span>{score}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Cari Objek:</span>
            <span className="text-3xl font-black text-[#20BFA9] drop-shadow-sm leading-none mt-1">
              {target}
            </span>
          </div>
        </div>

        {/* Mascot Speech Dialogue */}
        <div className="flex items-center gap-2 bg-[#EBFDFA] px-4 py-2 rounded-2xl border-2 border-[#20BFA9]/20">
          <span className="text-xl animate-bounce">🦊</span>
          <span className="text-xs font-black text-[#20BFA9] leading-none">
            "Temukan {isTargetLetter ? 'huruf' : 'angka'} {target} di balik {targetObjectName}!"
          </span>
        </div>
      </div>

      <div className="w-full h-[40dvh] bg-gradient-to-b from-green-200 via-green-100 to-amber-50 border-4 border-[#FFE8A3] border-b-[10px] rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Floating elements */}
        <div className="absolute top-2 left-6 text-4xl opacity-30 select-none pointer-events-none animate-pulse">☁️</div>
        <div className="absolute top-6 right-8 text-5xl opacity-25 select-none pointer-events-none animate-pulse">☁️</div>
        <div className="absolute top-1 right-1/3 text-3xl opacity-30 select-none pointer-events-none">☀️</div>

        {/* Forest base background */}
        <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-green-300 to-green-200 flex items-end justify-around pb-1 z-0">
          <span className="text-2xl opacity-30">🌿</span>
          <span className="text-3xl opacity-25">🌳</span>
          <span className="text-2xl opacity-30">🌱</span>
          <span className="text-3xl opacity-25">🌲</span>
          <span className="text-2xl opacity-30">🌿</span>
        </div>

        {/* Hidden items grid */}
        {hiddenItems.map((item) => (
          <motion.div
            key={item.id}
            style={{ position: 'absolute', left: `${item.x}%`, top: `${item.y}%` }}
            className="z-10"
          >
            {!item.found ? (
              <motion.button
                onClick={() => handleDiscover(item)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                animate={{
                  x: [0, 3, -3, 0],
                  y: [0, -3, 3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5 + Math.random() * 1.5,
                  ease: 'easeInOut',
                }}
                className={`relative cursor-pointer ${getPeekTransform(item.peekDirection)} flex items-center justify-center`}
              >
                {/* Cute Peeking Eyes - ultimate kid friendly hint */}
                <motion.div
                  animate={{
                    y: [-4, 2, -4],
                    scaleY: [1, 0.1, 1],
                  }}
                  transition={{
                    y: { repeat: Infinity, duration: 2 + Math.random() * 2, ease: 'easeInOut' },
                    scaleY: { repeat: Infinity, duration: 3.5, repeatDelay: 1.5 },
                  }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1 z-0 pointer-events-none"
                >
                  <div className="w-2.5 h-2.5 bg-slate-900 border border-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full -mt-0.5 -ml-0.5"></div>
                  </div>
                  <div className="w-2.5 h-2.5 bg-slate-900 border border-white rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full -mt-0.5 -ml-0.5"></div>
                  </div>
                </motion.div>

                {/* Hiding item emoji (chunky bush, cloud, rock) */}
                <span className="text-6xl md:text-7xl filter drop-shadow-xl relative z-10">{item.hidingBehindEmoji}</span>

                {/* Sparkling Hint Question Mark */}
                <motion.span
                  animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.95, 1.1, 0.95] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-xl font-black text-[#FF85A1] drop-shadow-md z-20 bg-white/70 px-2 py-0.5 rounded-full border border-white"
                >
                  ?
                </motion.span>
              </motion.button>
            ) : (
              // Found Item - Bouncing Spring Pegas reveal with blurry silhouette styling
              <motion.div
                initial={{ scale: 0, rotate: -220, y: 30 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ type: 'spring', damping: 9, stiffness: 120 }}
                className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-[1.8rem] shadow-xl border-4 border-b-8 backdrop-blur-md relative overflow-hidden transition-all ${
                  item.value === target
                    ? 'bg-[#20BFA9] border-[#189E8B] text-white ring-4 ring-[#20BFA9]/30 shadow-[0_0_15px_rgba(32,191,169,0.5)] z-20'
                    : 'bg-white/90 border-[#FFE8A3] text-[#4A4A4A]'
                }`}
              >
                {/* Obscured Blurry Silhouette text for decoy, or clear glowing text for target */}
                {item.value === target ? (
                  <span className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] animate-pulse select-none">
                    {item.value}
                  </span>
                ) : (
                  <span className="text-3xl md:text-4xl font-black drop-shadow-sm blur-[2.5px] select-none opacity-45 text-slate-700">
                    {item.value}
                  </span>
                )}

                {/* Magic fog layer overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/5 pointer-events-none"></div>
              </motion.div>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/30 z-20 pointer-events-none flex items-center justify-center"
            >
              {Array.from({ length: 14 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: -20, x: Math.random() * 300 - 150, rotate: 0, opacity: 1 }}
                  animate={{ y: 450, rotate: 360, opacity: [1, 1, 0] }}
                  transition={{ duration: 1.5 + Math.random() * 1.0, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute text-3xl"
                >
                  {['⭐', '✨', '🎈', '🎉', '🌟', '🍭', '🌈'][idx % 7]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isWon && (
        <div className="mt-3 bg-white/80 backdrop-blur-sm border-2 border-[#FFE8A3] rounded-2xl px-4 py-1.5 shadow-sm text-center">
          <p className="text-[11px] text-gray-500 font-extrabold flex items-center justify-center gap-1.5 flex-wrap">
            <span>🌫️ Siluet Samar:</span>
            <span>Huruf/angka yang ditemukan sedikit samar. Tebaklah berdasarkan bentuk siluetnya! 🔍</span>
          </p>
        </div>
      )}
    </div>
  );
}
