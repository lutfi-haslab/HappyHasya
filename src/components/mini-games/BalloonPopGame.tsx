import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playBalloonPopSound, playSuccessSound, playTapSound, speakIndonesian } from '../../utils/audio';
import { RotateCcw } from 'lucide-react';

interface BalloonPopGameProps {
  onGameComplete: () => void;
}

interface Balloon {
  id: string;
  value: string;
  x: number;
  color: string;
  size: number;
  speed: number;
  delay: number;
  wobble: number;
  popped: boolean;
}

const BALLOON_COLORS = [
  'from-red-400 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-yellow-400 to-amber-500',
  'from-purple-400 to-fuchsia-500',
  'from-orange-400 to-red-400',
  'from-pink-400 to-rose-400',
  'from-teal-400 to-cyan-400',
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBERS = '123456789'.split('');
const MIXED_POOL = [...LETTERS, ...NUMBERS];
type GameMode = 'letters' | 'numbers' | 'mixed';

export default function BalloonPopGame({ onGameComplete }: BalloonPopGameProps) {
  const [mode, setMode] = useState<GameMode>('mixed');
  const [target, setTarget] = useState('');
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [confetti, setConfetti] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const roundRef = useRef(0);

  const generateRound = useCallback(() => {
    const pool = MIXED_POOL;
    const targetValue = pool[Math.floor(Math.random() * pool.length)];
    const count = 4 + Math.floor(Math.random() * 3);

    const usedValues = new Set<string>([targetValue]);
    while (usedValues.size < count) {
      const v = pool[Math.floor(Math.random() * pool.length)];
      usedValues.add(v);
    }

    const values = Array.from(usedValues).sort(() => Math.random() - 0.5);

    const newBalloons: Balloon[] = values.map((value, idx) => ({
      id: `bp_${value}_${idx}_${Math.floor(Math.random() * 1000000)}`,
      value,
      x: 8 + (idx * (80 / count)) + Math.random() * 5,
      color: BALLOON_COLORS[idx % BALLOON_COLORS.length],
      size: 65 + Math.random() * 20, // slightly larger balloons for better tap target
      speed: 12.0 + Math.random() * 8.0, // very slow rise speeds (12 to 20 seconds) for toddler ease
      delay: 0, // launch immediately with zero delay!
      wobble: Math.random() * 20 - 10,
      popped: false,
    }));

    setTarget(targetValue);
    setBalloons(newBalloons);
    setIsWon(false);
    setWrongTaps(0);
    setConfetti([]);
    roundRef.current++;

    const isLetter = LETTERS.includes(targetValue);
    speakIndonesian(`Ayo, cari dan pecahkan balon ${isLetter ? 'huruf' : 'angka'} ${targetValue}!`);
  }, []);

  useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handlePopBalloon = (balloon: Balloon) => {
    if (balloon.popped || isWon) return;

    const isLetter = LETTERS.includes(target);

    if (balloon.value === target) {
      playBalloonPopSound();
      setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));

      const newConfetti = Array.from({ length: 16 }).map((_, i) => ({
        id: Date.now() + i,
        x: balloon.x + (Math.random() * 12 - 6),
        y: 40 + (Math.random() * 20 - 10),
        emoji: ['⭐', '✨', '🎉', '🎈', '💫', '🎊', '🌟', '💖', '🌈', '🍭', '🌸', '🥳'][i % 12],
      }));
      setConfetti(newConfetti);

      setTimeout(() => {
        playSuccessSound();
        setIsWon(true);
        setScore(prev => prev + 1);
        onGameComplete();
        speakIndonesian(`Horeee! Kamu hebat sekali! Balon ${isLetter ? 'huruf' : 'angka'} ${target} meletus dor!`);
      }, 300);

      setTimeout(() => {
        setConfetti([]);
        generateRound();
      }, 2200);
    } else {
      playBalloonPopSound();
      setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));
      setWrongTaps(prev => prev + 1);
      speakIndonesian(`Bukan yang itu sayang, ayo cari ${isLetter ? 'huruf' : 'angka'} ${target}! 😊`);

      setTimeout(() => {
        setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: false } : b));
      }, 800);
    }
  };

  const isLetter = LETTERS.includes(target);

  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-1 select-none flex flex-col items-center">
      {/* Premium Kid Target Bar */}
      <div className="flex items-center justify-between w-full mb-3 bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-[2rem] border-3 border-[#FFE8A3] shadow-md gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 text-white font-black text-lg md:text-xl px-3.5 py-2 rounded-2xl shadow-md border-b-4 border-amber-500 flex items-center gap-1.5">
            <span>🎈</span>
            <span>{score}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none">Cari Balon:</span>
            <span className="text-3xl font-black text-[#FF85A1] drop-shadow-sm leading-none mt-1">
              {target}
            </span>
          </div>
        </div>

        {/* Mascot Speech Dialogue */}
        <div className="flex items-center gap-2 bg-[#FFF0F3] px-4 py-2 rounded-2xl border-2 border-[#FF85A1]/20">
          <span className="text-xl animate-bounce">😸</span>
          <span className="text-xs font-black text-[#FF85A1] leading-none">
            "Ketuk balon {isLetter ? 'huruf' : 'angka'} {target}!"
          </span>
        </div>
      </div>

      <div className="w-full h-[40dvh] bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 border-4 border-[#FFE8A3] border-b-[10px] rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Floating Clouds */}
        <div className="absolute top-4 left-6 text-3xl opacity-35 select-none pointer-events-none animate-pulse">☁️</div>
        <div className="absolute top-10 right-10 text-4xl opacity-30 select-none pointer-events-none animate-pulse">☁️</div>
        <div className="absolute top-2 right-1/3 text-3xl opacity-35 select-none pointer-events-none">☀️</div>

        {/* Grass bottom scene */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-green-200 to-green-100 flex items-center justify-around z-0">
          <span className="text-xl opacity-20">🌿</span>
          <span className="text-xl opacity-20">🌱</span>
          <span className="text-xl opacity-20">🌸</span>
          <span className="text-xl opacity-20">🌿</span>
        </div>

        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: '5dvh', opacity: 1 }}
              animate={
                balloon.popped
                  ? { scale: 1.5, opacity: 0, transition: { duration: 0.15 } }
                  : { y: '-50dvh', opacity: [0.9, 1, 0.9], x: [0, balloon.wobble, 0, -balloon.wobble, 0] }
              }
              transition={
                balloon.popped
                  ? { duration: 0.15 }
                  : { 
                      y: { duration: balloon.speed, ease: 'linear', repeat: Infinity, delay: balloon.delay }, 
                      x: { repeat: Infinity, duration: 3 + Math.random() * 2, ease: 'easeInOut' } 
                    }
              }
              exit={{ scale: 0, opacity: 0 }}
              style={{ position: 'absolute', left: `${balloon.x}%`, bottom: 0 }}
              onClick={() => handlePopBalloon(balloon)}
              className="cursor-pointer z-10 touch-none"
            >
              {/* Cute Balloon with faces, blush cheeks, string and gloss */}
              <div className={`relative bg-gradient-to-b ${balloon.color} rounded-full shadow-lg flex flex-col items-center justify-center`}
                style={{ width: balloon.size, height: balloon.size * 1.25 }}>
                
                {/* Glossy highlight */}
                <div className="absolute top-2.5 left-3 w-4 h-4 bg-white/40 rounded-full"></div>
                
                {/* Blush cheeks */}
                <div className="absolute bottom-5 left-1.5 w-3 h-2 bg-rose-200/50 rounded-full blur-[0.5px]"></div>
                <div className="absolute bottom-5 right-1.5 w-3 h-2 bg-rose-200/50 rounded-full blur-[0.5px]"></div>
                
                {/* Cute eyes */}
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-3.5 z-20">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                </div>

                {/* Sweet smile */}
                <div className="absolute top-6 w-3 h-1.5 bg-red-400/90 rounded-b-full border-t border-slate-900/60 z-20"></div>

                <span className="text-white font-black text-2xl md:text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] z-10">
                  {balloon.value}
                </span>

                {/* Balloon knot */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2">
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-current" style={{ fill: 'currentColor', filter: 'brightness(0.9)' }}>
                    <path d="M6 0 L1 6 Q6 8 11 6 Z" />
                  </svg>
                </div>

                {/* Long curvy wiggling string */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none h-8 w-4">
                  <svg width="12" height="32" viewBox="0 0 12 32" className="stroke-gray-400/80 fill-none" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M 6 0 Q 10 8 6 16 T 6 32" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {confetti.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 1, scale: 1, x: `${c.x}%`, y: `${c.y}%` }}
              animate={{ opacity: 0, scale: 0.5, y: [`${c.y}%`, `${c.y! + 30}%`], x: `${c.x! + (Math.random() * 20 - 10)}%`, rotate: 360 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute text-2xl pointer-events-none z-20"
            >
              {c.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-30 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.4, 1] }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </div>

      {!isWon && wrongTaps > 1 && (
        <button
          onClick={() => { playTapSound(); generateRound(); }}
          className="mt-3 bg-white border-2 border-[#FFE8A3] border-b-4 text-[#FF85A1] font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Lewati</span>
        </button>
      )}
    </div>
  );
}
