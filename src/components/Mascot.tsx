import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { speakIndonesian, playTapSound } from '../utils/audio';

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'excited' | 'thinking' | 'victory';
  speakOnMount?: boolean;
}

export default function Mascot({ message = "Halo teman kecil! Mari bermain bersama Hasya! 👋", mood = 'happy', speakOnMount = false }: MascotProps) {
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
    <div id="mascot-container" className="flex flex-col items-center justify-center max-w-sm mx-auto p-2 md:p-4 select-none flex-shrink-0">
      {/* Dynamic Bubble Box */}
      <motion.div
        id="mascot-speech-bubble"
        initial={{ opacity: 0, scale: 0.7, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="relative bg-white border-2 md:border-4 border-[#FFE8A3] rounded-[1.5rem] md:rounded-[2.5rem] p-3.5 md:p-5 mb-3 md:mb-5 text-center shadow-md md:shadow-xl max-w-[280px] md:max-w-md"
      >
        <p className="text-gray-700 font-black text-base md:text-2xl tracking-wide leading-relaxed">
          {message}
        </p>
        <div className="absolute left-1/2 -bottom-3 w-3 h-3 bg-white border-r-2 border-b-2 border-[#FFE8A3] rotate-45 -translate-x-1/2"></div>
      </motion.div>
 
      {/* Mascot Visual Body */}
      <motion.div
        id="mascot-body"
        animate={controls}
        whileHover={{ scale: 1.05 }}
        onClick={handleTapMascot}
        className={`w-16 h-16 md:w-32 md:h-32 rounded-full border-4 md:border-6 ${getMoodColors()} flex flex-col items-center justify-center relative cursor-pointer shadow-lg md:shadow-xl`}
      >
        {/* Rosy Cheeks */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-1.5 md:left-3 md:w-4 md:h-3 bg-pink-400/60 rounded-full blur-[1px] md:blur-xs"></div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-1.5 md:right-3 md:w-4 md:h-3 bg-pink-400/60 rounded-full blur-[1px] md:blur-xs"></div>
 
        {/* Big Animated Eyes */}
        <div className="flex gap-3 md:gap-6 mb-1 md:mb-2">
          {/* Left Eye */}
          <motion.div 
            className="w-2.5 md:w-4 h-3.5 md:h-6 bg-slate-900 rounded-full flex items-start justify-center pt-0.5 md:pt-1 origin-center"
            animate={{ scaleY: isBlinking ? 0.05 : 1 }}
            transition={{ duration: 0.1 }}
          >
            {!isBlinking && <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>}
          </motion.div>
 
          {/* Right Eye */}
          <motion.div 
            className="w-2.5 md:w-4 h-3.5 md:h-6 bg-slate-900 rounded-full flex items-start justify-center pt-0.5 md:pt-1 origin-center"
            animate={{ scaleY: isBlinking ? 0.05 : 1 }}
            transition={{ duration: 0.1 }}
          >
            {!isBlinking && <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-white rounded-full"></div>}
          </motion.div>
        </div>
 
        {/* Loving smile or talking mouth */}
        <motion.div
          id="mascot-mouth"
          animate={mood === 'victory' || mood === 'excited' ? { scaleY: [1, 1.4, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-4 h-2.5 md:w-7 md:h-4 bg-red-500 rounded-b-full border-t border-slate-900 flex items-end justify-center overflow-hidden"
        >
          {/* Tongue */}
          <div className="w-2.5 h-1.5 md:w-4 md:h-2 bg-pink-300 rounded-full"></div>
        </motion.div>
 
        {/* Tiny playful details: animal ears */}
        <div className="absolute -left-0.5 -top-0.5 w-4 h-4 md:-left-1 md:-top-1 md:w-7 md:h-7 bg-amber-400 border-2 md:border-4 border-amber-500 rounded-tl-full -rotate-45 z-[-1]"></div>
        <div className="absolute -right-0.5 -top-0.5 w-4 h-4 md:-right-1 md:-top-1 md:w-7 md:h-7 bg-amber-400 border-2 md:border-4 border-amber-500 rounded-tr-full rotate-45 z-[-1]"></div>
      </motion.div>
 
      {/* Gentle Tap Hint */}
      <span className="text-[10px] md:text-xs text-[#FF85A1] font-extrabold mt-1.5 md:mt-3 uppercase tracking-widest opacity-85 animate-pulse">
        Tap Hasya!
      </span>
    </div>
  );
}
