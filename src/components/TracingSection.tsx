import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playTapSound, playSuccessSound, speakIndonesian } from '../utils/audio';
import Mascot from './Mascot';
import { Sparkles, Trash2, CheckCircle, ArrowRight } from 'lucide-react';

interface TracingSectionProps {
  onLogTracing: (letter: string) => void;
}

// Toddler-friendly letters to trace with strategic checkpoint nodes (fractions of width/height 0-1)
interface TracingModel {
  letter: string;
  name: string;
  emoji: string;
  color: string;
  // Node coordinates inside the box to validate sequence or progress
  checkpoints: { x: number; y: number; label: string; hit: boolean }[];
  guides: string; // Draw instruction for structural guidance
  path: string; // The SVG skeletal path!
}

const TRACING_MODELS_POOL: TracingModel[] = [
  {
    letter: 'A',
    name: 'Apel',
    emoji: '🍎',
    color: 'text-red-500 bg-red-50 border-red-200',
    path: "M 50 15 L 20 85 M 50 15 L 80 85 M 35 55 L 65 55",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Atas', hit: false },
      { x: 0.35, y: 0.5, label: 'Kiri Tengah', hit: false },
      { x: 0.2, y: 0.85, label: 'Bawah Kiri', hit: false },
      { x: 0.65, y: 0.5, label: 'Kanan Tengah', hit: false },
      { x: 0.8, y: 0.85, label: 'Bawah Kanan', hit: false },
      { x: 0.5, y: 0.55, label: 'Jembatan Tengah', hit: false },
      { x: 0.65, y: 0.55, label: 'Jembatan Kanan', hit: false },
    ],
    guides: "Mulai dari atas 👆 lalu ke bawah kiri, ke bawah kanan, dan buat jembatan di tengah!"
  },
  {
    letter: 'B',
    name: 'Bebek',
    emoji: '🦆',
    color: 'text-orange-500 bg-orange-50 border-orange-200',
    path: "M 35 15 L 35 85 M 35 15 C 65 15, 65 48, 35 48 C 70 48, 70 85, 35 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false },
      { x: 0.6, y: 0.3, label: 'Lengkung Atas', hit: false },
      { x: 0.45, y: 0.48, label: 'Lengkung Tengah', hit: false },
      { x: 0.65, y: 0.68, label: 'Lengkung Bawah', hit: false },
      { x: 0.45, y: 0.85, label: 'Lengkung Bawah Akhir', hit: false },
    ],
    guides: "Tarik tiang lurus dari atas ke bawah 👇 lalu bentuk perut bebek melengkung!"
  },
  {
    letter: 'C',
    name: 'Ceri',
    emoji: '🍒',
    color: 'text-pink-500 bg-pink-50 border-pink-200',
    path: "M 70 20 C 35 20, 35 80, 70 80",
    checkpoints: [
      { x: 0.7, y: 0.2, label: 'Ujung Atas', hit: false },
      { x: 0.45, y: 0.22, label: 'Puncak Lengkung', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah', hit: false },
      { x: 0.45, y: 0.78, label: 'Dasar Lengkung', hit: false },
      { x: 0.7, y: 0.8, label: 'Ujung Bawah', hit: false },
    ],
    guides: "Buat bulan sabit besar melengkung dari atas ke bawah!"
  },
  {
    letter: 'D',
    name: 'Domba',
    emoji: '🐑',
    color: 'text-green-500 bg-green-50 border-green-200',
    path: "M 35 15 L 35 85 M 35 15 C 75 15, 75 85, 35 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Kepala Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Badan Tiang', hit: false },
      { x: 0.35, y: 0.85, label: 'Kaki Tiang', hit: false },
      { x: 0.6, y: 0.3, label: 'Perut Atas', hit: false },
      { x: 0.7, y: 0.5, label: 'Perut Tengah', hit: false },
      { x: 0.6, y: 0.7, label: 'Perut Bawah', hit: false },
      { x: 0.45, y: 0.82, label: 'Perut Akhir', hit: false },
    ],
    guides: "Tarik garis lurus ke bawah 👇 lalu buat lingkaran perut besar di kanan!"
  },
  {
    letter: 'E',
    name: 'Es Krim',
    emoji: '🍦',
    color: 'text-blue-500 bg-blue-50 border-blue-200',
    path: "M 35 15 L 35 85 M 35 15 L 70 15 M 35 50 L 65 50 M 35 85 L 70 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false },
      { x: 0.7, y: 0.15, label: 'Sayap Atas', hit: false },
      { x: 0.6, y: 0.5, label: 'Sayap Tengah', hit: false },
      { x: 0.7, y: 0.85, label: 'Sayap Bawah', hit: false },
    ],
    guides: "Gambar garis lurus ke bawah, lalu bikin tiga sisir garis ke samping!"
  },
  {
    letter: 'O',
    name: 'Onta',
    emoji: '🐫',
    color: 'text-violet-500 bg-violet-50 border-violet-200',
    path: "M 50 15 C 20 15, 20 85, 50 85 C 80 85, 80 15, 50 15 Z",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Ujung Atas', hit: false },
      { x: 0.25, y: 0.5, label: 'Kiri Tengah', hit: false },
      { x: 0.5, y: 0.85, label: 'Ujung Bawah', hit: false },
      { x: 0.75, y: 0.5, label: 'Kanan Tengah', hit: false },
      { x: 0.55, y: 0.18, label: 'Kembali Atas', hit: false },
    ],
    guides: "Putar lingkaran besar seperti donat lezat! 🍩"
  },
  {
    letter: 'S',
    name: 'Singa',
    emoji: '🦁',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    path: "M 65 20 C 35 15, 35 45, 50 50 C 65 55, 65 85, 35 80",
    checkpoints: [
      { x: 0.65, y: 0.2, label: 'Kepala Atas', hit: false },
      { x: 0.4, y: 0.32, label: 'Lekuk Tengah', hit: false },
      { x: 0.5, y: 0.5, label: 'Lekuk Bawah', hit: false },
      { x: 0.6, y: 0.68, label: 'Lekuk Dasar', hit: false },
      { x: 0.35, y: 0.8, label: 'Buntut', hit: false },
    ],
    guides: "Ular berjalan meliuk-liuk! Mengalir ke kiri lalu meliuk ke kanan!"
  }
];

export default function TracingSection({ onLogTracing }: TracingSectionProps) {
  const [modelIndex, setModelIndex] = useState(0);
  const currentModel = TRACING_MODELS_POOL[modelIndex];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeCheckpoints, setActiveCheckpoints] = useState(currentModel.checkpoints);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Brush color options
  const [brushColor, setBrushColor] = useState('#f59e0b');

  // Load / Reload Letter Tracing Map
  useEffect(() => {
    setActiveCheckpoints(
      currentModel.checkpoints.map(cp => ({ ...cp, hit: false }))
    );
    setIsCompleted(false);
    setIsCompleting(false);
    clearCanvas();
    speakIndonesian(`Ayo kita menulis huruf ${currentModel.letter}! Lakukan dengan jarimu!`);
  }, [modelIndex]);

  // Adjust canvas bounds dynamically on screen refresh
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        // Redraw guidance on resize if any
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentModel]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setActiveCheckpoints(
      currentModel.checkpoints.map(cp => ({ ...cp, hit: false }))
    );
    setIsCompleted(false);
  };

  const checkProximity = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isCompleted) return;

    const bounds = canvas.getBoundingClientRect();
    // Coordinates relative to canvas pixels (0 to width)
    const relativeX = clientX - bounds.left;
    const relativeY = clientY - bounds.top;

    // Relative fraction (0 to 1)
    const fx = relativeX / bounds.width;
    const fy = relativeY / bounds.height;

    // Find first unhit checkpoint index (sequential flow mode)
    const currentUnhitIdx = activeCheckpoints.findIndex(cp => !cp.hit);
    if (currentUnhitIdx === -1) return;

    const targetCp = activeCheckpoints[currentUnhitIdx];
    // Calculate geometric distance (delta-x, delta-y)
    const dx = targetCp.x - fx;
    const dy = targetCp.y - fy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Safe, extra child-friendly proximity radius (around 12% of screen)
    if (distance < 0.12) {
      playTapSound();
      
      const nextCheckpoints = activeCheckpoints.map((cp, idx) => {
        if (idx === currentUnhitIdx) {
          return { ...cp, hit: true };
        }
        return cp;
      });

      setActiveCheckpoints(nextCheckpoints);

      // Verify if all checkpoints are satisfied
      const hitAll = nextCheckpoints.every(cp => cp.hit);
      if (hitAll && !isCompleting) {
        setIsCompleting(true);
        setTimeout(() => {
          setIsCompleted(true);
          setIsCompleting(false);
          playSuccessSound();
          onLogTracing(currentModel.letter);
          speakIndonesian(`Hebat sekali! Keren! Kamu berhasil menulis huruf ${currentModel.letter}! Jagoan kecil!`);
        }, 1200); // 1200ms delay gives ample time to finish drawing the line completely
      }
    }
  };

  // Drawing event triggers (Mouse)
  const drawStartMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || isCompleted) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const bounds = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(e.clientX - bounds.left, e.clientY - bounds.top);
    checkProximity(e.clientX, e.clientY);
  };

  const drawMoveMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - bounds.left, e.clientY - bounds.top);
    ctx.stroke();
    checkProximity(e.clientX, e.clientY);
  };

  const drawEndMouse = () => {
    setIsDrawing(false);
  };

  // Drawing event triggers (Touch - for Android or iPads)
  const drawStartTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || isCompleted || e.touches.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const touch = e.touches[0];
    const bounds = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(touch.clientX - bounds.left, touch.clientY - bounds.top);
    checkProximity(touch.clientX, touch.clientY);
  };

  const drawMoveTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted || e.touches.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const touch = e.touches[0];
    const bounds = canvas.getBoundingClientRect();
    ctx.lineTo(touch.clientX - bounds.left, touch.clientY - bounds.top);
    ctx.stroke();
    checkProximity(touch.clientX, touch.clientY);
  };

  const drawEndTouch = () => {
    setIsDrawing(false);
  };

  // Skip / Change Letter Trigger
  const handleNextModel = () => {
    playTapSound();
    const prevIndex = modelIndex;
    let nextIndex = (modelIndex + 1) % TRACING_MODELS_POOL.length;
    setModelIndex(nextIndex);
  };

  return (
    <div id="tracing-playground-section" className="w-full max-w-4xl mx-auto px-4 py-2 select-none flex flex-col items-center">
      {/* Dynamic Instruction panel */}
      <Mascot
        message={isCompleted 
          ? `Keren! Huruf "${currentModel.letter}" selesai ditulis! 🌟` 
          : `${currentModel.guides}`
        }
        mood={isCompleted ? 'victory' : 'happy'}
      />

      {/* Controller Buttons top bar */}
      <div className="flex flex-wrap gap-2.5 items-center justify-center my-2.5">
        <span className="text-gray-500 font-black text-xs mr-1.5 block">Crayon:</span>
        <div className="flex gap-1.5">
          {['#FF85A1', '#ec4899', '#4CC9F0', '#20BFA9', '#c084fc'].map((col) => (
            <button
              key={col}
              onClick={() => { playTapSound(); setBrushColor(col); }}
              style={{ backgroundColor: col }}
              className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-2 cursor-pointer transition-all hover:scale-110 active:scale-90 ${brushColor === col ? 'border-white ring-2 ring-[#FFE8A3]' : 'border-slate-100 shadow-sm'}`}
            />
          ))}
        </div>
      </div>
 
      {/* Main Tracing Drawing Container */}
      <div 
        ref={containerRef}
        id="tracing-viewport"
        className="w-full max-w-sm h-64 md:h-[400px] border-4 border-[#FFE8A3] border-b-[8px] md:border-b-[12px] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative mb-4 overflow-hidden flex items-center justify-center cursor-crosshair flex-shrink-0 touch-none"
      >
        {/* Beautiful vector skeletal letter template guiding behind */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full select-none pointer-events-none opacity-20"
        >
          {/* Outer thick guide line (light grey) */}
          <path
            d={currentModel.path}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-45"
          />
          {/* Inner thin guide dash line for a premium tracing feel */}
          <path
            d={currentModel.path}
            fill="none"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="3 3"
            className="opacity-55"
          />
        </svg>
 
        {/* Tactical glowing guide points children can aim to trace */}
        {(() => {
          const firstUnhitIdx = activeCheckpoints.findIndex(cp => !cp.hit);
          return activeCheckpoints.map((cp, idx) => {
            const isNextActive = idx === firstUnhitIdx;
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${cp.x * 100}%`,
                  top: `${cp.y * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-black border-2 shadow-md transition-all duration-300 ${
                  cp.hit 
                    ? 'bg-[#20BFA9] border-[#189E8B] scale-110 text-white shadow-lg' 
                    : isNextActive
                      ? 'bg-[#FF85A1] border-[#FF85A1] text-white scale-125 animate-bounce shadow-lg shadow-[#FF85A1]/45 ring-4 ring-[#FFF0F3]'
                      : 'bg-[#FFF0F3] border-dashed border-gray-300 text-gray-400 scale-90 opacity-60'
                }`}
              >
                {cp.hit ? '✓' : idx + 1}
              </div>
            );
          });
        })()}
 
        {/* Big visual sticker at top right to indicate matched word */}
        <div className="absolute top-3 right-3 bg-[#FFF0F3] rounded-xl p-1.5 border border-[#FFE8A3] flex items-center gap-1 shadow-sm select-none pointer-events-none z-10">
          <span className="text-2xl">{currentModel.emoji}</span>
          <span className="text-[#FF85A1] font-black text-xs">{currentModel.name}</span>
        </div>
 
        {/* The Painting Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={drawStartMouse}
          onMouseMove={drawMoveMouse}
          onMouseUp={drawEndMouse}
          onMouseLeave={drawEndMouse}
          onTouchStart={drawStartTouch}
          onTouchMove={drawMoveTouch}
          onTouchEnd={drawEndTouch}
          className="absolute inset-0 z-20 touch-none"
        />
      </div>
 
      {/* Control Actions bottom panel */}
      <div id="tracing-actions-bottom" className="flex justify-center items-center gap-3 w-full max-w-sm">
        <button
          id="btn-clear-canvas"
          onClick={clearCanvas}
          className="flex-1 bg-white hover:bg-[#FFF0F3] border-2 border-b-4 border-gray-200 active:border-b-2 hover:border-[#FF85A1]/20 text-[#FF85A1] rounded-2xl p-2.5 flex items-center justify-center gap-1.5 font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer"
        >
          <Trash2 className="w-4.5 h-4.5" />
          <span>Hapus</span>
        </button>
 
        <button
          id="btn-skip-tracing"
          onClick={handleNextModel}
          className="flex-1 bg-[#FF85A1] hover:bg-[#e06c87] border-2 border-b-4 border-[#e06c87] active:border-b-2 text-white rounded-2xl p-2.5 flex items-center justify-center gap-1.5 font-black text-base shadow-md active:translate-y-0.5 transition-all cursor-pointer"
        >
          <span>Huruf Lain</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* FULL-SCREEN SUCCESS MODAL OVERLAY */}
      <AnimatePresence>
        {isCompleted && (
          <div id="tracing-success-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
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

              <div className="text-5xl mb-2 relative z-10 animate-bounce">
                {currentModel.emoji}
              </div>
              <h3 className="text-2xl font-black text-[#FF85A1] flex items-center gap-1 justify-center relative z-10">
                <CheckCircle className="w-6 h-6 text-[#20BFA9]" />
                <span>Sangat Hebat!</span>
              </h3>
              <p className="text-gray-500 font-extrabold text-xs mt-1 mb-5 leading-normal relative z-10 leading-relaxed">
                Kamu pandai menulis huruf <span className="text-[#FF85A1] text-lg font-black">{currentModel.letter}</span>!<br />Hebat sekali! ✍️
              </p>

              <button
                id="btn-tracing-next-letter"
                onClick={handleNextModel}
                className="w-full bg-[#20BFA9] text-white font-black text-lg p-3 rounded-xl border-b-4 border-[#189E8B] shadow-lg hover:border-b-2 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer relative z-10"
              >
                <span>Ganti Huruf 🚀</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
