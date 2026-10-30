// levels.js - Definisi 70 level permainan anak berbasis lembar kerja Problem Solving Kids
// 4 Dunia petualangan: Hutan Satwa, Kota Angka, Markas Pahlawan, Lab Koding

export const WORLDS = [
  {
    id: 'hewan',
    name: 'Hutan Satwa Lucu',
    emoji: '🌳',
    color: '#10B981',
    bgColor: '#ECFDF5',
    desc: 'Bantu hewan-hewan lucu mencari makanan dan rumahnya!'
  },
  {
    id: 'angka',
    name: 'Kota Angka Spidey',
    emoji: '🔢',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    desc: 'Belajar berhitung 1 sampai 10 dan tambah-tambahan seru!'
  },
  {
    id: 'spidey',
    name: 'Markas Pahlawan Cilik',
    emoji: '🕸️',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    desc: 'Tembus labirin kota, sambung titik, dan raih piala pahlawan!'
  },
  {
    id: 'koding',
    name: 'Lab Robot & Koding',
    emoji: '🤖',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    desc: 'Program robot Spidey dengan panah, saklar, dan logika cerdas!'
  }
];

export const LEVELS = [
  // ==========================================
  // DUNIA 1: HUTAN SATWA LUCU (Lembar 01 - 11)
  // ==========================================
  {
    id: '01',
    worldId: 'hewan',
    sheetNo: 1,
    title: 'Bantu Hewan Makan',
    type: 'hubungkan',
    prompt: 'Tarik garis dari hewan ke makanan kesukaannya!',
    pairs: [
      { left: '🐰 Kelinci', right: '🥕 Wortel' },
      { left: '🐶 Anjing', right: '🦴 Tulang' },
      { left: '🐵 Monyet', right: '🍌 Pisang' },
      { left: '🐻 Beruang', right: '🍯 Madu' }
    ]
  },
  {
    id: '02',
    worldId: 'hewan',
    sheetNo: 2,
    title: 'Labirin Kucing Manis',
    type: 'labirin',
    prompt: 'Bantu kucing kecil berjalan menyusuri jalan menuju ikan lezat!',
    startEmoji: '🐱',
    targetEmoji: '🐟',
    gridSize: 5,
    walls: ['1,0', '1,2', '3,1', '2,3', '3,3']
  },
  {
    id: '03',
    worldId: 'hewan',
    sheetNo: 3,
    title: 'Cocokkan Bayangan Hewan',
    type: 'hubungkan',
    prompt: 'Hubungkan hewan berwarna dengan bayangan hitamnya!',
    pairs: [
      { left: '🦁 Singa Ceria', right: '🦁 Bayangan Singa' },
      { left: '🐘 Gajah Belalai', right: '🐘 Bayangan Gajah' },
      { left: '🦒 Jerapah Leher Panjang', right: '🦒 Bayangan Jerapah' }
    ]
  },
  {
    id: '04',
    worldId: 'hewan',
    sheetNo: 4,
    title: 'Cari yang Berbeda',
    type: 'pilih',
    prompt: 'Sentuh satu gambar yang paling berbeda dari teman-temannya!',
    items: [
      {
        question: 'Mana yang berbeda?',
        options: ['🐱', '🐱', '🐶', '🐱'],
        answerIndex: 2,
        hint: 'Semua kucing, tapi ada satu anjing!'
      },
      {
        question: 'Mana yang berbeda?',
        options: ['🍎', '🍌', '🍎', '🍎'],
        answerIndex: 1,
        hint: 'Semua apel, ada satu pisang!'
      }
    ]
  },
  {
    id: '05',
    worldId: 'hewan',
    sheetNo: 5,
    title: 'Mana yang Paling Besar?',
    type: 'pilih',
    prompt: 'Sentuh hewan yang ukurannya PALING BESAR!',
    items: [
      {
        question: 'Pilih hewan paling besar!',
        options: [
          { label: 'Gajah Raksasa 🐘', size: 'big' },
          { label: 'Semut Kecil 🐜', size: 'small' }
        ],
        answerIndex: 0
      },
      {
        question: 'Pilih hewan paling besar!',
        options: [
          { label: 'Burung Pipit 🐦', size: 'small' },
          { label: 'Paus Biru 🐋', size: 'big' }
        ],
        answerIndex: 1
      }
    ]
  },
  {
    id: '06',
    worldId: 'hewan',
    sheetNo: 6,
    title: 'Hitung Hewan 1 sampai 5',
    type: 'pilih',
    prompt: 'Hitung berapa banyak hewannya, lalu pilih angka yang benar!',
    items: [
      {
        display: '🦆 🦆 🦆',
        question: 'Ada berapa bebek?',
        options: [2, 3, 4],
        answer: 3
      },
      {
        display: '🐸 🐸',
        question: 'Ada berapa katak?',
        options: [1, 2, 5],
        answer: 2
      },
      {
        display: '🦋 🦋 🦋 🦋',
        question: 'Ada berapa kupu-kupu?',
        options: [3, 4, 5],
        answer: 4
      }
    ]
  },
  {
    id: '07',
    worldId: 'hewan',
    sheetNo: 7,
    title: 'Lengkapi Pola Hewan',
    type: 'pilih',
    prompt: 'Perhatikan polanya! Apa hewan berikutnya setelah tanda tanya?',
    items: [
      {
        sequence: ['🐱', '🐶', '🐱', '🐶', '❓'],
        options: ['🐱', '🐶'],
        answerIndex: 0
      },
      {
        sequence: ['🐸', '🐸', '🦆', '🐸', '🐸', '❓'],
        options: ['🦆', '🐸'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '08',
    worldId: 'hewan',
    sheetNo: 8,
    title: 'Induk dan Bayi Hewan',
    type: 'hubungkan',
    prompt: 'Tarik garis dari ibu hewan ke anak bayinya yang lucu!',
    pairs: [
      { left: '🐔 Ayam Ibu', right: '🐤 Anak Ayam' },
      { left: '🐮 Sapi Ibu', right: '🐂 Anak Sapi' },
      { left: '🦆 Bebek Ibu', right: '🐣 Anak Bebek' }
    ]
  },
  {
    id: '09',
    worldId: 'hewan',
    sheetNo: 9,
    title: 'Sambung Titik 1 sampai 10',
    type: 'titik',
    prompt: 'Sentuh angka 1, 2, 3 sampai 10 untuk menggambar hewan rahasia!',
    dots: [
      { num: 1, x: 50, y: 15 },
      { num: 2, x: 71, y: 22 },
      { num: 3, x: 85, y: 39 },
      { num: 4, x: 85, y: 61 },
      { num: 5, x: 71, y: 78 },
      { num: 6, x: 50, y: 85 },
      { num: 7, x: 29, y: 78 },
      { num: 8, x: 15, y: 61 },
      { num: 9, x: 15, y: 39 },
      { num: 10, x: 29, y: 22 }
    ],
    revealEmoji: '🐢',
    revealName: 'Kura-kura Hebat!'
  },
  {
    id: '10',
    worldId: 'hewan',
    sheetNo: 10,
    title: 'Rumah Hewan yang Nyaman',
    type: 'hubungkan',
    prompt: 'Di mana rumah mereka? Tarik garis ke rumah yang pas!',
    pairs: [
      { left: '🐦 Burung Cantik', right: '🪺 Sarang Ranting' },
      { left: '🐝 Lebah Madu', right: '🍯 Sarang Lebah' },
      { left: '🐟 Ikan Mas', right: '🌊 Kolam Air' }
    ]
  },
  {
    id: '11',
    worldId: 'hewan',
    sheetNo: 11,
    title: 'Mewarnai Bentuk Geometri',
    type: 'mewarnai',
    prompt: 'Pilih warna krayon, lalu sentuh bentuk untuk mewarnainya!',
    targetName: 'Bentuk Ceria',
    palette: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'],
    shapes: [
      { id: 's1', type: 'circle', label: 'Lingkaran', defaultColor: '#F1F5F9' },
      { id: 's2', type: 'square', label: 'Kotak', defaultColor: '#F1F5F9' },
      { id: 's3', type: 'triangle', label: 'Segitiga', defaultColor: '#F1F5F9' }
    ]
  },

  // ==========================================
  // DUNIA 2: KOTA ANGKA SPIDEY
  // (Lembar 24, 27-36, 40, 47, 48, 52, 53, 54, 56)
  // ==========================================
  {
    id: '47',
    worldId: 'angka',
    sheetNo: 47,
    title: 'Jumbo Hitung 1, 2, 3',
    type: 'pilih',
    prompt: 'Hitung benda super besar ini! Ada berapa ya?',
    items: [
      { display: '🕷️', question: 'Ada berapa laba-laba?', options: [1, 2, 3], answer: 1 },
      { display: '⭐ ⭐', question: 'Ada berapa bintang?', options: [1, 2, 3], answer: 2 },
      { display: '🕸️ 🕸️ 🕸️', question: 'Ada berapa jaring?', options: [2, 3, 4], answer: 3 }
    ]
  },
  {
    id: '48',
    worldId: 'angka',
    sheetNo: 48,
    title: 'Jumbo Hitung 4 dan 5',
    type: 'pilih',
    prompt: 'Yuk hitung lagi! Sentuh angka yang benar ya!',
    items: [
      { display: '🔋 🔋 🔋 🔋', question: 'Ada berapa baterai?', options: [3, 4, 5], answer: 4 },
      { display: '🤖 🤖 🤖 🤖 🤖', question: 'Ada berapa robot cilik?', options: [4, 5, 6], answer: 5 }
    ]
  },
  {
    id: '53',
    worldId: 'angka',
    sheetNo: 53,
    title: 'Tebalkan Angka Raksasa (1, 2, 3)',
    type: 'tebalkan',
    prompt: 'Telusuri garis putus-putus dengan jari untuk menulis angka!',
    traceItems: [
      { label: 'Angka 1', pathType: 'one' },
      { label: 'Angka 2', pathType: 'two' },
      { label: 'Angka 3', pathType: 'three' }
    ]
  },
  {
    id: '54',
    worldId: 'angka',
    sheetNo: 54,
    title: 'Tebalkan Angka Raksasa (4 & 5)',
    type: 'tebalkan',
    prompt: 'Ikuti garis putus-putus untuk membentuk angka 4 dan 5!',
    traceItems: [
      { label: 'Angka 4', pathType: 'four' },
      { label: 'Angka 5', pathType: 'five' }
    ]
  },
  {
    id: '56',
    worldId: 'angka',
    sheetNo: 56,
    title: 'Hitung Jari Tangan Pahlawan',
    type: 'hubungkan',
    prompt: 'Berapa jari yang diangkat? Tarik garis ke angkanya!',
    pairs: [
      { left: '☝️ Satu Jari', right: '1️⃣ Angka Satu' },
      { left: '✌️ Dua Jari', right: '2️⃣ Angka Dua' },
      { left: '🖐️ Lima Jari', right: '5️⃣ Angka Lima' }
    ]
  },
  {
    id: '24',
    worldId: 'angka',
    sheetNo: 24,
    title: 'Hitung Angka 6 sampai 10',
    type: 'pilih',
    prompt: 'Koleksi pahlawan makin banyak! Hitung berapa jumlahnya!',
    items: [
      { display: '⭐ ⭐ ⭐ ⭐ ⭐ ⭐', question: 'Ada berapa bintang?', options: [5, 6, 7], answer: 6 },
      { display: '🔋 🔋 🔋 🔋 🔋 🔋 🔋', question: 'Ada berapa baterai?', options: [6, 7, 8], answer: 7 },
      { display: '🕸️ 🕸️ 🕸️ 🕸️ 🕸️ 🕸️ 🕸️ 🕸️', question: 'Ada berapa jaring?', options: [7, 8, 9], answer: 8 }
    ]
  },
  {
    id: '27',
    worldId: 'angka',
    sheetNo: 27,
    title: 'Hitung dan Lingkari Pahlawan',
    type: 'pilih',
    prompt: 'Hitung topeng Spidey, lalu sentuh angka yang tepat!',
    items: [
      { display: '🎭 🎭 🎭', question: 'Berapa topeng pahlawan?', options: [2, 3, 4], answer: 3 },
      { display: '🎭 🎭 🎭 🎭', question: 'Berapa topeng pahlawan?', options: [3, 4, 5], answer: 4 }
    ]
  },
  {
    id: '28',
    worldId: 'angka',
    sheetNo: 28,
    title: 'Tarik Garis Benda ke Angka',
    type: 'hubungkan',
    prompt: 'Pasangkan kelompok benda ke kartu angkanya!',
    pairs: [
      { left: '🕸️', right: '1️⃣ Satu' },
      { left: '🤖 🤖', right: '2️⃣ Dua' },
      { left: '🔋 🔋 🔋', right: '3️⃣ Tiga' }
    ]
  },
  {
    id: '32',
    worldId: 'angka',
    sheetNo: 32,
    title: 'Mana yang Lebih Banyak?',
    type: 'pilih',
    prompt: 'Sentuh kelompok yang punya benda LEBIH BANYAK!',
    items: [
      {
        question: 'Mana yang lebih banyak?',
        options: ['⭐ ⭐ ⭐ (3 Bintang)', '⭐ (1 Bintang)'],
        answerIndex: 0
      },
      {
        question: 'Mana yang lebih banyak?',
        options: ['🔋 🔋 (2 Baterai)', '🔋 🔋 🔋 🔋 (4 Baterai)'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '33',
    worldId: 'angka',
    sheetNo: 33,
    title: 'Penjumlahan Bergambar (Maksimal 5)',
    type: 'pilih',
    prompt: 'Ayo jumlahkan! Hitung semua benda lalu sentuh hasilnya!',
    items: [
      { display: '🤖 + 🤖', question: '1 robot ditambah 1 robot, jadi berapa?', options: [1, 2, 3], answer: 2 },
      { display: '🕷️ 🕷️ + 🕷️', question: '2 laba-laba ditambah 1 laba-laba, jadi berapa?', options: [2, 3, 4], answer: 3 },
      { display: '🕸️ 🕸️ + 🕸️ 🕸️', question: '2 jaring ditambah 2 jaring, jadi berapa?', options: [3, 4, 5], answer: 4 }
    ]
  },
  {
    id: '34',
    worldId: 'angka',
    sheetNo: 34,
    title: 'Urutan Angka yang Hilang',
    type: 'pilih',
    prompt: 'Ada angka yang bersembunyi! Angka berapa yang hilang?',
    items: [
      { display: '1, 2, ❓, 4', question: 'Angka berapa di tanda tanya?', options: [2, 3, 5], answer: 3 },
      { display: '3, 4, ❓', question: 'Angka berapa setelah 4?', options: [5, 6, 2], answer: 5 }
    ]
  },
  {
    id: '43',
    worldId: 'angka',
    sheetNo: 43,
    title: 'Pengurangan Bergambar',
    type: 'pilih',
    prompt: 'Benda berkurang! Berapa sisa yang tertinggal?',
    items: [
      { display: '⭐⭐⭐ diambil ⭐', question: '3 bintang hilang 1 bintang, tersisa berapa?', options: [1, 2, 3], answer: 2 },
      { display: '🔋🔋 diambil 🔋', question: '2 baterai terpakai 1, tersisa berapa?', options: [1, 2, 0], answer: 1 }
    ]
  },
  {
    id: '15',
    worldId: 'angka',
    sheetNo: 15,
    title: 'Hitung Logo Spidey 1 sampai 5',
    type: 'pilih',
    prompt: 'Hitung ada berapa laba-laba kecil di layar, lalu sentuh angkanya!',
    items: [
      {
        display: '🕷️',
        question: 'Ada berapa laba-laba kecil?',
        options: [1, 2, 3],
        answer: 1
      },
      {
        display: '🕷️ 🕷️ 🕷️',
        question: 'Ada berapa laba-laba kecil?',
        options: [2, 3, 4],
        answer: 3
      },
      {
        display: '🕷️ 🕷️ 🕷️ 🕷️ 🕷️',
        question: 'Ada berapa laba-laba kecil?',
        options: [4, 5, 6],
        answer: 5
      }
    ]
  },
  {
    id: '29',
    worldId: 'angka',
    sheetNo: 29,
    title: 'Hitung dan Tebalkan Angka',
    type: 'tebalkan',
    prompt: 'Tebalkan angka pahlawan dengan jarimu di atas layar!',
    traceItems: [
      { label: 'Tebalkan Angka 1 (Satu Topeng)', pathType: 'one' },
      { label: 'Tebalkan Angka 2 (Dua Robot)', pathType: 'two' },
      { label: 'Tebalkan Angka 3 (Tiga Bintang)', pathType: 'three' }
    ]
  },
  {
    id: '30',
    worldId: 'angka',
    sheetNo: 30,
    title: 'Warnai Kotak Jumlah Bintang',
    type: 'mewarnai',
    prompt: 'Pilih krayon warna, lalu warnai kotak energi bintang pahlawan!',
    targetName: 'Kotak Energi Bintang',
    palette: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6'],
    shapes: [
      { id: 'k1', type: 'square', label: 'Kotak 1 ⭐', defaultColor: '#F1F5F9' },
      { id: 'k2', type: 'square', label: 'Kotak 2 ⭐', defaultColor: '#F1F5F9' },
      { id: 'k3', type: 'square', label: 'Kotak 3 ⭐', defaultColor: '#F1F5F9' }
    ]
  },
  {
    id: '31',
    worldId: 'angka',
    sheetNo: 31,
    title: 'Cari dan Hitung Benda Spidey',
    type: 'pilih',
    prompt: 'Cari benda pahlawan yang bersembunyi dan hitung ada berapa!',
    items: [
      {
        display: '🕸️ 🕸️ 🕸️',
        question: 'Berapa jaring yang bersembunyi?',
        options: [2, 3, 4],
        answer: 3
      },
      {
        display: '⭐ ⭐ ⭐ ⭐',
        question: 'Berapa bintang yang berkilau?',
        options: [3, 4, 5],
        answer: 4
      }
    ]
  },
  {
    id: '35',
    worldId: 'angka',
    sheetNo: 35,
    title: 'Hitung Jari Tangan Lanjutan',
    type: 'hubungkan',
    prompt: 'Tarik garis dari jumlah jari tangan ke angka yang tepat!',
    pairs: [
      { left: '🤟 Tiga Jari', right: '3️⃣ Angka Tiga' },
      { left: '🖖 Empat Jari', right: '4️⃣ Angka Empat' },
      { left: '🖐️ Lima Jari Penuh', right: '5️⃣ Angka Lima' }
    ]
  },
  {
    id: '36',
    worldId: 'angka',
    sheetNo: 36,
    title: 'Hitung Bentuk Geometri Spidey',
    type: 'pilih',
    prompt: 'Hitung berapa bentuk geometri pada tameng pahlawan!',
    items: [
      {
        display: '🔵 🔵 🔵',
        question: 'Ada berapa lingkaran biru?',
        options: [2, 3, 4],
        answer: 3
      },
      {
        display: '🟥 🟥',
        question: 'Ada berapa kotak merah?',
        options: [1, 2, 3],
        answer: 2
      },
      {
        display: '🔺 🔺 🔺 🔺',
        question: 'Ada berapa segitiga pahlawan?',
        options: [3, 4, 5],
        answer: 4
      }
    ]
  },
  {
    id: '39',
    worldId: 'angka',
    sheetNo: 39,
    title: 'Labirin Jalur Angka',
    type: 'labirin',
    prompt: 'Susuri jalan kota berurutan dari angka 1 menuju piala emas!',
    startEmoji: '1️⃣',
    targetEmoji: '🏆',
    gridSize: 4,
    walls: ['1,0', '0,2', '1,2', '2,0', '3,1', '2,3']
  },
  {
    id: '40',
    worldId: 'angka',
    sheetNo: 40,
    title: 'Warnai Baterai Sesuai Angka',
    type: 'mewarnai',
    prompt: 'Warnai sel daya baterai Spideybot dengan krayon cerah!',
    targetName: 'Baterai Daya Robot',
    palette: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
    shapes: [
      { id: 'cell1', type: 'square', label: 'Daya 1 ⚡', defaultColor: '#E2E8F0' },
      { id: 'cell2', type: 'square', label: 'Daya 2 ⚡', defaultColor: '#E2E8F0' },
      { id: 'cell3', type: 'circle', label: 'Lampu Daya 💡', defaultColor: '#E2E8F0' }
    ]
  },
  {
    id: '42',
    worldId: 'angka',
    sheetNo: 42,
    title: 'Pola Bentuk Geometri Spidey',
    type: 'pilih',
    prompt: 'Lihat pola bentuknya! Bentuk apa berikutnya setelah tanda tanya?',
    items: [
      {
        sequence: ['🔵', '🟥', '🔵', '🟥', '❓'],
        options: ['🔵 Lingkaran', '🟥 Kotak'],
        answerIndex: 0
      },
      {
        sequence: ['🔺', '🔺', '🔵', '🔺', '🔺', '❓'],
        options: ['🔵 Lingkaran', '🔺 Segitiga'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '52',
    worldId: 'angka',
    sheetNo: 52,
    title: 'Jumbo Mana Lebih Besar?',
    type: 'pilih',
    prompt: 'Sentuh benda raksasa yang ukurannya LEBIH BESAR!',
    items: [
      {
        question: 'Mana yang LEBIH BESAR?',
        options: ['🏢 Gedung Pencakar Langit (Raksasa)', '🏠 Rumah Kecil'],
        answerIndex: 0
      },
      {
        question: 'Mana yang LEBIH BESAR?',
        options: ['🚗 Mobil Kecil', '✈️ Pesawat Terbang Raksasa'],
        answerIndex: 1
      }
    ]
  },

  // ==========================================
  // DUNIA 3: MARKAS PAHLAWAN CILIK
  // (Lembar 12-23, 25, 26, 37, 38, 39, 41, 42, 44-46, 49-51, 55)
  // ==========================================
  {
    id: '12',
    worldId: 'spidey',
    sheetNo: 12,
    title: 'Labirin Jaring Spidey',
    type: 'labirin',
    prompt: 'Bantu Spidey kecil berayun di labirin menuju robot ciliknya!',
    startEmoji: '🕷️',
    targetEmoji: '🤖',
    gridSize: 5,
    walls: ['0,2', '1,2', '3,0', '3,1', '3,3', '4,3']
  },
  {
    id: '49',
    worldId: 'spidey',
    sheetNo: 49,
    title: 'Labirin Jalur Jumbo Balita',
    type: 'labirin',
    prompt: 'Jalan lebar pahlawan! Geser Spidey langsung ke piala emas!',
    startEmoji: '🦸',
    targetEmoji: '🏆',
    gridSize: 4,
    walls: ['1,1', '2,1']
  },
  {
    id: '14',
    worldId: 'spidey',
    sheetNo: 14,
    title: 'Cocokkan Bayangan Spidey',
    type: 'hubungkan',
    prompt: 'Tarik garis dari kostum pahlawan ke bayangan hitamnya!',
    pairs: [
      { left: '🦸 Spidey Merah', right: '🦸 Bayangan Spidey' },
      { left: '🤖 Robot Teman', right: '🤖 Bayangan Robot' },
      { left: '🎭 Topeng Spidey', right: '🎭 Bayangan Topeng' }
    ]
  },
  {
    id: '16',
    worldId: 'spidey',
    sheetNo: 16,
    title: 'Detektif Topeng Pahlawan',
    type: 'pilih',
    prompt: 'Ada satu topeng yang berbeda arah hadapnya! Sentuh topeng itu!',
    hideCaptions: true,
    items: [
      {
        question: 'Mana topeng yang arah hadapnya berbeda?',
        options: [
          { label: 'Topeng Hadap Kanan', direction: 'right', hideLabel: true },
          { label: 'Topeng Hadap Kanan', direction: 'right', hideLabel: true },
          { label: 'Topeng Hadap Kiri', direction: 'left', hideLabel: true },
          { label: 'Topeng Hadap Kanan', direction: 'right', hideLabel: true }
        ],
        answerIndex: 2
      }
    ]
  },
  {
    id: '17',
    worldId: 'spidey',
    sheetNo: 17,
    title: 'Pola Jaring Pahlawan',
    type: 'pilih',
    prompt: 'Lihat polanya! Benda apa selanjutnya dalam jaring?',
    items: [
      {
        sequence: ['🕷️', '🕸️', '🕷️', '🕸️', '❓'],
        options: ['🕷️ Topeng', '🕸️ Jaring'],
        answerIndex: 0
      },
      {
        sequence: ['🤖', '⭐', '🤖', '⭐', '❓'],
        options: ['⭐ Bintang', '🤖 Robot'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '18',
    worldId: 'spidey',
    sheetNo: 18,
    title: 'Urutkan Ukuran Pahlawan',
    type: 'urutkan',
    sortType: 'size',
    hideItemLabels: true,
    prompt: 'Sentuh pahlawan dari yang PALING KECIL ke yang PALING BESAR!',
    items: [
      { label: 'Spidey Cilik', size: 1 },
      { label: 'Spidey Sedang', size: 2 },
      { label: 'Spidey Besar', size: 3 }
    ]
  },
  {
    id: '19',
    worldId: 'spidey',
    sheetNo: 19,
    title: 'Sambung Titik Jaring Laba-laba',
    type: 'titik',
    prompt: 'Sentuh titik nomor 1 sampai 8 untuk membuat lambang laba-laba!',
    dots: [
      { num: 1, x: 50, y: 15 },
      { num: 2, x: 75, y: 25 },
      { num: 3, x: 85, y: 50 },
      { num: 4, x: 75, y: 75 },
      { num: 5, x: 50, y: 85 },
      { num: 6, x: 25, y: 75 },
      { num: 7, x: 15, y: 50 },
      { num: 8, x: 25, y: 25 }
    ],
    revealEmoji: '🕸️',
    revealName: 'Jaring Pahlawan Kuat!'
  },
  {
    id: '20',
    worldId: 'spidey',
    sheetNo: 20,
    title: 'Mewarnai Topeng Spidey Cilik',
    type: 'mewarnai',
    prompt: 'Warnai topeng pahlawan dengan warna MERAH dan BIRU kesukaanmu!',
    targetName: 'Topeng Pahlawan',
    palette: ['#EF4444', '#2563EB', '#1E293B', '#F59E0B'],
    shapes: [
      { id: 'topeng_kiri', type: 'circle', label: 'Sisi Kiri', defaultColor: '#F8FAFC' },
      { id: 'topeng_kanan', type: 'circle', label: 'Sisi Kanan', defaultColor: '#F8FAFC' },
      { id: 'jaring_tengah', type: 'square', label: 'Logo Tengah', defaultColor: '#F8FAFC' }
    ]
  },
  {
    id: '23',
    worldId: 'spidey',
    sheetNo: 23,
    title: 'Arah Kiri dan Kanan',
    type: 'pilih',
    prompt: 'Spidey mau belok ke mana? Pilih tombol arah yang tepat!',
    items: [
      {
        question: 'Spidey ingin melompat ke KANAN ➡️',
        options: ['⬅️ Kiri', '➡️ Kanan'],
        answerIndex: 1
      },
      {
        question: 'Spidey ingin melompat ke KIRI ⬅️',
        options: ['⬅️ Kiri', '➡️ Kanan'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '25',
    worldId: 'spidey',
    sheetNo: 25,
    title: 'Mengenal Ekspresi Wajah',
    type: 'pilih',
    prompt: 'Bagaimana perasaan Spidey sekarang? Sentuh wajah yang pas!',
    items: [
      {
        question: 'Spidey sedang SENANG karena berhasil menang! 🎉',
        options: ['😄 Senang Ceria', '😢 Sedih'],
        answerIndex: 0
      },
      {
        question: 'Spidey KAGET melihat kado raksasa! 😲',
        options: ['😴 Ngantuk', '😲 Kaget Kagum'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '38',
    worldId: 'spidey',
    sheetNo: 38,
    title: 'Kartu Memori Pasangan Sama',
    type: 'memori',
    prompt: 'Buka kartu dan temukan dua gambar pahlawan yang sama!',
    pairs: [
      { id: 'p1', emoji: '🕷️', name: 'Laba-laba' },
      { id: 'p2', emoji: '🤖', name: 'Robot' },
      { id: 'p3', emoji: '⭐', name: 'Bintang' }
    ]
  },
  {
    id: '46',
    worldId: 'spidey',
    sheetNo: 46,
    title: 'Piala Juara Pahlawan',
    type: 'pilih',
    prompt: 'Kamu pahlawan hebat! Pilih piala emas untuk merayakannya!',
    items: [
      {
        question: 'Ambil piala kemenanganmu!',
        options: ['🏆 Piala Emas Juara!'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '13',
    worldId: 'spidey',
    sheetNo: 13,
    title: 'Tarik Garis Jaring Spidey',
    type: 'hubungkan',
    prompt: 'Tembakkan jaring Spidey ke sasaran di kota!',
    pairs: [
      { left: '🕸️ Jaring Atas', right: '🏢 Gedung Tinggi' },
      { left: '🕸️ Jaring Cepat', right: '🚁 Helikopter' },
      { left: '🕸️ Jaring Kuat', right: '🚏 Tiang Lampu Kota' }
    ]
  },
  {
    id: '21',
    worldId: 'spidey',
    sheetNo: 21,
    title: 'Labirin Gedung Kota',
    type: 'labirin',
    prompt: 'Bantu Spidey melompati atap gedung menuju sinyal pahlawan!',
    startEmoji: '🕷️',
    targetEmoji: '🚨',
    gridSize: 5,
    walls: ['0,1', '0,3', '1,2', '2,0', '3,1', '3,2', '4,3', '1,4']
  },
  {
    id: '22',
    worldId: 'spidey',
    sheetNo: 22,
    title: 'Tim Pahlawan Spidey',
    type: 'hubungkan',
    prompt: 'Pasangkan pahlawan hebat dengan simbol khas mereka!',
    pairs: [
      { left: '🕷️ Spidey Cilik', right: '🕸️ Topeng Jaring' },
      { left: '🤖 Spideybot', right: '🔋 Baterai Energi' },
      { left: '👻 Ghost-Spider', right: '🎀 Kerudung Putih' }
    ]
  },
  {
    id: '26',
    worldId: 'spidey',
    sheetNo: 26,
    title: 'Labirin Penyelamatan Kucing',
    type: 'labirin',
    prompt: 'Spidey harus menyelamatkan anak kucing yang tersesat di pohon!',
    startEmoji: '🦸',
    targetEmoji: '🐱',
    gridSize: 5,
    walls: ['1,0', '1,1', '2,1', '0,3', '3,2', '3,3', '4,1', '4,2']
  },
  {
    id: '37',
    worldId: 'spidey',
    sheetNo: 37,
    title: 'Kelompokkan Warna Kostum',
    type: 'hubungkan',
    prompt: 'Hubungkan perlengkapan pahlawan dengan warna yang sama!',
    pairs: [
      { left: '🔴 Topeng Merah', right: '🍎 Apel Merah Segar' },
      { left: '🔵 Kostum Biru', right: '🌊 Ombak Biru Laut' },
      { left: '🟡 Sabuk Kuning', right: '⭐ Bintang Kuning' }
    ]
  },
  {
    id: '41',
    worldId: 'spidey',
    sheetNo: 41,
    title: 'Jaring Panjang dan Pendek',
    type: 'pilih',
    prompt: 'Perhatikan ukuran jaring Spidey! Sentuh yang sesuai pertanyaan!',
    items: [
      {
        question: 'Mana jaring Spidey yang PALING PANJANG?',
        options: ['🕸️━━━━━━ (Panjang)', '🕸️━━ (Pendek)'],
        answerIndex: 0
      },
      {
        question: 'Mana tali jaring yang PALING PENDEK?',
        options: ['🧵━━━━━ (Panjang)', '🧵━ (Pendek)'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '44',
    worldId: 'spidey',
    sheetNo: 44,
    title: 'Urutkan Robot Kecil ke Besar',
    type: 'urutkan',
    prompt: 'Sentuh robot dari yang PALING KECIL ke yang PALING BESAR!',
    items: [
      { label: 'Robot Mungil 🤖', size: 1 },
      { label: 'Robot Sedang 🤖', size: 2 },
      { label: 'Robot Raksasa 🤖', size: 3 }
    ]
  },
  {
    id: '45',
    worldId: 'spidey',
    sheetNo: 45,
    title: 'Sambung Titik Laba-Laba Spidey',
    type: 'titik',
    prompt: 'Sentuh angka 1 sampai 10 untuk menggambar laba-laba pahlawan!',
    dots: [
      { num: 1, x: 50, y: 14 },
      { num: 2, x: 72, y: 22 },
      { num: 3, x: 86, y: 41 },
      { num: 4, x: 82, y: 64 },
      { num: 5, x: 68, y: 83 },
      { num: 6, x: 50, y: 87 },
      { num: 7, x: 32, y: 83 },
      { num: 8, x: 18, y: 64 },
      { num: 9, x: 14, y: 41 },
      { num: 10, x: 28, y: 22 }
    ],
    revealEmoji: '🕷️',
    revealName: 'Laba-laba Pahlawan Cilik!'
  },
  {
    id: '50',
    worldId: 'spidey',
    sheetNo: 50,
    title: 'Mewarnai Topeng Spidey Jumbo',
    type: 'mewarnai',
    prompt: 'Warnai topeng raksasa Spidey dengan krayon favoritmu!',
    targetName: 'Topeng Spidey Jumbo',
    palette: ['#EF4444', '#2563EB', '#F59E0B', '#10B981', '#1E293B'],
    shapes: [
      { id: 'mata_kiri', type: 'circle', label: 'Lensa Kiri', defaultColor: '#FFFFFF' },
      { id: 'mata_kanan', type: 'circle', label: 'Lensa Kanan', defaultColor: '#FFFFFF' },
      { id: 'topeng_dahi', type: 'square', label: 'Dahi Merah', defaultColor: '#F8FAFC' },
      { id: 'topeng_dagu', type: 'triangle', label: 'Dagu Pahlawan', defaultColor: '#F8FAFC' }
    ]
  },
  {
    id: '51',
    worldId: 'spidey',
    sheetNo: 51,
    title: 'Perlengkapan Pahlawan Jumbo',
    type: 'hubungkan',
    prompt: 'Tarik garis perlengkapan pahlawan ke pasangannya!',
    pairs: [
      { left: '🧤 Sarung Tangan Kiri', right: '🧤 Sarung Tangan Kanan' },
      { left: '👢 Sepatu Kiri Spidey', right: '👢 Sepatu Kanan Spidey' },
      { left: '🎭 Topeng Pelindung', right: '🦸 Kostum Pahlawan' }
    ]
  },
  {
    id: '55',
    worldId: 'spidey',
    sheetNo: 55,
    title: 'Bayangan Pahlawan Raksasa',
    type: 'hubungkan',
    prompt: 'Cocokkan gambar pahlawan jumbo ke siluet hitam raksasanya!',
    pairs: [
      { left: '🦸 Pose Terbang Spidey', right: '🦸 Bayangan Spidey' },
      { left: '🎭 Topeng Pahlawan', right: '🎭 Bayangan Topeng' },
      { left: '🤖 Robot Spidey Siaga', right: '🤖 Bayangan Spideybot' }
    ]
  },

  // ==========================================
  // DUNIA 4: LAB ROBOT & KODING (Lembar 57-76)
  // ==========================================
  {
    id: '57',
    worldId: 'koding',
    sheetNo: 57,
    title: 'Algoritma Langkah Robot',
    type: 'urutkan',
    prompt: 'Urutkan langkah 1, 2, 3 agar robot Spidey bisa mengisi baterai!',
    items: [
      { label: '1️⃣ Robot Bangun', step: 1 },
      { label: '2️⃣ Jalan ke Baterai', step: 2 },
      { label: '3️⃣ Baterai Penuh 100%', step: 3 }
    ]
  },
  {
    id: '58',
    worldId: 'koding',
    sheetNo: 58,
    title: 'Koding Panah Spideybot',
    type: 'panah',
    prompt: 'Susun panah jalan agar Spideybot bisa mengambil baterai energi!',
    grid: [
      ['R', '.', '.'],
      ['X', '.', '.'],
      ['.', '.', 'G']
    ],
    // R = Robot, . = Jalan, X = Halangan, G = Baterai Energi
    correctProgram: ['➡️', '➡️', '⬇️', '⬇️']
  },
  {
    id: '59',
    worldId: 'koding',
    sheetNo: 59,
    title: 'Logika Jika - Maka (If - Then)',
    type: 'hubungkan',
    prompt: 'Hubungkan warna lampu sinyal ke aksi pahlawan yang benar!',
    pairs: [
      { left: '🔴 JIKA Lampu Merah', right: '🛑 MAKA Berhenti!' },
      { left: '🟢 JIKA Lampu Hijau', right: '🚀 MAKA Maju Cepat!' },
      { left: '🟡 JIKA Lampu Kuning', right: '⚠️ MAKA Hati-hati!' }
    ]
  },
  {
    id: '60',
    worldId: 'koding',
    sheetNo: 60,
    title: 'Detektif Debugging (Cari Bug)',
    type: 'pilih',
    prompt: 'Ada kabel yang rusak digigit kumbang bug! Sentuh kabel yang ADA BUG!',
    items: [
      {
        question: 'Kabel mana yang terputus / rusak?',
        options: [
          '⚡ Kabel A (Lancar Aman)',
          '🐛❌ Kabel B (Ada Bug Rusak!)',
          '⚡ Kabel C (Lancar Aman)'
        ],
        answerIndex: 1
      }
    ]
  },
  {
    id: '61',
    worldId: 'koding',
    sheetNo: 61,
    title: 'Koding Looping (Perulangan)',
    type: 'pilih',
    prompt: 'Lihat gerakan berulang robot! Apa langkah berikutnya?',
    items: [
      {
        sequence: ['🚶 Jalan', '🦘 Lompat', '🚶 Jalan', '🦘 Lompat', '❓'],
        options: ['🚶 Jalan', '🦘 Lompat'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '62',
    worldId: 'koding',
    sheetNo: 62,
    title: 'Dekomposisi: Rakit Robot',
    type: 'hubungkan',
    prompt: 'Pasang bagian potongan ke tubuh robot Spidey!',
    pairs: [
      { left: '📡 Antena Sinyal', right: 'Kepala Robot' },
      { left: '🦾 Kaki Mekanik', right: 'Bawah Robot' },
      { left: '🔋 Baterai Inti', right: 'Dada Robot' }
    ]
  },
  {
    id: '63',
    worldId: 'koding',
    sheetNo: 63,
    title: 'Koding Warna Pixel',
    type: 'mewarnai',
    prompt: 'Warnai kotak pixel sesuai angka kode untuk membentuk topeng Spidey!',
    targetName: 'Pixel Spidey (3x3)',
    palette: ['#EF4444', '#FFFFFF', '#3B82F6'],
    shapes: [
      { id: 'px1', type: 'square', label: '1: Merah', defaultColor: '#E2E8F0' },
      { id: 'px2', type: 'square', label: '2: Mata Putih', defaultColor: '#E2E8F0' },
      { id: 'px3', type: 'square', label: '3: Biru Langit', defaultColor: '#E2E8F0' }
    ]
  },
  {
    id: '64',
    worldId: 'koding',
    sheetNo: 64,
    title: 'Tombol Fungsi Spideybot',
    type: 'hubungkan',
    prompt: 'Tarik garis dari tombol kode ke reaksi seru robot!',
    pairs: [
      { left: '📢 BUNYI()', right: '🔊 Suara "BEEP BEEP!"' },
      { left: '💡 LAMPU()', right: '✨ Sorot Lampu Terang' },
      { left: '🕸️ JARING()', right: '🎯 Tembak Jaring Pelindung' }
    ]
  },
  {
    id: '65',
    worldId: 'koding',
    sheetNo: 65,
    title: 'Filter Data Aman vs Bahaya',
    type: 'pilih',
    prompt: 'Filter cerdas! Sentuh benda yang AMAN untuk disentuh robot!',
    items: [
      {
        question: 'Mana yang AMAN disentuh?',
        options: ['🔥 Api Panas', '🐱 Kucing Jinak'],
        answerIndex: 1
      },
      {
        question: 'Mana yang AMAN disentuh?',
        options: ['🎈 Balon Ceria', '🌵 Duri Tajam'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '66',
    worldId: 'koding',
    sheetNo: 66,
    title: 'Koding Belok Kiri & Kanan',
    type: 'pilih',
    prompt: 'Baterai ada di sebelah kanan! Sentuh tombol putar KANAN ↪️!',
    items: [
      {
        question: 'Putar robot menuju target di KANAN ➡️',
        options: ['↩️ Belok KIRI', '↪️ Belok KANAN'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '67',
    worldId: 'koding',
    sheetNo: 67,
    title: 'Saklar Biner ON (1) dan OFF (0)',
    type: 'hubungkan',
    prompt: 'Komputer pakai kode 1 dan 0! Hubungkan saklar ke lampunya!',
    pairs: [
      { left: '🟢 SAKLAR ON (1)', right: '💡 Lampu Menyala Terang' },
      { left: '⚫ SAKLAR OFF (0)', right: '💤 Lampu Mati Hemat Daya' }
    ]
  },
  {
    id: '68',
    worldId: 'koding',
    sheetNo: 68,
    title: 'Koding Lompat Rintangan',
    type: 'pilih',
    prompt: 'Ada batu besar di depan! Pilih perintah apa ya?',
    items: [
      {
        question: 'Di depan ada BATU BESAR! 🪨',
        options: ['➡️ Tabrak Maju', '🦘 LOMPAT TINGGI!'],
        answerIndex: 1
      }
    ]
  },
  {
    id: '69',
    worldId: 'koding',
    sheetNo: 69,
    title: 'Pola Dance Heroik (Loop)',
    type: 'pilih',
    prompt: 'Spidey menari dengan pola! Apa tarian berikutnya?',
    items: [
      {
        sequence: ['👊 Pukul', '🛡️ Tangkis', '🕸️ Jaring', '👊 Pukul', '🛡️ Tangkis', '❓'],
        options: ['🕸️ Jaring', '👊 Pukul'],
        answerIndex: 0
      }
    ]
  },
  {
    id: '70',
    worldId: 'koding',
    sheetNo: 70,
    title: 'Kotak Variabel Spidey',
    type: 'hubungkan',
    prompt: 'Variabel adalah kotak penyimpan! Tarik benda ke kotak namanya!',
    pairs: [
      { left: '🎭 Topeng Spidey', right: '📦 Kotak "TOPENG"' },
      { left: '🤖 Robot Cilik', right: '📦 Kotak "ROBOT"' },
      { left: '⭐ Bintang Emas', right: '📦 Kotak "BINTANG"' }
    ]
  },
  {
    id: '71',
    worldId: 'koding',
    sheetNo: 71,
    title: 'Cari Panah yang Nyasar (Bug)',
    type: 'pilih',
    prompt: 'Robot harus jalan ke kanan ➡️, sentuh SATU panah yang salah arah!',
    items: [
      {
        question: 'Mana panah yang salah arah?',
        options: ['➡️ Benar', '➡️ Benar', '⬅️ SALAH (BUG!)', '➡️ Benar'],
        answerIndex: 2
      }
    ]
  },
  {
    id: '72',
    worldId: 'koding',
    sheetNo: 72,
    title: 'Peta Koordinat Rahasia',
    type: 'pilih',
    prompt: 'Spidey ada di kotak mana? Lihat huruf kolom dan angka barisnya!',
    items: [
      {
        display: '📍 Kolom B, Baris 2',
        question: 'Di mana koordinat Spidey?',
        options: ['A1', 'B2', 'C3'],
        answer: 'B2'
      }
    ]
  },
  {
    id: '73',
    worldId: 'koding',
    sheetNo: 73,
    title: 'Sensor Sentuh Spideybot',
    type: 'hubungkan',
    prompt: 'Ketika sensor disentuh, robot bereaksi ceria! Hubungkan sentuhannya!',
    pairs: [
      { left: '👆 Sentuh Kepala Robot', right: '✨ Mata Berkedip Bintang' },
      { left: '👆 Sentuh Kaki Robot', right: '💃 Robot Menari Ceria' },
      { left: '👆 Tekan Tombol Dada', right: '🎶 Bunyi Lagu Spidey' }
    ]
  },
  {
    id: '74',
    worldId: 'koding',
    sheetNo: 74,
    title: 'Sambung Kabel Energi',
    type: 'tebalkan',
    prompt: 'Telusuri jalur kabel dengan jari dari baterai ke menara lampu!',
    traceItems: [
      { label: 'Kabel Bergelombang', pathType: 'wave' },
      { label: 'Kabel Zig-Zag', pathType: 'zigzag' }
    ]
  },
  {
    id: '75',
    worldId: 'koding',
    sheetNo: 75,
    title: 'Sebelum vs Sesudah Koding',
    type: 'hubungkan',
    prompt: 'Hubungkan kondisi robot SEBELUM dan SESUDAH koding aktif!',
    pairs: [
      { left: '🪫 Baterai Kosong Habis', right: '🔋 Baterai Penuh 100% ✨' },
      { left: '😴 Robot Sedang Tidur', right: '💃 Robot Ceria Menari ✨' }
    ]
  }
];
