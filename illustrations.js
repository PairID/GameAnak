// illustrations.js - Koleksi Vektor Ilustrasi Kartun Berkualitas Tinggi untuk Game Balita
// Setiap ilustrasi dirancang dalam format SVG vektor tajam, cerah, ekspresif, dan ramah anak.
// Mendukung ukuran variabel dan mode siluet (isShadow = true) 100% presisi.

export const Illustrations = {
  // 1. Kucing Ceria (Cat)
  kucing(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#FB923C';
    const innerEar = isShadow ? '#1E293B' : '#FCA5A5';
    const stroke = isShadow ? '#0F172A' : '#7C2D12';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Pointy Ears -->
      <polygon points="20,44 14,14 42,28" fill="${skin}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="22,40 18,19 38,28" fill="${innerEar}"/>
      <polygon points="80,44 86,14 58,28" fill="${skin}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="78,40 82,19 62,28" fill="${innerEar}"/>
      <!-- Chubby Head -->
      <ellipse cx="50" cy="54" rx="34" ry="28" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <!-- Rosy Cheeks -->
      <ellipse cx="30" cy="60" rx="5" ry="3" fill="#FCA5A5" opacity="0.7"/>
      <ellipse cx="70" cy="60" rx="5" ry="3" fill="#FCA5A5" opacity="0.7"/>
      <!-- Big Cute Eyes -->
      <ellipse cx="38" cy="48" rx="4.5" ry="5.5" fill="#1E293B"/>
      <circle cx="39.5" cy="46" r="1.8" fill="#FFFFFF"/>
      <ellipse cx="62" cy="48" rx="4.5" ry="5.5" fill="#1E293B"/>
      <circle cx="63.5" cy="46" r="1.8" fill="#FFFFFF"/>
      <!-- Nose & Mouth -->
      <polygon points="47,56 53,56 50,60" fill="#F43F5E"/>
      <path d="M 45 61 Q 50 64 50 61 Q 50 64 55 61" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Whiskers -->
      <line x1="16" y1="52" x2="28" y2="54" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <line x1="14" y1="60" x2="28" y2="59" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <line x1="84" y1="52" x2="72" y2="54" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      <line x1="86" y1="60" x2="72" y2="59" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 2. Anjing Setia (Dog)
  anjing(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#D97706';
    const ear = isShadow ? '#1E293B' : '#92400E';
    const stroke = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Drooping Ears -->
      <ellipse cx="22" cy="48" rx="10" ry="22" transform="rotate(-15 22 48)" fill="${ear}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="78" cy="48" rx="10" ry="22" transform="rotate(15 78 48)" fill="${ear}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Body / Head -->
      <circle cx="50" cy="48" r="28" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? `
      <ellipse cx="50" cy="60" rx="18" ry="14" fill="${skin}"/>
      ` : `
      <!-- Muzzle -->
      <ellipse cx="50" cy="58" rx="15" ry="11" fill="#FEF3C7" stroke="${stroke}" stroke-width="2"/>
      <ellipse cx="50" cy="52" rx="5.5" ry="4" fill="#1E293B"/>
      <path d="M 50 56 L 50 61 M 46 61 Q 50 64 50 61 Q 50 64 54 61" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Cute Tongue -->
      <path d="M 48 62 Q 50 68 52 62 Z" fill="#F43F5E"/>
      <!-- Big Eyes -->
      <ellipse cx="38" cy="42" rx="4" ry="5" fill="#1E293B"/>
      <circle cx="39.5" cy="40.5" r="1.5" fill="#FFFFFF"/>
      <ellipse cx="62" cy="42" rx="4" ry="5" fill="#1E293B"/>
      <circle cx="63.5" cy="40.5" r="1.5" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 3. Kelinci Manis (Rabbit)
  kelinci(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#F8FAFC';
    const ear = isShadow ? '#1E293B' : '#FCA5A5';
    const stroke = isShadow ? '#0F172A' : '#475569';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Tall Long Ears -->
      <ellipse cx="34" cy="22" rx="10" ry="24" transform="rotate(-10 34 22)" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="34" cy="22" rx="5.5" ry="17" transform="rotate(-10 34 22)" fill="${ear}"/>
      <ellipse cx="66" cy="22" rx="10" ry="24" transform="rotate(10 66 22)" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="66" cy="22" rx="5.5" ry="17" transform="rotate(10 66 22)" fill="${ear}"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="26" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <!-- Cheeks -->
      <circle cx="34" cy="60" r="5" fill="#FCA5A5" opacity="0.6"/>
      <circle cx="66" cy="60" r="5" fill="#FCA5A5" opacity="0.6"/>
      <!-- Eyes -->
      <circle cx="41" cy="48" r="4" fill="#1E293B"/>
      <circle cx="42.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="59" cy="48" r="4" fill="#1E293B"/>
      <circle cx="60.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
      <!-- Pink Nose -->
      <polygon points="47,56 53,56 50,60" fill="#F43F5E"/>
      <path d="M 50 60 L 50 64 M 46 64 Q 50 67 50 64 Q 50 67 54 64" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 4. Monyet Ceria (Monkey)
  monyet(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#78350F';
    const face = isShadow ? '#1E293B' : '#FDE68A';
    const stroke = isShadow ? '#0F172A' : '#451A03';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Big Round Ears -->
      <circle cx="20" cy="46" r="15" fill="${face}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="80" cy="46" r="15" fill="${face}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Head -->
      <circle cx="50" cy="50" r="30" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Face Mask -->
      <path d="M 30 46 Q 30 32 42 32 Q 50 38 50 42 Q 50 38 58 32 Q 70 32 70 46 Q 70 66 50 68 Q 30 66 30 46 Z" fill="${face}" stroke="${stroke}" stroke-width="2.5"/>
      ${isShadow ? '' : `
      <!-- Eyes -->
      <circle cx="42" cy="42" r="4" fill="#1E293B"/>
      <circle cx="43.5" cy="40.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="58" cy="42" r="4" fill="#1E293B"/>
      <circle cx="59.5" cy="40.5" r="1.5" fill="#FFFFFF"/>
      <!-- Big Monkey Smile -->
      <circle cx="47" cy="52" r="1.5" fill="#78350F"/>
      <circle cx="53" cy="52" r="1.5" fill="#78350F"/>
      <path d="M 42 56 Q 50 63 58 56" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 5. Beruang Sahabat (Bear)
  beruang(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#78350F';
    const muzzle = isShadow ? '#1E293B' : '#FED7AA';
    const stroke = isShadow ? '#0F172A' : '#451A03';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Round Fluffy Ears -->
      <circle cx="24" cy="26" r="13" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="24" cy="26" r="7" fill="${muzzle}"/>
      <circle cx="76" cy="26" r="13" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="76" cy="26" r="7" fill="${muzzle}"/>
      <!-- Big Head -->
      <circle cx="50" cy="52" r="32" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="58" rx="17" ry="13" fill="${muzzle}" stroke="${stroke}" stroke-width="2.5"/>
      ${isShadow ? '' : `
      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="54" rx="6" ry="4.5" fill="#1E293B"/>
      <path d="M 50 58 L 50 63 M 44 63 Q 50 66 50 63 Q 50 66 56 63" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Eyes -->
      <circle cx="38" cy="44" r="4" fill="#1E293B"/>
      <circle cx="39.5" cy="42.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="62" cy="44" r="4" fill="#1E293B"/>
      <circle cx="63.5" cy="42.5" r="1.5" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 6. Singa Raja Hutan (Lion)
  singa(size = 100, isShadow = false) {
    const maneColor = isShadow ? '#1E293B' : '#D97706';
    const faceColor = isShadow ? '#1E293B' : '#FBBF24';
    const strokeColor = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Fluffy Mane -->
      <circle cx="50" cy="50" r="44" fill="${maneColor}" stroke="${strokeColor}" stroke-width="${isShadow ? '4' : '3'}"/>
      <!-- Face -->
      <circle cx="50" cy="53" r="28" fill="${faceColor}" stroke="${strokeColor}" stroke-width="${isShadow ? '0' : '3'}"/>
      ${isShadow ? '' : `
      <!-- Ears -->
      <circle cx="28" cy="24" r="9" fill="${faceColor}" stroke="${strokeColor}" stroke-width="3"/>
      <circle cx="72" cy="24" r="9" fill="${faceColor}" stroke="${strokeColor}" stroke-width="3"/>
      <!-- Cheeks -->
      <circle cx="34" cy="58" r="4" fill="#FCA5A5" opacity="0.6"/>
      <circle cx="66" cy="58" r="4" fill="#FCA5A5" opacity="0.6"/>
      <!-- Eyes -->
      <circle cx="41" cy="46" r="4.5" fill="#1E293B"/>
      <circle cx="42.5" cy="44.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="59" cy="46" r="4.5" fill="#1E293B"/>
      <circle cx="60.5" cy="44.5" r="1.5" fill="#FFFFFF"/>
      <!-- Nose & Mouth -->
      <polygon points="46,54 54,54 50,59" fill="#B45309"/>
      <path d="M 50 59 L 50 64 M 45 64 Q 50 67 50 64 Q 50 67 55 64" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 7. Gajah Belalai (Elephant)
  gajah(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#94A3B8';
    const innerEar = isShadow ? '#1E293B' : '#CBD5E1';
    const stroke = isShadow ? '#0F172A' : '#334155';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Huge Ears -->
      <ellipse cx="22" cy="46" rx="18" ry="24" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="22" cy="46" rx="10" ry="16" fill="${innerEar}"/>
      <ellipse cx="78" cy="46" rx="18" ry="24" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="78" cy="46" rx="10" ry="16" fill="${innerEar}"/>
      <!-- Head -->
      <circle cx="50" cy="46" r="28" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Trunk -->
      <path d="M 45 56 C 45 76 36 84 48 84 C 56 84 55 70 55 56" fill="${skin}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <!-- Eyes -->
      <circle cx="40" cy="40" r="4" fill="#1E293B"/>
      <circle cx="41.5" cy="38.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="60" cy="40" r="4" fill="#1E293B"/>
      <circle cx="61.5" cy="38.5" r="1.5" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 8. Jerapah (Giraffe)
  jerapah(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#FCD34D';
    const spots = isShadow ? '#1E293B' : '#B45309';
    const stroke = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Horns -->
      <path d="M 42 20 L 42 10 M 58 20 L 58 10" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="42" cy="9" r="4.5" fill="${spots}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="58" cy="9" r="4.5" fill="${spots}" stroke="${stroke}" stroke-width="2"/>
      <!-- Ears -->
      <ellipse cx="26" cy="24" rx="8" ry="4" transform="rotate(-25 26 24)" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <ellipse cx="74" cy="24" rx="8" ry="4" transform="rotate(25 74 24)" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Neck -->
      <path d="M 42 48 L 40 94 L 60 94 L 58 48 Z" fill="${skin}" stroke="${stroke}" stroke-width="3"/>
      <!-- Head -->
      <ellipse cx="50" cy="34" rx="19" ry="22" fill="${skin}" stroke="${stroke}" stroke-width="3"/>
      ${isShadow ? `
      <ellipse cx="50" cy="45" rx="15" ry="12" fill="${skin}"/>
      ` : `
      <circle cx="48" cy="62" r="5" fill="${spots}"/>
      <circle cx="53" cy="76" r="6" fill="${spots}"/>
      <ellipse cx="50" cy="45" rx="14" ry="10" fill="#FEF08A" stroke="${stroke}" stroke-width="2"/>
      <circle cx="45" cy="45" r="1.5" fill="${spots}"/>
      <circle cx="55" cy="45" r="1.5" fill="${spots}"/>
      <circle cx="42" cy="29" r="3.5" fill="#1E293B"/>
      <circle cx="43.5" cy="28" r="1" fill="#FFFFFF"/>
      <circle cx="58" cy="29" r="3.5" fill="#1E293B"/>
      <circle cx="59.5" cy="28" r="1" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 9. Bebek Ceria (Duck)
  bebek(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#FBBF24';
    const beak = isShadow ? '#1E293B' : '#F97316';
    const stroke = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Duck Body -->
      <ellipse cx="52" cy="64" rx="28" ry="22" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Wing -->
      <ellipse cx="54" cy="64" rx="16" ry="10" fill="${isShadow ? skin : '#FDE047'}" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Head -->
      <circle cx="42" cy="40" r="20" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Beak -->
      <ellipse cx="22" cy="44" rx="12" ry="7" fill="${beak}" stroke="${stroke}" stroke-width="2.5"/>
      ${isShadow ? '' : `
      <!-- Eye -->
      <circle cx="38" cy="36" r="4" fill="#1E293B"/>
      <circle cx="39.5" cy="34.5" r="1.5" fill="#FFFFFF"/>
      <!-- Cheeks -->
      <circle cx="46" cy="44" r="3.5" fill="#FCA5A5" opacity="0.7"/>
      `}
    </svg>`;
  },

  // 10. Katak Hijau (Frog)
  katak(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#22C55E';
    const belly = isShadow ? '#1E293B' : '#BBF7D0';
    const stroke = isShadow ? '#0F172A' : '#14532D';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Frog Big Eyes Sockets -->
      <circle cx="32" cy="32" r="15" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="68" cy="32" r="15" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Body -->
      <ellipse cx="50" cy="56" rx="36" ry="28" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Belly -->
      <ellipse cx="50" cy="62" rx="22" ry="16" fill="${belly}"/>
      ${isShadow ? '' : `
      <!-- Eyes -->
      <circle cx="32" cy="32" r="7" fill="#FFFFFF"/>
      <circle cx="32" cy="32" r="4.5" fill="#1E293B"/>
      <circle cx="33.5" cy="30.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="68" cy="32" r="7" fill="#FFFFFF"/>
      <circle cx="68" cy="32" r="4.5" fill="#1E293B"/>
      <circle cx="69.5" cy="30.5" r="1.5" fill="#FFFFFF"/>
      <!-- Smile -->
      <path d="M 36 54 Q 50 64 64 54" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="30" cy="56" r="4" fill="#FCA5A5" opacity="0.6"/>
      <circle cx="70" cy="56" r="4" fill="#FCA5A5" opacity="0.6"/>
      `}
    </svg>`;
  },

  // 11. Kupu-Kupu Cantik (Butterfly)
  kupuKupu(size = 100, isShadow = false) {
    const wing1 = isShadow ? '#1E293B' : '#EC4899';
    const wing2 = isShadow ? '#1E293B' : '#A855F7';
    const body = isShadow ? '#1E293B' : '#1E293B';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Left Upper Wing -->
      <path d="M 50 48 C 30 16 10 24 16 48 C 20 62 45 54 50 48 Z" fill="${wing1}" stroke="#0F172A" stroke-width="3"/>
      <!-- Right Upper Wing -->
      <path d="M 50 48 C 70 16 90 24 84 48 C 80 62 55 54 50 48 Z" fill="${wing1}" stroke="#0F172A" stroke-width="3"/>
      <!-- Lower Wings -->
      <path d="M 50 52 C 34 60 20 78 36 84 C 48 88 48 64 50 52 Z" fill="${wing2}" stroke="#0F172A" stroke-width="2.5"/>
      <path d="M 50 52 C 66 60 80 78 64 84 C 52 88 52 64 50 52 Z" fill="${wing2}" stroke="#0F172A" stroke-width="2.5"/>
      <!-- Body & Antenna -->
      <ellipse cx="50" cy="52" rx="4" ry="20" fill="${body}"/>
      <path d="M 48 34 Q 40 24 38 22 M 52 34 Q 60 24 62 22" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
      ${isShadow ? '' : `
      <circle cx="32" cy="40" r="5" fill="#FEF08A"/>
      <circle cx="68" cy="40" r="5" fill="#FEF08A"/>
      `}
    </svg>`;
  },

  // 12. Apel Merah Segar (Apple)
  apel(size = 100, isShadow = false) {
    const apple = isShadow ? '#1E293B' : '#EF4444';
    const leaf = isShadow ? '#1E293B' : '#22C55E';
    const stroke = isShadow ? '#0F172A' : '#7F1D1D';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Stem & Leaf -->
      <path d="M 50 28 Q 54 14 62 16" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="62" cy="20" rx="9" ry="5" transform="rotate(-25 62 20)" fill="${leaf}" stroke="${stroke}" stroke-width="2"/>
      <!-- Apple Shape -->
      <path d="M 50 36 C 36 28 16 36 16 56 C 16 80 34 88 50 88 C 66 88 84 80 84 56 C 84 36 64 28 50 36 Z" fill="${apple}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <!-- Glossy Highlight -->
      <ellipse cx="32" cy="48" rx="5" ry="10" transform="rotate(-20 32 48)" fill="#FFFFFF" opacity="0.5"/>
      `}
    </svg>`;
  },

  // 13. Pisang Manis (Banana)
  pisang(size = 100, isShadow = false) {
    const banana = isShadow ? '#1E293B' : '#FBBF24';
    const tip = isShadow ? '#1E293B' : '#78350F';
    const stroke = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 28 24 Q 52 20 74 46 Q 66 78 30 76 Q 56 68 56 46 Q 44 32 28 24 Z" fill="${banana}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <circle cx="28" cy="24" r="4" fill="${tip}"/>
      <circle cx="30" cy="76" r="4" fill="${tip}"/>
      ${isShadow ? '' : `
      <path d="M 38 32 Q 54 38 62 52" stroke="#FDE047" stroke-width="3" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 14. Wortel Oranye (Carrot)
  wortel(size = 100, isShadow = false) {
    const carrot = isShadow ? '#1E293B' : '#F97316';
    const leaf = isShadow ? '#1E293B' : '#22C55E';
    const stroke = isShadow ? '#0F172A' : '#7C2D12';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 50 28 Q 38 12 30 20 Q 42 26 48 30" fill="${leaf}" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M 50 28 Q 50 6 52 8 Q 54 20 50 30" fill="${leaf}" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M 50 28 Q 62 12 70 20 Q 58 26 52 30" fill="${leaf}" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M 32 32 Q 50 28 68 32 Q 56 68 50 90 Q 44 68 32 32 Z" fill="${carrot}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <line x1="40" y1="44" x2="52" y2="44" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="46" y1="58" x2="60" y2="58" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 15. Tulang Lezat (Bone)
  tulang(size = 100, isShadow = false) {
    const color = isShadow ? '#1E293B' : '#F8FAFC';
    const stroke = isShadow ? '#0F172A' : '#94A3B8';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <g transform="rotate(35 50 50)">
        <rect x="28" y="44" width="44" height="12" rx="4" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <circle cx="26" cy="42" r="8.5" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <circle cx="26" cy="58" r="8.5" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <circle cx="74" cy="42" r="8.5" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <circle cx="74" cy="58" r="8.5" fill="${color}" stroke="${stroke}" stroke-width="3"/>
        <rect x="26" y="45" width="48" height="10" fill="${color}"/>
      </g>
    </svg>`;
  },

  // 16. Toples Madu (Honey)
  madu(size = 100, isShadow = false) {
    const pot = isShadow ? '#1E293B' : '#F59E0B';
    const honey = isShadow ? '#1E293B' : '#FEF08A';
    const stroke = isShadow ? '#0F172A' : '#78350F';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="50" cy="28" rx="24" ry="7" fill="${honey}" stroke="${stroke}" stroke-width="3"/>
      <path d="M 28 32 C 18 46 20 78 50 84 C 80 78 82 46 72 32 Z" fill="${pot}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <path d="M 45 32 C 45 44 55 44 55 32" fill="${honey}" stroke="${stroke}" stroke-width="2"/>
      <ellipse cx="50" cy="58" rx="15" ry="9" fill="#FBBF24" opacity="0.7"/>
      <text x="50" y="62" font-size="12" font-weight="900" text-anchor="middle" fill="#78350F">MADU</text>
      `}
    </svg>`;
  },

  // 17. Ayam Ibu (Hen)
  ayam(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#EA580C';
    const comb = isShadow ? '#1E293B' : '#EF4444';
    const beak = isShadow ? '#1E293B' : '#FBBF24';
    const stroke = isShadow ? '#0F172A' : '#7C2D12';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Comb (Jengger) -->
      <circle cx="48" cy="22" r="6" fill="${comb}"/>
      <circle cx="56" cy="20" r="7" fill="${comb}"/>
      <!-- Body -->
      <ellipse cx="52" cy="62" rx="28" ry="22" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Head -->
      <circle cx="50" cy="36" r="18" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Beak -->
      <polygon points="34,36 34,44 24,40" fill="${beak}" stroke="${stroke}" stroke-width="2"/>
      <polygon points="34,44 40,44 37,50" fill="${comb}"/>
      ${isShadow ? '' : `
      <!-- Wing -->
      <ellipse cx="60" cy="62" rx="16" ry="11" fill="#C2410C" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Eye -->
      <circle cx="44" cy="34" r="3.5" fill="#1E293B"/>
      <circle cx="45" cy="33" r="1" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 18. Anak Ayam Cilik (Chick)
  anakAyam(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#FDE047';
    const beak = isShadow ? '#1E293B' : '#F97316';
    const stroke = isShadow ? '#0F172A' : '#A16207';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Little Round Body -->
      <circle cx="50" cy="56" r="26" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Beak -->
      <polygon points="30,52 30,60 22,56" fill="${beak}" stroke="${stroke}" stroke-width="2"/>
      ${isShadow ? '' : `
      <!-- Wing -->
      <ellipse cx="58" cy="58" rx="10" ry="7" fill="#FEF08A" stroke="${stroke}" stroke-width="2"/>
      <!-- Big Cute Eye -->
      <circle cx="38" cy="48" r="4.5" fill="#1E293B"/>
      <circle cx="39.5" cy="46.5" r="1.5" fill="#FFFFFF"/>
      <circle cx="44" cy="56" r="3.5" fill="#FCA5A5" opacity="0.6"/>
      `}
    </svg>`;
  },

  // 19. Sapi Ramah (Cow)
  sapi(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#F8FAFC';
    const spot = isShadow ? '#1E293B' : '#1E293B';
    const muzzle = isShadow ? '#1E293B' : '#FBCFE8';
    const stroke = isShadow ? '#0F172A' : '#334155';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Horns -->
      <path d="M 32 24 Q 28 14 20 18 M 68 24 Q 72 14 80 18" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
      <!-- Ears -->
      <ellipse cx="20" cy="32" rx="10" ry="5" transform="rotate(-15 20 32)" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <ellipse cx="80" cy="32" rx="10" ry="5" transform="rotate(15 80 32)" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Head -->
      <ellipse cx="50" cy="44" rx="26" ry="24" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      <path d="M 34 32 Q 44 26 42 42 Q 30 46 34 32 Z" fill="${spot}"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="58" rx="20" ry="14" fill="${muzzle}" stroke="${stroke}" stroke-width="2.5"/>
      <circle cx="43" cy="58" r="3" fill="#831843"/>
      <circle cx="57" cy="58" r="3" fill="#831843"/>
      ${isShadow ? '' : `
      <circle cx="36" cy="38" r="3.5" fill="#1E293B"/>
      <circle cx="64" cy="38" r="3.5" fill="#1E293B"/>
      `}
    </svg>`;
  },

  // 20. Ikan Berenang (Fish)
  ikan(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#38BDF8';
    const fins = isShadow ? '#1E293B' : '#F43F5E';
    const stroke = isShadow ? '#0F172A' : '#0369A1';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Tail -->
      <polygon points="80,50 94,32 90,50 94,68" fill="${fins}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <!-- Dorsal Fin -->
      <path d="M 44 32 Q 52 18 64 28" fill="${fins}" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Body -->
      <ellipse cx="50" cy="50" rx="34" ry="22" fill="${skin}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <!-- Eye -->
      <circle cx="30" cy="46" r="4.5" fill="#FFFFFF"/>
      <circle cx="29" cy="46" r="3" fill="#1E293B"/>
      <!-- Gill & Fin -->
      <path d="M 44 42 Q 48 50 44 58" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="54" cy="52" rx="8" ry="5" fill="${fins}"/>
      `}
    </svg>`;
  },

  // 21. Mobil Keren (Car)
  mobil(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#EF4444';
    const stroke = isShadow ? '#0F172A' : '#7F1D1D';
    const wheel = isShadow ? '#1E293B' : '#1E293B';
    const windowColor = isShadow ? '#1E293B' : '#93C5FD';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 16 62 Q 16 54 24 54 L 34 54 L 42 34 Q 45 28 54 28 L 68 28 Q 76 28 80 38 L 86 54 L 88 54 Q 94 54 94 62 L 94 72 Q 94 76 88 76 L 18 76 Q 12 76 16 62 Z" fill="${body}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      ${isShadow ? `
      <circle cx="32" cy="76" r="14" fill="${body}"/>
      <circle cx="76" cy="76" r="14" fill="${body}"/>
      ` : `
      <path d="M 44 36 L 56 36 L 56 50 L 36 50 Z" fill="${windowColor}" stroke="${stroke}" stroke-width="2"/>
      <path d="M 60 36 L 73 36 L 79 50 L 60 50 Z" fill="${windowColor}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="88" cy="62" r="4" fill="#FDE047"/>
      <circle cx="32" cy="74" r="12" fill="${wheel}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="32" cy="74" r="5" fill="#E2E8F0"/>
      <circle cx="76" cy="74" r="12" fill="${wheel}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="76" cy="74" r="5" fill="#E2E8F0"/>
      `}
    </svg>`;
  },

  // 22. Bus Sekolah (Bus)
  bus(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#FBBF24';
    const stroke = isShadow ? '#0F172A' : '#78350F';
    const wheel = isShadow ? '#1E293B' : '#1E293B';
    const windowColor = isShadow ? '#1E293B' : '#93C5FD';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="12" y="28" width="76" height="46" rx="10" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? `
      <circle cx="30" cy="76" r="14" fill="${body}"/>
      <circle cx="70" cy="76" r="14" fill="${body}"/>
      ` : `
      <rect x="20" y="36" width="16" height="16" rx="4" fill="${windowColor}" stroke="${stroke}" stroke-width="2"/>
      <rect x="42" y="36" width="16" height="16" rx="4" fill="${windowColor}" stroke="${stroke}" stroke-width="2"/>
      <rect x="64" y="36" width="16" height="16" rx="4" fill="${windowColor}" stroke="${stroke}" stroke-width="2"/>
      <line x1="12" y1="58" x2="88" y2="58" stroke="${stroke}" stroke-width="3"/>
      <circle cx="30" cy="74" r="11" fill="${wheel}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="30" cy="74" r="4" fill="#E2E8F0"/>
      <circle cx="70" cy="74" r="11" fill="${wheel}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="70" cy="74" r="4" fill="#E2E8F0"/>
      `}
    </svg>`;
  },

  // 23. Pesawat Terbang (Airplane)
  pesawat(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#3B82F6';
    const stroke = isShadow ? '#0F172A' : '#1D4ED8';
    const detail = isShadow ? '#1E293B' : '#93C5FD';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="50" cy="50" rx="36" ry="15" fill="${body}" stroke="${stroke}" stroke-width="3"/>
      <path d="M 40 46 L 24 16 L 38 16 L 56 46 Z" fill="${body}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 40 54 L 24 84 L 38 84 L 56 54 Z" fill="${body}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 76 46 L 86 28 L 94 28 L 86 50 Z" fill="${body}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <path d="M 18 48 Q 24 44 32 46 L 30 52 Q 22 52 18 48 Z" fill="${detail}" stroke="${stroke}" stroke-width="1.5"/>
      `}
    </svg>`;
  },

  // 24. Spidey Cilik Pahlawan (Spidey)
  spidey(size = 100, isShadow = false) {
    const suit = isShadow ? '#1E293B' : '#EF4444';
    const blue = isShadow ? '#1E293B' : '#2563EB';
    const eye = isShadow ? '#1E293B' : '#FFFFFF';
    const stroke = isShadow ? '#0F172A' : '#1E293B';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="36" y="74" width="10" height="18" rx="5" fill="${blue}" stroke="${stroke}" stroke-width="2.5"/>
      <rect x="54" y="74" width="10" height="18" rx="5" fill="${blue}" stroke="${stroke}" stroke-width="2.5"/>
      <rect x="30" y="50" width="40" height="28" rx="10" fill="${suit}" stroke="${stroke}" stroke-width="3"/>
      <path d="M 28 54 Q 16 62 20 74" stroke="${suit}" stroke-width="9" stroke-linecap="round"/>
      <path d="M 72 54 Q 84 62 80 74" stroke="${suit}" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="50" cy="34" rx="28" ry="24" fill="${suit}" stroke="${stroke}" stroke-width="3"/>
      ${isShadow ? '' : `
      <path d="M 32 32 Q 40 22 46 32 Q 40 40 32 32 Z" fill="${eye}" stroke="${stroke}" stroke-width="2.5"/>
      <path d="M 68 32 Q 60 22 54 32 Q 60 40 68 32 Z" fill="${eye}" stroke="${stroke}" stroke-width="2.5"/>
      `}
    </svg>`;
  },

  // 25. Spideybot (Robot)
  robot(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#3B82F6';
    const stroke = isShadow ? '#0F172A' : '#1E293B';
    const eye = isShadow ? '#1E293B' : '#FFFFFF';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <line x1="50" y1="24" x2="50" y2="12" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="50" cy="10" r="5" fill="${isShadow ? '#1E293B' : '#EF4444'}" stroke="${stroke}" stroke-width="2"/>
      <path d="M 24 55 Q 12 60 16 78 M 28 65 Q 18 80 30 88" stroke="${stroke}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M 76 55 Q 88 60 84 78 M 72 65 Q 82 80 70 88" stroke="${stroke}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <ellipse cx="50" cy="54" rx="30" ry="24" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <circle cx="40" cy="50" r="6" fill="${eye}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="41" cy="50" r="2.5" fill="#1E293B"/>
      <circle cx="60" cy="50" r="6" fill="${eye}" stroke="${stroke}" stroke-width="2"/>
      <circle cx="59" cy="50" r="2.5" fill="#1E293B"/>
      <path d="M 44 62 Q 50 67 56 62" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      `}
    </svg>`;
  },

  // 26. Topeng Pahlawan (Mask)
  topeng(size = 100, isShadow = false, direction = 'front') {
    const mask = isShadow ? '#1E293B' : '#EF4444';
    const stroke = isShadow ? '#0F172A' : '#7F1D1D';
    const eye = isShadow ? '#1E293B' : '#FFFFFF';

    if (direction === 'right' || direction === 'left') {
      const isLeft = direction === 'left';
      return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg topeng-dir-${direction} ${isShadow ? 'ill-shadow' : ''}">
      <g ${isLeft ? 'transform="translate(100, 0) scale(-1, 1)"' : ''}>
        <!-- Asymmetric 3/4 Superhero Head Contour -->
        <path d="M 22 50 C 22 26 44 14 68 18 C 84 22 90 38 86 58 C 82 76 68 90 48 90 C 30 90 22 72 22 50 Z" fill="${mask}" stroke="${stroke}" stroke-width="4"/>
        ${isShadow ? '' : `
        <!-- Spidey Web Lines radiating from forward nose bridge (64, 44) -->
        <path d="M 64 44 L 68 18" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 40 16" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 22 36" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 22 56" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 32 82" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 54 90" stroke="#991B1B" stroke-width="2"/>
        <path d="M 64 44 L 86 58" stroke="#991B1B" stroke-width="2"/>
        <!-- Curved concentric web arcs -->
        <path d="M 52 24 Q 65 30 74 27" fill="none" stroke="#991B1B" stroke-width="2"/>
        <path d="M 38 30 Q 58 40 78 38" fill="none" stroke="#991B1B" stroke-width="2"/>
        <path d="M 30 48 Q 58 56 82 54" fill="none" stroke="#991B1B" stroke-width="2"/>
        <path d="M 36 68 Q 54 70 72 68" fill="none" stroke="#991B1B" stroke-width="2"/>
        <!-- Distinctive Spidey Eyes in 3/4 perspective -->
        <!-- Rear Eye (further away) -->
        <path d="M 32 44 Q 42 32 48 40 Q 42 50 32 44 Z" fill="${eye}" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
        <!-- Front Eye (prominent, angled sharply facing right) -->
        <path d="M 56 42 Q 72 26 84 42 Q 72 58 56 46 Z" fill="${eye}" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
        `}
      </g>
    </svg>`;
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="50" cy="50" rx="36" ry="42" fill="${mask}" stroke="${stroke}" stroke-width="4"/>
      ${isShadow ? '' : `
      <line x1="50" y1="8" x2="50" y2="92" stroke="#991B1B" stroke-width="2"/>
      <line x1="14" y1="50" x2="86" y2="50" stroke="#991B1B" stroke-width="2"/>
      <ellipse cx="50" cy="50" rx="20" ry="24" fill="none" stroke="#991B1B" stroke-width="2" stroke-dasharray="4 3"/>
      <path d="M 28 46 Q 38 32 46 46 Q 38 56 28 46 Z" fill="${eye}" stroke="#1E293B" stroke-width="3"/>
      <path d="M 72 46 Q 62 32 54 46 Q 62 56 72 46 Z" fill="${eye}" stroke="#1E293B" stroke-width="3"/>
      `}
    </svg>`;
  },

  // 27. Bintang Bersinar (Star)
  bintang(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#FBBF24';
    const stroke = isShadow ? '#0F172A' : '#D97706';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 50 10 L 61 35 L 88 38 L 68 56 L 73 83 L 50 70 L 27 83 L 32 56 L 12 38 L 39 35 Z" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <circle cx="42" cy="38" r="4" fill="#FEF08A"/>
      `}
    </svg>`;
  },

  // 28. Jaring Laba-Laba (Spider Web)
  jaring(size = 100, isShadow = false) {
    const stroke = isShadow ? '#1E293B' : '#94A3B8';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <line x1="50" y1="10" x2="50" y2="90" stroke="${stroke}" stroke-width="3.5"/>
      <line x1="10" y1="50" x2="90" y2="50" stroke="${stroke}" stroke-width="3.5"/>
      <line x1="22" y1="22" x2="78" y2="78" stroke="${stroke}" stroke-width="3.5"/>
      <line x1="22" y1="78" x2="78" y2="22" stroke="${stroke}" stroke-width="3.5"/>
      <circle cx="50" cy="50" r="16" fill="none" stroke="${stroke}" stroke-width="3"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="${stroke}" stroke-width="3"/>
    </svg>`;
  },

  // 29. Baterai Energi (Battery)
  baterai(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#10B981';
    const stroke = isShadow ? '#0F172A' : '#047857';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="22" y="32" width="56" height="42" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="4"/>
      <rect x="78" y="44" width="8" height="18" rx="3" fill="${stroke}"/>
      ${isShadow ? '' : `
      <!-- Lightning bolt -->
      <polygon points="52,38 42,54 50,54 46,68 60,50 52,50" fill="#FEF08A" stroke="${stroke}" stroke-width="1.5"/>
      `}
    </svg>`;
  },

  // 30. Piala Emas (Trophy)
  piala(size = 100, isShadow = false) {
    const gold = isShadow ? '#1E293B' : '#FBBF24';
    const stroke = isShadow ? '#0F172A' : '#B45309';

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Handles -->
      <path d="M 30 36 C 16 36 16 54 32 54" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 70 36 C 84 36 84 54 68 54" stroke="${stroke}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <!-- Cup -->
      <path d="M 28 26 L 72 26 C 72 52 58 64 50 64 C 42 64 28 52 28 26 Z" fill="${gold}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      <!-- Stem & Base -->
      <rect x="46" y="64" width="8" height="12" fill="${gold}" stroke="${stroke}" stroke-width="3"/>
      <rect x="32" y="76" width="36" height="12" rx="4" fill="${isShadow ? '#1E293B' : '#B45309'}" stroke="${stroke}" stroke-width="3"/>
      ${isShadow ? '' : `
      <polygon points="50,34 53,42 62,43 55,49 57,58 50,53 43,58 45,49 38,43 47,42" fill="#FEF08A"/>
      `}
    </svg>`;
  },

  // 31. Batu Besar (Rock / Boulder)
  batu(size = 100, isShadow = false) {
    const rock = isShadow ? '#1E293B' : '#64748B';
    const stroke = isShadow ? '#0F172A' : '#334155';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 20 72 L 16 46 L 36 24 L 68 22 L 86 42 L 82 72 Z" fill="${rock}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <path d="M 36 24 L 46 44 L 68 22" stroke="${stroke}" stroke-width="2.5" fill="none"/>
      <path d="M 46 44 L 42 72" stroke="${stroke}" stroke-width="2.5" fill="none"/>
      <ellipse cx="62" cy="54" rx="4" ry="2" fill="#94A3B8"/>
      `}
    </svg>`;
  },

  // 32. Lingkaran Biru (Circle)
  lingkaran(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#3B82F6';
    const stroke = isShadow ? '#0F172A' : '#1D4ED8';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <circle cx="50" cy="50" r="38" fill="${fill}" stroke="${stroke}" stroke-width="4.5"/>
      ${isShadow ? '' : `<circle cx="38" cy="36" r="8" fill="#93C5FD" opacity="0.6"/>`}
    </svg>`;
  },

  // 33. Kotak Merah (Square)
  kotak(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#EF4444';
    const stroke = isShadow ? '#0F172A' : '#B91C1C';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="16" y="16" width="68" height="68" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="4.5"/>
      ${isShadow ? '' : `<rect x="24" y="24" width="20" height="20" rx="4" fill="#FCA5A5" opacity="0.6"/>`}
    </svg>`;
  },

  // 34. Segitiga Emas (Triangle)
  segitiga(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#F59E0B';
    const stroke = isShadow ? '#0F172A' : '#B45309';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <polygon points="50,14 88,80 12,80" fill="${fill}" stroke="${stroke}" stroke-width="4.5" stroke-linejoin="round"/>
      ${isShadow ? '' : `<polygon points="50,26 68,62 38,62" fill="#FDE68A" opacity="0.6"/>`}
    </svg>`;
  },

  // 35. Balon Merah Ceria (Balloon)
  balon(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#F43F5E';
    const stroke = isShadow ? '#0F172A' : '#BE123C';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="50" cy="42" rx="28" ry="34" fill="${fill}" stroke="${stroke}" stroke-width="3.5"/>
      <polygon points="46,76 54,76 50,82" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
      <path d="M 50 82 Q 44 90 52 96" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${isShadow ? '' : `<ellipse cx="40" cy="30" rx="5" ry="10" transform="rotate(-20 40 30)" fill="#FECDD3" opacity="0.8"/>`}
    </svg>`;
  },

  // 36. Api Menyala (Fire)
  api(size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#EA580C';
    const stroke = isShadow ? '#0F172A' : '#9A3412';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <path d="M 50 14 C 54 30 76 42 76 64 C 76 80 64 88 50 88 C 36 88 24 80 24 64 C 24 46 42 34 50 14 Z" fill="${fill}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      ${isShadow ? '' : `
      <path d="M 50 44 C 52 54 62 62 62 72 C 62 80 56 84 50 84 C 44 84 38 80 38 72 C 38 60 48 54 50 44 Z" fill="#FDE047"/>
      `}
    </svg>`;
  },

  // 37. Bunga Cantik (Flower)
  bunga(size = 100, isShadow = false) {
    const petal = isShadow ? '#1E293B' : '#EC4899';
    const center = isShadow ? '#1E293B' : '#FBBF24';
    const stroke = isShadow ? '#0F172A' : '#9D174D';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <circle cx="50" cy="28" r="14" fill="${petal}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="70" cy="42" r="14" fill="${petal}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="62" cy="68" r="14" fill="${petal}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="38" cy="68" r="14" fill="${petal}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="30" cy="42" r="14" fill="${petal}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="50" cy="50" r="15" fill="${center}" stroke="${stroke}" stroke-width="3"/>
    </svg>`;
  },

  // 38. Pohon Rindang (Tree)
  pohon(size = 100, isShadow = false) {
    const leaves = isShadow ? '#1E293B' : '#10B981';
    const trunk = isShadow ? '#1E293B' : '#78350F';
    const stroke = isShadow ? '#0F172A' : '#047857';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="44" y="60" width="12" height="26" fill="${trunk}" stroke="${isShadow ? stroke : '#451A03'}" stroke-width="3"/>
      <ellipse cx="50" cy="42" rx="32" ry="26" fill="${leaves}" stroke="${stroke}" stroke-width="3.5"/>
      <ellipse cx="38" cy="34" rx="16" ry="14" fill="${leaves}"/>
      <ellipse cx="62" cy="34" rx="16" ry="14" fill="${leaves}"/>
    </svg>`;
  },

  // 39. Rumah Mungil (House)
  rumah(size = 100, isShadow = false) {
    const roof = isShadow ? '#1E293B' : '#DC2626';
    const wall = isShadow ? '#1E293B' : '#FEF3C7';
    const stroke = isShadow ? '#0F172A' : '#991B1B';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <polygon points="50,18 86,46 14,46" fill="${roof}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="22" y="46" width="56" height="38" fill="${wall}" stroke="${isShadow ? stroke : '#B45309'}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <rect x="42" y="58" width="16" height="26" fill="#78350F"/>
      <circle cx="53" cy="72" r="2" fill="#FBBF24"/>
      `}
    </svg>`;
  },

  // 40. Gedung Bertingkat (Building / Skyscraper)
  gedung(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#0284C7';
    const stroke = isShadow ? '#0F172A' : '#0369A1';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <rect x="26" y="16" width="48" height="72" rx="4" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      ${isShadow ? '' : `
      <rect x="34" y="24" width="8" height="10" fill="#E0F2FE"/>
      <rect x="46" y="24" width="8" height="10" fill="#E0F2FE"/>
      <rect x="58" y="24" width="8" height="10" fill="#E0F2FE"/>
      <rect x="34" y="40" width="8" height="10" fill="#E0F2FE"/>
      <rect x="46" y="40" width="8" height="10" fill="#E0F2FE"/>
      <rect x="58" y="40" width="8" height="10" fill="#E0F2FE"/>
      <rect x="34" y="56" width="8" height="10" fill="#E0F2FE"/>
      <rect x="46" y="56" width="8" height="10" fill="#E0F2FE"/>
      <rect x="58" y="56" width="8" height="10" fill="#E0F2FE"/>
      `}
    </svg>`;
  },

  // 41. Semut Kecil (Ant)
  semut(size = 100, isShadow = false) {
    const skin = isShadow ? '#1E293B' : '#78350F';
    const stroke = isShadow ? '#0F172A' : '#451A03';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="30" cy="50" rx="10" ry="9" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <ellipse cx="48" cy="50" rx="7" ry="7" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <ellipse cx="68" cy="50" rx="14" ry="11" fill="${skin}" stroke="${stroke}" stroke-width="2.5"/>
      <!-- Legs -->
      <line x1="48" y1="44" x2="40" y2="30" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="48" y1="56" x2="40" y2="70" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="52" y1="44" x2="60" y2="30" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="52" y1="56" x2="60" y2="70" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Antenna -->
      <path d="M 24 44 Q 18 36 14 38" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 24 56 Q 18 64 14 62" stroke="${stroke}" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${isShadow ? '' : `<circle cx="28" cy="46" r="2" fill="#FFFFFF"/>`}
    </svg>`;
  },

  // 42. Burung Pipit (Bird)
  burung(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#0EA5E9';
    const beak = isShadow ? '#1E293B' : '#F59E0B';
    const stroke = isShadow ? '#0F172A' : '#0369A1';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <ellipse cx="48" cy="54" rx="22" ry="18" fill="${body}" stroke="${stroke}" stroke-width="3"/>
      <circle cx="62" cy="42" r="14" fill="${body}" stroke="${stroke}" stroke-width="3"/>
      <polygon points="74,40 86,44 74,48" fill="${beak}" stroke="${stroke}" stroke-width="2"/>
      <ellipse cx="38" cy="56" rx="14" ry="8" transform="rotate(-15 38 56)" fill="#38BDF8"/>
      ${isShadow ? '' : `
      <circle cx="64" cy="40" r="3" fill="#1E293B"/>
      <circle cx="65" cy="39" r="1" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 43. Paus Raksasa (Whale)
  paus(size = 100, isShadow = false) {
    const body = isShadow ? '#1E293B' : '#3B82F6';
    const belly = isShadow ? '#1E293B' : '#DBEAFE';
    const stroke = isShadow ? '#0F172A' : '#1D4ED8';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <!-- Water Spout -->
      ${isShadow ? '' : `
      <path d="M 40 28 Q 40 16 34 14 M 40 28 Q 44 14 50 16" stroke="#60A5FA" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `}
      <!-- Body -->
      <path d="M 16 54 C 16 38 44 32 68 38 C 84 42 86 54 82 64 C 76 72 44 76 24 72 C 18 70 16 62 16 54 Z" fill="${body}" stroke="${stroke}" stroke-width="3.5"/>
      <!-- Tail -->
      <path d="M 80 58 L 92 48 L 90 68 Z" fill="${body}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>
      <!-- Belly -->
      <path d="M 24 64 C 36 70 54 70 66 64 C 54 74 34 74 24 64 Z" fill="${belly}"/>
      ${isShadow ? '' : `
      <circle cx="34" cy="48" r="3.5" fill="#1E293B"/>
      <circle cx="35" cy="47" r="1.2" fill="#FFFFFF"/>
      `}
    </svg>`;
  },

  // 44. Panah Arah (Arrow Direction)
  panah(dir = 'right', size = 100, isShadow = false) {
    const fill = isShadow ? '#1E293B' : '#3B82F6';
    const stroke = isShadow ? '#0F172A' : '#1D4ED8';
    let rot = 0;
    if (dir === 'left' || dir.includes('kiri') || dir.includes('left')) rot = 180;
    else if (dir === 'up' || dir.includes('atas') || dir.includes('up')) rot = 270;
    else if (dir === 'down' || dir.includes('bawah') || dir.includes('down')) rot = 90;

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="ill-svg ${isShadow ? 'ill-shadow' : ''}">
      <g transform="rotate(${rot} 50 50)">
        <polygon points="50,20 84,50 50,80 50,62 16,62 16,38 50,38" fill="${fill}" stroke="${stroke}" stroke-width="4.5" stroke-linejoin="round"/>
      </g>
    </svg>`;
  },

  // Universal Visual Resolver
  // Menerima teks, emoji, atau nama benda -> menghasilkan elemen visual SVG raksasa yang indah!
  render(text, { isShadow = false, size = 96, direction = null } = {}) {
    if (!text) return '';
    const lower = String(text).toLowerCase();

    // 1. Animals
    if (lower.includes('kucing') || lower.includes('cat') || text.includes('🐱')) return this.kucing(size, isShadow);
    if (lower.includes('anjing') || lower.includes('dog') || lower.includes('puppy') || text.includes('🐶')) return this.anjing(size, isShadow);
    if (lower.includes('kelinci') || lower.includes('rabbit') || text.includes('🐰')) return this.kelinci(size, isShadow);
    if (lower.includes('monyet') || lower.includes('monkey') || text.includes('🐵')) return this.monyet(size, isShadow);
    if (lower.includes('beruang') || lower.includes('bear') || text.includes('🐻')) return this.beruang(size, isShadow);
    if (lower.includes('singa') || lower.includes('lion') || text.includes('🦁')) return this.singa(size, isShadow);
    if (lower.includes('gajah') || lower.includes('elephant') || text.includes('🐘')) return this.gajah(size, isShadow);
    if (lower.includes('jerapah') || lower.includes('giraffe') || text.includes('🦒')) return this.jerapah(size, isShadow);
    if (lower.includes('anak ayam') || lower.includes('chick') || text.includes('🐤') || text.includes('🐣')) return this.anakAyam(size, isShadow);
    if (lower.includes('ayam') || lower.includes('hen') || text.includes('🐔')) return this.ayam(size, isShadow);
    if (lower.includes('bebek') || lower.includes('duck') || text.includes('🦆')) return this.bebek(size, isShadow);
    if (lower.includes('katak') || lower.includes('frog') || text.includes('🐸')) return this.katak(size, isShadow);
    if (lower.includes('kupu') || lower.includes('butterfly') || text.includes('🦋')) return this.kupuKupu(size, isShadow);
    if (lower.includes('sapi') || lower.includes('cow') || lower.includes('lembu') || text.includes('🐮') || text.includes('🐂')) return this.sapi(size, isShadow);
    if (lower.includes('ikan') || lower.includes('fish') || text.includes('🐟')) return this.ikan(size, isShadow);
    if (lower.includes('semut') || lower.includes('ant') || text.includes('🐜')) return this.semut(size, isShadow);
    if (lower.includes('burung') || lower.includes('bird') || text.includes('🐦')) return this.burung(size, isShadow);
    if (lower.includes('paus') || lower.includes('whale') || text.includes('🐋')) return this.paus(size, isShadow);

    // 2. Foods & Fruits
    if (lower.includes('apel') || lower.includes('apple') || text.includes('🍎')) return this.apel(size, isShadow);
    if (lower.includes('pisang') || lower.includes('banana') || text.includes('🍌')) return this.pisang(size, isShadow);
    if (lower.includes('wortel') || lower.includes('carrot') || text.includes('🥕')) return this.wortel(size, isShadow);
    if (lower.includes('tulang') || lower.includes('bone') || text.includes('🦴')) return this.tulang(size, isShadow);
    if (lower.includes('madu') || lower.includes('honey') || text.includes('🍯')) return this.madu(size, isShadow);

    // 3. Vehicles
    if (lower.includes('mobil') || lower.includes('car') || text.includes('🚗')) return this.mobil(size, isShadow);
    if (lower.includes('bus') || text.includes('🚌')) return this.bus(size, isShadow);
    if (lower.includes('pesawat') || lower.includes('plane') || text.includes('✈️')) return this.pesawat(size, isShadow);

    // 4. Hero & Robot
    if (lower.includes('topeng') || lower.includes('mask') || text.includes('🎭')) {
      let dir = direction;
      if (!dir) {
        if (lower.includes('kiri') || lower.includes('left')) dir = 'left';
        else if (lower.includes('kanan') || lower.includes('right')) dir = 'right';
      }
      return this.topeng(size, isShadow, dir);
    }
    if (lower.includes('spidey') || lower.includes('pahlawan') || lower.includes('hero') || text.includes('🦸') || text.includes('🕷️') || text.includes('🕷')) return this.spidey(size, isShadow);
    if (lower.includes('robot') || lower.includes('spideybot') || text.includes('🤖')) return this.robot(size, isShadow);
    if (lower.includes('jaring') || lower.includes('web') || text.includes('🕸️') || text.includes('🕸')) return this.jaring(size, isShadow);
    if (lower.includes('bintang') || lower.includes('star') || text.includes('⭐')) return this.bintang(size, isShadow);
    if (lower.includes('baterai') || lower.includes('battery') || text.includes('🔋')) return this.baterai(size, isShadow);
    if (lower.includes('piala') || lower.includes('trophy') || lower.includes('juara') || text.includes('🏆')) return this.piala(size, isShadow);

    // 5. Nature & Environment
    if (lower.includes('batu') || lower.includes('rock') || text.includes('🪨')) return this.batu(size, isShadow);
    if (lower.includes('balon') || lower.includes('balloon') || text.includes('🎈')) return this.balon(size, isShadow);
    if (lower.includes('api') || lower.includes('fire') || text.includes('🔥')) return this.api(size, isShadow);
    if (lower.includes('bunga') || lower.includes('flower') || text.includes('🌸') || text.includes('🌻')) return this.bunga(size, isShadow);
    if (lower.includes('pohon') || lower.includes('tree') || text.includes('🌳') || text.includes('🌲')) return this.pohon(size, isShadow);
    if (lower.includes('rumah') || lower.includes('house') || text.includes('🏠')) return this.rumah(size, isShadow);
    if (lower.includes('gedung') || lower.includes('building') || text.includes('🏢')) return this.gedung(size, isShadow);

    // 6. Geometry
    if (lower.includes('lingkaran') || lower.includes('circle') || text.includes('🔵')) return this.lingkaran(size, isShadow);
    if (lower.includes('kotak') || lower.includes('persegi') || lower.includes('square') || text.includes('🟥')) return this.kotak(size, isShadow);
    if (lower.includes('segitiga') || lower.includes('triangle') || text.includes('🔺')) return this.segitiga(size, isShadow);

    // 7. Direction Arrows
    if (text.includes('➡️') || lower.includes('kanan')) return this.panah('right', size, isShadow);
    if (text.includes('⬅️') || lower.includes('kiri')) return this.panah('left', size, isShadow);
    if (text.includes('⬆️') || lower.includes('atas') || lower.includes('naik')) return this.panah('up', size, isShadow);
    if (text.includes('⬇️') || lower.includes('bawah') || lower.includes('turun')) return this.panah('down', size, isShadow);

    // Fallback: jika benar-benar emoji lain yang belum ada vektor kustomnya, render dengan container jumbo berskala besar
    const emojiMatch = text.match(/(\p{Extended_Pictographic}+)/u);
    const emoji = emojiMatch ? emojiMatch[1] : text;

    return `
      <div class="emoji-visual-box ${isShadow ? 'silhouette-emoji' : ''}" style="font-size: ${Math.round(size * 0.72)}px; line-height: 1;">
        ${emoji}
      </div>
    `;
  }
};
