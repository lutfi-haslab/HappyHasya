import { AlphabetItem, Sticker } from './types';

export const ALPHABET_DATA: AlphabetItem[] = [
  { letter: 'A', word: 'Apel', emoji: '🍎', phonetic: 'Aaa... untuk Apel!', color: 'from-red-400 to-rose-500 text-red-500 shadow-red-200' },
  { letter: 'B', word: 'Bebek', emoji: '🦆', phonetic: 'Bee... untuk Bebek!', color: 'from-orange-400 to-amber-500 text-orange-500 shadow-orange-200' },
  { letter: 'C', word: 'Ceri', emoji: '🍒', phonetic: 'Cee... untuk Ceri!', color: 'from-pink-400 to-rose-600 text-pink-500 shadow-pink-200' },
  { letter: 'D', word: 'Domba', emoji: '🐑', phonetic: 'Dee... untuk Domba!', color: 'from-green-400 to-teal-500 text-green-500 shadow-green-200' },
  { letter: 'E', word: 'Es Krim', emoji: '🍦', phonetic: 'Eee... untuk Es Krim!', color: 'from-blue-400 to-indigo-500 text-blue-500 shadow-blue-200' },
  { letter: 'F', word: 'Foto', emoji: '📷', phonetic: 'Eff... untuk Foto!', color: 'from-cyan-400 to-blue-500 text-cyan-600 shadow-cyan-200' },
  { letter: 'G', word: 'Gajah', emoji: '🐘', phonetic: 'Gee... untuk Gajah!', color: 'from-purple-400 to-fuchsia-500 text-purple-500 shadow-purple-200' },
  { letter: 'H', word: 'Harimau', emoji: '🐯', phonetic: 'Haa... untuk Harimau!', color: 'from-orange-500 to-red-500 text-orange-600 shadow-orange-200' },
  { letter: 'I', word: 'Ikan', emoji: '🐟', phonetic: 'Iii... untuk Ikan!', color: 'from-sky-400 to-blue-500 text-sky-500 shadow-sky-200' },
  { letter: 'J', word: 'Jeruk', emoji: '🍊', phonetic: 'Jee... untuk Jeruk!', color: 'from-amber-400 to-orange-500 text-amber-500 shadow-amber-200' },
  { letter: 'K', word: 'Kucing', emoji: '🐱', phonetic: 'Kaa... untuk Kucing!', color: 'from-yellow-400 to-amber-500 text-yellow-600 shadow-yellow-200' },
  { letter: 'L', word: 'Lebah', emoji: '🐝', phonetic: 'Ell... untuk Lebah!', color: 'from-yellow-300 to-yellow-500 text-yellow-500 shadow-yellow-100' },
  { letter: 'M', word: 'Monyet', emoji: '🐒', phonetic: 'Emm... untuk Monyet!', color: 'from-emerald-400 to-green-600 text-emerald-600 shadow-emerald-200' },
  { letter: 'N', word: 'Nanas', emoji: '🍍', phonetic: 'Enn... untuk Nanas!', color: 'from-orange-300 to-yellow-500 text-yellow-500 shadow-yellow-100' },
  { letter: 'O', word: 'Onta', emoji: '🐫', phonetic: 'Ooo... untuk Onta!', color: 'from-orange-400 to-amber-600 text-orange-600 shadow-orange-200' },
  { letter: 'P', word: 'Pisang', emoji: '🍌', phonetic: 'Pee... untuk Pisang!', color: 'from-yellow-400 to-orange-400 text-yellow-500 shadow-yellow-200' },
  { letter: 'Q', word: 'Quran', emoji: '📖', phonetic: 'Kiu... untuk Quran!', color: 'from-teal-400 to-emerald-500 text-teal-500 shadow-teal-200' },
  { letter: 'R', word: 'Roti', emoji: '🍞', phonetic: 'Err... untuk Roti!', color: 'from-amber-600 to-yellow-700 text-amber-700 shadow-amber-300' },
  { letter: 'S', word: 'Singa', emoji: '🦁', phonetic: 'Ess... untuk Singa!', color: 'from-orange-400 to-red-600 text-orange-500 shadow-orange-200' },
  { letter: 'T', word: 'Telur', emoji: '🥚', phonetic: 'Tee... untuk Telur!', color: 'from-zinc-300 to-zinc-400 text-zinc-500 shadow-zinc-200' },
  { letter: 'U', word: 'Ulat', emoji: '🐛', phonetic: 'Uuu... untuk Ulat!', color: 'from-lime-400 to-emerald-500 text-lime-600 shadow-lime-200' },
  { letter: 'V', word: 'Vas', emoji: '🏺', phonetic: 'Vee... untuk Vas!', color: 'from-indigo-400 to-purple-500 text-indigo-500 shadow-indigo-200' },
  { letter: 'W', word: 'Wortel', emoji: '🥕', phonetic: 'Wee... untuk Wortel!', color: 'from-orange-500 to-rose-500 text-orange-500 shadow-orange-200' },
  { letter: 'X', word: 'Xilofon', emoji: '🎹', phonetic: 'Eks... untuk Xilofon!', color: 'from-violet-400 to-indigo-500 text-violet-500 shadow-violet-200' },
  { letter: 'Y', word: 'Yoyo', emoji: '🪀', phonetic: 'Yee... untuk Yoyo!', color: 'from-emerald-400 to-lime-500 text-emerald-500 shadow-emerald-200' },
  { letter: 'Z', word: 'Zebra', emoji: '🦓', phonetic: 'Zet... untuk Zebra!', color: 'from-slate-600 to-zinc-800 text-slate-700 shadow-slate-300' },
];

export const STICKERS_DATA: Sticker[] = [
  { id: 'cat', name: 'Kucing Imut', emoji: '🐱', category: 'hewan', achievement: 'Hadiah selamat datang ceria!' },
  { id: 'dog', name: 'Gukguk Lucu', emoji: '🐶', category: 'hewan', achievement: 'Selesaikan 1 game hitung angka!' },
  { id: 'rabbit', name: 'Kelinci Gemas', emoji: '🐰', category: 'hewan', achievement: 'Selesaikan 2 game hitung angka!' },
  { id: 'lion', name: 'Singa Berani', emoji: '🦁', category: 'hewan', achievement: 'Selesaikan 3 game hitung angka!' },
  { id: 'monkey', name: 'Monyet Ceria', emoji: '🐒', category: 'hewan', achievement: 'Selesaikan 4 game hitung angka!' },
  { id: 'panda', name: 'Panda Gembul', emoji: '🐼', category: 'hewan', achievement: 'Selesaikan 5 game hitung angka!' },
  { id: 'dino', name: 'Dino Hijau', emoji: '🦖', category: 'hewan', achievement: 'Berhasil menulis huruf pertamamu!' },
  { id: 'unicorn', name: 'Kuda Terbang', emoji: '🦄', category: 'fantasi', achievement: 'Berhasil menulis 2 huruf berbeda!' },
  
  { id: 'icecream', name: 'Es Krim Manis', emoji: '🍦', category: 'makanan', achievement: 'Ketuk 2 huruf di papan huruf!' },
  { id: 'donut', name: 'Donat Cokelat', emoji: '🍩', category: 'makanan', achievement: 'Ketuk 5 huruf di papan huruf!' },
  { id: 'pizza', name: 'Pizza Lezat', emoji: '🍕', category: 'makanan', achievement: 'Pecahkan gelembung balon di papan huruf!' },
  { id: 'strawberry', name: 'Stroberi Segar', emoji: '🍓', category: 'makanan', achievement: 'Ganti krayon warna ditiap menggambar!' },
  { id: 'cupcake', name: 'Kue Cupcake', emoji: '🧁', category: 'makanan', achievement: 'Lebih rajin ganti tipe huruf tulis!' },
  
  { id: 'car', name: 'Mobil Merah', emoji: '🚗', category: 'benda', achievement: 'Kunjungi laporan Dashboard Orang Tua!' },
  { id: 'rocket', name: 'Roket Angkasa', emoji: '🚀', category: 'benda', achievement: 'Lengkapi biodata profil identitas si kecil!' },
  { id: 'ball', name: 'Bola Warna-warni', emoji: '⚽', category: 'benda', achievement: 'Menghitung objek tinggi bernilai 5+!' },
  { id: 'teddy', name: 'Boneka Beruang', emoji: '🧸', category: 'benda', achievement: 'Bermain seru selama 1 menit!' },
  { id: 'balloon', name: 'Balon Terbang', emoji: '🎈', category: 'benda', achievement: 'Bermain seru selama 3 menit!' },
  
  { id: 'star_gold', name: 'Bintang Emas', emoji: '⭐', category: 'fantasi', achievement: 'Coba semua tab menu belajar!' },
  { id: 'magic_wand', name: 'Tongkat Sihir', emoji: '🪄', category: 'fantasi', achievement: 'Sapa Hasya maskot sebanyak 5 kali!' },
  { id: 'rainbow', name: 'Pelangi Indah', emoji: '🌈', category: 'fantasi', achievement: 'Koleksi setidaknya 5 stiker lain!' },
  { id: 'bubble', name: 'Gelembung Sabun', emoji: '🫧', category: 'fantasi', achievement: 'Lakukan pembersihan papan corat-coret!' },
];

export const MINI_GAME_STICKER_THEMES: Record<string, { name: string; emoji: string; stickers: string[] }> = {
  dinosaurus: { name: 'Dinosaurus', emoji: '🦖', stickers: ['🦖', '🦕', '🦴', '🌿', '🥚', '☄️', '🌋', '🦎'] },
  kendaraan: { name: 'Kendaraan', emoji: '🚗', stickers: ['🚗', '🚀', '✈️', '🚂', '🚁', '🚢', '🚌', '🛸'] },
  hewan: { name: 'Hewan', emoji: '🐱', stickers: ['🐱', '🐶', '🐰', '🦁', '🐼', '🦄', '🐸', '🦋'] },
  luar_angkasa: { name: 'Luar Angkasa', emoji: '🌟', stickers: ['🌟', '🌙', '🪐', '🛸', '👨‍🚀', '🔭', '☄️', '🚀'] },
  makanan: { name: 'Makanan Lucu', emoji: '🍕', stickers: ['🍕', '🍦', '🍩', '🍓', '🧁', '🍔', '🌮', '🍿'] },
};

export const COUNTING_OBJECTS = [
  { name: 'Apel', emoji: '🍎', phonetic: 'Apel' },
  { name: 'Bebek', emoji: '🦆', phonetic: 'Bebek' },
  { name: 'Ceri', emoji: '🍒', phonetic: 'Ceri' },
  { name: 'Gajah', emoji: '🐘', phonetic: 'Gajah' },
  { name: 'Kucing', emoji: '🐱', phonetic: 'Kucing' },
  { name: 'Lebah', emoji: '🐝', phonetic: 'Lebah' },
  { name: 'Pisang', emoji: '🍌', phonetic: 'Pisang' },
  { name: 'Singa', emoji: '🦁', phonetic: 'Singa' },
  { name: 'Wortel', emoji: '🥕', phonetic: 'Wortel' },
  { name: 'Stroberi', emoji: '🍓', phonetic: 'Stroberi' },
];
