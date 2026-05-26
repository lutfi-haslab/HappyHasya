export interface AlphabetItem {
  letter: string;
  word: string;
  emoji: string;
  phonetic: string;
  color: string;
}

export interface ActivityLog {
  letterTaps: Record<string, number>;
  countingAttempts: {
    total: number;
    correct: number;
  };
  tracedLetters: string[];
  playTimeMinutes: number;
  stickersEarned: string[];
  sessionStart: number;
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: 'hewan' | 'makanan' | 'benda' | 'fantasi';
  unlockedAt?: number;
  achievement?: string;
}

export interface ChildProfile {
  name: string;
  age: number;
  gender: 'Laki-laki' | 'Perempuan' | '';
}

