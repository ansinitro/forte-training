/* ============================================================
   FORTE QUEST — Conversation Trainer (Game Engine 2.0)
   Animated Client · Visual Novel Typewriter · RPG Mechanics
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// CONSTANTS & AUDIO ENGINE
// ─────────────────────────────────────────────────────────────
const CASES_URL = './all-cases.json';

const RANKS = [
  { xp: 0,   name: 'Стажёр',         icon: '🌱', color: '#5e7d9a' },
  { xp: 100, name: 'Консультант',     icon: '📋', color: '#4a9eff' },
  { xp: 220, name: 'Специалист',      icon: '⭐', color: '#10d98a' },
  { xp: 380, name: 'Эксперт',         icon: '🏆', color: '#f5c218' },
  { xp: 580, name: 'Мастер гарантий', icon: '💎', color: '#a78bfa' },
];

const CASE_COLORS = ['blue', 'amber', 'purple', 'teal', 'red', 'green'];

// Archetypes and visual assets for the 6 clients
const CLIENT_PROFILES = {
  1: { archetype: 'Поставщик госзакупок', avatar: '👩‍💼', title: 'Директор компании' },
  2: { archetype: 'Генподрядчик Самрук-Казына', avatar: '👷‍♂️', title: 'Главный инженер ТОО' },
  3: { archetype: 'Малый торговый бизнес', avatar: '🧑‍💼', title: 'Индивидуальный предприниматель' },
  4: { archetype: 'Корпоративный застройщик', avatar: '👔', title: 'Финансовый директор АО' },
  5: { archetype: 'Иностранный нерезидент', avatar: '🌐', title: 'Представитель зарубежного филиала' },
  6: { archetype: 'Связанное лицо / Партнёр', avatar: '💎', title: 'Премиум-партнёр ForteBank' },
};

const PLAYER_AVATARS = ['👨‍💼','👩‍💼','👨‍💻','👩‍💻','🧑‍🏫','👩‍🏫','🧔','👱','🧑‍💼','👳'];

// ─────────────────────────────────────────────────────────────
// WEB AUDIO API SOUND SYSTEM (100% Native, 0 latency)
// ─────────────────────────────────────────────────────────────
const Sound = {
  ctx: null,
  muted: false,
  init() {
    this.muted = localStorage.getItem('fq_sound') === 'muted';
  },
  getCtx() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },
  toggle() {
    this.muted = !this.muted;
    localStorage.setItem('fq_sound', this.muted ? 'muted' : 'active');
    return !this.muted;
  },
  playType() {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const freq = 360 + Math.random() * 90;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch (e) {}
  },
  playClick() {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.055);
    } catch (e) {}
  },
  playCorrect() {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.29);
      });
    } catch (e) {}
  },
  playMistake() {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      [220, 175].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.24);
      });
    } catch (e) {}
  },
  playVictory() {
    if (this.muted) return;
    try {
      const ctx = this.getCtx();
      if (!ctx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.36);
      });
    } catch (e) {}
  }
};
Sound.init();

// ─────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────
let G = {
  cases:    null,
  player:   null,
  progress: null,
};

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────
function loadAllPlayers() {
  try { return JSON.parse(localStorage.getItem('fq2_players') || '[]'); }
  catch { return []; }
}
function saveAllPlayers(arr) {
  try { localStorage.setItem('fq2_players', JSON.stringify(arr)); }
  catch {}
}
function loadPlayer(name) {
  const p = loadAllPlayers().find(p => p.name === name);
  return p ? { xp: p.xp || 0, done: p.done || {} } : { xp: 0, done: {} };
}
function savePlayer() {
  if (!G.player) return;
  const all = loadAllPlayers().filter(p => p.name !== G.player.name);
  all.push({ name: G.player.name, avatar: G.player.avatar, xp: G.progress.xp, done: G.progress.done });
  saveAllPlayers(all);
}
function getLeaderboard() {
  return loadAllPlayers().sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

function getRank(xp)     { return [...RANKS].reverse().find(r => xp >= r.xp) || RANKS[0]; }
function getNextRank(xp) { return RANKS.find(r => r.xp > xp) || null; }

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

function maxScore(c) {
  return c.stages.reduce((sum, s) => sum + Math.max(...s.options.map(o => o.score)), 0);
}

// ─────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────
function triggerConfetti(duration = 3500) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#f5c218','#4a9eff','#10d98a','#ff5572','#a78bfa','#f59e0b','#22d3ee','#fff'];
  const particles = Array.from({ length: 180 }, () => ({
    x:   Math.random() * canvas.width,
    y:   Math.random() * canvas.height - canvas.height,
    w:   Math.random() * 11 + 4,
    h:   Math.random() * 5 + 3,
    col: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360,
    vx:  (Math.random() - 0.5) * 3.5,
    vy:  Math.random() * 4 + 2,
    vr:  (Math.random() - 0.5) * 7,
    op:  1,
  }));
  const start = Date.now();
  function frame() {
    const elapsed = Date.now() - start;
    if (elapsed > duration) { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const prog = elapsed / duration;
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      p.op = prog > 0.65 ? 1 - (prog - 0.65) / 0.35 : 1;
      ctx.save(); ctx.globalAlpha = p.op; ctx.fillStyle = p.col;
      ctx.translate(p.x + p.w/2, p.y + p.h/2); ctx.rotate(p.rot * Math.PI/180);
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore();
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ─────────────────────────────────────────────────────────────
// SMOOTH SCREEN TRANSITION
// ─────────────────────────────────────────────────────────────
function go(fn, ...args) {
  const root = document.getElementById('root');
  root.style.opacity = '0';
  root.style.transform = 'translateY(8px)';
  setTimeout(() => {
    root.innerHTML = '';
    fn(root, ...args);
    root.style.transition = 'opacity 0.26s ease, transform 0.26s ease';
    root.style.opacity = '1';
    root.style.transform = 'translateY(0)';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 140);
}

// ─────────────────────────────────────────────────────────────
// HUD
// ─────────────────────────────────────────────────────────────
function buildHUD() {
  const rank = getRank(G.progress.xp);
  const hud  = document.createElement('header');
  hud.className = 'hud';
  hud.innerHTML = `
    <a class="hud-logo" id="hud-home" href="#">
      <span>🏦</span> Forte Quest
    </a>
    <div class="hud-sep"></div>
    <div class="hud-av">${esc(G.player.avatar)}</div>
    <div class="hud-name">${esc(G.player.name)}</div>
    <div class="hud-rank">${esc(rank.icon)} ${esc(rank.name)}</div>
    
    <div class="hud-pill">
      <span class="hud-pill-lbl">XP</span>
      <span class="hud-pill-val" id="hud-xp">${G.progress.xp}</span>
    </div>

    <button class="hud-btn" id="hud-sound" title="Включить / отключить звук">
      ${Sound.muted ? '🔇 Звук: ВЫКЛ' : '🔊 Звук: ВКЛ'}
    </button>
    <button class="hud-btn" id="hud-lb">🏆 Рейтинг</button>
  `;

  hud.querySelector('#hud-home').addEventListener('click', e => { e.preventDefault(); Sound.playClick(); go(renderMap); });
  hud.querySelector('#hud-lb').addEventListener('click', () => { Sound.playClick(); go(renderLeaderboard); });

  const soundBtn = hud.querySelector('#hud-sound');
  soundBtn.addEventListener('click', () => {
    const active = Sound.toggle();
    soundBtn.textContent = active ? '🔊 Звук: ВКЛ' : '🔇 Звук: ВЫКЛ';
    if (active) Sound.playClick();
  });

  return hud;
}

function refreshHUDxp() {
  const el = document.getElementById('hud-xp');
  if (el) el.textContent = G.progress.xp;
}

// ─────────────────────────────────────────────────────────────
// TYPEWRITER ENGINE
// ─────────────────────────────────────────────────────────────
function startTypewriter(containerEl, fullText, { speed = 20, onComplete } = {}) {
  let isCancelled = false;
  let charIdx = 0;
  containerEl.innerHTML = '';

  const textSpan = document.createElement('span');
  textSpan.className = 'typewriter-content';
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'typewriter-cursor';
  cursorSpan.textContent = '▌';

  containerEl.appendChild(textSpan);
  containerEl.appendChild(cursorSpan);

  function step() {
    if (isCancelled) return;
    if (charIdx < fullText.length) {
      const ch = fullText[charIdx];
      textSpan.textContent += ch;
      charIdx++;

      // Play soft speech chirp on every 3rd character
      if (charIdx % 3 === 0 && ch.trim() !== '') {
        Sound.playType();
      }

      // Natural cadence pauses
      let delay = speed;
      if (ch === '.' || ch === '!' || ch === '?') delay = speed * 6;
      else if (ch === ',' || ch === ';' || ch === '—') delay = speed * 3.5;

      setTimeout(step, delay);
    } else {
      cursorSpan.remove();
      if (onComplete) onComplete();
    }
  }

  step();

  return {
    skip: () => {
      if (isCancelled) return;
      isCancelled = true;
      textSpan.textContent = fullText;
      cursorSpan.remove();
      if (onComplete) onComplete();
    },
    isDone: () => charIdx >= fullText.length || isCancelled
  };
}

// ─────────────────────────────────────────────────────────────
// SCREEN: LOGIN
// ─────────────────────────────────────────────────────────────
function renderLogin(root) {
  let selectedAvatar = PLAYER_AVATARS[0];

  root.innerHTML = `
    <div class="login-screen">
      <div class="login-bg"></div>
      <div class="login-card animate-in">
        <div class="login-emblem">🏦</div>
        <h1 class="login-title">Forte Quest</h1>
        <p class="login-subtitle">
          Интерактивный RPG-тренажёр переговоров по банковским гарантиям.<br>
          Проведите реальные переговоры с клиентами, выбирайте правильные решения и повышайте свой ранг!
        </p>

        <label class="field-label" for="pname">Ваше имя</label>
        <input class="field-input" id="pname" type="text"
          placeholder="Например: Дамир Сейткали" maxlength="40" autocomplete="name" />

        <span class="avatar-label">Выберите персонажа</span>
        <div class="avatar-grid" id="av-grid">
          ${PLAYER_AVATARS.map((a,i) => `
            <button class="avatar-btn${i===0?' active':''}" data-av="${esc(a)}" aria-label="${a}">${a}</button>
          `).join('')}
        </div>

        <button class="btn btn-gold btn-full" id="start-btn" style="font-size:18px;min-height:60px;" disabled>
          ▶ Начать игру
        </button>
      </div>
    </div>
  `;

  const nameInput = root.querySelector('#pname');
  const startBtn  = root.querySelector('#start-btn');

  const last = loadAllPlayers().slice(-1)[0];
  if (last) { nameInput.value = last.name; selectedAvatar = last.avatar || selectedAvatar; }

  nameInput.addEventListener('input', () => { startBtn.disabled = nameInput.value.trim().length < 2; });
  if (nameInput.value.trim().length >= 2) startBtn.disabled = false;

  root.querySelectorAll('.avatar-btn').forEach(btn => {
    if (btn.dataset.av === selectedAvatar) btn.classList.add('active');
    else btn.classList.remove('active');
    btn.addEventListener('click', () => {
      Sound.playClick();
      root.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAvatar = btn.dataset.av;
    });
  });

  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length < 2) return;
    Sound.playClick();
    const existing = loadAllPlayers().find(p => p.name === name);
    G.player   = { name, avatar: existing?.avatar || selectedAvatar };
    G.progress = loadPlayer(name);
    go(renderMap);
  });

  nameInput.focus();
}

// ─────────────────────────────────────────────────────────────
// SCREEN: MAP / CASES
// ─────────────────────────────────────────────────────────────
function renderMap(root) {
  const hud = buildHUD();
  root.appendChild(hud);

  const main = document.createElement('main');
  main.className = 'map-screen animate-in';

  const done = G.progress.done || {};
  const totalCases = G.cases.length;
  const completedCount = G.cases.filter(c => done[c.id]?.pass).length;

  main.innerHTML = `
    <div class="map-hero">
      <div class="map-hero-badge">💼 Симулятор переговоров · ForteBank</div>
      <h1 class="map-title">Выберите клиентский кейс</h1>
      <p class="map-sub">
        Пройдено: <strong>${completedCount}</strong> из <strong>${totalCases}</strong> кейсов.
        Каждый диалог проверяет знание продуктов, стоп-факторов, расчет комиссий и каналы подачи.
      </p>
    </div>

    <div class="case-grid" id="case-grid"></div>

    <div class="action-row" style="justify-content:center;margin-top:20px;">
      <button class="btn btn-ghost" id="lb-btn">🏆 Таблица рейтинга</button>
      ${completedCount === totalCases && totalCases > 0
        ? `<button class="btn btn-gold" id="cert-btn">🎓 Получить сертификат</button>`
        : ''}
    </div>
  `;
  root.appendChild(main);

  const grid = main.querySelector('#case-grid');
  G.cases.forEach((c, idx) => {
    const color = CASE_COLORS[idx % CASE_COLORS.length];
    const mDone = done[c.id];
    const isPassed = !!mDone?.pass;
    const best = mDone ? Math.round(mDone.best || 0) : 0;
    const profile = CLIENT_PROFILES[c.id] || { archetype: 'Клиент банка', avatar: '👤', title: 'Клиент' };
    const stageCount = c.stages.length;

    const card = document.createElement('div');
    card.className = 'case-card';
    card.setAttribute('data-color', color);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <div class="case-top">
        <div class="case-icon">${profile.avatar}</div>
        <div class="case-badges">
          ${isPassed ? '<span class="badge badge-done">✓ Пройдено</span>' : ''}
          <span class="badge badge-kind">Диалог</span>
        </div>
      </div>
      <div class="case-client">${esc(c.client)} · ${esc(profile.archetype)}</div>
      <div class="case-title">${esc(c.title)}</div>
      <div class="case-request">${esc(c.request)}</div>
      ${isPassed ? `
        <div style="font-size:12px;color:var(--green);font-weight:700;">
          ⭐ Лучший результат: ${best}%
        </div>
      ` : ''}
      <div class="case-footer">
        <span class="case-footer-meta">${stageCount} этапов</span>
        <button class="case-cta" tabindex="-1">
          ${isPassed ? '↻ Повторить →' : '▶ Начать диалог →'}
        </button>
      </div>
    `;

    const launch = () => { Sound.playClick(); go(renderConvo, c); };
    card.addEventListener('click', launch);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); launch(); } });
    grid.appendChild(card);
  });

  main.querySelector('#lb-btn').addEventListener('click', () => { Sound.playClick(); go(renderLeaderboard); });
  const certBtn = main.querySelector('#cert-btn');
  if (certBtn) certBtn.addEventListener('click', () => { Sound.playClick(); go(renderCertificate); });
}

// ─────────────────────────────────────────────────────────────
// SCREEN: VISUAL NOVEL CONVERSATION GAME
// ─────────────────────────────────────────────────────────────
function renderConvo(root, caseData) {
  const hud = buildHUD();
  root.appendChild(hud);

  const main = document.createElement('main');
  main.className = 'convo-screen animate-in';
  root.appendChild(main);

  const profile = CLIENT_PROFILES[caseData.id] || {
    archetype: 'Клиент банка',
    avatar: '👤',
    title: 'Клиент'
  };

  // State
  let stageIdx = 0;
  let score = 0;
  let trust = 50;
  let chosen = null;
  let reviews = [];
  let currentTypewriter = null;
  const maxPossible = maxScore(caseData);

  // Message history for dialogue stream
  let chatHistory = [];

  function currentStage() {
    return caseData.stages[stageIdx];
  }

  // Keyboard shortcut handler
  function handleKeyDown(e) {
    if (e.target && ['input','textarea'].includes(e.target.tagName.toLowerCase())) return;

    // Space: skip typing if actively typing
    if (e.code === 'Space') {
      if (currentTypewriter && !currentTypewriter.isDone()) {
        e.preventDefault();
        currentTypewriter.skip();
        return;
      }
    }

    // Number keys 1, 2, 3 to choose options
    if (!chosen && stageIdx < caseData.stages.length) {
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 3) {
        const stage = currentStage();
        if (stage && stage.options && stage.options[num - 1]) {
          const btn = main.querySelector(`.rpg-choice-card[data-opt-idx="${num - 1}"]`);
          if (btn && !btn.disabled) {
            e.preventDefault();
            btn.click();
          }
        }
      }
    }

    // Enter: continue to next stage if choice already made
    if (chosen && e.code === 'Enter') {
      const nextBtn = main.querySelector('#next-stage-btn');
      if (nextBtn) {
        e.preventDefault();
        nextBtn.click();
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown);

  // Cleanup on leave
  const originalGo = go;

  function renderScene() {
    main.innerHTML = '';

    // Top Navigation & Case title
    const nav = document.createElement('div');
    nav.className = 'convo-nav';
    nav.innerHTML = `
      <button class="back-btn" id="convo-back-btn">← Все кейсы</button>
      <span class="convo-case-title">💼 ${esc(caseData.title)}</span>
    `;
    nav.querySelector('#convo-back-btn').addEventListener('click', () => {
      window.removeEventListener('keydown', handleKeyDown);
      Sound.playClick();
      go(renderMap);
    });
    main.appendChild(nav);

    // Stage Stepper (1 to 5)
    const stepper = document.createElement('div');
    stepper.className = 'game-stepper';
    stepper.innerHTML = caseData.stages.map((st, i) => {
      const cls = i < stageIdx ? 'done' : i === stageIdx ? 'active' : '';
      return `
        <div class="step-item ${cls}">
          <div class="step-num">${i < stageIdx ? '✓' : i + 1}</div>
          <div class="step-name">${esc(st.stage_name)}</div>
          ${i < caseData.stages.length - 1 ? '<span class="step-arrow">›</span>' : ''}
        </div>
      `;
    }).join('');
    main.appendChild(stepper);

    // Main Game Arena Layout
    const layout = document.createElement('div');
    layout.className = 'convo-layout';

    // ── LEFT: CLIENT CHARACTER STAGE ──
    const tr = Math.max(0, Math.min(100, Math.round(trust)));
    const trustCls = tr < 35 ? 'lo' : tr >= 70 ? 'hi' : 'mid';

    const clientStage = document.createElement('div');
    clientStage.className = 'client-stage';
    clientStage.id = 'client-stage-card';

    clientStage.innerHTML = `
      <div class="client-portrait-wrap">
        <div class="client-avatar-frame" id="client-avatar-frame">
          <div class="client-avatar-emoji">${profile.avatar}</div>
          <div class="speaking-eq">
            <div class="eq-bar"></div>
            <div class="eq-bar"></div>
            <div class="eq-bar"></div>
            <div class="eq-bar"></div>
          </div>
        </div>
        <div class="client-status-badge" id="client-status-badge">💬 Говорит...</div>
        <div class="client-name-title">${esc(caseData.client)}</div>
        <div class="client-archetype">${esc(profile.archetype)}</div>
      </div>

      <!-- Trust Gauge -->
      <div class="trust-widget">
        <div class="floating-fx-container" id="floating-fx-container"></div>
        <div class="trust-header-row">
          <span class="trust-title-text">🤝 Доверие клиента</span>
          <span class="trust-number-val ${trustCls}" id="trust-val">${tr}%</span>
        </div>
        <div class="trust-gauge-rail">
          <div class="trust-gauge-bar ${trustCls}" id="trust-bar" style="width:${tr}%"></div>
        </div>
      </div>

      <!-- Client Dossier -->
      <div class="dossier-box">
        <div class="dossier-header">
          <span>📋 Дело клиента</span>
        </div>
        ${Object.entries(caseData.data || {}).map(([k, v]) => `
          <div class="dossier-row">
            <span class="dossier-lbl">${esc(k.replace(/_/g, ' '))}:</span>
            <span class="dossier-val">${esc(v)}</span>
          </div>
        `).join('')}
      </div>
    `;
    layout.appendChild(clientStage);

    // ── RIGHT: DIALOGUE DECK ──
    const dialogueDeck = document.createElement('div');
    dialogueDeck.className = 'dialogue-deck';

    // Stream of previous conversation
    const chatStream = document.createElement('div');
    chatStream.className = 'chat-stream';
    chatStream.id = 'chat-stream';

    chatHistory.forEach(entry => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${entry.type}`;
      bubble.innerHTML = `
        <span class="bubble-speaker-tag">${esc(entry.speaker)}</span>
        <div>${esc(entry.text)}</div>
      `;
      chatStream.appendChild(bubble);
    });
    dialogueDeck.appendChild(chatStream);

    // Active Visual Novel Dialogue Frame
    const vnFrame = document.createElement('div');
    vnFrame.className = 'vn-dialogue-frame speaking-glow';
    vnFrame.id = 'vn-dialogue-frame';

    const stage = currentStage();
    const isFinished = stageIdx >= caseData.stages.length;

    if (isFinished) {
      vnFrame.innerHTML = `
        <div class="vn-dialogue-top">
          <span class="vn-speaker-badge">🏁 Переговоры завершены</span>
        </div>
        <div class="vn-dialogue-text">
          Все этапы диалога с клиентом пройдены. Посмотрим на ваши результаты и разбор ошибок!
        </div>
      `;
      dialogueDeck.appendChild(vnFrame);

      const finishBtn = document.createElement('button');
      finishBtn.className = 'btn btn-gold btn-full';
      finishBtn.style.cssText = 'min-height:60px;font-size:18px;margin-top:14px;';
      finishBtn.textContent = '🎯 Посмотреть результат';
      finishBtn.addEventListener('click', () => {
        window.removeEventListener('keydown', handleKeyDown);
        Sound.playVictory();
        const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
        go(renderResult, caseData, Math.max(0, Math.min(100, pct)), reviews);
      });
      dialogueDeck.appendChild(finishBtn);
      layout.appendChild(dialogueDeck);
      main.appendChild(layout);
      return;
    }

    // Active Dialogue Box for current stage
    vnFrame.innerHTML = `
      <div class="vn-dialogue-top">
        <span class="vn-speaker-badge">💬 ${esc(caseData.client)}</span>
        <button class="vn-skip-btn" id="vn-skip-btn">⏩ Пропустить (Space)</button>
      </div>
      <div class="vn-dialogue-text" id="typewriter-box"></div>
    `;
    dialogueDeck.appendChild(vnFrame);

    // Options container (Action choices)
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'rpg-actions-container';
    actionsContainer.id = 'rpg-actions-container';
    actionsContainer.style.display = 'none'; // hidden during typewriter

    if (!chosen) {
      actionsContainer.innerHTML = `
        <div class="rpg-actions-title">
          <span>⚡ Выберите ваш ответ (Клавиши 1, 2, 3 или клик мышью):</span>
        </div>
      `;

      stage.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'rpg-choice-card';
        btn.setAttribute('data-opt-idx', idx);
        btn.innerHTML = `
          <div class="rpg-key-badge">${idx + 1}</div>
          <div>${esc(opt.text)}</div>
        `;

        btn.addEventListener('click', () => {
          makeChoice(opt);
        });
        actionsContainer.appendChild(btn);
      });
    }

    dialogueDeck.appendChild(actionsContainer);
    layout.appendChild(dialogueDeck);
    main.appendChild(layout);

    // Scroll chat stream
    setTimeout(() => {
      chatStream.scrollTop = chatStream.scrollHeight;
    }, 50);

    // Trigger Typewriter for client's line
    const textTarget = main.querySelector('#typewriter-box');
    const avatarFrame = main.querySelector('#client-avatar-frame');
    const statusBadge = main.querySelector('#client-status-badge');
    const skipBtn = main.querySelector('#vn-skip-btn');

    if (avatarFrame) avatarFrame.className = 'client-avatar-frame speaking';
    if (statusBadge) {
      statusBadge.className = 'client-status-badge speaking';
      statusBadge.textContent = '💬 Говорит...';
    }

    function onTypewriterDone() {
      if (avatarFrame) avatarFrame.className = 'client-avatar-frame';
      if (statusBadge) {
        statusBadge.className = 'client-status-badge';
        statusBadge.textContent = '👂 Слушает вас';
      }
      if (vnFrame) vnFrame.classList.remove('speaking-glow');
      if (skipBtn) skipBtn.style.display = 'none';

      // Reveal action choices smoothly
      const act = main.querySelector('#rpg-actions-container');
      if (act && !chosen) {
        act.style.display = 'flex';
      }
    }

    currentTypewriter = startTypewriter(textTarget, stage.client_line, {
      speed: 22,
      onComplete: onTypewriterDone
    });

    // Clicking dialogue or skip button immediately completes text
    if (skipBtn) skipBtn.addEventListener('click', () => currentTypewriter.skip());
    if (textTarget) textTarget.addEventListener('click', () => currentTypewriter.skip());

    // ── Choice Handler ──
    function makeChoice(opt) {
      chosen = opt;
      score += opt.score;
      const deltaTrust = opt.score * 0.6;
      trust = Math.max(0, Math.min(100, trust + deltaTrust));

      // Audio feedback
      if (opt.correct) Sound.playCorrect();
      else Sound.playMistake();

      // Add user response and client reaction to history
      chatHistory.push({ type: 'you', speaker: 'Вы (Консультант)', text: opt.text });
      chatHistory.push({ type: 'client', speaker: caseData.client, text: opt.reaction });

      // Floating combat score popup
      showFloatingScore(opt.score);

      // Emotion reaction on client avatar
      const frame = main.querySelector('#client-avatar-frame');
      const badge = main.querySelector('#client-status-badge');
      const card = main.querySelector('#client-stage-card');

      if (opt.correct) {
        if (frame) frame.className = 'client-avatar-frame happy';
        if (badge) {
          badge.className = 'client-status-badge happy';
          badge.textContent = '🌟 Доволен(а) ответом!';
        }
        if (card) { card.classList.add('happy'); setTimeout(() => card.classList.remove('happy'), 1200); }
      } else {
        if (frame) frame.className = 'client-avatar-frame skeptical';
        if (badge) {
          badge.className = 'client-status-badge skeptical';
          badge.textContent = '⚠️ Не согласен / сомневается';
        }
        if (card) { card.classList.add('skeptical'); setTimeout(() => card.classList.remove('skeptical'), 1200); }
      }

      // Update trust bar UI smoothly
      const newTr = Math.max(0, Math.min(100, Math.round(trust)));
      const trustValEl = main.querySelector('#trust-val');
      const trustBarEl = main.querySelector('#trust-bar');
      const newCls = newTr < 35 ? 'lo' : newTr >= 70 ? 'hi' : 'mid';

      if (trustValEl) {
        trustValEl.textContent = `${newTr}%`;
        trustValEl.className = `trust-number-val ${newCls}`;
      }
      if (trustBarEl) {
        trustBarEl.style.width = `${newTr}%`;
        trustBarEl.className = `trust-gauge-bar ${newCls}`;
      }

      // Replace actions area with Coach review deck and Continue button
      const actContainer = main.querySelector('#rpg-actions-container');
      if (actContainer) {
        actContainer.innerHTML = '';

        // Coach explanation card
        const coachDeck = document.createElement('div');
        coachDeck.className = `coach-deck ${opt.correct ? 'good' : 'bad'}`;
        coachDeck.innerHTML = `
          <div class="coach-avatar-box">👨‍🏫</div>
          <div class="coach-content">
            <div class="coach-title-row">
              <span class="coach-name">Наставник Forte</span>
              <span class="coach-score-tag ${opt.score > 0 ? 'pos' : 'neg'}">
                ${opt.score > 0 ? '+' : ''}${opt.score} баллов к репутации
              </span>
            </div>
            <div class="coach-body-text">${esc(opt.explanation)}</div>
          </div>
        `;
        actContainer.appendChild(coachDeck);

        // Continue Button
        const contBtn = document.createElement('button');
        contBtn.className = 'btn btn-primary btn-full';
        contBtn.id = 'next-stage-btn';
        contBtn.style.cssText = 'min-height:58px;font-size:17px;margin-top:10px;';
        contBtn.innerHTML = stageIdx + 1 >= caseData.stages.length
          ? '🎯 Завершить переговоры (Enter)'
          : '▶ Перейти к следующему этапу (Enter) →';

        contBtn.addEventListener('click', () => {
          Sound.playClick();
          reviews.push({
            stageNum:    stage.stage_number,
            stageName:   stage.stage_name,
            choiceText:  opt.text,
            isCorrect:   opt.correct,
            explanation: opt.explanation,
            score:       opt.score,
          });

          stageIdx++;
          chosen = null;
          renderScene();
        });

        actContainer.appendChild(contBtn);
        contBtn.focus();
      }
    }

    // Helper for floating text
    function showFloatingScore(amount) {
      const container = main.querySelector('#floating-fx-container');
      if (!container) return;
      const pill = document.createElement('div');
      pill.className = `floating-pill ${amount > 0 ? 'pos' : 'neg'}`;
      pill.innerHTML = amount > 0
        ? `+${amount} Репутация! ✨`
        : `${amount} Ошибка ⚠️`;
      container.appendChild(pill);
      setTimeout(() => pill.remove(), 1800);
    }
  }

  renderScene();
}

// ─────────────────────────────────────────────────────────────
// SCREEN: RESULT
// ─────────────────────────────────────────────────────────────
function renderResult(root, caseData, scorePct, reviews) {
  const prev     = G.progress.done[caseData.id] || { xp: 0, best: 0 };
  const xpEarned = Math.round(scorePct);
  const gain     = Math.max(0, xpEarned - (prev.xp || 0));
  const oldXP    = G.progress.xp;

  G.progress.xp += gain;
  G.progress.done[caseData.id] = {
    xp:   Math.max(xpEarned, prev.xp || 0),
    best: Math.max(scorePct, prev.best || 0),
    pass: prev.pass || scorePct >= 70,
  };
  savePlayer();
  refreshHUDxp();

  const oldRank  = getRank(oldXP);
  const newRank  = getRank(G.progress.xp);
  const rankedUp = newRank.name !== oldRank.name;
  const isGreat  = scorePct >= 70;
  const circCls  = scorePct >= 70 ? 'great' : scorePct >= 40 ? 'ok' : 'poor';

  if (isGreat) triggerConfetti(4000);

  const hud = buildHUD();
  root.appendChild(hud);

  const main = document.createElement('main');
  main.className = 'result-screen animate-in';

  main.innerHTML = `
    <div class="convo-nav" style="margin-bottom:20px;">
      <button class="back-btn" id="back-btn">← Все кейсы</button>
    </div>

    <div class="result-hero">
      <div class="result-circle ${circCls}">${Math.round(scorePct)}%</div>
      <div class="result-title">${scorePct >= 70 ? '🎉 Отличная консультация!' : scorePct >= 40 ? '💪 Хорошее начало' : '📚 Требуется практика'}</div>
      <p class="result-note">${
        scorePct >= 70
          ? 'Вы отлично провели переговоры: верно определили продукт, точно назвали комиссии и корректно направили клиента в нужный канал!'
          : scorePct >= 40
          ? 'Диалог в целом состоялся, однако допущены ошибки в продуктовой линейке, ограничениях или расчёте условий.'
          : 'Клиент остался неудовлетворён консультацией. Ознакомьтесь с правильными параметрами продукта и попробуйте снова.'
      }</p>
      <div class="xp-badge">✨ +${gain} XP</div>
      ${gain < xpEarned ? `<p style="color:var(--muted);font-size:12px;margin-top:10px;">Повторное прохождение засчитывает прирост опыта.</p>` : ''}
    </div>

    <!-- Correct product reveal -->
    <div class="correct-product-box">
      <div class="correct-product-icon">✅</div>
      <div>
        <div class="correct-product-label">Эталонное решение по гарантии</div>
        <div class="correct-product-name">${esc(caseData.correct_product)}</div>
        <div class="correct-product-detail">
          <strong>Комиссия:</strong> ${esc(caseData.commission)}<br>
          <strong>Канал оформления:</strong> ${esc(caseData.channel)}<br>
          <strong>Лимиты:</strong> ${esc(caseData.limits)}<br>
          <strong>Документы:</strong> ${esc(caseData.documents)}
        </div>
      </div>
    </div>

    <div class="action-row" style="margin-bottom:32px;">
      <button class="btn btn-gold" id="again-btn">↻ Пройти кейс ещё раз</button>
      <button class="btn btn-ghost" id="home-btn">← Все кейсы</button>
    </div>

    <h2 class="section-title">📋 Детальный разбор каждого этапа</h2>
    <div class="review-section" id="review-area"></div>
  `;
  root.appendChild(main);

  const revArea = main.querySelector('#review-area');
  reviews.forEach(r => {
    const item = document.createElement('div');
    item.className = `review-item ${r.isCorrect ? 'ok' : 'miss'}`;
    item.innerHTML = `
      <div class="review-stage">Этап ${r.stageNum}: ${esc(r.stageName)}</div>
      <div class="review-result-tag ${r.isCorrect ? 'ok' : 'miss'}">${r.isCorrect ? '✓ Верно' : '✗ Ошибка'} · ${r.score > 0 ? '+' : ''}${r.score} баллов</div>
      <div class="review-choice">«${esc(r.choiceText)}»</div>
      <div class="review-why">${esc(r.explanation)}</div>
    `;
    revArea.appendChild(item);
  });

  main.querySelector('#back-btn').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
  main.querySelector('#home-btn').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
  main.querySelector('#again-btn').addEventListener('click', () => { Sound.playClick(); go(renderConvo, caseData); });

  if (rankedUp) showCeremony(newRank);
}

// ─────────────────────────────────────────────────────────────
// RANK-UP CEREMONY
// ─────────────────────────────────────────────────────────────
function showCeremony(rank) {
  setTimeout(() => {
    Sound.playVictory();
    const ov = document.createElement('div');
    ov.className = 'ceremony-overlay';
    ov.innerHTML = `
      <div class="ceremony-card">
        <div class="ceremony-stars">🌟✨🏆✨🌟</div>
        <div class="ceremony-lbl">Повышение ранга!</div>
        <div class="ceremony-title">${esc(rank.icon)} ${esc(rank.name)}</div>
        <div class="ceremony-sub">Ваш навык консультирования по гарантиям перешёл на новый уровень!</div>
        <button class="btn btn-gold btn-full" id="ov-close" style="font-size:17px;min-height:54px;">🎉 Принять награду</button>
      </div>
    `;
    document.body.appendChild(ov);
    ov.querySelector('#ov-close').addEventListener('click', () => { Sound.playClick(); ov.remove(); });
    triggerConfetti(3500);
  }, 600);
}

// ─────────────────────────────────────────────────────────────
// SCREEN: LEADERBOARD
// ─────────────────────────────────────────────────────────────
function renderLeaderboard(root) {
  const hud = buildHUD();
  root.appendChild(hud);

  const players = getLeaderboard();
  const medals  = ['🥇','🥈','🥉'];

  const main = document.createElement('main');
  main.className = 'lb-screen animate-in';
  main.innerHTML = `
    <div class="convo-nav"><button class="back-btn" id="back-btn">← Назад</button></div>
    <div class="lb-head">
      <h1>🏆 Таблица рейтинга</h1>
      <p>Лучшие консультанты по банковским гарантиям</p>
    </div>
    ${players.length === 0
      ? `<div style="text-align:center;color:var(--muted);padding:48px 0;">Пока нет результатов. Начните обучение!</div>`
      : `<div class="lb-list" id="lb-list"></div>`
    }
    <div class="action-row mt-24" style="justify-content:center;">
      <button class="btn btn-ghost" id="back-btn2">← Вернуться к кейсам</button>
    </div>
  `;
  root.appendChild(main);

  if (players.length > 0) {
    const list = main.querySelector('#lb-list');
    players.forEach((p, i) => {
      const rank   = getRank(p.xp || 0);
      const isMe   = G.player && p.name === G.player.name;
      const posCls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const item   = document.createElement('div');
      item.className = `lb-item${isMe ? ' me' : ''}${i === 0 ? ' top' : ''}`;
      item.innerHTML = `
        <div class="lb-pos ${posCls}">${medals[i] || i + 1}</div>
        <div class="lb-av">${esc(p.avatar || '👤')}</div>
        <div class="lb-info">
          <div class="lb-name">${esc(p.name)}${isMe ? ' <span style="color:var(--blue);font-size:12px;">(вы)</span>' : ''}</div>
          <div class="lb-rank">${esc(rank.icon)} ${esc(rank.name)}</div>
        </div>
        <div class="lb-xp-group">
          <div class="lb-xp-val">${p.xp || 0}</div>
          <div class="lb-xp-lbl">XP</div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  main.querySelector('#back-btn').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
  main.querySelector('#back-btn2').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
}

// ─────────────────────────────────────────────────────────────
// SCREEN: CERTIFICATE
// ─────────────────────────────────────────────────────────────
function renderCertificate(root) {
  const hud = buildHUD();
  root.appendChild(hud);
  const rank = getRank(G.progress.xp);
  const today = new Date().toLocaleDateString('ru-RU', { year:'numeric', month:'long', day:'numeric' });
  const completedCount = G.cases.filter(c => G.progress.done[c.id]?.pass).length;

  const main = document.createElement('main');
  main.className = 'cert-screen animate-in';
  main.innerHTML = `
    <div class="convo-nav"><button class="back-btn" id="back-btn">← Назад</button></div>
    <div class="cert-card" id="cert-area">
      <div class="cert-corner tl">🏦</div>
      <div class="cert-corner tr">🏦</div>
      <div class="cert-corner bl">🏦</div>
      <div class="cert-corner br">🏦</div>
      <div class="cert-badge">🎓</div>
      <div class="cert-issued">ForteBank · Сертификат об окончании симулятора</div>
      <div class="cert-name">${esc(G.player.name)}</div>
      <div class="cert-text">
        успешно прошёл(а) игровой тренажёр консультанта<br>
        <strong>«Банковские гарантии: продукты, лимиты и переговоры»</strong><br><br>
        Освоены ключевые алгоритмы подбора бланковых и покрытых гарантий, расчет комиссии и регламенты каналов обслуживания.
      </div>
      <hr class="cert-hr" />
      <div class="cert-stats">
        <div>
          <div class="cert-stat-val gold">${G.progress.xp} XP</div>
          <div class="cert-stat-lbl">Опыт</div>
        </div>
        <div>
          <div class="cert-stat-val">${esc(rank.icon)} ${esc(rank.name)}</div>
          <div class="cert-stat-lbl">Итоговый ранг</div>
        </div>
        <div>
          <div class="cert-stat-val">${completedCount}</div>
          <div class="cert-stat-lbl">Кейсов пройдено</div>
        </div>
      </div>
      <hr class="cert-hr" />
      <div class="cert-footer">Выдан: ${today} · Forte Quest · forte.kz</div>
    </div>
    <div class="action-row mt-24" style="justify-content:center;">
      <button class="btn btn-gold" id="print-btn">🖨️ Распечатать</button>
      <button class="btn btn-ghost" id="home-btn">← К кейсам</button>
    </div>
  `;
  root.appendChild(main);
  triggerConfetti(4000);

  main.querySelector('#back-btn').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
  main.querySelector('#home-btn').addEventListener('click', () => { Sound.playClick(); go(renderMap); });
  main.querySelector('#print-btn').addEventListener('click', () => window.print());
}

// ─────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────
function renderError(root, msg) {
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <div class="error-title">Ошибка загрузки данных</div>
        <div class="error-msg">${esc(msg)}</div>
        <div class="error-hint">Убедитесь, что сервер запущен: <code>python -m http.server 8000</code></div>
        <div style="margin-top:20px;">
          <button class="btn btn-primary" onclick="location.reload()">↻ Перезагрузить</button>
        </div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────
// INIT & NORMALIZATION
// ─────────────────────────────────────────────────────────────
async function init() {
  const root = document.getElementById('root');
  try {
    const resp = await fetch(CASES_URL + '?v=' + Date.now());
    if (!resp.ok) throw new Error('Не удалось загрузить all-cases.json');

    let text = await resp.text();
    text = text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }
    const data = JSON.parse(text);
    const rawCases = Array.isArray(data) ? data : (data.cases || []);
    if (!rawCases.length) throw new Error('Файл all-cases.json не содержит кейсов');

    // Normalize case fields for robust compatibility
    G.cases = rawCases.map((c, idx) => {
      const clientData = c.client_data || c.data || {};
      const stages = (c.stages || []).map((s, sIdx) => ({
        stage_number: s.stage || s.stage_number || (sIdx + 1),
        stage_name:   s.name  || s.stage_name   || `Этап ${sIdx + 1}`,
        client_line:  s.client_line || '',
        options: (s.options || []).map((o, oIdx) => ({
          id:          o.id || o.option_id || `${sIdx + 1}.${oIdx + 1}`,
          text:        o.text || '',
          correct:     !!o.correct,
          score:       typeof o.score === 'number' ? o.score : (o.correct ? 25 : -20),
          reaction:    o.reaction || o.client_reaction || '',
          explanation: o.explanation || ''
        }))
      }));

      return {
        id:              c.id || (idx + 1),
        title:           c.title || `Кейс ${idx + 1}`,
        client:          c.client || 'Клиент',
        request:         c.request || '',
        data:            clientData,
        correct_product: c.correct_product || '',
        commission:      c.commission || '',
        limits:          c.limits || '',
        channel:         c.channel || '',
        documents:       c.documents || '',
        stages
      };
    });

    go(renderLogin);
  } catch (e) {
    renderError(root, e.message);
  }
}

init();
