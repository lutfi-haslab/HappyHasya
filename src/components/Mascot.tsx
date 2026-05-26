import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { speakIndonesian, playTapSound } from '../utils/audio';

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'excited' | 'thinking' | 'victory';
  speakOnMount?: boolean;
  compact?: boolean;
}

export default function Mascot({
  message = "Halo teman kecil! Mari bermain bersama Hasya! 👋",
  mood = 'happy',
  speakOnMount = false,
  compact = false
}: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (speakOnMount && message) {
      speakIndonesian(message);
    }
  }, [message, speakOnMount]);

  // Handle blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const handleTapMascot = async () => {
    playTapSound();
    // Fun bounce animation
    await controls.start({
      scale: [1, 1.25, 0.9, 1.1, 1],
      rotate: [0, -6, 6, -3, 0],
      transition: { duration: 0.6 }
    });
    speakIndonesian(message);
  };

  // Assign background colors based on mood
  const getMoodColors = () => {
    switch (mood) {
      case 'excited': return 'bg-yellow-300 border-yellow-400';
      case 'victory': return 'bg-lime-300 border-lime-400';
      case 'thinking': return 'bg-sky-300 border-sky-400';
      default: return 'bg-amber-300 border-amber-400';
    }
  };

  return (
    <div
      id="mascot-container"
      className={`flex items-center justify-center max-w-sm mx-auto select-none flex-shrink-0 ${compact
        ? 'flex-row gap-3 p-1.5 w-full'
        : 'flex-col p-2 md:p-4'
        }`}
    >
      {/* Mascot Visual Body */}
      <motion.div
        id="mascot-body"
        animate={controls}
        whileHover={{ scale: 1.05 }}
        onClick={handleTapMascot}
        className={`rounded-full border-4 ${getMoodColors()} flex flex-col items-center justify-center relative cursor-pointer shadow-lg ${compact
          ? 'w-10 h-10 border-2 shadow-sm flex-shrink-0'
          : 'w-16 h-16 md:w-32 md:h-32 md:border-6 md:shadow-xl'
          }`}
      >
        {/* Rosy Cheeks */}
        <div className={`absolute top-1/2 -translate-y-1/2 bg-pink-400/60 rounded-full blur-[1px] ${compact
          ? 'left-0.5 w-1.5 h-1'
          : 'left-1.5 w-2 h-1.5 md:left-3 md:w-4 md:h-3 md:blur-xs'
          }`}></div>
        <div className={`absolute top-1/2 -translate-y-1/2 bg-pink-400/60 rounded-full blur-[1px] ${compact
          ? 'right-0.5 w-1.5 h-1'
          : 'right-1.5 w-2 h-1.5 md:right-3 md:w-4 md:h-3 md:blur-xs'
          }`}></div>

        {/* Big Animated Eyes */}
        <div className={`flex origin-center ${compact ? 'gap-1.5 mb-0.5' : 'gap-3 md:gap-6 mb-1 md:mb-2'}`}>
          {/* Left Eye */}
          <motion.div
            className={`bg-slate-900 rounded-full flex items-start justify-center origin-center ${compact ? 'w-1.5 h-2 pt-0.5' : 'w-2.5 md:w-4 h-3.5 md:h-6 pt-0.5 md:pt-1'
              }`}
            animate={{ scaleY: isBlinking ? 0.05 : 1 }}
            transition={{ duration: 0.1 }}
          >
            {!isBlinking && <div className={`bg-white rounded-full ${compact ? 'w-0.5 h-0.5' : 'w-0.5 h-0.5 md:w-1.5 md:h-1.5'}`}></div>}
          </motion.div>

          {/* Right Eye */}
          <motion.div
            className={`bg-slate-900 rounded-full flex items-start justify-center origin-center ${compact ? 'w-1.5 h-2 pt-0.5' : 'w-2.5 md:w-4 h-3.5 md:h-6 pt-0.5 md:pt-1'
              }`}
            animate={{ scaleY: isBlinking ? 0.05 : 1 }}
            transition={{ duration: 0.1 }}
          >
            {!isBlinking && <div className={`bg-white rounded-full ${compact ? 'w-0.5 h-0.5' : 'w-0.5 h-0.5 md:w-1.5 md:h-1.5'}`}></div>}
          </motion.div>
        </div>

        {/* Loving smile or talking mouth */}
        <motion.div
          id="mascot-mouth"
          animate={mood === 'victory' || mood === 'excited' ? { scaleY: [1, 1.4, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`bg-red-500 rounded-b-full border-t border-slate-900 flex items-end justify-center overflow-hidden ${compact ? 'w-2.5 h-1.5' : 'w-4 h-2.5 md:w-7 md:h-4'
            }`}
        >
          {/* Tongue */}
          <div className={`bg-pink-300 rounded-full ${compact ? 'w-1.5 h-0.5' : 'w-2.5 h-1.5 md:w-4 md:h-2'}`}></div>
        </motion.div>

        {/* Tiny playful details: animal ears */}
        <div className={`bg-amber-400 border-amber-500 rounded-tl-full -rotate-45 z-[-1] absolute ${compact ? '-left-0.5 -top-0.5 w-2 h-2 border' : '-left-0.5 -top-0.5 w-4 h-4 md:-left-1 md:-top-1 md:w-7 md:h-7 md:border-4'
          }`}></div>
        <div className={`bg-amber-400 border-amber-500 rounded-tr-full rotate-45 z-[-1] absolute ${compact ? '-right-0.5 -top-0.5 w-2 h-2 border' : '-right-0.5 -top-0.5 w-4 h-4 md:-right-1 md:-top-1 md:w-7 md:h-7 md:border-4'
          }`}></div>
      </motion.div>

      {/* Dynamic Bubble Box */}
      <motion.div
        id="mascot-speech-bubble"
        initial={{ opacity: 0, scale: 0.7, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className={`relative bg-white border-2 border-[#FFE8A3] rounded-[1.2rem] p-2 px-3 text-center shadow-md ${compact
          ? 'mb-0 border-b-4 max-w-[240px] md:max-w-xs'
          : 'md:border-4 md:rounded-[2.5rem] md:p-5 mb-3 md:mb-5 max-w-[280px] md:max-w-md'
          }`}
      >
        <p className="text-gray-700 font-black tracking-wide text-base md:text-2xl leading-relaxed">
          {message}
        </p>
        {!compact && (
          <div className="absolute left-1/2 -bottom-3 w-3 h-3 bg-white border-r-2 border-b-2 border-[#FFE8A3] rotate-45 -translate-x-1/2"></div>
        )}
        {compact && (
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l-2 border-b-2 border-[#FFE8A3] rotate-45"></div>
        )}
      </motion.div>

      {/* Gentle Tap Hint */}
      {!compact && (
        <span className="text-[10px] md:text-xs text-[#FF85A1] font-extrabold mt-1.5 md:mt-3 uppercase tracking-widest opacity-85 animate-pulse">
          Tap Hasya!
        </span>
      )}
    </div>
  );
}
