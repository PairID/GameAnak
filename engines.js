// engines.js - 9 Mesin Game Interaktif untuk Balita (3-4 tahun)
// Menggunakan Pointer Events (layar sentuh + mouse), feedback positif, audio & visual responsif

import { sound } from './audio.js';
import { Mascot } from './mascot.js';
import { Illustrations } from './illustrations.js';

const PRAISE_LIST = [
  'Hebat! ⭐',
  'Pintar Sekali! 🌟',
  'Luar Biasa! 🎉',
  'Bagus Sekali! ✨',
  'Mantap! 🚀',
  'Yey, Betul! 👏'
];

function triggerMascotReaction(emotion = 'cheer', customText = null) {
  if (typeof window === 'undefined') return;
  const text = customText || PRAISE_LIST[Math.floor(Math.random() * PRAISE_LIST.length)];
  try {
    if (window.AppController && typeof window.AppController.reactMascot === 'function') {
      window.AppController.reactMascot(emotion, text);
    } else if (window.app && typeof window.app.reactMascot === 'function') {
      window.app.reactMascot(emotion, text);
    } else if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mascot-react', { detail: { emotion, text } }));
    }
  } catch (_) {
    // Non-blocking fallback
  }
}

export const Engines = {
  // ==========================================
  // ENGINE 1: HUBUNGKAN (Tarik Garis / Drag & Tap Pasangan)
  // Cocok untuk lembar kerja tarik garis, bayangan, pasangan
  // ==========================================
  renderHubungkan(container, level, onComplete) {
    container.innerHTML = `
      <div class="engine-hubungkan">
        <div class="pairs-grid">
          <div class="col-left" id="colLeft"></div>
          <svg class="line-canvas" id="hubungkanSvg"></svg>
          <div class="col-right" id="colRight"></div>
        </div>
        <div class="engine-tip">
          <span class="tip-hand">✏️</span> Tarik garis dengan jarimu dari kiri ke kanan! (Atau sentuh gambar kiri lalu pasangannya di kanan)
        </div>
      </div>
    `;

    const colLeft = container.querySelector('#colLeft');
    const colRight = container.querySelector('#colRight');
    const svg = container.querySelector('#hubungkanSvg');

    let selectedLeftBtn = null;
    let selectedRightBtn = null;
    let matchedCount = 0;
    const pairs = level.pairs;
    const totalPairs = pairs.length;

    function clearSelections() {
      if (selectedLeftBtn) selectedLeftBtn.classList.remove('selected');
      if (selectedRightBtn) selectedRightBtn.classList.remove('selected');
      selectedLeftBtn = null;
      selectedRightBtn = null;
    }

    // Helper untuk merender kartu jumbo dengan ilustrasi/bayangan yang jelas
    function formatCard(itemData, isRight = false) {
      const rawText = typeof itemData === 'string' ? itemData : (itemData.text || itemData.label || '');
      const isShadow = isRight && (
        itemData.rightIsShadow ||
        rawText.toLowerCase().includes('bayangan') ||
        rawText.toLowerCase().includes('siluet') ||
        rawText.toLowerCase().includes('gelap')
      );

      const cleanLabel = rawText.replace(/^[^\w\s\u00C0-\u1FFF\u2C00-\uD7FF]+/u, '').trim();
      const visualHtml = Illustrations.render(rawText, { isShadow, size: 88 });

      return `
        <div class="pair-card-content">
          <div class="pair-visual-box ${isShadow ? 'is-shadow-visual' : ''}">
            ${visualHtml}
          </div>
          <div class="pair-card-text ${isShadow ? 'is-shadow-text' : ''}">
            <span class="pair-text">${cleanLabel}</span>
          </div>
        </div>
      `;
    }

    // Acak urutan kanan agar ada tantangan mencari
    const shuffledRight = pairs.map((p, i) => ({ item: p.right, originalIndex: i }))
      .sort(() => Math.random() - 0.5);

    // Render kartu kiri
    pairs.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = 'pair-item left-item';
      btn.dataset.idx = idx;
      btn.innerHTML = `${formatCard(p.left, false)}<span class="dot-connector left-dot"><span class="dot-core"></span></span>`;

      // Pointer drag & touch
      btn.addEventListener('pointerdown', (e) => {
        if (btn.classList.contains('matched')) return;
        sound.playPop();

        if (selectedRightBtn) {
          checkMatch(btn, selectedRightBtn);
          return;
        }

        colLeft.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
        selectedLeftBtn = btn;
        btn.classList.add('selected');

        startDraggingLine(e, btn, true);
      });

      // Tap fallback
      btn.onclick = () => {
        if (btn.classList.contains('matched')) return;
        sound.playPop();

        if (selectedRightBtn) {
          checkMatch(btn, selectedRightBtn);
          return;
        }

        colLeft.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
        selectedLeftBtn = btn;
        btn.classList.add('selected');
      };

      colLeft.appendChild(btn);
    });

    // Render kartu kanan
    shuffledRight.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'pair-item right-item';
      btn.dataset.origIdx = r.originalIndex;
      btn.innerHTML = `<span class="dot-connector right-dot"><span class="dot-core"></span></span>${formatCard(r.item, true)}`;

      // Pointer drag & touch from right side
      btn.addEventListener('pointerdown', (e) => {
        if (btn.classList.contains('matched')) return;
        sound.playPop();

        if (selectedLeftBtn) {
          checkMatch(selectedLeftBtn, btn);
          return;
        }

        colRight.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
        selectedRightBtn = btn;
        btn.classList.add('selected');

        startDraggingLine(e, btn, false);
      });

      // Tap fallback from right side
      btn.onclick = () => {
        if (btn.classList.contains('matched')) return;
        sound.playPop();

        if (selectedLeftBtn) {
          checkMatch(selectedLeftBtn, btn);
          return;
        }

        colRight.querySelectorAll('.pair-item').forEach(b => b.classList.remove('selected'));
        selectedRightBtn = btn;
        btn.classList.add('selected');
      };

      colRight.appendChild(btn);
    });

    // Logika pencocokan pasangan fleksibel (kiri-ke-kanan atau kanan-ke-kiri)
    function checkMatch(leftBtn, rightBtn) {
      if (!leftBtn || !rightBtn || leftBtn.classList.contains('matched') || rightBtn.classList.contains('matched')) return;

      const leftIdx = parseInt(leftBtn.dataset.idx, 10);
      const rightOrigIdx = parseInt(rightBtn.dataset.origIdx, 10);

      if (rightOrigIdx === leftIdx) {
        // MATCH!
        sound.playCorrect();
        triggerMascotReaction('cheer', 'Hebat! ⭐');
        rightBtn.classList.add('matched');
        leftBtn.classList.add('matched');
        clearSelections();

        // Gambar garis permanen hijau ceria di SVG
        const svgRect = svg.getBoundingClientRect ? svg.getBoundingClientRect() : { left: 0, top: 0, width: 800, height: 600 };
        const leftDot = leftBtn.querySelector('.dot-connector');
        const rightDot = rightBtn.querySelector('.dot-connector');

        const leftDotRect = (leftDot && leftDot.getBoundingClientRect) ? leftDot.getBoundingClientRect() : leftBtn.getBoundingClientRect();
        const rightDotRect = (rightDot && rightDot.getBoundingClientRect) ? rightDot.getBoundingClientRect() : rightBtn.getBoundingClientRect();

        const x1 = (leftDotRect.left + (leftDotRect.width || 24) / 2) - svgRect.left;
        const y1 = (leftDotRect.top + (leftDotRect.height || 24) / 2) - svgRect.top;
        const x2 = (rightDotRect.left + (rightDotRect.width || 24) / 2) - svgRect.left;
        const y2 = (rightDotRect.top + (rightDotRect.height || 24) / 2) - svgRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#10B981');
        line.setAttribute('stroke-width', '8');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('class', 'connected-line');
        svg.appendChild(line);

        matchedCount++;

        if (matchedCount === totalPairs) {
          setTimeout(onComplete, 700);
        }
      } else {
        // Salah: goyang lembut kedua kartu yang dicoba
        sound.playGentleTryAgain();
        triggerMascotReaction('think', 'Coba lagi ya! 😊');
        rightBtn.classList.add('shake');
        leftBtn.classList.add('shake');
        setTimeout(() => {
          rightBtn.classList.remove('shake');
          leftBtn.classList.remove('shake');
        }, 400);
        clearSelections();
      }
    }

    // Dynamic Live Dragging Line (Mendukung Tarik Kiri-ke-Kanan maupun Kanan-ke-Kiri)
    let activeDragLine = null;
    let isDragging = false;

    function startDraggingLine(downEvent, startBtn, isFromLeft = true) {
      if (typeof window === 'undefined') return;
      isDragging = true;

      const svgRect = svg.getBoundingClientRect ? svg.getBoundingClientRect() : { left: 0, top: 0 };
      const startDot = startBtn.querySelector('.dot-connector') || startBtn;
      const dotRect = (startDot && startDot.getBoundingClientRect) ? startDot.getBoundingClientRect() : startBtn.getBoundingClientRect();

      const startX = (dotRect.left + (dotRect.width || 24) / 2) - svgRect.left;
      const startY = (dotRect.top + (dotRect.height || 24) / 2) - svgRect.top;

      if (!activeDragLine) {
        activeDragLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        activeDragLine.setAttribute('stroke', '#EF4444');
        activeDragLine.setAttribute('stroke-width', '8');
        activeDragLine.setAttribute('stroke-linecap', 'round');
        activeDragLine.setAttribute('stroke-dasharray', '12 6');
        activeDragLine.setAttribute('class', 'dragging-line');
        svg.appendChild(activeDragLine);
      }

      activeDragLine.setAttribute('x1', startX);
      activeDragLine.setAttribute('y1', startY);
      activeDragLine.setAttribute('x2', startX);
      activeDragLine.setAttribute('y2', startY);
      activeDragLine.style.display = 'block';

      const targetCol = isFromLeft ? colRight : colLeft;
      const targetClass = isFromLeft ? '.right-item' : '.left-item';

      function onMove(e) {
        if (!isDragging || !activeDragLine) return;
        const curX = e.clientX - svgRect.left;
        const curY = e.clientY - svgRect.top;
        activeDragLine.setAttribute('x2', curX);
        activeDragLine.setAttribute('y2', curY);

        if (document.elementFromPoint) {
          const hovered = document.elementFromPoint(e.clientX, e.clientY)?.closest(targetClass);
          targetCol.querySelectorAll(targetClass).forEach(r => r.classList.remove('drag-hover'));
          if (hovered && !hovered.classList.contains('matched')) {
            hovered.classList.add('drag-hover');
          }
        }
      }

      function onUp(e) {
        if (!isDragging) return;
        isDragging = false;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);

        if (activeDragLine) {
          activeDragLine.style.display = 'none';
        }
        targetCol.querySelectorAll(targetClass).forEach(r => r.classList.remove('drag-hover'));

        if (document.elementFromPoint) {
          const target = document.elementFromPoint(e.clientX, e.clientY)?.closest(targetClass);
          if (target && !target.classList.contains('matched')) {
            const leftTarget = isFromLeft ? startBtn : target;
            const rightTarget = isFromLeft ? target : startBtn;
            checkMatch(leftTarget, rightTarget);
          }
        }
      }

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }
  },

  // ==========================================
  // ENGINE 2: LABIRIN (Maze Navigasi Sentuh)
  // Grid besar dengan jalan bebas macet untuk balita
  // ==========================================
  renderLabirin(container, level, onComplete) {
    const size = level.gridSize || 5;
    let playerPos = { r: 0, c: 0 };
    const goalPos = { r: size - 1, c: size - 1 };
    const walls = new Set(level.walls || []);

    container.innerHTML = `
      <div class="engine-labirin">
        <div class="maze-header">
          <span>Mulai: ${level.startEmoji || '🕷️'}</span>
          <span>Tujuan: ${level.targetEmoji || '🤖'}</span>
        </div>
        <div class="maze-grid" style="--grid-size: ${size};" id="mazeGrid"></div>
        <div class="maze-controls">
          <button class="nav-btn up" data-dir="up">⬆️</button>
          <div class="nav-row">
            <button class="nav-btn left" data-dir="left">⬅️</button>
            <button class="nav-btn down" data-dir="down">⬇️</button>
            <button class="nav-btn right" data-dir="right">➡️</button>
          </div>
        </div>
      </div>
    `;

    const gridEl = container.querySelector('#mazeGrid');

    function drawGrid() {
      gridEl.innerHTML = '';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const cell = document.createElement('div');
          const key = `${r},${c}`;
          cell.className = 'maze-cell';
          if (walls.has(key)) {
            cell.classList.add('wall');
            cell.innerHTML = Illustrations.render('🕸️', { size: 36 });
          } else if (r === playerPos.r && c === playerPos.c) {
            cell.classList.add('player');
            cell.innerHTML = Illustrations.render(level.startEmoji || '🕷️', { size: 40 });
          } else if (r === goalPos.r && c === goalPos.c) {
            cell.classList.add('goal');
            cell.innerHTML = Illustrations.render(level.targetEmoji || '🤖', { size: 40 });
          }

          // Allow direct cell tap for toddlers!
          cell.onclick = () => {
            if (walls.has(key)) return;
            // Check adjacency
            const dr = Math.abs(playerPos.r - r);
            const dc = Math.abs(playerPos.c - c);
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
              move(r, c);
            }
          };

          gridEl.appendChild(cell);
        }
      }
    }

    function move(newR, newC) {
      if (newR < 0 || newR >= size || newC < 0 || newC >= size) return;
      if (walls.has(`${newR},${newC}`)) {
        sound.playGentleTryAgain();
        triggerMascotReaction('think', 'Ada rintangan! 🕸️');
        return;
      }
      playerPos = { r: newR, c: newC };
      sound.playPop();
      drawGrid();

      if (playerPos.r === goalPos.r && playerPos.c === goalPos.c) {
        sound.playCorrect();
        triggerMascotReaction('cheer', 'Sampai di Tujuan! 🏁');
        setTimeout(onComplete, 600);
      }
    }

    // Direction buttons for little fingers
    container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.onclick = () => {
        const dir = btn.dataset.dir;
        let nr = playerPos.r;
        let nc = playerPos.c;
        if (dir === 'up') nr--;
        if (dir === 'down') nr++;
        if (dir === 'left') nc--;
        if (dir === 'right') nc++;
        move(nr, nc);
      };
    });

    drawGrid();
  },

  // ==========================================
  // ENGINE 3: PILIH JAWABAN (Multiple Choice Jumbo)
  // Untuk pola, hitung, cari yang beda, logika, dsb.
  // ==========================================
  renderPilih(container, level, onComplete) {
    const items = level.items || [];
    let currentStep = 0;

    function showItem() {
      if (currentStep >= items.length) {
        onComplete();
        return;
      }
      const item = items[currentStep];

      // Speak item specific prompt if present
      if (item.question && currentStep > 0) {
        sound.speak(item.question);
      }

      let contentHtml = '';
      if (item.display) {
        const tokens = item.display.trim().split(/\s+/);
        let displayInner = '';
        if (tokens.length > 1) {
          displayInner = `
            <div class="display-tokens-row">
              ${tokens.map(tok => {
                if (tok === '+' || tok === '=' || tok === 'diambil' || tok === '-') {
                  return `<span class="display-op">${tok === 'diambil' ? '➖' : tok}</span>`;
                }
                if (tok === '❓' || tok.includes('❓')) {
                  return `<span class="display-token display-mystery">❓</span>`;
                }
                return `<span class="display-token">${Illustrations.render(tok, { size: 76 })}</span>`;
              }).join('')}
            </div>
          `;
        } else {
          displayInner = `
            <div class="display-single-token">
              ${Illustrations.render(item.display, { size: 92 })}
            </div>
          `;
        }
        contentHtml += `<div class="question-display">${displayInner}</div>`;
      }

      if (item.sequence) {
        contentHtml += `
          <div class="sequence-display">
            ${item.sequence.map(s => {
              const isMystery = s === '❓' || s.includes('❓');
              const visual = isMystery
                ? '<div class="seq-mystery">❓</div>'
                : Illustrations.render(s, { size: 68 });
              return `
                <span class="seq-badge ${isMystery ? 'highlight-box' : ''}">
                  ${visual}
                  <span class="seq-text" style="display:none">${s}</span>
                </span>
              `;
            }).join('')}
          </div>
        `;
      }

      if (item.question) {
        contentHtml += `<div class="question-title">${item.question}</div>`;
      }

      const optCount = item.options.length;
      container.innerHTML = `
        <div class="engine-pilih">
          <div class="step-indicator">Soal ${currentStep + 1} dari ${items.length}</div>
          ${contentHtml}
          <div class="options-grid options-count-${optCount}" id="optionsGrid"></div>
        </div>
      `;

      const optGrid = container.querySelector('#optionsGrid');
      item.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';

        const isObj = typeof opt === 'object' && opt !== null;
        const labelText = isObj ? opt.label : String(opt);
        const optDirection = isObj && opt.direction ? opt.direction : null;
        const hideLabel = Boolean((isObj && opt.hideLabel) || level.hideCaptions || item.hideCaptions);
        const isPureNumber = /^\d+$/.test(labelText.trim());

        let visualHtml = '';
        if (isPureNumber) {
          visualHtml = `<div class="choice-num-badge">${labelText.trim()}</div>`;
        } else {
          visualHtml = `
            <div class="choice-visual-box">
              ${Illustrations.render(labelText, { size: 104, direction: optDirection })}
            </div>
          `;
        }

        // Clean label without emojis if it had extra text, e.g. "Gajah Raksasa 🐘" -> "Gajah Raksasa"
        const cleanText = labelText.replace(/^[^\w\s\u00C0-\u1FFF\u2C00-\uD7FF]+/u, '')
                                   .replace(/[^\w\s\u00C0-\u1FFF\u2C00-\uD7FF]+$/u, '')
                                   .trim();
        const showCaption = cleanText.length > 0 && !isPureNumber && !hideLabel;

        btn.innerHTML = `
          <div class="choice-card-content">
            ${visualHtml}
            ${showCaption ? `<div class="choice-caption">${cleanText}</div>` : ''}
            <span class="choice-text" style="display:none">${labelText}</span>
          </div>
        `;

        btn.onclick = () => {
          let isCorrect = false;
          if (item.answerIndex !== undefined) {
            isCorrect = idx === item.answerIndex;
          } else if (item.answer !== undefined) {
            isCorrect = opt === item.answer || labelText.includes(String(item.answer));
          }

          if (isCorrect) {
            sound.playCorrect();
            triggerMascotReaction('cheer', 'Pintar Sekali! 🌟');
            btn.classList.add('correct');
            setTimeout(() => {
              currentStep++;
              showItem();
            }, 600);
          } else {
            sound.playGentleTryAgain();
            triggerMascotReaction('think', 'Ayo cari lagi! 🔍');
            btn.classList.add('shake');
            setTimeout(() => btn.classList.remove('shake'), 400);
          }
        };

        optGrid.appendChild(btn);
      });
    }

    showItem();
  },

  // ==========================================
  // ENGINE 4: HUBUNGKAN TITIK (Connect The Dots 1 to 10)
  // Menghitung angka 1-2-3 sambil memunculkan gambar
  // ==========================================
  renderHubungkanTitik(container, level, onComplete) {
    const dots = level.dots || [];
    let currentDotIndex = 0;

    container.innerHTML = `
      <div class="engine-titik">
        <div class="titik-canvas-wrapper" id="dotsCanvasWrapper">
          <svg class="titik-svg" id="dotsSvg">
            <line id="activeDotDragLine" stroke="#EF4444" stroke-width="5" stroke-dasharray="6 4" stroke-linecap="round" style="display:none;"></line>
          </svg>
          <div class="reveal-overlay" id="revealOverlay">
            <div class="reveal-visual-box">${Illustrations.render(level.revealName || level.revealEmoji || '🎉', { size: 140 })}</div>
            <div class="reveal-emoji">${level.revealEmoji || '🎉'}</div>
            <div class="reveal-title">${level.revealName || 'Hore Berhasil!'}</div>
          </div>
        </div>
        <div class="titik-counter">Sentuh Angka: <span class="current-target" id="targetNum">1</span></div>
      </div>
    `;

    const wrapper = container.querySelector('#dotsCanvasWrapper');
    const svg = container.querySelector('#dotsSvg');
    const targetNumEl = container.querySelector('#targetNum');
    const revealEl = container.querySelector('#revealOverlay');
    const dragLine = svg.querySelector('#activeDotDragLine');

    const indonesianNumbers = ['Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh'];
    const dotNodes = [];

    function updateNextPulse() {
      dotNodes.forEach((btn, i) => {
        if (i === currentDotIndex) {
          btn.classList.add('next');
        } else {
          btn.classList.remove('next');
        }
      });
    }

    function activateDot(idx) {
      if (idx !== currentDotIndex) return false;
      const dot = dots[idx];
      const node = dotNodes[idx];

      sound.playPop();
      sound.speak(indonesianNumbers[dot.num - 1] || String(dot.num));
      if (node) {
        node.classList.remove('next');
        node.classList.add('active');
      }

      if (currentDotIndex > 0) {
        // Draw line from previous dot to current
        const prev = dots[currentDotIndex - 1];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${prev.x}%`);
        line.setAttribute('y1', `${prev.y}%`);
        line.setAttribute('x2', `${dot.x}%`);
        line.setAttribute('y2', `${dot.y}%`);
        line.setAttribute('stroke', '#EF4444');
        line.setAttribute('stroke-width', '5');
        line.setAttribute('stroke-linecap', 'round');
        svg.appendChild(line);
      }

      currentDotIndex++;

      if (currentDotIndex < dots.length) {
        if (targetNumEl) targetNumEl.textContent = dots[currentDotIndex].num;
        updateNextPulse();
      } else {
        // Finished!
        // For contours (>= 4 dots), draw closing line from last dot back to first dot
        if (dots.length >= 4) {
          const first = dots[0];
          const last = dots[dots.length - 1];
          if (first && last) {
            const closingLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            closingLine.setAttribute('x1', `${last.x}%`);
            closingLine.setAttribute('y1', `${last.y}%`);
            closingLine.setAttribute('x2', `${first.x}%`);
            closingLine.setAttribute('y2', `${first.y}%`);
            closingLine.setAttribute('stroke', '#EF4444');
            closingLine.setAttribute('stroke-width', '5');
            closingLine.setAttribute('stroke-linecap', 'round');
            svg.appendChild(closingLine);
          }
        }
        if (dragLine) dragLine.style.display = 'none';
        sound.playCorrect();
        triggerMascotReaction('cheer', 'Luar Biasa! 🎨');
        if (revealEl) revealEl.classList.add('show');
        setTimeout(onComplete, 1600);
      }
      return true;
    }

    dots.forEach((dot, idx) => {
      const node = document.createElement('button');
      node.className = 'dot-node';
      node.style.left = `${dot.x}%`;
      node.style.top = `${dot.y}%`;
      node.dataset.idx = idx;
      node.innerHTML = `<span>${dot.num}</span>`;

      node.onclick = () => {
        if (idx === currentDotIndex) {
          activateDot(idx);
        } else if (idx > currentDotIndex) {
          sound.playGentleTryAgain();
          triggerMascotReaction('think', 'Cari angka berikutnya ya! 🔢');
          node.classList.add('shake');
          setTimeout(() => node.classList.remove('shake'), 400);
        }
      };

      dotNodes.push(node);
      wrapper.appendChild(node);
    });

    updateNextPulse();

    // Support touch and mouse draw/drag gesture to connect dots
    let isDragging = false;
    let activePointerId = null;

    function getCoords(e) {
      if (!wrapper || !wrapper.getBoundingClientRect) return { x: 0, y: 0 };
      const rect = wrapper.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
      const xPct = rect.width ? ((clientX - rect.left) / rect.width) * 100 : 0;
      const yPct = rect.height ? ((clientY - rect.top) / rect.height) * 100 : 0;
      return { x: xPct, y: yPct };
    }

    function checkHitTarget(pos) {
      if (currentDotIndex >= dots.length) return;
      const targetDot = dots[currentDotIndex];
      const dist = Math.hypot(pos.x - targetDot.x, pos.y - targetDot.y);
      if (dist <= 14) {
        activateDot(currentDotIndex);
      }
    }

    function onPointerDown(e) {
      if (currentDotIndex >= dots.length) return;
      if (activePointerId !== null) return;
      activePointerId = e.pointerId !== undefined ? e.pointerId : 1;
      isDragging = true;

      if (wrapper.setPointerCapture && e.pointerId !== undefined) {
        try { wrapper.setPointerCapture(e.pointerId); } catch (_) {}
      }

      const pos = getCoords(e);
      checkHitTarget(pos);

      if (currentDotIndex > 0 && currentDotIndex < dots.length && dragLine) {
        const prev = dots[currentDotIndex - 1];
        dragLine.setAttribute('x1', `${prev.x}%`);
        dragLine.setAttribute('y1', `${prev.y}%`);
        dragLine.setAttribute('x2', `${pos.x}%`);
        dragLine.setAttribute('y2', `${pos.y}%`);
        dragLine.style.display = 'block';
      }
    }

    function onPointerMove(e) {
      if (!isDragging || currentDotIndex >= dots.length) return;
      if (activePointerId !== null && e.pointerId !== undefined && e.pointerId !== activePointerId) return;

      const pos = getCoords(e);
      checkHitTarget(pos);

      if (currentDotIndex > 0 && currentDotIndex < dots.length && dragLine) {
        const prev = dots[currentDotIndex - 1];
        dragLine.setAttribute('x1', `${prev.x}%`);
        dragLine.setAttribute('y1', `${prev.y}%`);
        dragLine.setAttribute('x2', `${pos.x}%`);
        dragLine.setAttribute('y2', `${pos.y}%`);
        dragLine.style.display = 'block';
      }
    }

    function onPointerUp(e) {
      if (activePointerId !== null && e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
      if (wrapper.releasePointerCapture && activePointerId !== null) {
        try { wrapper.releasePointerCapture(activePointerId); } catch (_) {}
      }
      activePointerId = null;
      isDragging = false;
      if (dragLine) dragLine.style.display = 'none';
    }

    if (wrapper.addEventListener) {
      wrapper.addEventListener('pointerdown', onPointerDown);
      wrapper.addEventListener('pointermove', onPointerMove);
      wrapper.addEventListener('pointerup', onPointerUp);
      wrapper.addEventListener('pointercancel', onPointerUp);
    }
  },

  // ==========================================
  // ENGINE 5: TEBALKAN (Finger Tracing Guide)
  // Menulis angka atau kabel menggunakan jari
  // ==========================================
  renderTebalkan(container, level, onComplete) {
    const traceItems = level.traceItems || [{ label: 'Tebalkan Jalur', pathType: 'zigzag' }];
    let currentIdx = 0;

    function showTraceItem() {
      if (currentIdx >= traceItems.length) {
        onComplete();
        return;
      }
      const item = traceItems[currentIdx];

      container.innerHTML = `
        <div class="engine-tebalkan">
          <div class="trace-title">✍️ ${item.label}</div>
          <div class="trace-box">
            <canvas id="traceCanvas" width="340" height="340"></canvas>
          </div>
          <div class="trace-actions">
            <button class="small-btn" id="clearTraceBtn">Bersihkan 🔄</button>
            <button class="primary-btn finish-btn" id="doneTraceBtn">Selesai ✨</button>
          </div>
        </div>
      `;

      const canvas = container.querySelector('#traceCanvas');
      if (!canvas) return;
      if (canvas.style) canvas.style.touchAction = 'none';
      const ctx = canvas.getContext ? canvas.getContext('2d') : null;
      if (!ctx) return;
      let isDrawing = false;
      let drawnPoints = 0;

      // Draw faint guideline
      function drawGuide() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([12, 12]);

        ctx.beginPath();
        if (item.pathType === 'one') {
          ctx.moveTo(170, 70); ctx.lineTo(170, 270);
        } else if (item.pathType === 'two') {
          ctx.arc(170, 120, 50, Math.PI, 0, false);
          ctx.lineTo(120, 270);
          ctx.lineTo(220, 270);
        } else if (item.pathType === 'three') {
          ctx.arc(170, 120, 45, Math.PI * 1.2, Math.PI * 0.4, false);
          ctx.arc(170, 210, 50, Math.PI * 1.6, Math.PI * 0.8, false);
        } else if (item.pathType === 'four') {
          ctx.moveTo(190, 70); ctx.lineTo(120, 180); ctx.lineTo(230, 180);
          ctx.moveTo(190, 70); ctx.lineTo(190, 270);
        } else if (item.pathType === 'five') {
          ctx.moveTo(210, 80); ctx.lineTo(140, 80); ctx.lineTo(135, 160);
          ctx.arc(170, 210, 50, Math.PI * 1.3, Math.PI * 0.7, false);
        } else {
          // Zigzag or wave
          ctx.moveTo(40, 170); ctx.lineTo(120, 70); ctx.lineTo(200, 270); ctx.lineTo(280, 170);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawGuide();

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: (clientX - rect.left) * (canvas.width / rect.width),
          y: (clientY - rect.top) * (canvas.height / rect.height)
        };
      }

      function startDraw(e) {
        e.preventDefault();
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        sound.playPop();
      }

      function onDraw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        drawnPoints++;
      }

      function stopDraw() {
        if (isDrawing) {
          isDrawing = false;
        }
      }

      canvas.addEventListener('pointerdown', startDraw);
      canvas.addEventListener('pointermove', onDraw);
      canvas.addEventListener('pointerup', stopDraw);
      canvas.addEventListener('pointercancel', stopDraw);

      container.querySelector('#clearTraceBtn').onclick = () => {
        sound.playClick();
        drawnPoints = 0;
        drawGuide();
      };

      container.querySelector('#doneTraceBtn').onclick = () => {
        sound.playCorrect();
        triggerMascotReaction('cheer', 'Rapi Sekali! ✍️');
        currentIdx++;
        showTraceItem();
      };
    }

    showTraceItem();
  },

  // ==========================================
  // ENGINE 6: MEWARNAI (Palette & Tap-to-Fill)
  // Mewarnai bentuk atau grid pixel
  // ==========================================
  renderMewarnai(container, level, onComplete) {
    const palette = level.palette || ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'];
    let selectedColor = palette[0];
    const shapes = level.shapes || [];

    container.innerHTML = `
      <div class="engine-mewarnai">
        <div class="palette-bar" id="paletteBar"></div>
        <div class="coloring-canvas" id="coloringCanvas"></div>
        <button class="primary-btn finish-btn" id="finishColorBtn">Selesai Mewarnai ✨</button>
      </div>
    `;

    const palEl = container.querySelector('#paletteBar');
    const canvasEl = container.querySelector('#coloringCanvas');

    // Build Palette
    palette.forEach((col, idx) => {
      const sw = document.createElement('button');
      sw.className = `color-swatch ${idx === 0 ? 'selected' : ''}`;
      sw.style.backgroundColor = col;
      sw.onclick = () => {
        sound.playClick();
        palEl.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        selectedColor = col;
      };
      palEl.appendChild(sw);
    });

    // Build Shapes / Pixels
    shapes.forEach(shape => {
      const sEl = document.createElement('div');
      sEl.className = `color-target shape-${shape.type}`;
      sEl.style.backgroundColor = shape.defaultColor || '#F1F5F9';
      sEl.innerHTML = `<span>${shape.label || ''}</span>`;

      sEl.onclick = () => {
        sound.playPop();
        triggerMascotReaction('cheer', 'Warna Cantik! 🌈');
        sEl.style.backgroundColor = selectedColor;
      };

      canvasEl.appendChild(sEl);
    });

    container.querySelector('#finishColorBtn').onclick = () => {
      sound.playCorrect();
      triggerMascotReaction('cheer', 'Karya Indah! 🎨');
      setTimeout(onComplete, 500);
    };
  },

  // ==========================================
  // ENGINE 7: URUTKAN (Kecil ke Besar / 1-2-3)
  // Menata tahapan algoritma atau ukuran
  // ==========================================
  renderUrutkan(container, level, onComplete) {
    const rawItems = level.items || [];
    // Shuffle items for child to pick in correct sequence
    const shuffled = [...rawItems].sort(() => Math.random() - 0.5);
    let expectedIndex = 1; // 1, 2, 3...
    const total = rawItems.length;
    const isSizeSort = level.sortType === 'size' || Boolean(level.prompt && level.prompt.toLowerCase().includes('kecil')) || Boolean(rawItems[0] && rawItems[0].size !== undefined);
    const hideText = Boolean(level.hideItemLabels);

    container.innerHTML = `
      <div class="engine-urutkan ${isSizeSort ? 'urut-ukuran-mode' : ''}">
        <div class="target-slots" id="slotsRow"></div>
        <div class="items-pool" id="itemsPool"></div>
      </div>
    `;

    const slotsRow = container.querySelector('#slotsRow');
    const itemsPool = container.querySelector('#itemsPool');
    const sizeHints = ['Paling Kecil', 'Sedang', 'Paling Besar'];

    for (let i = 1; i <= total; i++) {
      const slot = document.createElement('div');
      slot.className = `order-slot ${isSizeSort ? `slot-size-step-${i}` : ''}`;
      slot.dataset.slot = i;
      if (isSizeSort) {
        slot.innerHTML = `<span class="slot-num">${i}</span><span class="slot-hint">${sizeHints[i - 1] || ''}</span>`;
      } else {
        slot.innerHTML = `<span>${i}</span>`;
      }
      slotsRow.appendChild(slot);
    }

    shuffled.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `order-item-btn ${item.size ? `size-btn-${item.size}` : ''}`;
      const sz = item.size === 1 ? 50 : item.size === 2 ? 84 : item.size === 3 ? 124 : 76;
      btn.innerHTML = `
        <div class="order-visual-box">${Illustrations.render(item.label, { size: sz })}</div>
        <span class="order-label-text" ${hideText || item.hideLabel ? 'style="display:none"' : ''}>${item.label}</span>
      `;

      btn.onclick = () => {
        const targetVal = item.step || item.size;
        if (targetVal === expectedIndex) {
          // Correct order!
          sound.playCorrect();
          triggerMascotReaction('cheer', 'Urutan Betul! 🔢');
          const targetSlot = slotsRow.querySelector(`[data-slot="${expectedIndex}"]`);
          targetSlot.innerHTML = `
            <div class="order-visual-box">${Illustrations.render(item.label, { size: sz })}</div>
            <span class="order-label-text" ${hideText || item.hideLabel ? 'style="display:none"' : ''}>${item.label}</span>
          `;
          targetSlot.classList.add('filled');
          btn.style.visibility = 'hidden';
          expectedIndex++;

          if (expectedIndex > total) {
            setTimeout(onComplete, 700);
          }
        } else {
          sound.playGentleTryAgain();
          triggerMascotReaction('think', 'Coba yang lain ya! 😊');
          btn.classList.add('shake');
          setTimeout(() => btn.classList.remove('shake'), 400);
        }
      };

      itemsPool.appendChild(btn);
    });
  },

  // ==========================================
  // ENGINE 8: KODING PANAH (Grid Coding Spideybot)
  // Anak menyusun panah lalu tekan RUN ▶️
  // ==========================================
  renderKodingPanah(container, level, onComplete) {
    const correctSeq = level.correctProgram || ['➡️', '➡️', '⬇️', '⬇️'];
    let program = [];

    container.innerHTML = `
      <div class="engine-panah">
        <div class="spidey-grid-board" id="spideyGridBoard">
          <div class="grid-cell" id="c00">${Mascot.robot(54)}</div>
          <div class="grid-cell" id="c01"></div>
          <div class="grid-cell" id="c02"></div>
          <div class="grid-cell" id="c10">${Illustrations.render('🪨', { size: 48 })}</div>
          <div class="grid-cell" id="c11"></div>
          <div class="grid-cell" id="c12"></div>
          <div class="grid-cell" id="c20"></div>
          <div class="grid-cell" id="c21"></div>
          <div class="grid-cell" id="c22">${Illustrations.render('🔋', { size: 48 })}</div>
        </div>

        <div class="program-tray">
          <div class="tray-label">Program Kamu:</div>
          <div class="program-slots" id="programSlots"></div>
        </div>

        <div class="arrows-palette">
          <button class="arrow-cmd-btn" data-arrow="➡️">➡️ Maju</button>
          <button class="arrow-cmd-btn" data-arrow="⬇️">⬇️ Turun</button>
          <button class="arrow-cmd-btn" data-arrow="⬆️">⬆️ Naik</button>
          <button class="arrow-cmd-btn" data-arrow="⬅️">⬅️ Balik</button>
        </div>

        <div class="koding-actions">
          <button class="small-btn" id="resetProgBtn">Hapus ❌</button>
          <button class="primary-btn run-btn" id="runProgBtn">JALANKAN ▶️</button>
        </div>
      </div>
    `;

    const slotsEl = container.querySelector('#programSlots');

    function updateSlots() {
      slotsEl.innerHTML = '';
      if (program.length === 0) {
        slotsEl.innerHTML = '<span class="empty-hint">Pilih panah di bawah!</span>';
        return;
      }
      program.forEach((cmd, idx) => {
        const chip = document.createElement('span');
        chip.className = 'cmd-chip';
        chip.textContent = cmd;
        slotsEl.appendChild(chip);
      });
    }

    container.querySelectorAll('.arrow-cmd-btn').forEach(btn => {
      btn.onclick = () => {
        if (program.length >= 6) return;
        sound.playPop();
        program.push(btn.dataset.arrow);
        updateSlots();
      };
    });

    container.querySelector('#resetProgBtn').onclick = () => {
      sound.playClick();
      program = [];
      updateSlots();
    };

    container.querySelector('#runProgBtn').onclick = () => {
      // Check program matches
      const isMatch = program.length >= 2 &&
        program.filter(p => p === '➡️').length >= 2 &&
        program.filter(p => p === '⬇️').length >= 2;

      if (isMatch) {
        sound.playRobotStep();
        setTimeout(() => sound.playFanfare(), 150);
        triggerMascotReaction('cheer', 'Robot Berhasil! 🤖');
        // Animate robot to goal
        const board = container.querySelector('#spideyGridBoard');
        container.querySelector('#c00').innerHTML = '';
        container.querySelector('#c22').innerHTML = Mascot.robot(54);
        setTimeout(onComplete, 1200);
      } else {
        sound.playGentleTryAgain();
        triggerMascotReaction('think', 'Yuk atur jalurnya lagi! 💡');
        sound.speak('Robot butuh jalan ke kanan dan turun ke baterai!');
      }
    };

    updateSlots();
  },

  // ==========================================
  // ENGINE 9: MEMORI / KARTU KEMBAR
  // Membalik kartu bergambar pahlawan
  // ==========================================
  renderMemori(container, level, onComplete) {
    const pairs = level.pairs || [
      { id: '1', emoji: '🕷️', name: 'Laba' },
      { id: '2', emoji: '🤖', name: 'Robot' },
      { id: '3', emoji: '⭐', name: 'Bintang' }
    ];

    // Duplicate and shuffle
    const cards = [...pairs, ...pairs]
      .map((item, idx) => ({ ...item, uniqueId: idx }))
      .sort(() => Math.random() - 0.5);

    let flipped = [];
    let matchedPairs = 0;

    container.innerHTML = `
      <div class="engine-memori">
        <div class="cards-grid" id="memoryCardsGrid"></div>
      </div>
    `;

    const grid = container.querySelector('#memoryCardsGrid');

    cards.forEach(card => {
      const cardEl = document.createElement('button');
      cardEl.className = 'memory-card';
      cardEl.dataset.uniqueId = card.uniqueId;
      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-front">${Illustrations.render('🕸️', { size: 60 })}</div>
          <div class="card-back">
            <div class="mem-visual">${Illustrations.render(card.name || card.emoji, { size: 76 })}</div>
            <span class="emoji-text" style="display:none">${card.emoji}</span>
          </div>
        </div>
      `;

      cardEl.onclick = () => {
        if (flipped.length >= 2 || cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) {
          return;
        }

        sound.playPop();
        cardEl.classList.add('flipped');
        flipped.push({ card, el: cardEl });

        if (flipped.length === 2) {
          const [first, second] = flipped;
          if (first.card.id === second.card.id) {
            // Match!
            sound.playCorrect();
            triggerMascotReaction('cheer', 'Kembar Cocok! 🃏');
            first.el.classList.add('matched');
            second.el.classList.add('matched');
            flipped = [];
            matchedPairs++;

            if (matchedPairs === pairs.length) {
              setTimeout(onComplete, 800);
            }
          } else {
            // Mismatch
            sound.playGentleTryAgain();
            triggerMascotReaction('think', 'Ingat-ingat lagi! 🧠');
            setTimeout(() => {
              first.el.classList.remove('flipped');
              second.el.classList.remove('flipped');
              flipped = [];
            }, 900);
          }
        }
      };

      grid.appendChild(cardEl);
    });
  },

  // ==========================================
  // UNIFIED DISPATCHER
  // ==========================================
  render(container, level, onComplete) {
    const map = {
      hubungkan: this.renderHubungkan,
      labirin: this.renderLabirin,
      pilih: this.renderPilih,
      titik: this.renderHubungkanTitik,
      tebalkan: this.renderTebalkan,
      mewarnai: this.renderMewarnai,
      urutkan: this.renderUrutkan,
      panah: this.renderKodingPanah,
      memori: this.renderMemori
    };
    const fn = map[level.type];
    if (!fn) {
      console.error(`Unknown engine type: ${level.type}`);
      return;
    }
    fn.call(this, container, level, onComplete);
  }
};

// Aliases for direct type mapping
Engines.renderTitik = Engines.renderHubungkanTitik;
Engines.renderPanah = Engines.renderKodingPanah;

