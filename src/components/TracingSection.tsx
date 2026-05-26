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
  // Node coordinates inside the box to validate sequence or progress, with optional parent connection indices
  checkpoints: { x: number; y: number; label: string; hit: boolean; prevIndex?: number }[];
  guides: string; // Draw instruction for structural guidance
  path: string; // The SVG skeletal path!
}

const TRACING_MODELS_POOL: TracingModel[] = [
  {
    letter: 'A',
    name: 'Apel',
    emoji: '🍎',
    color: 'text-red-500 bg-red-55 border-red-200',
    path: "M 50 15 L 20 85 M 50 15 L 80 85 M 35 55 L 65 55",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Atas', hit: false },
      { x: 0.35, y: 0.5, label: 'Kiri Tengah', hit: false, prevIndex: 0 },
      { x: 0.2, y: 0.85, label: 'Bawah Kiri', hit: false, prevIndex: 1 },
      { x: 0.65, y: 0.5, label: 'Kanan Tengah', hit: false, prevIndex: 0 },
      { x: 0.8, y: 0.85, label: 'Bawah Kanan', hit: false, prevIndex: 3 },
      { x: 0.5, y: 0.55, label: 'Jembatan Tengah', hit: false, prevIndex: 1 },
      { x: 0.65, y: 0.55, label: 'Jembatan Kanan', hit: false, prevIndex: 5 },
    ],
    guides: "Mulai dari atas 👆 lalu ke bawah kiri, ke bawah kanan, dan buat jembatan di tengah!"
  },
  {
    letter: 'B',
    name: 'Bebek',
    emoji: '🦆',
    color: 'text-orange-500 bg-orange-55 border-orange-200',
    path: "M 35 15 L 35 85 M 35 15 C 65 15, 65 48, 35 48 C 70 48, 70 85, 35 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.3, label: 'Lengkung Atas', hit: false, prevIndex: 0 },
      { x: 0.45, y: 0.48, label: 'Lengkung Tengah', hit: false, prevIndex: 3 },
      { x: 0.65, y: 0.68, label: 'Lengkung Bawah', hit: false, prevIndex: 4 },
      { x: 0.45, y: 0.85, label: 'Lengkung Bawah Akhir', hit: false, prevIndex: 5 },
    ],
    guides: "Tarik tiang lurus dari atas ke bawah 👇 lalu bentuk perut bebek melengkung!"
  },
  {
    letter: 'C',
    name: 'Ceri',
    emoji: '🍒',
    color: 'text-pink-500 bg-pink-55 border-pink-200',
    path: "M 70 20 C 35 20, 35 80, 70 80",
    checkpoints: [
      { x: 0.7, y: 0.2, label: 'Ujung Atas', hit: false },
      { x: 0.45, y: 0.22, label: 'Puncak Lengkung', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.5, label: 'Tengah', hit: false, prevIndex: 1 },
      { x: 0.45, y: 0.78, label: 'Dasar Lengkung', hit: false, prevIndex: 2 },
      { x: 0.7, y: 0.8, label: 'Ujung Bawah', hit: false, prevIndex: 3 },
    ],
    guides: "Buat bulan sabit besar melengkung dari atas ke bawah!"
  },
  {
    letter: 'D',
    name: 'Domba',
    emoji: '🐑',
    color: 'text-green-500 bg-green-55 border-green-200',
    path: "M 35 15 L 35 85 M 35 15 C 75 15, 75 85, 35 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Kepala Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Badan Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Kaki Tiang', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.3, label: 'Perut Atas', hit: false, prevIndex: 0 },
      { x: 0.7, y: 0.5, label: 'Perut Tengah', hit: false, prevIndex: 3 },
      { x: 0.6, y: 0.7, label: 'Perut Bawah', hit: false, prevIndex: 4 },
      { x: 0.45, y: 0.82, label: 'Perut Akhir', hit: false, prevIndex: 5 },
    ],
    guides: "Tarik garis lurus ke bawah 👇 lalu buat lingkaran perut besar di kanan!"
  },
  {
    letter: 'E',
    name: 'Es Krim',
    emoji: '🍦',
    color: 'text-blue-500 bg-blue-55 border-blue-200',
    path: "M 35 15 L 35 85 M 35 15 L 70 15 M 35 50 L 65 50 M 35 85 L 70 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.15, label: 'Sayap Atas', hit: false, prevIndex: 0 },
      { x: 0.6, y: 0.5, label: 'Sayap Tengah', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.85, label: 'Sayap Bawah', hit: false, prevIndex: 2 },
    ],
    guides: "Gambar garis lurus ke bawah, lalu bikin tiga sisir garis ke samping!"
  },
  {
    letter: 'F',
    name: 'Foto',
    emoji: '📷',
    color: 'text-cyan-500 bg-cyan-55 border-cyan-200',
    path: "M 35 15 L 35 85 M 35 15 L 70 15 M 35 50 L 65 50",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.15, label: 'Kanan Atas', hit: false, prevIndex: 0 },
      { x: 0.6, y: 0.5, label: 'Kanan Tengah', hit: false, prevIndex: 1 },
    ],
    guides: "Garis lurus ke bawah 👇 lalu buat dua garis ke samping di atas dan tengah!"
  },
  {
    letter: 'G',
    name: 'Gajah',
    emoji: '🐘',
    color: 'text-purple-500 bg-purple-55 border-purple-200',
    path: "M 70 25 C 35 15, 35 85, 70 80 L 70 55 L 55 55",
    checkpoints: [
      { x: 0.7, y: 0.25, label: 'Mulai Atas', hit: false },
      { x: 0.35, y: 0.5, label: 'Lengkung Kiri', hit: false, prevIndex: 0 },
      { x: 0.7, y: 0.8, label: 'Lengkung Bawah', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.55, label: 'Naik Tengah', hit: false, prevIndex: 2 },
      { x: 0.55, y: 0.55, label: 'Masuk Dalam', hit: false, prevIndex: 3 },
    ],
    guides: "Buat lengkungan besar melingkar 🔄 lalu belok ke dalam di tengah!"
  },
  {
    letter: 'H',
    name: 'Harimau',
    emoji: '🐯',
    color: 'text-amber-500 bg-amber-55 border-amber-200',
    path: "M 30 15 L 30 85 M 70 15 L 70 85 M 30 50 L 70 50",
    checkpoints: [
      { x: 0.3, y: 0.15, label: 'Tiang Kiri Atas', hit: false },
      { x: 0.3, y: 0.85, label: 'Tiang Kiri Bawah', hit: false, prevIndex: 0 },
      { x: 0.7, y: 0.15, label: 'Tiang Kanan Atas', hit: false },
      { x: 0.7, y: 0.85, label: 'Tiang Kanan Bawah', hit: false, prevIndex: 2 },
      { x: 0.5, y: 0.5, label: 'Jembatan Tengah', hit: false, prevIndex: 1 },
    ],
    guides: "Gambar dua tiang lurus berdiri 🧍🧍 lalu hubungkan dengan jembatan di tengah!"
  },
  {
    letter: 'I',
    name: 'Ikan',
    emoji: '🐟',
    color: 'text-sky-500 bg-sky-55 border-sky-200',
    path: "M 50 20 L 50 80 M 35 20 L 65 20 M 35 80 L 65 80",
    checkpoints: [
      { x: 0.5, y: 0.2, label: 'Atas Tiang', hit: false },
      { x: 0.5, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.8, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
    ],
    guides: "Tarik tiang lurus ke bawah, lalu beri topi dan kaki kecil di atas dan bawah!"
  },
  {
    letter: 'J',
    name: 'Jeruk',
    emoji: '🍊',
    color: 'text-yellow-500 bg-yellow-55 border-yellow-200',
    path: "M 65 15 L 65 70 C 65 90, 35 90, 35 70",
    checkpoints: [
      { x: 0.65, y: 0.15, label: 'Mulai Atas', hit: false },
      { x: 0.65, y: 0.5, label: 'Garis Tengah', hit: false, prevIndex: 0 },
      { x: 0.65, y: 0.75, label: 'Lekuk Bawah', hit: false, prevIndex: 1 },
      { x: 0.45, y: 0.85, label: 'Lengkung Kiri', hit: false, prevIndex: 2 },
    ],
    guides: "Garis lurus ke bawah lalu melengkung manis ke kiri seperti payung! ☔"
  },
  {
    letter: 'K',
    name: 'Kucing',
    emoji: '🐱',
    color: 'text-yellow-600 bg-yellow-55 border-yellow-200',
    path: "M 35 15 L 35 85 M 65 15 L 35 50 L 65 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Tiang Atas', hit: false },
      { x: 0.35, y: 0.85, label: 'Tiang Bawah', hit: false, prevIndex: 0 },
      { x: 0.65, y: 0.15, label: 'Tangan Kanan Atas', hit: false },
      { x: 0.38, y: 0.5, label: 'Pertemuan Tengah', hit: false, prevIndex: 2 },
      { x: 0.65, y: 0.85, label: 'Kaki Kanan Bawah', hit: false, prevIndex: 3 },
    ],
    guides: "Tarik tiang lurus ke bawah 🐈 lalu buat mulut mencucup terbuka ke kanan!"
  },
  {
    letter: 'L',
    name: 'Lebah',
    emoji: '🐝',
    color: 'text-emerald-500 bg-emerald-55 border-emerald-200',
    path: "M 35 15 L 35 85 L 70 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.85, label: 'Ujung Kanan', hit: false, prevIndex: 2 },
    ],
    guides: "Tarik tiang lurus ke bawah 👇 lalu tidur santai ke kanan!"
  },
  {
    letter: 'M',
    name: 'Monyet',
    emoji: '🐒',
    color: 'text-amber-600 bg-amber-55 border-amber-200',
    path: "M 25 85 L 25 15 L 50 50 L 75 15 L 75 85",
    checkpoints: [
      { x: 0.25, y: 0.85, label: 'Kiri Bawah', hit: false },
      { x: 0.25, y: 0.15, label: 'Kiri Atas', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.5, label: 'Lembah Tengah', hit: false, prevIndex: 1 },
      { x: 0.75, y: 0.15, label: 'Kanan Atas', hit: false, prevIndex: 2 },
      { x: 0.75, y: 0.85, label: 'Kanan Bawah', hit: false, prevIndex: 3 },
    ],
    guides: "Gambar dua tiang tinggi, lalu buat lembah seru di tengahnya! ⛰️"
  },
  {
    letter: 'N',
    name: 'Nanas',
    emoji: '🍍',
    color: 'text-lime-500 bg-lime-55 border-lime-200',
    path: "M 30 85 L 30 15 L 70 85 L 70 15",
    checkpoints: [
      { x: 0.3, y: 0.85, label: 'Kiri Bawah', hit: false },
      { x: 0.3, y: 0.15, label: 'Kiri Atas', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.5, label: 'Luncuran Tengah', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.85, label: 'Kanan Bawah', hit: false, prevIndex: 2 },
      { x: 0.7, y: 0.15, label: 'Kanan Atas', hit: false, prevIndex: 3 },
    ],
    guides: "Gambar dua tiang, lalu luncurkan garis miring dari kiri atas ke kanan bawah! 🛝"
  },
  {
    letter: 'O',
    name: 'Onta',
    emoji: '🐫',
    color: 'text-violet-500 bg-violet-55 border-violet-200',
    path: "M 50 15 C 20 15, 20 85, 50 85 C 80 85, 80 15, 50 15 Z",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Ujung Atas', hit: false },
      { x: 0.25, y: 0.5, label: 'Kiri Tengah', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.85, label: 'Ujung Bawah', hit: false, prevIndex: 1 },
      { x: 0.75, y: 0.5, label: 'Kanan Tengah', hit: false, prevIndex: 2 },
      { x: 0.55, y: 0.18, label: 'Kembali Atas', hit: false, prevIndex: 3 },
    ],
    guides: "Putar lingkaran besar seperti donat lezat! 🍩"
  },
  {
    letter: 'P',
    name: 'Pisang',
    emoji: '🍌',
    color: 'text-yellow-500 bg-yellow-55 border-yellow-200',
    path: "M 35 15 L 35 85 M 35 15 C 65 15, 65 48, 35 48",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.3, label: 'Balon Atas Kanan', hit: false, prevIndex: 0 },
      { x: 0.45, y: 0.48, label: 'Balon Selesai', hit: false, prevIndex: 3 },
    ],
    guides: "Tarik tiang lurus ke bawah, lalu bikin gelembung kepala kecil di atas kanan!"
  },
  {
    letter: 'Q',
    name: 'Quran',
    emoji: '📖',
    color: 'text-teal-500 bg-teal-55 border-teal-200',
    path: "M 50 15 C 20 15, 20 75, 50 75 C 80 75, 80 15, 50 15 Z M 65 60 L 80 80",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Atas Bulat', hit: false },
      { x: 0.25, y: 0.45, label: 'Kiri Bulat', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.75, label: 'Bawah Bulat', hit: false, prevIndex: 1 },
      { x: 0.75, y: 0.45, label: 'Kanan Bulat', hit: false, prevIndex: 2 },
      { x: 0.8, y: 0.8, label: 'Ekor Kanan', hit: false },
    ],
    guides: "Putar lingkaran donat 🍩 lalu beri kaki kecil meluncur di kanan bawah!"
  },
  {
    letter: 'R',
    name: 'Roti',
    emoji: '🍞',
    color: 'text-rose-500 bg-rose-55 border-rose-200',
    path: "M 35 15 L 35 85 M 35 15 C 65 15, 65 48, 35 48 M 35 48 L 65 85",
    checkpoints: [
      { x: 0.35, y: 0.15, label: 'Atas Tiang', hit: false },
      { x: 0.35, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 0 },
      { x: 0.6, y: 0.3, label: 'Kepala Lengkung', hit: false, prevIndex: 0 },
      { x: 0.38, y: 0.48, label: 'Leher Tengah', hit: false, prevIndex: 2 },
      { x: 0.65, y: 0.85, label: 'Kaki Kanan Bawah', hit: false, prevIndex: 3 },
    ],
    guides: "Tiang lurus ke bawah, buat gelembung kepala, lalu tendang kaki miring ke kanan!"
  },
  {
    letter: 'S',
    name: 'Singa',
    emoji: '🦁',
    color: 'text-yellow-600 bg-yellow-55 border-yellow-200',
    path: "M 65 20 C 35 15, 35 45, 50 50 C 65 55, 65 85, 35 80",
    checkpoints: [
      { x: 0.65, y: 0.2, label: 'Kepala Atas', hit: false },
      { x: 0.4, y: 0.32, label: 'Lekuk Tengah', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.5, label: 'Lekuk Bawah', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.68, label: 'Lekuk Dasar', hit: false, prevIndex: 2 },
      { x: 0.35, y: 0.8, label: 'Buntut', hit: false, prevIndex: 3 },
    ],
    guides: "Ular berjalan meliuk-liuk! Mengalir ke kiri lalu meliuk ke kanan!"
  },
  {
    letter: 'T',
    name: 'Telur',
    emoji: '🥚',
    color: 'text-zinc-500 bg-zinc-55 border-zinc-200',
    path: "M 50 15 L 50 85 M 25 15 L 75 15",
    checkpoints: [
      { x: 0.5, y: 0.15, label: 'Tengah Atas', hit: false },
      { x: 0.5, y: 0.85, label: 'Tiang Bawah', hit: false, prevIndex: 0 },
      { x: 0.25, y: 0.15, label: 'Sayap Kiri', hit: false },
      { x: 0.75, y: 0.15, label: 'Sayap Kanan', hit: false, prevIndex: 2 },
    ],
    guides: "Tarik tiang lurus ke bawah 👇 lalu pasang topi lebar di atas! 👒"
  },
  {
    letter: 'U',
    name: 'Ulat',
    emoji: '🐛',
    color: 'text-lime-600 bg-lime-55 border-lime-200',
    path: "M 30 15 L 30 70 C 30 90, 70 90, 70 70 L 70 15",
    checkpoints: [
      { x: 0.3, y: 0.15, label: 'Kiri Atas', hit: false },
      { x: 0.3, y: 0.6, label: 'Kiri Tengah', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.85, label: 'Bawah Lengkung', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.6, label: 'Kanan Tengah', hit: false, prevIndex: 2 },
      { x: 0.7, y: 0.15, label: 'Kanan Atas', hit: false, prevIndex: 3 },
    ],
    guides: "Luncurkan ke bawah lalu melengkung naik seperti mangkuk sup! 🥣"
  },
  {
    letter: 'V',
    name: 'Vas',
    emoji: '🏺',
    color: 'text-indigo-500 bg-indigo-55 border-indigo-200',
    path: "M 25 15 L 50 85 L 75 15",
    checkpoints: [
      { x: 0.25, y: 0.15, label: 'Kiri Atas', hit: false },
      { x: 0.5, y: 0.85, label: 'Sudut Bawah', hit: false, prevIndex: 0 },
      { x: 0.75, y: 0.15, label: 'Kanan Atas', hit: false, prevIndex: 1 },
    ],
    guides: "Luncurkan miring ke bawah kiri, lalu daki ke kanan atas! 🧗"
  },
  {
    letter: 'W',
    name: 'Wortel',
    emoji: '🥕',
    color: 'text-orange-500 bg-orange-55 border-orange-200',
    path: "M 20 15 L 35 85 L 50 40 L 65 85 L 80 15",
    checkpoints: [
      { x: 0.2, y: 0.15, label: 'Mulai Kiri', hit: false },
      { x: 0.35, y: 0.85, label: 'Lembah Kiri', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.4, label: 'Puncak Tengah', hit: false, prevIndex: 1 },
      { x: 0.65, y: 0.85, label: 'Lembah Kanan', hit: false, prevIndex: 2 },
      { x: 0.8, y: 0.15, label: 'Ujung Kanan', hit: false, prevIndex: 3 },
    ],
    guides: "Luncurkan ke bawah, naik, turun lagi, lalu daki naik sekali lagi! 🎢"
  },
  {
    letter: 'X',
    name: 'Xilofon',
    emoji: '🎹',
    color: 'text-violet-500 bg-violet-55 border-violet-200',
    path: "M 25 15 L 75 85 M 75 15 L 25 85",
    checkpoints: [
      { x: 0.25, y: 0.15, label: 'Kiri Atas', hit: false },
      { x: 0.75, y: 0.85, label: 'Kanan Bawah', hit: false, prevIndex: 0 },
      { x: 0.75, y: 0.15, label: 'Kanan Atas', hit: false },
      { x: 0.25, y: 0.85, label: 'Kiri Bawah', hit: false, prevIndex: 2 },
    ],
    guides: "Silangkan dua garis miring seru dari sudut ke sudut! ⚔️"
  },
  {
    letter: 'Y',
    name: 'Yoyo',
    emoji: '🪀',
    color: 'text-emerald-500 bg-emerald-55 border-emerald-200',
    path: "M 25 15 L 50 50 L 75 15 M 50 50 L 50 85",
    checkpoints: [
      { x: 0.25, y: 0.15, label: 'Kiri Atas', hit: false },
      { x: 0.75, y: 0.15, label: 'Kanan Atas', hit: false },
      { x: 0.5, y: 0.5, label: 'Pertemuan Tengah', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.85, label: 'Tiang Bawah', hit: false, prevIndex: 2 },
    ],
    guides: "Buat huruf V kecil di atas, lalu tarik tiang lurus ke bawah! 🎈"
  },
  {
    letter: 'Z',
    name: 'Zebra',
    emoji: '🦓',
    color: 'text-slate-700 bg-slate-55 border-slate-200',
    path: "M 25 15 L 75 15 L 25 85 L 75 85",
    checkpoints: [
      { x: 0.25, y: 0.15, label: 'Mulai Kiri', hit: false },
      { x: 0.75, y: 0.15, label: 'Sudut Kanan Atas', hit: false, prevIndex: 0 },
      { x: 0.25, y: 0.85, label: 'Sudut Kiri Bawah', hit: false, prevIndex: 1 },
      { x: 0.75, y: 0.85, label: 'Akhir Kanan', hit: false, prevIndex: 2 },
    ],
    guides: "Tidur ke kanan, luncur miring ke bawah kiri, lalu tidur ke kanan lagi! ⚡"
  }
];

const TRACING_NUMBERS_POOL: TracingModel[] = [
  {
    letter: '1',
    name: 'Jerapah',
    emoji: '🦒',
    color: 'text-red-500 bg-red-55 border-red-200',
    path: "M 35 30 L 50 15 L 50 85 M 35 85 L 65 85",
    checkpoints: [
      { x: 0.35, y: 0.3, label: 'Mulai Bendera', hit: false },
      { x: 0.5, y: 0.15, label: 'Puncak Tiang', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 1 },
      { x: 0.5, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 2 },
      { x: 0.35, y: 0.85, label: 'Kaki Kiri', hit: false },
      { x: 0.65, y: 0.85, label: 'Kaki Kanan', hit: false, prevIndex: 4 }
    ],
    guides: "Mulai dari bendera kecil di kiri 🚩 lalu turun tegak ke bawah, dan beri garis tidur di bawah!"
  },
  {
    letter: '2',
    name: 'Bebek',
    emoji: '🦆',
    color: 'text-orange-500 bg-orange-55 border-orange-200',
    path: "M 30 30 C 30 10, 70 10, 70 35 C 70 60, 30 85, 30 85 L 70 85",
    checkpoints: [
      { x: 0.3, y: 0.3, label: 'Kepala Mulai', hit: false },
      { x: 0.5, y: 0.15, label: 'Lengkung Atas', hit: false, prevIndex: 0 },
      { x: 0.7, y: 0.3, label: 'Lengkung Belakang', hit: false, prevIndex: 1 },
      { x: 0.5, y: 0.55, label: 'Leher Miring', hit: false, prevIndex: 2 },
      { x: 0.3, y: 0.85, label: 'Sudut Kiri Bawah', hit: false, prevIndex: 3 },
      { x: 0.7, y: 0.85, label: 'Kaki Kanan', hit: false, prevIndex: 4 }
    ],
    guides: "Buat lengkungan kepala bebek meliuk 🦆 lalu tarik lurus ke samping kanan!"
  },
  {
    letter: '3',
    name: 'Monyet',
    emoji: '🐒',
    color: 'text-pink-500 bg-pink-55 border-pink-200',
    path: "M 30 20 C 60 20, 60 48, 45 48 C 65 48, 65 80, 30 80",
    checkpoints: [
      { x: 0.3, y: 0.2, label: 'Mulai Atas', hit: false },
      { x: 0.55, y: 0.2, label: 'Lengkung Puncak', hit: false, prevIndex: 0 },
      { x: 0.45, y: 0.48, label: 'Lekuk Tengah', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.64, label: 'Lengkung Bawah', hit: false, prevIndex: 2 },
      { x: 0.3, y: 0.8, label: 'Lengkung Dasar', hit: false, prevIndex: 3 }
    ],
    guides: "Lengkung atas seperti sayap burung 🐦 lalu lengkung bawah lagi!"
  },
  {
    letter: '4',
    name: 'Kupu-kupu',
    emoji: '🦋',
    color: 'text-green-500 bg-green-55 border-green-200',
    path: "M 55 15 L 25 60 L 75 60 M 55 15 L 55 85",
    checkpoints: [
      { x: 0.55, y: 0.15, label: 'Puncak Miring', hit: false },
      { x: 0.25, y: 0.6, label: 'Sudut Kiri', hit: false, prevIndex: 0 },
      { x: 0.75, y: 0.6, label: 'Garis Kanan', hit: false, prevIndex: 1 },
      { x: 0.55, y: 0.5, label: 'Tengah Tiang', hit: false, prevIndex: 0 },
      { x: 0.55, y: 0.85, label: 'Bawah Tiang', hit: false, prevIndex: 3 }
    ],
    guides: "Luncurkan garis miring ke kiri 🛝 geser ke kanan, lalu tarik tiang lurus ke bawah!"
  },
  {
    letter: '5',
    name: 'Bintang',
    emoji: '⭐',
    color: 'text-blue-500 bg-blue-55 border-blue-200',
    path: "M 65 15 L 35 15 L 35 48 C 65 48, 65 85, 30 85",
    checkpoints: [
      { x: 0.65, y: 0.15, label: 'Topi Kanan', hit: false },
      { x: 0.35, y: 0.15, label: 'Topi Kiri', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.48, label: 'Tiang Bawah', hit: false, prevIndex: 1 },
      { x: 0.6, y: 0.58, label: 'Lengkung Perut', hit: false, prevIndex: 2 },
      { x: 0.3, y: 0.85, label: 'Pantat Dasar', hit: false, prevIndex: 3 }
    ],
    guides: "Tarik tiang pendek ke bawah 📏 beri perut gendut melengkung, lalu buat topi lebar!"
  },
  {
    letter: '6',
    name: 'Ceri',
    emoji: '🍒',
    color: 'text-cyan-500 bg-cyan-55 border-cyan-200',
    path: "M 60 15 C 30 25, 20 60, 35 75 C 50 90, 65 80, 50 60 C 35 48, 30 60, 35 75",
    checkpoints: [
      { x: 0.6, y: 0.15, label: 'Mulai Atas', hit: false },
      { x: 0.35, y: 0.35, label: 'Turun Miring', hit: false, prevIndex: 0 },
      { x: 0.3, y: 0.65, label: 'Lengkung Kiri', hit: false, prevIndex: 1 },
      { x: 0.5, y: 0.85, label: 'Dasar Bulat', hit: false, prevIndex: 2 },
      { x: 0.65, y: 0.65, label: 'Kanan Bulat', hit: false, prevIndex: 3 },
      { x: 0.5, y: 0.55, label: 'Tengah Bulat', hit: false, prevIndex: 4 }
    ],
    guides: "Meluncur miring ke bawah kiri 🛝 lalu putar perut bulat penuh seperti siput!"
  },
  {
    letter: '7',
    name: 'Pelangi',
    emoji: '🌈',
    color: 'text-purple-500 bg-purple-55 border-purple-200',
    path: "M 30 20 L 70 20 L 45 85",
    checkpoints: [
      { x: 0.3, y: 0.2, label: 'Mulai Kiri Atas', hit: false },
      { x: 0.7, y: 0.2, label: 'Sudut Kanan Atas', hit: false, prevIndex: 0 },
      { x: 0.55, y: 0.5, label: 'Garis Tengah', hit: false, prevIndex: 1 },
      { x: 0.45, y: 0.85, label: 'Ujung Kiri Bawah', hit: false, prevIndex: 2 }
    ],
    guides: "Geser lurus ke kanan ➡️ lalu luncurkan tiang miring ke bawah kiri!"
  },
  {
    letter: '8',
    name: 'Gurita',
    emoji: '🐙',
    color: 'text-amber-500 bg-amber-55 border-amber-200',
    path: "M 50 50 C 30 40, 30 15, 50 15 C 70 15, 70 40, 50 50 C 30 60, 30 85, 50 85 C 70 85, 70 60, 50 50 Z",
    checkpoints: [
      { x: 0.5, y: 0.5, label: 'Titik Tengah', hit: false },
      { x: 0.3, y: 0.3, label: 'Kiri Atas', hit: false, prevIndex: 0 },
      { x: 0.5, y: 0.15, label: 'Puncak Atas', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.3, label: 'Kanan Atas', hit: false, prevIndex: 2 },
      { x: 0.5, y: 0.5, label: 'Tengah Silang', hit: false, prevIndex: 3 },
      { x: 0.3, y: 0.7, label: 'Kiri Bawah', hit: false, prevIndex: 4 },
      { x: 0.5, y: 0.85, label: 'Dasar Bawah', hit: false, prevIndex: 5 },
      { x: 0.7, y: 0.7, label: 'Kanan Bawah', hit: false, prevIndex: 6 },
      { x: 0.5, y: 0.5, label: 'Selesai Tengah', hit: false, prevIndex: 7 }
    ],
    guides: "Putar lingkaran kecil di atas 🔄 lalu sambung dengan lingkaran di bawah seperti boneka salju! ⛄"
  },
  {
    letter: '9',
    name: 'Balon',
    emoji: '🎈',
    color: 'text-rose-500 bg-rose-55 border-rose-200',
    path: "M 65 50 C 65 15, 35 15, 35 35 C 35 55, 65 55, 65 50 L 65 85 C 65 95, 35 95, 35 85",
    checkpoints: [
      { x: 0.65, y: 0.35, label: 'Mulai Bulat', hit: false },
      { x: 0.5, y: 0.15, label: 'Puncak Bulat', hit: false, prevIndex: 0 },
      { x: 0.35, y: 0.35, label: 'Kiri Bulat', hit: false, prevIndex: 1 },
      { x: 0.5, y: 0.5, label: 'Bawah Bulat', hit: false, prevIndex: 2 },
      { x: 0.65, y: 0.35, label: 'Kembali Bulat', hit: false, prevIndex: 3 },
      { x: 0.65, y: 0.65, label: 'Tiang Bawah', hit: false, prevIndex: 4 },
      { x: 0.65, y: 0.85, label: 'Ujung Tiang', hit: false, prevIndex: 5 },
      { x: 0.45, y: 0.85, label: 'Buntut Kiri', hit: false, prevIndex: 6 }
    ],
    guides: "Buat kepala balon bulat di atas 🎈 lalu luncurkan ekor manis ke bawah kiri!"
  },
  {
    letter: '10',
    name: 'Apel',
    emoji: '🍎',
    color: 'text-teal-500 bg-teal-55 border-teal-200',
    path: "M 30 30 L 40 15 L 40 85 M 70 15 C 55 15, 55 85, 70 85 C 85 85, 85 15, 70 15 Z",
    checkpoints: [
      { x: 0.3, y: 0.3, label: 'Mulai Satu', hit: false },
      { x: 0.4, y: 0.15, label: 'Atas Satu', hit: false, prevIndex: 0 },
      { x: 0.4, y: 0.85, label: 'Bawah Satu', hit: false, prevIndex: 1 },
      { x: 0.7, y: 0.15, label: 'Atas Nol', hit: false },
      { x: 0.58, y: 0.5, label: 'Kiri Nol', hit: false, prevIndex: 3 },
      { x: 0.7, y: 0.85, label: 'Bawah Nol', hit: false, prevIndex: 4 },
      { x: 0.82, y: 0.5, label: 'Kanan Nol', hit: false, prevIndex: 5 },
      { x: 0.7, y: 0.15, label: 'Kembali Nol', hit: false, prevIndex: 6 }
    ],
    guides: "Tulis angka satu lurus ke bawah 👇 lalu putar lingkaran telur nol besar di sampingnya! 🥚"
  }
];

export default function TracingSection({ onLogTracing }: TracingSectionProps) {
  const [poolType, setPoolType] = useState<'letters' | 'numbers'>('letters');
  const [modelIndex, setModelIndex] = useState(0);

  const currentPool = poolType === 'letters' ? TRACING_MODELS_POOL : TRACING_NUMBERS_POOL;
  const currentModel = currentPool[modelIndex];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeCheckpoints, setActiveCheckpoints] = useState(currentModel.checkpoints);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Brush color options
  const [brushColor, setBrushColor] = useState('#FF85A1');

  // Load / Reload Letter/Number Tracing Map
  useEffect(() => {
    setActiveCheckpoints(
      currentModel.checkpoints.map(cp => ({ ...cp, hit: false }))
    );
    setIsCompleted(false);
    setIsCompleting(false);
    clearCanvas();
    speakIndonesian(`Ayo kita menulis ${poolType === 'letters' ? 'huruf' : 'angka'} ${currentModel.letter}! Lakukan dengan jarimu!`);
  }, [modelIndex, poolType]);

  // Adjust canvas bounds dynamically on screen refresh
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
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

  const checkProximity = (clientX: number, clientY: number, isTapEvent: boolean) => {
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
      
      // Auto-draw connection from parent checkpoint (prevIndex) ONLY for taps (Connect the Dots)!
      // If the child is manually tracing/dragging, we do NOT auto-draw the straight line segment over it.
      if (isTapEvent) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = brushColor;
          ctx.lineWidth = 18;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const px = targetCp.x * canvas.width;
          const py = targetCp.y * canvas.height;

          ctx.beginPath();
          if (targetCp.prevIndex !== undefined) {
            const prevCp = activeCheckpoints[targetCp.prevIndex];
            const prevX = prevCp.x * canvas.width;
            const prevY = prevCp.y * canvas.height;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
          } else {
            // Draw a small solid dot for the starting checkpoint of a stroke
            ctx.arc(px, py, 9, 0, Math.PI * 2);
            ctx.fillStyle = brushColor;
            ctx.fill();
          }
          ctx.stroke();
        }
      }

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
          speakIndonesian(`Hebat sekali! Keren! Kamu berhasil menulis ${poolType === 'letters' ? 'huruf' : 'angka'} ${currentModel.letter}! Jagoan kecil!`);
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
    checkProximity(e.clientX, e.clientY, true);
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
    checkProximity(e.clientX, e.clientY, false);
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
    checkProximity(touch.clientX, touch.clientY, true);
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
    checkProximity(touch.clientX, touch.clientY, false);
  };

  const drawEndTouch = () => {
    setIsDrawing(false);
  };

  // Skip / Change Letter Trigger
  const handleNextModel = () => {
    playTapSound();
    const nextIndex = (modelIndex + 1) % currentPool.length;
    setModelIndex(nextIndex);
  };

  return (
    <div id="tracing-playground-section" className="w-full max-w-4xl mx-auto px-4 py-1 select-none flex flex-col items-center">
      {/* Dynamic Instruction panel */}
      <Mascot
        message={isCompleted 
          ? `Keren! ${poolType === 'letters' ? 'Huruf' : 'Angka'} "${currentModel.letter}" selesai ditulis! 🌟` 
          : `${currentModel.guides}`
        }
        mood={isCompleted ? 'victory' : 'happy'}
        compact={true}
      />

      {/* Playful Category Switcher */}
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-sm mt-3 mb-2 flex-shrink-0">
        <button
          onClick={() => {
            playTapSound();
            setPoolType('letters');
            setModelIndex(0);
          }}
          className={`relative py-3 px-4 rounded-3xl font-black text-sm transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border-2 border-b-4 shadow-sm hover:scale-105 active:scale-95 active:translate-y-0.5 active:border-b-2 ${
            poolType === 'letters'
              ? 'bg-[#FF85A1] border-[#FF85A1] border-b-[#e06c87] text-white shadow-md scale-102'
              : 'bg-white border-[#FFE8A3] border-b-[#FFE8A3]/80 text-[#FF85A1] hover:bg-[#FFF0F3]'
          }`}
        >
          <span className="text-2xl animate-pulse">🔤</span>
          <span className="font-black text-xs uppercase tracking-wide">Huruf A - Z</span>
        </button>
        
        <button
          onClick={() => {
            playTapSound();
            setPoolType('numbers');
            setModelIndex(0);
          }}
          className={`relative py-3 px-4 rounded-3xl font-black text-sm transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border-2 border-b-4 shadow-sm hover:scale-105 active:scale-95 active:translate-y-0.5 active:border-b-2 ${
            poolType === 'numbers'
              ? 'bg-[#20BFA9] border-[#20BFA9] border-b-[#189E8B] text-white shadow-md scale-102'
              : 'bg-white border-[#FFE8A3] border-b-[#FFE8A3]/80 text-[#20BFA9] hover:bg-[#F0FDFA]'
          }`}
        >
          <span className="text-2xl animate-pulse">🔢</span>
          <span className="font-black text-xs uppercase tracking-wide">Angka 1 - 10</span>
        </button>
      </div>

      {/* Premium Compact Top Controller (Single Row Layout) */}
      <div className="w-full max-w-sm bg-white border-2 border-b-4 border-[#FFE8A3] rounded-[1.5rem] px-3.5 py-1.5 mt-1.5 mb-1.5 flex items-center justify-between shadow-sm flex-shrink-0">
        {/* Left Side: Current Letter & Vocabulary Word */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#20BFA9] rounded-xl flex items-center justify-center text-white text-base font-black shadow-inner flex-shrink-0">
            {currentModel.letter}
          </div>
          <div className="flex items-center gap-1 bg-[#FFF0F3] rounded-xl px-2 py-1 border border-[#FFE8A3]/60 flex-shrink-0">
            <span className="text-lg leading-none">{currentModel.emoji}</span>
            <span className="text-[#FF85A1] font-black text-[10px] uppercase tracking-wide">{currentModel.name}</span>
          </div>
        </div>

        {/* Right Side: Crayon Color Selection */}
        <div className="flex items-center gap-1.5">
          {['#FF85A1', '#ec4899', '#4CC9F0', '#20BFA9', '#c084fc'].map((col) => (
            <button
              key={col}
              onClick={() => { playTapSound(); setBrushColor(col); }}
              style={{ backgroundColor: col }}
              className={`w-6 h-6 rounded-full border cursor-pointer transition-all hover:scale-110 active:scale-90 flex-shrink-0 ${
                brushColor === col 
                  ? 'border-white ring-2 ring-[#FF85A1] scale-110 shadow-sm' 
                  : 'border-slate-100 shadow-sm opacity-85'
              }`}
            />
          ))}
        </div>
      </div>
 
      {/* Main Tracing Drawing Container */}
      <div 
        ref={containerRef}
        id="tracing-viewport"
        className="w-full max-w-sm h-[32dvh] min-h-[240px] max-h-[300px] md:h-[400px] md:max-h-none border-4 border-[#FFE8A3] border-b-[8px] md:border-b-[12px] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl relative mb-4 overflow-hidden flex items-center justify-center cursor-crosshair flex-shrink-0 touch-none"
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
                  transform: 'translate(-50%, -50%)',
                }}
                className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-black border-2 shadow-md transition-all duration-300 z-30 pointer-events-none ${
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
          <span>{poolType === 'letters' ? 'Huruf Lain' : 'Angka Lain'}</span>
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
              <p className="text-gray-500 font-extrabold text-xs mt-1 mb-5 leading-normal relative z-10 leading-relaxed font-black">
                Kamu pandai menulis {poolType === 'letters' ? 'huruf' : 'angka'} <span className="text-[#FF85A1] text-lg font-black">{currentModel.letter}</span>!<br />Hebat sekali! ✍️
              </p>

              <div className="w-full space-y-3.5 relative z-10">
                <button
                  id="btn-tracing-retry-letter"
                  onClick={() => {
                    playTapSound();
                    clearCanvas();
                  }}
                  className="w-full bg-[#FF85A1] hover:bg-[#e06c87] text-white font-black text-lg p-3.5 rounded-2xl border-b-4 border-[#e06c87] shadow-lg hover:border-b-2 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Main Lagi ✍️</span>
                </button>

                <button
                  id="btn-tracing-next-letter"
                  onClick={handleNextModel}
                  className="w-full bg-[#20BFA9] hover:bg-[#189E8B] text-white font-black text-lg p-3.5 rounded-2xl border-b-4 border-[#189E8B] shadow-lg hover:border-b-2 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{poolType === 'letters' ? 'Ganti Huruf 🚀' : 'Ganti Angka 🚀'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
