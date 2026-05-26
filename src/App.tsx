import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivityLog, ChildProfile } from './types';
import { playTapSound, speakIndonesian } from './utils/audio';
import AlphabetSection from './components/AlphabetSection';
import CountingSection from './components/CountingSection';
import TracingSection from './components/TracingSection';
import RewardSection from './components/RewardSection';
import ParentDashboard from './components/ParentDashboard';
import Mascot from './components/Mascot';
import { Sparkles, Award, Compass, Settings, User } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'happy_hasya_progress_v1';

const INITIAL_LOGS: ActivityLog = {
  letterTaps: {},
  countingAttempts: {
    total: 0,
    correct: 0
  },
  tracedLetters: [],
  playTimeMinutes: 0,
  stickersEarned: ['cat'], // Start with one free friendly cat sticker!
  sessionStart: Date.now()
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'alphabet' | 'counting' | 'tracing' | 'reward' | 'parent'>('home');
  const [logs, setLogs] = useState<ActivityLog>(INITIAL_LOGS);
  
  // Custom Persona Child Profile State
  const [profile, setProfile] = useState<ChildProfile>({
    name: '',
    age: 4,
    gender: ''
  });
  const [tempProfile, setTempProfile] = useState<ChildProfile>({
    name: '',
    age: 4,
    gender: ''
  });
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Load progress and profile on mounting
  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setLogs({
          ...parsed,
          sessionStart: Date.now()
        });
      } catch (err) {
        console.error('Failed to parse logs', err);
      }
    }

    const rawProfile = localStorage.getItem('happy_hasya_profile_v1');
    if (rawProfile) {
      try {
        const parsedProfile = JSON.parse(rawProfile);
        setProfile(parsedProfile);
        setTempProfile(parsedProfile);
      } catch (err) {
        console.error('Failed to parse profile', err);
      }
    } else {
      // First time user: trigger child-friendly startup onboarding!
      setShowProfileSetup(true);
    }
  }, []);

  // Listen for PWA Install Prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Safe background PWA update applicator: only reloads when user is on the Home screen (Beranda)
  useEffect(() => {
    const checkForUpdates = () => {
      if (activeTab === 'home' && localStorage.getItem('pwa-update-ready') === 'true') {
        console.log('[PWA] Applying pending update safely while on Home screen...');
        localStorage.removeItem('pwa-update-ready');
        window.location.reload();
      }
    };
    
    // Check immediately when tab changes
    checkForUpdates();
    
    // Also check periodically every 10 seconds
    const interval = setInterval(checkForUpdates, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    playTapSound();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA installer choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallModal(false);
  };

  // Save profile dynamically
  const saveProfile = (nextProfile: ChildProfile) => {
    setProfile(nextProfile);
    setTempProfile(nextProfile);
    localStorage.setItem('happy_hasya_profile_v1', JSON.stringify(nextProfile));
  };

  // Save progress dynamically on changes
  const saveLogs = (nextLogs: ActivityLog) => {
    setLogs(nextLogs);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextLogs));
  };

  // Tracker for Active Play Time
  useEffect(() => {
    const timeInterval = setInterval(() => {
      // Calculate delta minutes from start of session and update progress logs
      const deltaMs = Date.now() - logs.sessionStart;
      const minutesSpent = Math.max(0, Math.floor(deltaMs / 60000));
      
      if (minutesSpent > 0 && minutesSpent !== logs.playTimeMinutes) {
        saveLogs({
          ...logs,
          playTimeMinutes: (logs.playTimeMinutes || 0) + 1,
          sessionStart: Date.now() // reset counter anchor
        });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timeInterval);
  }, [logs]);

  // Central automatic sticker achievements checker (enforcing fully descriptive achievements criteria)
  useEffect(() => {
    const toAward: string[] = [];
    
    // 1. Dog: Selesaikan 1 game hitung
    if (logs.countingAttempts.correct >= 1) toAward.push('dog');
    // 2. Rabbit: Selesaikan 2 game hitung
    if (logs.countingAttempts.correct >= 2) toAward.push('rabbit');
    // 3. Lion: Selesaikan 3 game hitung
    if (logs.countingAttempts.correct >= 3) toAward.push('lion');
    // 4. Monkey: Selesaikan 4 game hitung
    if (logs.countingAttempts.correct >= 4) toAward.push('monkey');
    // 5. Panda: Selesaikan 5 game hitung
    if (logs.countingAttempts.correct >= 5) toAward.push('panda');
    
    // 6. Dino: Berhasil menulis 1 huruf
    if (logs.tracedLetters.length >= 1) toAward.push('dino');
    // 7. Unicorn: Berhasil menulis 2 huruf berbeda
    if (logs.tracedLetters.length >= 2) toAward.push('unicorn');
    
    // 8. Icecream: Ketuk 2 huruf
    const distinctTaps = Object.keys(logs.letterTaps).length;
    if (distinctTaps >= 2) toAward.push('icecream');
    // 9. Donut: Ketuk 5 huruf
    if (distinctTaps >= 5) toAward.push('donut');
    
    // 10. Pizza: Pecahkan gelembung balon / ketuk total taps >= 3
    const totalTaps = (Object.values(logs.letterTaps) as number[]).reduce((a, b) => a + b, 0);
    if (totalTaps >= 3) toAward.push('pizza');
    
    // 11. Strawberry: Let's award on completing at least 1 counting attempt or 1 trace attempt
    if (logs.tracedLetters.length >= 1 || logs.countingAttempts.correct >= 1) {
      toAward.push('strawberry');
    }
    // 12. Cupcake: rajin ganti tipe huruf (traced length >= 2 or counting attempts >= 2)
    if (logs.tracedLetters.length >= 2 || logs.countingAttempts.correct >= 2) {
      toAward.push('cupcake');
    }
    
    // 13. Car: visited parent report (tracked via route navigates)
    if (activeTab === 'parent') {
      toAward.push('car');
    }
    
    // 15. Rocket: Biodata complete
    if (profile.name && profile.gender) {
      toAward.push('rocket');
    }
    
    // 16. Ball: correct high value count
    if (logs.countingAttempts.correct >= 3) {
      toAward.push('ball');
    }
    
    // 17. Teddy: Play for 1 min
    if (logs.playTimeMinutes >= 1) toAward.push('teddy');
    // 18. Balloon: Play for 3 mins
    if (logs.playTimeMinutes >= 3) toAward.push('balloon');
    
    // 19. Star Gold: Try all features
    if (distinctTaps > 0 && logs.countingAttempts.correct > 0 && logs.tracedLetters.length > 0) {
      toAward.push('star_gold');
    }
    
    // 20. Magic Wand: Sapa Hasya 5 times (based on activity volume)
    if (totalTaps + logs.tracedLetters.length >= 5) {
      toAward.push('magic_wand');
    }
    
    // 21. Rainbow: Koleksi setidaknya 5 stiker lain
    const currentUniqueStickers = logs.stickersEarned.filter(id => id !== 'rainbow');
    if (currentUniqueStickers.length >= 5) {
      toAward.push('rainbow');
    }
    
    // 22. Bubble: Clean canvas (triggers on activity)
    if (logs.tracedLetters.length >= 1 || logs.countingAttempts.correct >= 1) {
      toAward.push('bubble');
    }
    
    // See if any of these are not yet in stickersEarned
    const newlyAwarded = toAward.filter(id => !logs.stickersEarned.includes(id));
    if (newlyAwarded.length > 0) {
      const nextStickers = [...logs.stickersEarned];
      newlyAwarded.forEach(id => {
        if (!nextStickers.includes(id)) {
          nextStickers.push(id);
        }
      });
      saveLogs({
        ...logs,
        stickersEarned: nextStickers
      });
    }
  }, [logs.countingAttempts.correct, logs.tracedLetters, logs.letterTaps, logs.playTimeMinutes, profile, activeTab]);

  // Log alphabetical interactions
  const handleLogLetter = (letter: string) => {
    const updatedTaps = { ...logs.letterTaps };
    updatedTaps[letter] = (updatedTaps[letter] || 0) + 1;
    saveLogs({
      ...logs,
      letterTaps: updatedTaps
    });
  };

  // Log numbers counting accomplishments
  const handleLogCounting = (isCorrect: boolean) => {
    const total = logs.countingAttempts.total + 1;
    const correct = isCorrect ? logs.countingAttempts.correct + 1 : logs.countingAttempts.correct;
    saveLogs({
      ...logs,
      countingAttempts: { total, correct }
    });
  };

  // Unlock / Grant a new Sticker Reward
  const handleGrantSticker = (stickerId: string) => {
    if (!logs.stickersEarned.includes(stickerId)) {
      saveLogs({
        ...logs,
        stickersEarned: [...logs.stickersEarned, stickerId]
      });
    }
  };

  // Log when writing/tracing path matches complete outline
  const handleLogTracing = (letter: string) => {
    if (!logs.tracedLetters.includes(letter)) {
      saveLogs({
        ...logs,
        tracedLetters: [...logs.tracedLetters, letter]
      });
    }
  };

  const handleResetLogs = () => {
    saveLogs({
      ...INITIAL_LOGS,
      sessionStart: Date.now()
    });
    setActiveTab('home');
    speakIndonesian("Semua kemajuan telah dimulai dari awal!");
  };

  const handleNavigate = (tab: typeof activeTab, promptMsg?: string) => {
    playTapSound();
    setActiveTab(tab);
    if (promptMsg) {
      speakIndonesian(promptMsg);
    }
  };

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'alphabet':
        return <AlphabetSection onLogLetter={handleLogLetter} />;
      case 'counting':
        return (
          <CountingSection
            onLogCounting={handleLogCounting}
            onGrantSticker={handleGrantSticker}
            unlockedStickers={logs.stickersEarned}
          />
        );
      case 'tracing':
        return <TracingSection onLogTracing={handleLogTracing} />;
      case 'reward':
        return <RewardSection unlockedStickersIds={logs.stickersEarned} />;
      case 'parent':
        return (
          <ParentDashboard 
            activityLog={logs} 
            onResetLogs={handleResetLogs} 
            profile={profile}
            onEditProfileTrigger={() => { playTapSound(); setShowProfileSetup(true); }}
          />
        );
      default:
        return (
          // HOME PLAY SCREEN
          <div className="flex flex-col items-center px-4 w-full max-w-5xl mx-auto">
            <Mascot 
              message={profile.name 
                ? `Halo ${profile.name}! 🌻 Aku Hasya. Usiamu ${profile.age} tahun, ya? Hebat sekali! Yuk, pilih permainan seru di bawah ini! 👇`
                : "Halo teman kecil! 🌻 Aku Hasya. Yuk, pilih permainan seru di bawah ini! 👇"
              } 
              mood="happy" 
              speakOnMount={true} 
            />

            {/* Selection Grid for Modules */}
            {/* Selection Grid for Modules */}
            <div id="homescreen-modules-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-6">
              
              {/* Option 1: Alphabet Letters */}
              <motion.button
                id="btn-nav-alphabet"
                onClick={() => handleNavigate('alphabet', 'Ayo belajar memanggil huruf!')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-[2rem] p-2 shadow-lg border-b-[8px] border-[#FF85A1] cursor-pointer text-center relative group w-full transition-all"
              >
                <div className="bg-[#FFF0F3] rounded-[1.5rem] flex flex-col items-center justify-center py-4 px-2 h-full">
                  <div className="w-12 h-12 bg-[#FF85A1] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-inner mb-2">
                    A
                  </div>
                  <h3 className="text-lg font-black text-[#4A4A4A] mb-0.5">Huruf</h3>
                  <p className="text-[#FF85A1] font-bold text-[10px]">Mengenal A - Z</p>
                </div>
              </motion.button>
 
              {/* Option 2: Counting Game */}
              <motion.button
                id="btn-nav-counting"
                onClick={() => handleNavigate('counting', 'Mari berhitung bersama-sama!')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-[2rem] p-2 shadow-lg border-b-[8px] border-[#4CC9F0] cursor-pointer text-center relative group w-full transition-all"
              >
                <div className="bg-[#E0F7FA] rounded-[1.5rem] flex flex-col items-center justify-center py-4 px-2 h-full">
                  <div className="w-12 h-12 bg-[#4CC9F0] rounded-full flex items-center justify-center text-white text-3xl font-black shadow-inner mb-2">
                    3
                  </div>
                  <h3 className="text-lg font-black text-[#4A4A4A] mb-0.5">Angka</h3>
                  <p className="text-[#4CC9F0] font-bold text-[10px]">Menghitung Seru</p>
                </div>
              </motion.button>
 
              {/* Option 3: Character Tracing */}
              <motion.button
                id="btn-nav-tracing"
                onClick={() => handleNavigate('tracing', 'Waktunya melukis garis huruf!')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-[2rem] p-2 shadow-lg border-b-[8px] border-[#72EFDD] cursor-pointer text-center relative group w-full transition-all"
              >
                <div className="bg-[#EBFDFA] rounded-[1.5rem] flex flex-col items-center justify-center py-4 px-2 h-full">
                  <div className="w-12 h-12 bg-[#20BFA9] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner mb-2">
                    ✍️
                  </div>
                  <h3 className="text-lg font-black text-[#4A4A4A] mb-0.5">Menulis</h3>
                  <p className="text-[#20BFA9] font-bold text-[10px]">Belajar Melukis</p>
                </div>
              </motion.button>
 
              {/* Option 4: Stickers Reward album */}
              <motion.button
                id="btn-nav-rewards"
                onClick={() => handleNavigate('reward', 'Ayo lihat koleksi stiker indahmu!')}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white rounded-[2rem] p-2 shadow-lg border-b-[8px] border-[#c084fc] cursor-pointer text-center relative group w-full transition-all"
              >
                <div className="bg-[#FAF5FF] rounded-[1.5rem] flex flex-col items-center justify-center py-4 px-2 h-full">
                  <div className="w-12 h-12 bg-[#c084fc] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner mb-2">
                    🏆
                  </div>
                  <h3 className="text-lg font-black text-[#4A4A4A] mb-0.5">Stiker</h3>
                  <p className="text-[#c084fc] font-bold text-[10px]">Laci Papan Bermain</p>
                </div>
              </motion.button>

            </div>

            {/* Tiny credits section */}
            <p className="text-[10px] text-gray-400 font-extrabold uppercase mt-12 tracking-widest text-center">
              Dibuat penuh kasih sayang untuk anak usia 3 sampai 5 tahun ❤️
            </p>
          </div>
        );
    }
  };

  return (
    <div id="applet-root" className="h-[100dvh] bg-[#FEF9F0] flex flex-col justify-between font-sans text-gray-800 antialiased overflow-hidden select-none">
      
      {/* BRAND HEADER BAR */}
      <header className="bg-[#FEF9F0] border-b-4 border-[#FFE8A3] pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 px-4 md:px-8 relative z-50 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Name */}
          <button
            id="brand-logo-trigger"
            onClick={() => handleNavigate('home', 'Kembali ke rumah ceria!')}
            className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 bg-[#FF85A1] rounded-xl flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-6 transition-transform duration-200">
              <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black tracking-tight leading-none text-[#4A4A4A]">
                HappyHasya
              </h1>
              <span className="text-[9px] font-bold text-[#FF85A1] uppercase tracking-wider block mt-0.5">
                Ayo Main!
              </span>
            </div>
          </button>
 
          {/* Nav Links */}
          <div className="flex items-center gap-1.5">
            {/* PWA Manual Install Button Trigger */}
            {deferredPrompt && (
              <button
                id="btn-header-pwa-install"
                onClick={() => { playTapSound(); setShowInstallModal(true); }}
                className="bg-[#FF85A1] text-white hover:bg-[#e06c87] font-black text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border-2 border-[#e06c87] shadow-sm active:translate-y-0.5 flex items-center gap-1"
                title="Pasang Aplikasi"
              >
                <span>📥</span>
                <span className="font-black">Pasang App</span>
              </button>
            )}

            {/* Student Profile Identity Indicator Badge */}
            <button
              id="btn-header-profile-setup"
              onClick={() => { playTapSound(); setShowProfileSetup(true); }}
              className="bg-white text-gray-700 hover:bg-[#FFF0F3] hover:text-[#FF85A1] font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 border-2 border-[#FFE8A3] shadow-sm active:translate-y-0.5"
              title="Edit Profil Anak"
            >
              <span className="text-xs select-none leading-none">
                {profile.gender === 'Perempuan' ? '👧' : profile.gender === 'Laki-laki' ? '👦' : '👶'}
              </span>
              <span className="max-w-[55px] truncate inline-block font-black">
                {profile.name || 'Profil'}
              </span>
            </button>
 
            {activeTab !== 'home' ? (
              <button
                id="btn-header-home"
                onClick={() => handleNavigate('home', 'Kembali ke halaman utama!')}
                className="bg-white hover:bg-[#FFF0F3] text-[#FF85A1] font-black text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer border-2 border-[#FFE8A3] shadow-sm active:translate-y-0.5"
              >
                🏠 Beranda
              </button>
            ) : null}
 
            {/* Parent Section Trigger */}
            <button
              id="btn-header-parent-lock"
              onClick={() => handleNavigate('parent', 'Halaman orang tua diaktifkan.')}
              className={`font-extrabold text-[10px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 border-2 ${activeTab === 'parent' ? 'bg-[#4A4A4A] text-white border-[#4A4A4A]' : 'bg-white text-gray-500 hover:bg-gray-100 border-[#FFE8A3] shadow-sm'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden xs:inline font-black">Orang Tua</span>
            </button>
          </div>
        </div>
      </header>
 
      {/* PRIMARY ACTIVE INTERACTIVE PLAYGROUND VIEW */}
      <main className="flex-1 w-full overflow-y-auto py-3 px-3 md:py-6 md:px-6 flex flex-col items-center min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`w-full min-h-full flex flex-col items-center ${
              activeTab === 'tracing' 
                ? 'justify-center my-auto' 
                : 'justify-start py-2'
            }`}
          >
            {renderActiveSection()}
          </motion.div>
        </AnimatePresence>
      </main>
 
      {/* TIDY COMPACT FOOTER NAVIGATION FOR TODDLERS */}
      <footer className="bg-[#FEF9F0] border-t-4 border-[#FFE8A3] shadow-lg pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] px-3 sticky bottom-0 z-40 select-none flex-shrink-0">
        <div id="footer-navigation-tray" className="max-w-md mx-auto flex justify-around items-center gap-2 bg-white/90 p-1.5 rounded-[2rem] border-2 border-[#FFE8A3] shadow-inner">
          
          <button
            id="footer-btn-alphabet"
            onClick={() => handleNavigate('alphabet', 'Mari belajar memanggil huruf!')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all cursor-pointer ${activeTab === 'alphabet' ? 'text-white font-black scale-105 shadow-md' : 'text-gray-500 hover:text-[#FF85A1]'}`}
            style={activeTab === 'alphabet' ? { backgroundColor: '#FF85A1' } : {}}
          >
            <span className="text-2xl mt-0.5 leading-none">🔤</span>
            <span className="text-[10px] font-black mt-1 leading-none uppercase tracking-wide">Huruf</span>
          </button>

          <button
            id="footer-btn-counting"
            onClick={() => handleNavigate('counting', 'Mari berhitung bersama!')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all cursor-pointer ${activeTab === 'counting' ? 'text-white font-black scale-105 shadow-md' : 'text-gray-500 hover:text-[#4CC9F0]'}`}
            style={activeTab === 'counting' ? { backgroundColor: '#4CC9F0' } : {}}
          >
            <span className="text-2xl mt-0.5 leading-none">🍎</span>
            <span className="text-[10px] font-black mt-1 leading-none uppercase tracking-wide">Hitung</span>
          </button>

          <button
            id="footer-btn-tracing"
            onClick={() => handleNavigate('tracing', 'Waktunya melukis garis huruf!')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all cursor-pointer ${activeTab === 'tracing' ? 'text-white font-black scale-105 shadow-md' : 'text-gray-500 hover:text-[#20BFA9]'}`}
            style={activeTab === 'tracing' ? { backgroundColor: '#20BFA9' } : {}}
          >
            <span className="text-2xl mt-0.5 leading-none">🎨</span>
            <span className="text-[10px] font-black mt-1 leading-none uppercase tracking-wide">Tulis</span>
          </button>

          <button
            id="footer-btn-reward"
            onClick={() => handleNavigate('reward', 'Ayo lihat koleksi stiker indahmu!')}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all cursor-pointer ${activeTab === 'reward' ? 'text-white font-black scale-105 shadow-md' : 'text-gray-500 hover:text-[#c084fc]'}`}
            style={activeTab === 'reward' ? { backgroundColor: '#c084fc' } : {}}
          >
            <span className="text-2xl mt-0.5 leading-none">🏆</span>
            <span className="text-[10px] font-black mt-1 leading-none uppercase tracking-wide">Stiker</span>
          </button>

        </div>
      </footer>

      {/* PROFILE SETUP MODAL OVERLAY */}
      <AnimatePresence>
        {showProfileSetup && (
          <div id="profile-setup-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] border-4 border-[#FFE8A3] border-b-[12px] p-6 md:p-8 w-full max-w-sm shadow-2xl relative text-center"
            >
              {/* Profile setup header */}
              <div className="w-16 h-16 bg-[#FF85A1] rounded-2xl flex items-center justify-center text-white text-3xl mx-auto shadow-md mb-4 transform -rotate-3">
                👦
              </div>
              <h3 className="text-2xl font-black text-[#4A4A4A] tracking-tight">
                Profil Identitas Anak
              </h3>
              <p className="text-gray-500 font-bold text-xs mt-1 mb-6">
                Lengkapi identitas siswa agar Hasya bisa menyapamu! 🌟
              </p>

              {/* Form Input fields */}
              <div className="space-y-4 text-left">
                {/* Name */}
                <div>
                  <label className="block text-gray-600 font-black text-[10px] mb-1.5 uppercase tracking-wider">
                    Nama Panggilan Anak:
                  </label>
                  <input
                    type="text"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value.slice(0, 16) })}
                    placeholder="Mulan, Luthfi, Albi, dll."
                    className="w-full bg-[#FEF9F0] border-2 border-[#FFE8A3] rounded-2xl px-4 py-2.5 font-black text-gray-750 text-base focus:outline-none focus:ring-4 focus:ring-[#FF85A1]/20 focus:border-[#FF85A1] transition-all"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-gray-600 font-black text-[10px] mb-1.5 uppercase tracking-wider">
                    Usia Anak (Tahun):
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[2, 3, 4, 5].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => { playTapSound(); setTempProfile({ ...tempProfile, age }); }}
                        className={`py-2 px-3 rounded-xl font-black text-base border-2 transition-all cursor-pointer text-center ${
                          tempProfile.age === age
                            ? 'bg-[#FF85A1] border-[#FF85A1] text-white shadow-md scale-105'
                            : 'bg-[#FEF9F0] border-[#FFE8A3] text-gray-600 hover:border-[#FF85A1]/40'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-gray-600 font-black text-[10px] mb-1.5 uppercase tracking-wider">
                    Jenis Kelamin:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => { playTapSound(); setTempProfile({ ...tempProfile, gender: 'Laki-laki' }); }}
                      className={`py-2.5 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        tempProfile.gender === 'Laki-laki'
                          ? 'bg-sky-400 border-sky-450 text-white shadow-md scale-102'
                          : 'bg-[#FEF9F0] border-[#FFE8A3] text-gray-600 hover:border-sky-300'
                      }`}
                    >
                      <span className="text-lg">👦</span>
                      <span>Laki-laki</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { playTapSound(); setTempProfile({ ...tempProfile, gender: 'Perempuan' }); }}
                      className={`py-2.5 px-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        tempProfile.gender === 'Perempuan'
                          ? 'bg-pink-400 border-pink-450 text-white shadow-md scale-102'
                          : 'bg-[#FEF9F0] border-[#FFE8A3] text-gray-600 hover:border-pink-300'
                      }`}
                    >
                      <span className="text-lg">👧</span>
                      <span>Perempuan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Save button */}
              <div className="mt-6 flex gap-2">
                {profile.name && (
                  <button
                    onClick={() => { playTapSound(); setTempProfile(profile); setShowProfileSetup(false); }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-extrabold text-sm py-3 rounded-xl cursor-pointer active:scale-95 transition-all text-center"
                  >
                    Batal
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!tempProfile.name.trim()) {
                      speakIndonesian("Ketik namamu dulu ya teman kecil!");
                      return;
                    }
                    playTapSound();
                    saveProfile(tempProfile);
                    setShowProfileSetup(false);
                    speakIndonesian(`Halo ${tempProfile.name}! Hasya siap menemanimu bermain belajar ceria! 🎉`);
                  }}
                  className="flex-1 bg-[#20BFA9] hover:bg-[#189E8B] text-white font-black text-sm py-3 rounded-xl border-b-4 border-[#189E8B] shadow-lg hover:border-b-2 cursor-pointer active:scale-95 transition-all text-center"
                >
                  Simpan 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA INSTALL POPUP MODAL */}
      <AnimatePresence>
        {showInstallModal && deferredPrompt && (
          <div id="pwa-install-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] border-4 border-[#FFE8A3] border-b-[12px] p-6 w-full max-w-sm shadow-2xl relative text-center flex flex-col items-center"
            >
              {/* Cute App Icon visual */}
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-white mx-auto shadow-md mb-4 border-2 border-[#FFE8A3] overflow-hidden">
                <img 
                  src="/icon-192.png" 
                  alt="HappyHasya Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-black text-[#4A4A4A] tracking-tight">
                Pasang HappyHasya! 📱
              </h3>
              <p className="text-gray-500 font-bold text-xs mt-2 mb-6 leading-relaxed px-2">
                Yuk pasang aplikasi di layar utama HP atau Tablet agar bisa langsung bermain bersama Hasya kapan saja! 🚀
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 w-full">
                <button
                  id="btn-pwa-install-cancel"
                  onClick={() => { playTapSound(); setShowInstallModal(false); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-sm py-3 rounded-xl cursor-pointer active:scale-95 transition-all text-center"
                >
                  Nanti Saja
                </button>
                <button
                  id="btn-pwa-install-confirm"
                  onClick={handleInstallApp}
                  className="flex-1 bg-[#FF85A1] hover:bg-[#e06c87] text-white font-black text-sm py-3 rounded-xl border-b-4 border-[#e06c87] shadow-lg hover:border-b-2 cursor-pointer active:scale-95 transition-all text-center"
                >
                  Pasang!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
