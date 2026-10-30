// mascot.js - Commercial preschool vector art for Spidey Cilik & Animal Squad
// Inspired by Lingokids preschool quality: organic silhouettes, volumetric shading,
// anime chibi eyes with dual specular shines, rosy cheeks, and expressive mouths.
// 100% pure inline SVG strings, zero external dependencies, 100% offline.

export const Mascot = {
  // Spidey Cilik - Toddler superhero guide with chubby anatomy & expressive anime eyes
  hero(size = 120, pose = 'wave') {
    const isHappy = pose === 'happy';
    const isCheer = pose === 'cheer' || pose === 'cheering';
    const isThink = pose === 'think' || pose === 'thinking';
    const isEncourage = pose === 'encourage' || pose === 'encouraging';
    const isIdle = pose === 'idle';

    let leftArm, rightArm, hands, extraAccents = '';
    let leftEyePupil, rightEyePupil, mouthPath;

    if (isCheer) {
      // Both arms stretched triumphantly high up with celebratory golden sparkles
      leftArm = '<path d="M 35 66 Q 14 42 20 18" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 106 42 100 18" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="20" cy="18" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 24 23 Q 28 20 26 15" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
        <circle cx="100" cy="18" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 96 23 Q 92 20 94 15" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
      `;
      extraAccents = `
        <polygon points="12,10 14,5 19,7 15,11 17,16 12,13 7,15 9,10" fill="#FBBF24" stroke="#D97706" stroke-width="1"/>
        <polygon points="108,10 110,5 115,7 111,11 113,16 108,13 103,15 105,10" fill="#FBBF24" stroke="#D97706" stroke-width="1"/>
        <circle cx="15" cy="28" r="2.5" fill="#FEF08A"/>
        <circle cx="105" cy="28" r="2.5" fill="#FEF08A"/>
      `;
      leftEyePupil = `
        <ellipse cx="44" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="43" cy="35" r="2.2" fill="#FFFFFF"/>
        <circle cx="46" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="76" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="75" cy="35" r="2.2" fill="#FFFFFF"/>
        <circle cx="78" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = `
        <path d="M 52 50 Q 60 62 68 50 Q 60 52 52 50 Z" fill="#1E293B" stroke="#1E293B" stroke-width="2"/>
        <path d="M 55 54 Q 60 51 65 54 Q 60 61 55 54 Z" fill="#F43F5E"/>
      `;
    } else if (isThink) {
      // Right glove touching chin, head tilted inquisitively, thought sparks
      leftArm = '<path d="M 35 66 Q 20 78 26 92" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 92 50 68 52" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="26" cy="92" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <circle cx="68" cy="52" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 64 50 Q 61 46 65 44" stroke="#1E293B" stroke-width="2" stroke-linecap="round" fill="none"/>
      `;
      extraAccents = `
        <circle cx="88" cy="18" r="4" fill="#60A5FA" opacity="0.8"/>
        <circle cx="98" cy="10" r="6" fill="#3B82F6" opacity="0.9"/>
        <circle cx="96" cy="8" r="1.8" fill="#FFFFFF"/>
      `;
      leftEyePupil = `
        <ellipse cx="45" cy="34" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="44" cy="32" r="2.2" fill="#FFFFFF"/>
        <circle cx="47" cy="36" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="77" cy="34" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="76" cy="32" r="2.2" fill="#FFFFFF"/>
        <circle cx="79" cy="36" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = '<path d="M 55 51 Q 61 54 65 50" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
    } else if (isEncourage) {
      // Reaching forward giving energetic thumbs-up
      leftArm = '<path d="M 35 66 Q 20 78 26 92" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 106 58 100 42" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="26" cy="92" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <circle cx="100" cy="42" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 100 36 L 100 29" stroke="#1E293B" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="100" cy="28" r="2.5" fill="#EF4444"/>
      `;
      extraAccents = '<path d="M 108 34 Q 113 36 110 40" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      leftEyePupil = `
        <ellipse cx="44" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="43" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="46" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="76" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="75" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="78" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = `
        <path d="M 53 50 Q 60 58 67 50" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <ellipse cx="60" cy="53" rx="3" ry="1.5" fill="#F43F5E" opacity="0.8"/>
      `;
    } else if (isHappy) {
      // Both hands up waving happily with joyful sparkle
      leftArm = '<path d="M 35 66 Q 16 46 22 30" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 104 46 98 30" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="22" cy="30" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <circle cx="98" cy="30" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
      `;
      extraAccents = '<circle cx="14" cy="22" r="2.5" fill="#F472B6"/><circle cx="106" cy="22" r="2.5" fill="#F472B6"/>';
      leftEyePupil = `
        <ellipse cx="44" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="43" cy="35" r="2.2" fill="#FFFFFF"/>
        <circle cx="46" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="76" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="75" cy="35" r="2.2" fill="#FFFFFF"/>
        <circle cx="78" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = `
        <path d="M 52 50 Q 60 60 68 50 Q 60 52 52 50 Z" fill="#1E293B" stroke="#1E293B" stroke-width="2"/>
        <path d="M 55 53 Q 60 51 65 53 Q 60 59 55 53 Z" fill="#F43F5E"/>
      `;
    } else if (isIdle) {
      // Relaxed breathing stance, arms resting comfortably at sides
      leftArm = '<path d="M 35 66 Q 22 78 26 92" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 98 78 94 92" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="26" cy="92" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <circle cx="94" cy="92" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
      `;
      leftEyePupil = `
        <ellipse cx="44" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="43" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="46" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="76" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="75" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="78" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = '<path d="M 53 50 Q 60 57 67 50" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
    } else {
      // Default: wave (right hand waving warmly, left hand at side)
      leftArm = '<path d="M 35 66 Q 20 78 26 92" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      rightArm = '<path d="M 85 66 Q 106 50 102 32" stroke="#EF4444" stroke-width="12" stroke-linecap="round" fill="none"/>';
      hands = `
        <circle cx="26" cy="92" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <circle cx="102" cy="32" r="9" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 102 24 L 102 20 M 96 26 L 93 23 M 108 26 L 111 23" stroke="#FBBF24" stroke-width="2.2" stroke-linecap="round"/>
      `;
      leftEyePupil = `
        <ellipse cx="44" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="43" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="46" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      rightEyePupil = `
        <ellipse cx="76" cy="38" rx="5" ry="5.5" fill="url(#spideyEyeGrad)"/>
        <circle cx="75" cy="35.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="78" cy="40" r="1.2" fill="#FFFFFF"/>
      `;
      mouthPath = '<path d="M 53 50 Q 60 57 67 50" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="spidey-mascot ${pose}">
      <defs>
        <radialGradient id="spideyHeadGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FF6B6B"/>
          <stop offset="45%" stop-color="#EF4444"/>
          <stop offset="85%" stop-color="#DC2626"/>
          <stop offset="100%" stop-color="#991B1B"/>
        </radialGradient>
        <linearGradient id="spideySuitGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF5252"/>
          <stop offset="70%" stop-color="#EF4444"/>
          <stop offset="100%" stop-color="#B91C1C"/>
        </linearGradient>
        <radialGradient id="spideyBlueGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#60A5FA"/>
          <stop offset="60%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1D4ED8"/>
        </radialGradient>
        <radialGradient id="spideyEyeGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="55%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </radialGradient>
        <filter id="stickerGlow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.14"/>
        </filter>
      </defs>

      <g filter="url(#stickerGlow)">
        <!-- Ground Soft Contact Shadow -->
        <ellipse cx="60" cy="114" rx="30" ry="4" fill="#1E293B" opacity="0.12"/>

        <!-- Chubby Legs -->
        <path d="M 40 86 Q 40 102 46 106 L 54 106 Q 52 86 52 86 Z" fill="url(#spideyBlueGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
        <path d="M 68 86 Q 68 86 66 106 L 74 106 Q 80 102 80 86 Z" fill="url(#spideyBlueGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>

        <!-- Rounded Toddler Boots with Dark Soles -->
        <path d="M 38 104 Q 46 98 56 104 Q 57 112 47 112 Q 38 112 38 104 Z" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 39 110 Q 47 112 56 110" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>

        <path d="M 64 104 Q 74 98 82 104 Q 82 112 73 112 Q 63 112 64 104 Z" fill="#EF4444" stroke="#1E293B" stroke-width="3"/>
        <path d="M 64 110 Q 73 112 81 110" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Dynamic Arms & Mittens -->
        ${leftArm}
        ${rightArm}
        ${hands}

        <!-- Chubby Bean Torso -->
        <rect x="35" y="58" width="50" height="34" rx="16" fill="url(#spideySuitGrad)" stroke="#1E293B" stroke-width="3.5"/>

        <!-- Blue Side Flank Panels -->
        <path d="M 35 68 C 43 73 43 82 35 88 L 45 88 C 45 78 43 65 35 68 Z" fill="url(#spideyBlueGrad)"/>
        <path d="M 85 68 C 77 73 77 82 85 88 L 75 88 C 75 78 77 65 85 68 Z" fill="url(#spideyBlueGrad)"/>

        <!-- Spider Hero Emblem -->
        <ellipse cx="60" cy="74" rx="4.5" ry="5.5" fill="#1E293B"/>
        <path d="M 57 71 Q 51 68 49 64 M 63 71 Q 69 68 71 64" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 57 77 Q 50 80 48 84 M 63 77 Q 70 80 72 84" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>

        <!-- Chubby Squircle Head -->
        <ellipse cx="60" cy="40" rx="37" ry="32" fill="url(#spideyHeadGrad)" stroke="#1E293B" stroke-width="3.5"/>

        <!-- Top Gloss Highlight Arc -->
        <path d="M 38 22 Q 60 14 82 22" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" opacity="0.4" fill="none"/>

        <!-- Friendly Web Filaments on Mask -->
        <path d="M 60 12 L 60 68 M 27 36 L 93 44 M 31 48 L 89 32" stroke="#991B1B" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>
        <path d="M 44 26 Q 60 32 76 26 M 38 42 Q 60 50 82 42" stroke="#991B1B" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0.6"/>

        <!-- Rosy Cheek Blush Pills -->
        <ellipse cx="32" cy="46" rx="5" ry="3" fill="#FF8A80" opacity="0.75"/>
        <ellipse cx="88" cy="46" rx="5" ry="3" fill="#FF8A80" opacity="0.75"/>

        <!-- Anime Chibi Eyes with Dual Specular Reflections -->
        <!-- Left Eye Frame & Sclera -->
        <path d="M 33 38 Q 44 25 55 38 Q 44 49 33 38 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
        ${leftEyePupil}

        <!-- Right Eye Frame & Sclera -->
        <path d="M 87 38 Q 76 25 65 38 Q 76 49 87 38 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
        ${rightEyePupil}

        <!-- Expressive Preschool Mouth -->
        ${mouthPath}

        <!-- Pose Specific Accents & Energy -->
        ${extraAccents}
      </g>
    </svg>
    `;
  },

  // Spideybot / Bot Sahabat - Volumetric helper robot with glowing antenna & rotating cheek gears
  robot(size = 90, pose = 'idle') {
    const isCheer = pose === 'cheer' || pose === 'happy';
    const isThink = pose === 'think' || pose === 'thinking';
    const isWave = pose === 'wave';
    const antennaGlow = isCheer ? '#FBBF24' : (isThink ? '#38BDF8' : (isWave ? '#10B981' : '#EF4444'));

    let eyeVisual, mouthVisual, rocketThruster = '';

    if (isCheer) {
      // Joyful digital LED arcs (^ ^) & rocket thruster glow
      eyeVisual = `
        <path d="M 33 54 Q 38 48 43 54" stroke="#22D3EE" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <path d="M 57 54 Q 62 48 67 54" stroke="#22D3EE" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      `;
      mouthVisual = `
        <path d="M 43 72 Q 50 80 57 72" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M 45 73 Q 50 78 55 73" stroke="#F43F5E" stroke-width="2" stroke-linecap="round" fill="none"/>
      `;
      rocketThruster = `
        <ellipse cx="50" cy="92" rx="14" ry="4" fill="#F97316" opacity="0.4"/>
        <ellipse cx="50" cy="90" rx="8" ry="2.5" fill="#FBBF24"/>
      `;
    } else if (isThink) {
      // Calculating digital display looking up with radar sweep
      eyeVisual = `
        <ellipse cx="38" cy="52" rx="4.5" ry="5.5" fill="#38BDF8"/>
        <circle cx="37" cy="50" r="1.8" fill="#FFFFFF"/>
        <circle cx="40" cy="54" r="1" fill="#FFFFFF"/>
        <ellipse cx="62" cy="52" rx="4.5" ry="5.5" fill="#38BDF8"/>
        <circle cx="61" cy="50" r="1.8" fill="#FFFFFF"/>
        <circle cx="64" cy="54" r="1" fill="#FFFFFF"/>
        <path d="M 46 51 L 54 51" stroke="#22D3EE" stroke-width="1.5" stroke-dasharray="2 1"/>
      `;
      mouthVisual = '<path d="M 45 74 Q 50 76 55 73" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      rocketThruster = '<ellipse cx="50" cy="92" rx="26" ry="4" fill="#1E293B" opacity="0.12"/>';
    } else {
      // Idle / Wave: Large sparkling round digital eyes
      eyeVisual = `
        <ellipse cx="38" cy="54" rx="5" ry="6" fill="#22D3EE"/>
        <circle cx="36.5" cy="51.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="40" cy="56" r="1.2" fill="#FFFFFF"/>
        <ellipse cx="62" cy="54" rx="5" ry="6" fill="#22D3EE"/>
        <circle cx="60.5" cy="51.5" r="2.2" fill="#FFFFFF"/>
        <circle cx="64" cy="56" r="1.2" fill="#FFFFFF"/>
      `;
      mouthVisual = '<path d="M 43 73 Q 50 79 57 73" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>';
      rocketThruster = '<ellipse cx="50" cy="92" rx="26" ry="4" fill="#1E293B" opacity="0.12"/>';
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="spideybot ${pose}">
      <defs>
        <radialGradient id="botDomeGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="#BAE6FD"/>
          <stop offset="45%" stop-color="#38BDF8"/>
          <stop offset="85%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </radialGradient>
        <linearGradient id="botVisorGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#1E293B"/>
        </linearGradient>
        <linearGradient id="botGearGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FDE047"/>
          <stop offset="70%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#B45309"/>
        </linearGradient>
      </defs>

      <!-- Hover Thruster / Contact Shadow -->
      ${rocketThruster}

      <!-- Articulated Spider Robot Legs with Rivets -->
      <path d="M 22 55 Q 6 60 12 78 M 26 65 Q 14 80 26 88" stroke="#1E293B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M 78 55 Q 94 60 88 78 M 74 65 Q 86 80 74 88" stroke="#1E293B" stroke-width="4" stroke-linecap="round" fill="none"/>
      <circle cx="17" cy="62" r="2.5" fill="#38BDF8"/>
      <circle cx="83" cy="62" r="2.5" fill="#38BDF8"/>

      <!-- Coiled Antenna Stem & LED Beacon -->
      <path d="M 50 30 L 50 25 Q 46 22 50 19 Q 54 16 50 13" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="11" r="6" fill="${antennaGlow}" stroke="#1E293B" stroke-width="2.5" class="antenna-bulb"/>
      <circle cx="48" cy="9" r="1.8" fill="#FFFFFF"/>
      ${isCheer || isWave ? `<path d="M 40 8 Q 50 2 60 8" stroke="${antennaGlow}" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8"/>` : ''}

      <!-- Volumetric Chassis Dome with Top Specular Arc -->
      <ellipse cx="50" cy="56" rx="35" ry="29" fill="url(#botDomeGrad)" stroke="#1E293B" stroke-width="3.5"/>
      <path d="M 28 42 Q 50 32 72 42" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.6" fill="none"/>

      <!-- Brass Cheek Gears -->
      <circle cx="19" cy="56" r="4.5" fill="url(#botGearGrad)" stroke="#1E293B" stroke-width="1.8"/>
      <circle cx="19" cy="56" r="1.5" fill="#1E293B"/>
      <circle cx="81" cy="56" r="4.5" fill="url(#botGearGrad)" stroke="#1E293B" stroke-width="1.8"/>
      <circle cx="81" cy="56" r="1.5" fill="#1E293B"/>

      <!-- Digital Eye Visor Pill -->
      <rect x="26" y="44" width="48" height="22" rx="11" fill="url(#botVisorGrad)" stroke="#1E293B" stroke-width="2.5"/>
      <path d="M 30 48 Q 50 45 70 48" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.3" fill="none"/>

      <!-- Emotive Visor Eyes -->
      ${eyeVisual}

      <!-- Friendly Smile Line -->
      ${mouthVisual}
    </svg>
    `;
  },

  // Animal Companion 1: Kucing Ceria (Cheerful Kitten) - World 1 (Hutan Satwa 🌳)
  cat(size = 100, pose = 'idle') {
    const isCheer = pose === 'cheer' || pose === 'happy';
    const isThink = pose === 'think' || pose === 'thinking';
    const isWave = pose === 'wave';

    let pawsMarkup, mouthMarkup, accentsMarkup = '';

    if (isCheer) {
      // Both paws raised high showing pink paw pads, golden sparkles
      pawsMarkup = `
        <ellipse cx="28" cy="48" rx="7" ry="9" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <circle cx="28" cy="46" r="3" fill="#FCA5A5"/>
        <circle cx="25" cy="41" r="1.5" fill="#FCA5A5"/>
        <circle cx="28" cy="39" r="1.5" fill="#FCA5A5"/>
        <circle cx="31" cy="41" r="1.5" fill="#FCA5A5"/>

        <ellipse cx="72" cy="48" rx="7" ry="9" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <circle cx="72" cy="46" r="3" fill="#FCA5A5"/>
        <circle cx="69" cy="41" r="1.5" fill="#FCA5A5"/>
        <circle cx="72" cy="39" r="1.5" fill="#FCA5A5"/>
        <circle cx="75" cy="41" r="1.5" fill="#FCA5A5"/>
      `;
      mouthMarkup = `
        <path d="M 46 49 Q 50 56 54 49 Z" fill="#1E293B"/>
        <ellipse cx="50" cy="52" rx="2.5" ry="1.5" fill="#F472B6"/>
      `;
      accentsMarkup = `
        <polygon points="15,20 17,15 22,17 18,21 20,26 15,23 10,25 12,20" fill="#FBBF24"/>
        <polygon points="85,20 87,15 92,17 88,21 90,26 85,23 80,25 82,20" fill="#FBBF24"/>
      `;
    } else if (isThink) {
      // One paw touching cheek whiskers, inquisitive eyes
      pawsMarkup = `
        <ellipse cx="36" cy="80" rx="6" ry="7" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="64" cy="56" rx="6" ry="7" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = '<path d="M 45 49 Q 50 53 55 49" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      accentsMarkup = `
        <circle cx="78" cy="18" r="3" fill="#FBBF24"/>
        <circle cx="86" cy="12" r="4.5" fill="#FBBF24"/>
      `;
    } else if (isWave) {
      // Right paw waving hello with pink paw pad
      pawsMarkup = `
        <ellipse cx="36" cy="80" rx="6" ry="7" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="78" cy="45" rx="7" ry="9" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <circle cx="78" cy="43" r="3" fill="#FCA5A5"/>
        <circle cx="75" cy="38" r="1.5" fill="#FCA5A5"/>
        <circle cx="78" cy="36" r="1.5" fill="#FCA5A5"/>
        <circle cx="81" cy="38" r="1.5" fill="#FCA5A5"/>
      `;
      mouthMarkup = '<path d="M 44 49 Q 47 52 50 49 Q 53 52 56 49" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      accentsMarkup = '<path d="M 86 36 Q 90 40 88 46" stroke="#FB923C" stroke-width="2" stroke-linecap="round" fill="none"/>';
    } else {
      // Idle: resting comfortably
      pawsMarkup = `
        <ellipse cx="38" cy="82" rx="6" ry="7" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="62" cy="82" rx="6" ry="7" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = '<path d="M 44 49 Q 47 52 50 49 Q 53 52 56 49" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="mascot-companion cat ${pose}">
      <defs>
        <radialGradient id="catCoatGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FED7AA"/>
          <stop offset="40%" stop-color="#FB923C"/>
          <stop offset="85%" stop-color="#EA580C"/>
          <stop offset="100%" stop-color="#9A3412"/>
        </radialGradient>
        <linearGradient id="catBibGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#FEF3C7"/>
        </linearGradient>
        <radialGradient id="catEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#6EE7B7"/>
          <stop offset="50%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#047857"/>
        </radialGradient>
      </defs>

      <!-- Soft Ground Shadow -->
      <ellipse cx="50" cy="94" rx="28" ry="4" fill="#1E293B" opacity="0.12"/>

      <!-- Upward Curving Fluffy Tail -->
      <path d="M 72 78 Q 90 75 88 56 Q 86 48 80 50 Q 82 60 70 70 Z" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 88 56 Q 86 48 80 50 Q 82 56 86 56 Z" fill="#FFFBEB"/>

      <!-- Chubby Pear Body & Vanilla Bib -->
      <ellipse cx="50" cy="74" rx="25" ry="20" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3.5"/>
      <ellipse cx="50" cy="74" rx="15" ry="14" fill="url(#catBibGrad)"/>

      <!-- Interactive Paws -->
      ${pawsMarkup}

      <!-- Cute Kitten Ears -->
      <polygon points="26,36 18,10 40,24" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="27,32 22,15 36,24" fill="#FCA5A5"/>

      <polygon points="74,36 82,10 60,24" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
      <polygon points="73,32 78,15 64,24" fill="#FCA5A5"/>

      <!-- Chubby Kitten Head -->
      <ellipse cx="50" cy="42" rx="32" ry="26" fill="url(#catCoatGrad)" stroke="#1E293B" stroke-width="3.5"/>

      <!-- Tabby Forehead Stripes -->
      <path d="M 50 18 L 50 25 M 44 20 L 46 26 M 56 20 L 54 26" stroke="#C2410C" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="28" cy="48" rx="4.5" ry="2.8" fill="#F472B6" opacity="0.6"/>
      <ellipse cx="72" cy="48" rx="4.5" ry="2.8" fill="#F472B6" opacity="0.6"/>

      <!-- Whiskers -->
      <path d="M 22 47 L 10 45 M 22 51 L 11 53" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
      <path d="M 78 47 L 90 45 M 78 51 L 89 53" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>

      <!-- Emerald Anime Eyes with Dual Specular Highlights -->
      <ellipse cx="38" cy="40" rx="6" ry="7" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="38" cy="40" rx="4.5" ry="5.5" fill="url(#catEyeGrad)"/>
      <circle cx="36.5" cy="38" r="2" fill="#FFFFFF"/>
      <circle cx="39.5" cy="42" r="1.1" fill="#FFFFFF"/>

      <ellipse cx="62" cy="40" rx="6" ry="7" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="62" cy="40" rx="4.5" ry="5.5" fill="url(#catEyeGrad)"/>
      <circle cx="60.5" cy="38" r="2" fill="#FFFFFF"/>
      <circle cx="63.5" cy="42" r="1.1" fill="#FFFFFF"/>

      <!-- Coral Heart Nose -->
      <polygon points="50,47 47,44 53,44" fill="#F43F5E"/>

      <!-- Expressive W-Smile or Joy Crescent -->
      ${mouthMarkup}

      <!-- Accents -->
      ${accentsMarkup}
    </svg>
    `;
  },

  // Animal Companion 2: Kelinci Lincah (Bouncy Bunny) - Cross-world agility buddy
  bunny(size = 100, pose = 'idle') {
    const isCheer = pose === 'cheer' || pose === 'happy';
    const isThink = pose === 'think' || pose === 'thinking';
    const isWave = pose === 'wave';

    let pawsMarkup, mouthMarkup, accentsMarkup = '';

    if (isCheer) {
      // Leaping victory bounce, both ears perked
      pawsMarkup = `
        <ellipse cx="26" cy="54" rx="6" ry="8" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="74" cy="54" rx="6" ry="8" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = `
        <path d="M 45 53 Q 50 61 55 53 Z" fill="#1E293B"/>
        <ellipse cx="50" cy="57" rx="2.5" ry="1.5" fill="#F472B6"/>
        <rect x="48.5" y="53" width="3" height="3" rx="1" fill="#FFFFFF"/>
      `;
      accentsMarkup = `
        <polygon points="16,24 18,19 23,21 19,25 21,30 16,27 11,29 13,24" fill="#C084FC"/>
        <polygon points="84,24 86,19 91,21 87,25 89,30 84,27 79,29 81,24" fill="#FBBF24"/>
      `;
    } else if (isThink) {
      // Floppy ear drooped forward, paw on chin
      pawsMarkup = `
        <ellipse cx="38" cy="80" rx="6" ry="7" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="64" cy="58" rx="6" ry="7" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = `
        <path d="M 45 53 Q 50 56 55 53" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="48.5" y="54" width="3" height="2.5" rx="1" fill="#FFFFFF" stroke="#1E293B" stroke-width="1"/>
      `;
      accentsMarkup = `
        <circle cx="78" cy="20" r="3" fill="#A855F7"/>
        <circle cx="86" cy="14" r="5" fill="#8B5CF6"/>
      `;
    } else if (isWave) {
      // Right paw waving enthusiastically
      pawsMarkup = `
        <ellipse cx="38" cy="80" rx="6" ry="7" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="78" cy="50" rx="7" ry="8" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = `
        <path d="M 45 53 Q 50 56 55 53" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="48.5" y="54" width="3" height="2.5" rx="1" fill="#FFFFFF" stroke="#1E293B" stroke-width="1"/>
      `;
      accentsMarkup = '<path d="M 86 42 Q 90 46 88 52" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" fill="none"/>';
    } else {
      // Idle: paws tucked on chest
      pawsMarkup = `
        <ellipse cx="44" cy="74" rx="6" ry="6" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="56" cy="74" rx="6" ry="6" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = `
        <path d="M 45 53 Q 50 56 55 53" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <rect x="48.5" y="54" width="3" height="2.5" rx="1" fill="#FFFFFF" stroke="#1E293B" stroke-width="1"/>
      `;
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="mascot-companion bunny ${pose}">
      <defs>
        <radialGradient id="bunnyFurGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="70%" stop-color="#F1F5F9"/>
          <stop offset="100%" stop-color="#CBD5E1"/>
        </radialGradient>
        <linearGradient id="bunnyPinkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FBCFE8"/>
          <stop offset="100%" stop-color="#F472B6"/>
        </linearGradient>
        <radialGradient id="bunnyEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#C084FC"/>
          <stop offset="60%" stop-color="#8B5CF6"/>
          <stop offset="100%" stop-color="#5B21B6"/>
        </radialGradient>
      </defs>

      <!-- Soft Ground Shadow -->
      <ellipse cx="50" cy="94" rx="26" ry="4" fill="#1E293B" opacity="0.12"/>

      <!-- Cotton-ball Tail -->
      <circle cx="24" cy="78" r="7" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3"/>

      <!-- Chubby Egg Tummy -->
      <ellipse cx="50" cy="74" rx="24" ry="20" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3.5"/>

      <!-- Turquoise Bowtie -->
      <polygon points="45,64 50,66 45,68" fill="#38BDF8"/>
      <polygon points="55,64 50,66 55,68" fill="#38BDF8"/>
      <circle cx="50" cy="66" r="2.2" fill="#FBBF24"/>

      <!-- Velvet Ears: Left Upright, Right Floppy Fold -->
      <path d="M 32 32 Q 22 4 34 2 Q 42 4 38 32 Z" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 32 28 Q 26 8 34 6 Q 38 8 36 28 Z" fill="url(#bunnyPinkGrad)"/>

      <path d="M 62 32 Q 74 6 82 12 Q 86 24 76 34 Z" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M 66 30 Q 75 12 80 16 Q 82 24 74 30 Z" fill="url(#bunnyPinkGrad)"/>

      <!-- Round Chubby Head -->
      <ellipse cx="50" cy="46" rx="30" ry="24" fill="url(#bunnyFurGrad)" stroke="#1E293B" stroke-width="3.5"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="28" cy="50" rx="5" ry="3" fill="#F472B6" opacity="0.6"/>
      <ellipse cx="72" cy="50" rx="5" ry="3" fill="#F472B6" opacity="0.6"/>

      <!-- Sparkling Anime Violet Eyes -->
      <ellipse cx="38" cy="44" rx="6" ry="7" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="38" cy="44" rx="4.5" ry="5.5" fill="url(#bunnyEyeGrad)"/>
      <circle cx="36.5" cy="41.5" r="2.2" fill="#FFFFFF"/>
      <circle cx="39.5" cy="46" r="1.1" fill="#FFFFFF"/>

      <ellipse cx="62" cy="44" rx="6" ry="7" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="62" cy="44" rx="4.5" ry="5.5" fill="url(#bunnyEyeGrad)"/>
      <circle cx="60.5" cy="41.5" r="2.2" fill="#FFFFFF"/>
      <circle cx="63.5" cy="46" r="1.1" fill="#FFFFFF"/>

      <!-- Tiny Coral Nose & Buck Tooth Smile -->
      <ellipse cx="50" cy="51" rx="3" ry="2" fill="#F43F5E"/>
      ${mouthMarkup}

      <!-- Paws -->
      ${pawsMarkup}

      <!-- Accents -->
      ${accentsMarkup}
    </svg>
    `;
  },

  // Animal Companion 3: Panda Pintar (Smart Panda) - World 2 (Kota Angka 🔢)
  panda(size = 100, pose = 'idle') {
    const isCheer = pose === 'cheer' || pose === 'happy';
    const isThink = pose === 'think' || pose === 'thinking';
    const isWave = pose === 'wave';

    let pawsMarkup, mouthMarkup, accentsMarkup = '';

    if (isCheer) {
      // Paws high up with math stars
      pawsMarkup = `
        <ellipse cx="24" cy="50" rx="7" ry="9" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="76" cy="50" rx="7" ry="9" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = `
        <path d="M 45 54 Q 50 62 55 54 Z" fill="#1E293B"/>
        <ellipse cx="50" cy="58" rx="2.5" ry="1.5" fill="#F43F5E"/>
      `;
      accentsMarkup = `
        <text x="12" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#FBBF24" stroke="#D97706" stroke-width="0.5">1</text>
        <text x="82" y="24" font-family="Arial, sans-serif" font-size="14" font-weight="900" fill="#38BDF8" stroke="#0284C7" stroke-width="0.5">2</text>
        <polygon points="50,14 52,9 57,11 53,15 55,20 50,17 45,19 47,14" fill="#FBBF24"/>
      `;
    } else if (isThink) {
      // Paw touching golden glasses thoughtfully
      pawsMarkup = `
        <ellipse cx="36" cy="80" rx="6" ry="7" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="64" cy="50" rx="6" ry="7" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = '<path d="M 45 54 Q 50 57 55 54" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      accentsMarkup = `
        <circle cx="78" cy="18" r="4" fill="#FEF08A" stroke="#F59E0B" stroke-width="1.5"/>
        <line x1="78" y1="22" x2="78" y2="24" stroke="#D97706" stroke-width="2"/>
      `;
    } else if (isWave) {
      // Right paw waving warmly
      pawsMarkup = `
        <ellipse cx="36" cy="80" rx="6" ry="7" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="78" cy="48" rx="7" ry="9" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = '<path d="M 45 54 Q 50 58 55 54" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
      accentsMarkup = '<path d="M 86 40 Q 90 44 88 50" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" fill="none"/>';
    } else {
      // Idle: resting comfortably on tummy
      pawsMarkup = `
        <ellipse cx="38" cy="80" rx="7" ry="7" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
        <ellipse cx="62" cy="80" rx="7" ry="7" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
      `;
      mouthMarkup = '<path d="M 45 54 Q 50 58 55 54" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
    }

    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="mascot-companion panda ${pose}">
      <defs>
        <radialGradient id="pandaWhiteGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="80%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#E2E8F0"/>
        </radialGradient>
        <linearGradient id="pandaBlackGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#334155"/>
          <stop offset="60%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
        <radialGradient id="pandaEyeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#FBBF24"/>
          <stop offset="60%" stop-color="#D97706"/>
          <stop offset="100%" stop-color="#78350F"/>
        </radialGradient>
      </defs>

      <!-- Soft Ground Shadow -->
      <ellipse cx="50" cy="94" rx="28" ry="4" fill="#1E293B" opacity="0.12"/>

      <!-- Plump Pear Body with Black Vest -->
      <ellipse cx="50" cy="74" rx="26" ry="20" fill="url(#pandaWhiteGrad)" stroke="#1E293B" stroke-width="3.5"/>
      <path d="M 24 64 Q 35 68 50 68 Q 65 68 76 64 L 76 74 Q 65 80 50 80 Q 35 80 24 74 Z" fill="url(#pandaBlackGrad)"/>

      <!-- Fuzzy Black Ears -->
      <circle cx="26" cy="22" r="11" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>
      <circle cx="74" cy="22" r="11" fill="url(#pandaBlackGrad)" stroke="#1E293B" stroke-width="3"/>

      <!-- Giant Huggable Head -->
      <ellipse cx="50" cy="44" rx="33" ry="27" fill="url(#pandaWhiteGrad)" stroke="#1E293B" stroke-width="3.5"/>

      <!-- Velvet Black Eye Patches -->
      <ellipse cx="36" cy="42" rx="9" ry="11" transform="rotate(-15 36 42)" fill="url(#pandaBlackGrad)"/>
      <ellipse cx="64" cy="42" rx="9" ry="11" transform="rotate(15 64 42)" fill="url(#pandaBlackGrad)"/>

      <!-- Warm Amber Anime Eyes -->
      <ellipse cx="37" cy="42" rx="4.5" ry="5.5" fill="url(#pandaEyeGrad)"/>
      <circle cx="35.5" cy="40" r="1.8" fill="#FFFFFF"/>
      <circle cx="38.5" cy="44" r="1" fill="#FFFFFF"/>

      <ellipse cx="63" cy="42" rx="4.5" ry="5.5" fill="url(#pandaEyeGrad)"/>
      <circle cx="61.5" cy="40" r="1.8" fill="#FFFFFF"/>
      <circle cx="64.5" cy="44" r="1" fill="#FFFFFF"/>

      <!-- Chunky Golden Glasses -->
      <circle cx="36" cy="42" r="11" fill="none" stroke="#FBBF24" stroke-width="3"/>
      <circle cx="64" cy="42" r="11" fill="none" stroke="#FBBF24" stroke-width="3"/>
      <path d="M 47 41 Q 50 39 53 41" stroke="#FBBF24" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 30 35 L 34 32 M 58 35 L 62 32" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>

      <!-- Rosy Cheeks -->
      <ellipse cx="25" cy="51" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.7"/>
      <ellipse cx="75" cy="51" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.7"/>

      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="50" rx="3.5" ry="2.5" fill="#1E293B"/>
      ${mouthMarkup}

      <!-- Paws -->
      ${pawsMarkup}

      <!-- Accents -->
      ${accentsMarkup}
    </svg>
    `;
  },

  // Universal Polymorphic Companion Dispatcher
  companion(nameOrId = 'hero', size = 100, pose = 'idle') {
    const key = String(nameOrId).toLowerCase().trim();
    if (key === 'bot' || key === 'robot' || key === 'spideybot') return this.robot(size, pose);
    if (key === 'cat' || key === 'kucing') return this.cat(size, pose);
    if (key === 'bunny' || key === 'kelinci' || key === 'rabbit') return this.bunny(size, pose);
    if (key === 'panda') return this.panda(size, pose);
    return this.hero(size, pose);
  },

  // World Companion Auto-Resolver
  forWorld(worldId, size = 90, pose = 'idle') {
    switch (String(worldId).toLowerCase().trim()) {
      case 'hewan':  return this.cat(size, pose);
      case 'angka':  return this.panda(size, pose);
      case 'spidey': return this.hero(size, pose);
      case 'koding': return this.robot(size, pose);
      default:       return this.hero(size, pose);
    }
  },

  // Companion Squad Metadata Catalogue
  squad: [
    { id: 'spidey', name: 'Spidey Cilik', species: 'Superhero', worldId: 'spidey', color: '#EF4444' },
    { id: 'cat',    name: 'Kucing Ceria', species: 'Kucing',    worldId: 'hewan',  color: '#FB923C' },
    { id: 'bunny',  name: 'Kelinci Lincah', species: 'Kelinci', worldId: 'hewan',  color: '#8B5CF6' },
    { id: 'panda',  name: 'Panda Pintar', species: 'Panda',     worldId: 'angka',  color: '#F59E0B' },
    { id: 'bot',    name: 'Bot Sahabat',  species: 'Robot',     worldId: 'koding', color: '#3B82F6' }
  ],

  // Golden Sparkling Star (100% backward compatible)
  star(size = 40, active = true) {
    const fill = active ? '#FBBF24' : '#CBD5E1';
    const stroke = active ? '#D97706' : '#94A3B8';
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="star-icon ${active ? 'active' : 'inactive'}">
      <path d="M 20 4 L 24.5 13.8 L 35 15.1 L 27.2 22.3 L 29.2 32.8 L 20 27.6 L 10.8 32.8 L 12.8 22.3 L 5 15.1 L 15.5 13.8 Z"
        fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
      ${active ? '<circle cx="16" cy="14" r="2" fill="#FEF08A"/>' : ''}
    </svg>
    `;
  },

  // Spider Web Corner Decoration (100% backward compatible)
  web(size = 80) {
    return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="corner-web">
      <path d="M 0 0 L 100 0 M 0 0 L 92 38 M 0 0 L 70 70 M 0 0 L 38 92 M 0 0 L 0 100" stroke="#CBD5E1" stroke-width="2"/>
      <path d="M 25 0 Q 23 10 18 18 Q 10 23 0 25" stroke="#CBD5E1" stroke-width="2" fill="none"/>
      <path d="M 50 0 Q 46 20 35 35 Q 20 46 0 50" stroke="#CBD5E1" stroke-width="2" fill="none"/>
      <path d="M 75 0 Q 69 30 53 53 Q 30 69 0 75" stroke="#CBD5E1" stroke-width="2" fill="none"/>
    </svg>
    `;
  }
};

// Aliases strictly preserved
Mascot.bot = Mascot.robot;
Mascot.kucing = Mascot.cat;
Mascot.kelinci = Mascot.bunny;
