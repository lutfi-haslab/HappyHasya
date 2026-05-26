import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playTapSound, playSuccessSound, speakIndonesian } from '../utils/audio';
import { ActivityLog, ChildProfile } from '../types';
import { KeyRound, CheckCircle2, RotateCcw, Award, Clock, Hash, LetterText, User } from 'lucide-react';

interface ParentDashboardProps {
  activityLog: ActivityLog;
  onResetLogs: () => void;
  profile: ChildProfile;
  onEditProfileTrigger: () => void;
}

export default function ParentDashboard({ activityLog, onResetLogs, profile, onEditProfileTrigger }: ParentDashboardProps) {
  // Parental control math block
  const [isLocked, setIsLocked] = useState(true);
  const [numA, setNumA] = useState(0);
  const [numB, setNumB] = useState(0);
  const [parentInput, setParentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const generateParentQuestion = () => {
    setNumA(Math.floor(Math.random() * 8) + 6); // 6 to 13
    setNumB(Math.floor(Math.random() * 7) + 3);  // 3 to 9
    setParentInput('');
    setErrorMessage('');
  };

  useEffect(() => {
    generateParentQuestion();
  }, []);

  const handleUnlockCheck = () => {
    playTapSound();
    const correctAnswer = numA + numB;
    if (parseInt(parentInput) === correctAnswer) {
      playSuccessSound();
      setIsLocked(false);
      speakIndonesian("Pintu orang tua terbuka!");
    } else {
      setErrorMessage('Jawaban salah. Coba hitung lagi!');
      setParentInput('');
      speakIndonesian("Maaf, salah.");
    }
  };

  const handleTriggerReset = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua kemajuan anak?')) {
      playTapSound();
      onResetLogs();
      setIsLocked(true);
      generateParentQuestion();
    }
  };

  // Extract letter stats list sorted by frequency
  const sortedLetterTaps = Object.entries(activityLog.letterTaps)
    .map(([letter, count]) => ({ letter, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div id="parent-dashboard-section" className="w-full max-w-4xl mx-auto px-4 py-4 select-none flex flex-col items-center">
      <AnimatePresence mode="wait">
        {isLocked ? (
          // MATHEMATICAL PARENTAL GATE
          <motion.div
            key="gate"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white border-4 border-[#FFE8A3] border-b-[12px] rounded-[2.5rem] shadow-2xl p-6 md:p-8 flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 bg-[#FFF0F3] rounded-2xl flex items-center justify-center text-[#FF85A1] mb-5 border border-[#FFE8A3] shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-[#4A4A4A]">Khusus Orang Tua</h3>
            <p className="text-gray-500 font-bold text-sm mt-1.5 leading-relaxed">
              Silakan jawab soal matematika di bawah ini untuk membuktikan Anda adalah pendamping dewasa:
            </p>

            <div className="my-6 bg-[#FEF9F0] border-2 border-[#FFE8A3] px-6 py-4 rounded-2xl">
              <span className="text-3xl font-black text-slate-700 tracking-wider">
                {numA} + {numB} = ?
              </span>
            </div>

            <input
              id="parental-gate-input"
              type="number"
              placeholder="Masukkan jawaban..."
              value={parentInput}
              onChange={(e) => setParentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockCheck(); }}
              className="w-full border-4 border-slate-200 rounded-2xl p-4 text-center text-2xl font-black text-gray-800 focus:outline-none focus:border-[#FF85A1] focus:ring-4 focus:ring-[#FFF0F3] transition-all mb-4"
            />

            {errorMessage && (
              <p className="text-rose-500 font-extrabold text-sm mb-4 animate-shake">
                {errorMessage}
              </p>
            )}

            <button
              id="btn-parent-gate-submit"
              onClick={handleUnlockCheck}
              className="w-full bg-[#FF85A1] hover:bg-[#e06c87] text-white font-black text-lg p-4 rounded-2xl border-4 border-b-8 border-[#e06c87] active:border-b-4 hover:scale-102 transition-all cursor-pointer shadow-md"
            >
              Masuk Dashboard
            </button>
          </motion.div>
        ) : (
          // PARENT PROGRESS PORTAL
          <motion.div
            key="dashboard"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full flex flex-col items-center"
          >
            {/* Header section with lock-back action */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl mb-6 gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-3xl font-black text-[#4A4A4A] tracking-tight">Laporan Belajar Anak</h3>
                <p className="text-[#FF85A1] font-bold text-sm mt-1">
                  Melihat aktivitas eksplorasi HappyHasya si kecil
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  id="btn-lock-dashboard"
                  onClick={() => { playTapSound(); setIsLocked(true); generateParentQuestion(); }}
                  className="bg-white hover:bg-slate-50 text-gray-500 font-black px-4.5 py-2.5 rounded-2xl text-sm border-2 border-gray-200 cursor-pointer shadow-sm active:translate-y-0.5"
                >
                  Kunci Kembali
                </button>

                <button
                  id="btn-reset-data-progress"
                  onClick={handleTriggerReset}
                  className="bg-white hover:bg-[#FFF0F3] text-[#FF85A1] font-black px-4.5 py-2.5 rounded-2xl text-sm border-2 border-[#FFE8A3] flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-0.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Hapus Kemajuan</span>
                </button>
              </div>
            </div>

            {/* CHILD PROFILE PERSISTANCE CARD */}
            <div className="w-full max-w-3xl bg-[#FEF9F0] border-4 border-[#FFE8A3] border-b-8 p-5 rounded-[2rem] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 text-left">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl border border-[#FFE8A3] shadow-inner flex-shrink-0">
                  {profile.gender === 'Perempuan' ? '👧' : profile.gender === 'Laki-laki' ? '👦' : '👶'}
                </div>
                <div>
                  <span className="text-xs font-black text-gray-400 block uppercase tracking-wider">Profil Identitas Siswa</span>
                  <p className="text-xl font-black text-[#4A4A4A] flex items-center gap-2 flex-wrap">
                    <span>{profile.name || 'Belum diisi'}</span>
                    <span className="text-sm font-bold text-gray-400">
                      ({profile.gender ? `${profile.gender}, ` : ''}{profile.age ? `${profile.age} Tahun` : ''})
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  onEditProfileTrigger();
                }}
                className="bg-white hover:bg-slate-50 text-[#FF85A1] font-black px-5 py-2.5 rounded-2xl text-xs border-2 border-[#FFE8A3] cursor-pointer shadow-sm active:translate-y-0.5 whitespace-nowrap"
              >
                ✏️ Edit Profil Anak
              </button>
            </div>

            {/* HIGH-LEVEL STAT CARDS BENTO STYLE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl mb-8">
              {/* Card 1: Time Elapsed */}
              <div className="bg-white border-4 border-[#FFE8A3] border-b-8 p-5 rounded-[2rem] shadow-md flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFF0F3] rounded-[1.25rem] flex items-center justify-center text-[#FF85A1] shadow-inner">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-gray-400 block uppercase tracking-wider">Lama Bermain</span>
                  <span className="text-2xl font-black text-[#4A4A4A]">
                    ~{activityLog.playTimeMinutes} menit
                  </span>
                </div>
              </div>

              {/* Card 2: Number Game Performance */}
              <div className="bg-white border-4 border-[#FFE8A3] border-b-8 p-5 rounded-[2rem] shadow-md flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E0F7FA] rounded-[1.25rem] flex items-center justify-center text-[#4CC9F0] shadow-inner">
                  <Hash className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-gray-400 block uppercase tracking-wider">Jawaban Benar</span>
                  <span className="text-2xl font-black text-[#4A4A4A]">
                    {activityLog.countingAttempts.correct} kali
                  </span>
                </div>
              </div>

              {/* Card 3: Sticker Unlocked Total */}
              <div className="bg-white border-4 border-[#FFE8A3] border-b-8 p-5 rounded-[2rem] shadow-md flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FAF5FF] rounded-[1.25rem] flex items-center justify-center text-[#c084fc] shadow-inner">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black text-gray-400 block uppercase tracking-wider">Koleksi Stiker</span>
                  <span className="text-2xl font-black text-[#4A4A4A]">
                    {activityLog.stickersEarned.length} stiker
                  </span>
                </div>
              </div>
            </div>

            {/* DETAILED ACTIVITY CATEGORIES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              {/* ALPHABET ACTIVITY TRACKER */}
              <div className="bg-white border-4 border-[#FFE8A3] border-b-8 rounded-[2rem] p-6 shadow-md flex flex-col">
                <div className="flex items-center gap-2.5 mb-4">
                  <LetterText className="w-5 h-5 text-[#FF85A1]" />
                  <h4 className="font-black text-lg text-[#4A4A4A]">Huruf Sering Ditekan</h4>
                </div>

                {sortedLetterTaps.length === 0 ? (
                  <p className="text-gray-400 font-black text-sm py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    Anak Anda belum mulai mengetuk huruf alphabet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {sortedLetterTaps.map(({ letter, count }) => (
                      <div key={letter} className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-[#FFF0F3] font-black text-[#FF85A1] border border-[#FFE8A3] flex items-center justify-center">
                            {letter}
                          </span>
                          <span className="text-gray-600 font-extrabold text-sm">Huruf {letter}</span>
                        </div>
                        <span className="text-gray-700 font-black text-xs bg-[#FEF9F0] border border-[#FFE8A3] px-3 py-1.5 rounded-full">
                          {count} x ditekan
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TRACING & WRITING METRIC */}
              <div className="bg-white border-4 border-[#FFE8A3] border-b-8 rounded-[2rem] p-6 shadow-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#20BFA9]" />
                    <h4 className="font-black text-lg text-[#4A4A4A]">Menulis & Melukis</h4>
                  </div>

                  {activityLog.tracedLetters.length === 0 ? (
                    <p className="text-gray-400 font-black text-sm py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      Belum ada huruf yang berhasil ditulis.
                    </p>
                  ) : (
                    <div>
                      <p className="text-gray-500 font-extrabold text-sm mb-3">
                        Huruf yang sukses digambar sikecil:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activityLog.tracedLetters.map((char) => (
                          <span
                            key={char}
                            className="w-10 h-10 rounded-full bg-[#EBFDFA] border-2 border-[#72EFDD] font-black text-[#20BFA9] text-base flex items-center justify-center shadow-sm animate-pulse"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-[#E0F7FA]/75 rounded-2xl border border-sky-100 text-[#4CC9F0]">
                  <span className="font-black text-sm block mb-1">💡 Tip Pendampingan:</span>
                  <p className="text-xs font-extrabold leading-relaxed text-sky-700">
                    Ajak anak mengucapkan pengucapan huruf secara bergantian. Pendekatan interaktif ini menguatkan memori auditori jangka panjang sikecil!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
