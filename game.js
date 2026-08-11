(() => {
  "use strict";

  const W = 320;
  const H = 480;
  const HUD_H = 42;
  const PLAY_TOP = HUD_H + 4;
  const STORAGE_KEY = "retroSkyRaidHighScore";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const RAW_ASSETS = {
    player: "ChatGPT Image 2026年5月1日 23_02_29 (1).png",
    playerLeft: "ChatGPT Image 2026年5月1日 23_02_29 (2).png",
    playerRight: "ChatGPT Image 2026年5月1日 23_02_29 (3).png",
    smallEnemy: "ChatGPT Image 2026年5月1日 23_02_30 (5).png",
    smallEnemy2: "ChatGPT Image 2026年5月1日 23_07_20 (1).png",
    mediumEnemy: "ChatGPT Image 2026年5月1日 23_23_05 (7).png",
    transport: "ChatGPT Image 2026年5月1日 23_23_06 (10).png",
    tank: "ChatGPT Image 2026年5月1日 23_02_35 (9).png",
    turret: "ChatGPT Image 2026年5月1日 23_07_24 (10).png",
    boss: "ChatGPT Image 2026年5月1日 23_27_55 (1).png",
    playerBullet: "ChatGPT Image 2026年5月1日 23_15_27 (8).png",
    enemyBullet: "ChatGPT Image 2026年5月1日 23_15_25 (4).png",
    enemyBullet2: "ChatGPT Image 2026年5月1日 23_15_26 (5).png",
    power: "ChatGPT Image 2026年5月1日 23_07_24 (8).png",
    oneUp: "ChatGPT Image 2026年5月1日 23_07_24 (9).png",
    bomb: "ChatGPT Image 2026年5月1日 23_28_24 (6).png",
    stageClear: "ChatGPT Image 2026年5月1日 23_27_56 (3).png",
    gameOver: "ChatGPT Image 2026年5月1日 23_27_56 (4).png",
    exp1: "ChatGPT Image 2026年5月1日 23_12_35 (1).png",
    exp2: "ChatGPT Image 2026年5月1日 23_12_35 (2).png",
    exp3: "ChatGPT Image 2026年5月1日 23_12_36 (3).png",
    exp4: "ChatGPT Image 2026年5月1日 23_12_36 (5).png",
    grass: "ChatGPT Image 2026年5月1日 23_13_55 (1).png",
    dirt: "ChatGPT Image 2026年5月1日 23_13_55 (2).png",
    road: "ChatGPT Image 2026年5月1日 23_13_56 (3).png",
    runway: "ChatGPT Image 2026年5月1日 23_13_56 (4).png",
    concrete: "ChatGPT Image 2026年5月1日 23_13_56 (5).png",
    water: "ChatGPT Image 2026年5月1日 23_13_56 (6).png",
    base: "ChatGPT Image 2026年5月1日 23_13_56 (7).png"
  };

  const SPRITE_IDS = [
    "player", "playerLeft", "playerRight", "smallEnemy", "smallEnemy2",
    "mediumEnemy", "transport", "tank", "turret", "boss", "playerBullet",
    "enemyBullet", "enemyBullet2", "power", "oneUp", "bomb",
    "stageClear", "gameOver", "exp1", "exp2", "exp3", "exp4"
  ];

  const DIFFICULTY = {
    EASY: { bulletSpeed: 0.82, hp: 0.85, spawn: 0.82, item: 0.24 },
    NORMAL: { bulletSpeed: 1, hp: 1, spawn: 1, item: 0.17 },
    HARD: { bulletSpeed: 1.2, hp: 1.18, spawn: 1.25, item: 0.11 }
  };

  const STAGES = [
    {
      id: 1,
      name: "COASTAL BASE",
      terrain: "coast",
      bossTime: 92,
      scrollBase: 64,
      scrollRamp: 0.45,
      scrollMax: 46,
      enemyHpScale: 1,
      enemySpeedScale: 1,
      overlay: "rgba(0, 10, 20, 0.38)",
      boss: { hp: 300, score: 10000, fireDelayScale: 1, stageId: 1 },
      waves: [
        { time: 2, enemy: "small", count: 4, x: 100, pattern: "straight" },
        { time: 5, enemy: "small", count: 5, x: 210, pattern: "v" },
        { time: 9, enemy: "small", count: 4, pattern: "left" },
        { time: 12, enemy: "small", count: 4, pattern: "right" },
        { time: 17, enemy: "tank", count: 2, x: 72, spacing: 168, pattern: "ground" },
        { time: 21, enemy: "small", count: 6, x: 160, pattern: "v" },
        { time: 27, enemy: "turret", count: 2, x: 56, spacing: 206, pattern: "ground" },
        { time: 32, enemy: "medium", count: 1, x: 160, pattern: "hover" },
        { time: 39, enemy: "small", count: 5, pattern: "left" },
        { time: 44, enemy: "small", count: 5, pattern: "right" },
        { time: 50, enemy: "transport", count: 1, x: 160, pattern: "sine", drop: "power" },
        { time: 57, enemy: "tank", count: 3, x: 50, spacing: 92, pattern: "ground" },
        { time: 63, enemy: "medium", count: 2, x: 112, spacing: 96, pattern: "hover" },
        { time: 72, enemy: "turret", count: 3, x: 44, spacing: 116, pattern: "ground" },
        { time: 78, enemy: "small", count: 7, x: 160, pattern: "v" },
        { time: 84, enemy: "transport", count: 1, x: 72, pattern: "right", drop: "bomb" },
        { time: 87, enemy: "small", count: 5, pattern: "left" }
      ]
    },
    {
      id: 2,
      name: "FOREST FORTRESS",
      terrain: "forest",
      bossTime: 104,
      scrollBase: 70,
      scrollRamp: 0.55,
      scrollMax: 56,
      enemyHpScale: 1.12,
      enemySpeedScale: 1.05,
      overlay: "rgba(4, 18, 12, 0.42)",
      boss: { hp: 390, score: 15000, fireDelayScale: 0.88, stageId: 2 },
      waves: [
        { time: 2, enemy: "small", count: 5, x: 160, pattern: "v" },
        { time: 6, enemy: "small", count: 5, pattern: "left" },
        { time: 10, enemy: "small", count: 5, pattern: "right" },
        { time: 15, enemy: "turret", count: 2, x: 52, spacing: 214, pattern: "ground" },
        { time: 19, enemy: "tank", count: 3, x: 58, spacing: 102, pattern: "ground" },
        { time: 24, enemy: "medium", count: 1, x: 112, pattern: "hover" },
        { time: 29, enemy: "medium", count: 1, x: 208, pattern: "hover" },
        { time: 34, enemy: "small", count: 7, x: 160, pattern: "v" },
        { time: 41, enemy: "transport", count: 1, x: 220, pattern: "left", drop: "power" },
        { time: 47, enemy: "turret", count: 3, x: 50, spacing: 110, pattern: "ground" },
        { time: 54, enemy: "small", count: 6, pattern: "left" },
        { time: 58, enemy: "small", count: 6, pattern: "right" },
        { time: 65, enemy: "medium", count: 2, x: 104, spacing: 112, pattern: "hover" },
        { time: 74, enemy: "tank", count: 4, x: 38, spacing: 82, pattern: "ground" },
        { time: 82, enemy: "transport", count: 1, x: 72, pattern: "right", drop: "bomb" },
        { time: 88, enemy: "small", count: 8, x: 160, pattern: "v" },
        { time: 95, enemy: "turret", count: 2, x: 92, spacing: 136, pattern: "ground" }
      ]
    },
    {
      id: 3,
      name: "FINAL RUNWAY",
      terrain: "runway",
      bossTime: 114,
      scrollBase: 76,
      scrollRamp: 0.68,
      scrollMax: 66,
      enemyHpScale: 1.24,
      enemySpeedScale: 1.1,
      overlay: "rgba(12, 12, 20, 0.46)",
      boss: { hp: 520, score: 25000, fireDelayScale: 0.72, stageId: 3 },
      waves: [
        { time: 2, enemy: "small", count: 6, pattern: "left" },
        { time: 5, enemy: "small", count: 6, pattern: "right" },
        { time: 10, enemy: "medium", count: 1, x: 160, pattern: "hover" },
        { time: 15, enemy: "turret", count: 3, x: 40, spacing: 120, pattern: "ground" },
        { time: 20, enemy: "small", count: 8, x: 160, pattern: "v" },
        { time: 27, enemy: "transport", count: 1, x: 160, pattern: "sine", drop: "power" },
        { time: 33, enemy: "medium", count: 2, x: 96, spacing: 128, pattern: "hover" },
        { time: 42, enemy: "tank", count: 4, x: 34, spacing: 84, pattern: "ground" },
        { time: 49, enemy: "small", count: 7, pattern: "left" },
        { time: 53, enemy: "small", count: 7, pattern: "right" },
        { time: 61, enemy: "turret", count: 4, x: 36, spacing: 82, pattern: "ground" },
        { time: 68, enemy: "medium", count: 2, x: 104, spacing: 112, pattern: "hover" },
        { time: 77, enemy: "transport", count: 1, x: 240, pattern: "left", drop: "bomb" },
        { time: 84, enemy: "small", count: 9, x: 160, pattern: "v" },
        { time: 91, enemy: "medium", count: 3, x: 80, spacing: 80, pattern: "hover" },
        { time: 101, enemy: "turret", count: 3, x: 58, spacing: 102, pattern: "ground" },
        { time: 108, enemy: "small", count: 8, pattern: "right" }
      ]
    }
  ];

  const input = {
    keys: new Set(),
    pressed: new Set(),
    pointer: null,
    pointerId: null,
    pointerPress: null,
    shotQueued: false,
    consume(code) {
      if (!this.pressed.has(code)) return false;
      this.pressed.delete(code);
      return true;
    },
    down(...codes) {
      return codes.some((code) => this.keys.has(code));
    }
  };

  window.addEventListener("keydown", (event) => {
    const code = event.code;
    if (!input.keys.has(code)) input.pressed.add(code);
    input.keys.add(code);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    input.keys.delete(event.code);
  });

  const actionCodes = {
    bomb: "KeyX",
    pause: "KeyP",
    mute: "KeyM"
  };
  const touchButtons = {};
  document.querySelectorAll("[data-action]").forEach((button) => {
    const code = actionCodes[button.dataset.action];
    if (!code) return;
    touchButtons[button.dataset.action] = button;
    // click covers touch, keyboard, and assistive-technology activation once.
    button.addEventListener("click", () => {
      input.pressed.add(code);
    });
  });

  function syncTouchControls(game) {
    const bombButton = touchButtons.bomb;
    if (bombButton) {
      const bombLabel = bombButton.querySelector("[data-action-label]");
      if (bombLabel) bombLabel.textContent = `BOMB ${game.bombs}`;
      bombButton.disabled = game.bombs <= 0;
      bombButton.setAttribute("aria-label", `Use bomb (${game.bombs} remaining)`);
    }

    const pauseButton = touchButtons.pause;
    if (pauseButton) {
      const pauseLabel = pauseButton.querySelector("[data-action-label]");
      const paused = game.scene === "paused";
      if (pauseLabel) pauseLabel.textContent = paused ? "RESUME" : "PAUSE";
      pauseButton.setAttribute("aria-label", paused ? "Resume game" : "Pause game");
    }

    const muteButton = touchButtons.mute;
    if (muteButton) {
      const muteLabel = muteButton.querySelector("[data-action-label]");
      const muted = game.audio.muted;
      if (muteLabel) muteLabel.textContent = muted ? "SOUND" : "MUTE";
      muteButton.setAttribute("aria-label", muted ? "Turn sound on" : "Mute sound");
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    // Keep one active pointer so a second touch cannot hijack the drag.
    if (input.pointerId !== null) return;
    if (event.pointerType === "touch" && event.isPrimary === false) return;

    const position = pointerPosition(event);
    input.pointerId = event.pointerId;
    input.pointerPress = { ...position, pointerId: event.pointerId };
    input.pointer = {
      ...position,
      pointerType: event.pointerType,
      startX: position.x,
      startY: position.y,
      dragOrigin: null
    };
    canvas.setPointerCapture(event.pointerId);
    input.pressed.add("Space");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== input.pointerId || !input.pointer) return;
    Object.assign(input.pointer, pointerPosition(event));
  });

  canvas.addEventListener("pointerup", (event) => {
    releasePointer(event.pointerId);
  });

  canvas.addEventListener("pointercancel", (event) => {
    releasePointer(event.pointerId, true);
  });

  canvas.addEventListener("lostpointercapture", (event) => {
    releasePointer(event.pointerId, true);
  });

  window.addEventListener("blur", () => {
    clearTransientInput();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") clearTransientInput();
  });

  window.addEventListener("pagehide", () => {
    clearTransientInput();
  });

  function releasePointer(pointerId = null, cancelPress = false) {
    if (input.pointerId === null) return;
    if (pointerId !== null && pointerId !== input.pointerId) return;

    const activePointerId = input.pointerId;
    input.pointer = null;
    input.pointerId = null;
    if (cancelPress) input.pointerPress = null;
    if (canvas.hasPointerCapture && canvas.hasPointerCapture(activePointerId)) {
      canvas.releasePointerCapture(activePointerId);
    }
  }

  function clearTransientInput() {
    input.keys.clear();
    input.pressed.clear();
    input.pointerPress = null;
    input.shotQueued = false;
    releasePointer();
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H
    };
  }

  function difficultyIndexAt(y, count) {
    if (!Number.isFinite(y) || y < 180 || y > 306 || count <= 0) return -1;
    return Math.min(count - 1, Math.floor((y - 180) / 42));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function circleHit(a, b) {
    const r = a.r + b.r;
    return distSq(a, b) < r * r;
  }

  function padScore(score) {
    return String(Math.floor(score)).padStart(8, "0");
  }

  function loadImage(name) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Asset failed: ${name}`));
      img.src = `assets/${name}`;
    });
  }

  async function loadAssets() {
    const raw = {};
    await Promise.all(Object.entries(RAW_ASSETS).map(async ([id, file]) => {
      raw[id] = await loadImage(file);
    }));
    const sprites = {};
    for (const id of SPRITE_IDS) {
      const tolerance = id === "player" || id === "playerLeft" || id === "playerRight" ? 34 : 42;
      sprites[id] = makeCutoutSprite(raw[id], tolerance);
    }
    return { raw, sprites };
  }

  function makeCutoutSprite(img, tolerance = 42) {
    const size = 384;
    const work = document.createElement("canvas");
    work.width = size;
    work.height = size;
    const wctx = work.getContext("2d", { willReadFrequently: true });
    wctx.imageSmoothingEnabled = false;
    wctx.drawImage(img, 0, 0, size, size);

    const image = wctx.getImageData(0, 0, size, size);
    const data = image.data;
    const bgPalette = buildBorderPalette(data, size, size);
    const visited = new Uint8Array(size * size);
    const queue = new Int32Array(size * size);
    let head = 0;
    let tail = 0;

    const enqueue = (x, y) => {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      const pos = y * size + x;
      if (visited[pos]) return;
      const i = pos * 4;
      if (!isBackground(data[i], data[i + 1], data[i + 2], data[i + 3], bgPalette, tolerance)) return;
      visited[pos] = 1;
      queue[tail++] = pos;
      data[i + 3] = 0;
    };

    for (let x = 0; x < size; x += 1) {
      enqueue(x, 0);
      enqueue(x, size - 1);
    }
    for (let y = 0; y < size; y += 1) {
      enqueue(0, y);
      enqueue(size - 1, y);
    }

    while (head < tail) {
      const pos = queue[head++];
      const x = pos % size;
      const y = (pos / size) | 0;
      enqueue(x + 1, y);
      enqueue(x - 1, y);
      enqueue(x, y + 1);
      enqueue(x, y - 1);
    }

    let minX = size;
    let minY = size;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = (y * size + x) * 4;
        if (data[i + 3] > 20) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    wctx.putImageData(image, 0, 0);

    if (maxX < minX || maxY < minY) return work;

    const pad = 3;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(size - 1, maxX + pad);
    maxY = Math.min(size - 1, maxY + pad);

    const out = document.createElement("canvas");
    out.width = maxX - minX + 1;
    out.height = maxY - minY + 1;
    const octx = out.getContext("2d");
    octx.imageSmoothingEnabled = false;
    octx.drawImage(work, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
    return out;
  }

  function buildBorderPalette(data, w, h) {
    const counts = new Map();
    const add = (x, y) => {
      const i = (y * w + x) * 4;
      const r = data[i] >> 4;
      const g = data[i + 1] >> 4;
      const b = data[i + 2] >> 4;
      const key = `${r},${g},${b}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    };
    for (let x = 0; x < w; x += 2) {
      add(x, 0);
      add(x, h - 1);
    }
    for (let y = 0; y < h; y += 2) {
      add(0, y);
      add(w - 1, y);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 48)
      .map(([key]) => key.split(",").map((n) => Number(n) * 16 + 8));
  }

  function isBackground(r, g, b, a, palette, tolerance) {
    if (a < 16) return true;
    const limit = tolerance * tolerance;
    for (const color of palette) {
      const dr = r - color[0];
      const dg = g - color[1];
      const db = b - color[2];
      if (dr * dr + dg * dg + db * db <= limit) return true;
    }
    return false;
  }

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.bgm = null;
      this.enabled = true;
      this.muted = false;
      this.nextShotTime = 0;
      this.nextEnemyShotTime = 0;
    }

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume();
        return;
      }
      if (!this.enabled) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this.enabled = false;
        return;
      }
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.18;
      this.musicGain.gain.value = 0.72;
      this.sfxGain.gain.value = 0.95;
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.master.connect(this.ctx.destination);
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(this.muted ? 0 : 0.18, this.ctx.currentTime, 0.02);
      }
      return this.muted;
    }

    midi(note) {
      return 440 * 2 ** ((note - 69) / 12);
    }

    tone(freq, time, type = "square", gain = 0.08, slide = 1, destination = this.sfxGain, when = null) {
      if (!this.ctx) return;
      const now = when ?? this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), now + time);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + time);
      osc.connect(amp);
      amp.connect(destination || this.sfxGain);
      osc.start(now);
      osc.stop(now + time + 0.02);
    }

    noise(time = 0.22, gain = 0.12, filterFreq = 900, destination = this.sfxGain, when = null) {
      if (!this.ctx) return;
      const now = when ?? this.ctx.currentTime;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * time, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const amp = this.ctx.createGain();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, filterFreq * 0.28), now + time);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + time);
      source.buffer = buffer;
      source.connect(filter);
      filter.connect(amp);
      amp.connect(destination || this.sfxGain);
      source.start(now);
    }

    shot(power = 1) {
      if (!this.ctx || this.ctx.currentTime < this.nextShotTime) return;
      const now = this.ctx.currentTime;
      this.nextShotTime = now + 0.045;
      this.tone(820 + power * 42, 0.045, "square", 0.026, 1.95, this.sfxGain, now);
      this.tone(1640 + power * 72, 0.028, "triangle", 0.016, 1.35, this.sfxGain, now + 0.008);
    }

    enemyShot() {
      if (!this.ctx || this.ctx.currentTime < this.nextEnemyShotTime) return;
      const now = this.ctx.currentTime;
      this.nextEnemyShotTime = now + 0.055;
      this.tone(260, 0.065, "triangle", 0.018, 0.62, this.sfxGain, now);
      this.tone(130, 0.08, "square", 0.012, 0.8, this.sfxGain, now + 0.01);
    }

    item() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [72, 76, 79, 84].forEach((note, i) => {
        this.tone(this.midi(note), 0.075, "square", 0.042, 1.02, this.sfxGain, now + i * 0.052);
      });
    }

    boom(big = false) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.noise(big ? 0.46 : 0.22, big ? 0.15 : 0.075, big ? 1500 : 1050, this.sfxGain, now);
      this.tone(big ? 92 : 142, big ? 0.34 : 0.16, "sawtooth", big ? 0.078 : 0.038, 0.42, this.sfxGain, now);
      if (big) this.tone(48, 0.42, "square", 0.045, 0.52, this.sfxGain, now + 0.03);
    }

    bomb() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.noise(0.5, 0.18, 2300, this.sfxGain, now);
      this.tone(64, 0.48, "sawtooth", 0.09, 2.4, this.sfxGain, now);
      [48, 55, 60, 67].forEach((note, i) => {
        this.tone(this.midi(note), 0.12, "square", 0.04, 0.75, this.sfxGain, now + i * 0.055);
      });
    }

    miss() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.boom(true);
      [67, 62, 55, 48].forEach((note, i) => {
        this.tone(this.midi(note), 0.11, "triangle", 0.045, 0.9, this.sfxGain, now + i * 0.075);
      });
    }

    menuMove() {
      this.tone(380, 0.045, "square", 0.022, 1.25);
    }

    menuSelect() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.tone(520, 0.07, "square", 0.035, 1.12, this.sfxGain, now);
      this.tone(780, 0.08, "square", 0.03, 1.18, this.sfxGain, now + 0.055);
    }

    stageStart(stageId = 1) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const root = [60, 62, 65][stageId - 1] || 60;
      [root, root + 7, root + 12].forEach((note, i) => {
        this.tone(this.midi(note), 0.14, "square", 0.042, 1.01, this.sfxGain, now + i * 0.09);
      });
    }

    stageClear(final = false) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = final ? [60, 64, 67, 72, 76, 79] : [60, 64, 67, 72];
      notes.forEach((note, i) => {
        this.tone(this.midi(note), 0.13, "square", 0.046, 1.03, this.sfxGain, now + i * 0.09);
      });
    }

    gameOver() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [55, 52, 48, 43].forEach((note, i) => {
        this.tone(this.midi(note), 0.18, "triangle", 0.052, 0.96, this.sfxGain, now + i * 0.13);
      });
    }

    musicPattern(stageId, mode) {
      if (mode === "boss") {
        return {
          bpm: 182,
          bass: [36, 36, 43, 36, 35, 35, 42, 35, 38, 38, 45, 38, 41, 41, 48, 47],
          lead: [72, null, 72, 75, null, 74, null, 72, 79, null, 77, null, 75, 74, 72, null],
          arp: [60, 67, 72, 79],
          bassGain: 0.042,
          leadGain: 0.026
        };
      }
      const patterns = [
        {
          bpm: 150,
          bass: [36, 36, 43, 36, 48, 43, 36, 31, 36, 36, 43, 36, 50, 48, 43, 36],
          lead: [72, null, 76, null, 79, null, 76, 74, 72, null, 76, null, 81, 79, 76, null],
          arp: [60, 64, 67, 72],
          bassGain: 0.034,
          leadGain: 0.021
        },
        {
          bpm: 160,
          bass: [38, 38, 45, 38, 50, 45, 38, 33, 41, 41, 48, 41, 53, 50, 48, 45],
          lead: [74, null, 77, 79, null, 77, null, 74, 82, null, 81, 77, 79, null, 74, null],
          arp: [62, 65, 69, 74],
          bassGain: 0.036,
          leadGain: 0.023
        },
        {
          bpm: 170,
          bass: [41, 41, 48, 41, 53, 48, 41, 36, 43, 43, 50, 43, 55, 53, 50, 48],
          lead: [76, 79, null, 83, 81, null, 79, 76, 84, null, 83, 81, 79, 76, 74, null],
          arp: [65, 69, 72, 77],
          bassGain: 0.039,
          leadGain: 0.025
        }
      ];
      return patterns[stageId - 1] || patterns[0];
    }

    startBgm(stageId = 1, mode = "stage") {
      this.ensure();
      if (!this.ctx) return;
      if (this.bgm && this.bgm.stageId === stageId && this.bgm.mode === mode) return;
      this.stopBgm(true);
      const pattern = this.musicPattern(stageId, mode);
      const bus = this.ctx.createGain();
      bus.gain.value = mode === "boss" ? 0.16 : 0.13;
      bus.connect(this.musicGain);
      const bgm = { stageId, mode, pattern, step: 0, timer: null, bus, active: true };
      const stepMs = Math.round(60000 / pattern.bpm / 4);
      const playStep = () => {
        if (!bgm.active || !this.ctx) return;
        const step = bgm.step;
        const now = this.ctx.currentTime + 0.01;
        const stepSec = stepMs / 1000;
        const bass = pattern.bass[step % pattern.bass.length];
        const lead = pattern.lead[step % pattern.lead.length];
        const arp = pattern.arp[(step + Math.floor(step / 4)) % pattern.arp.length];
        if (bass != null && step % 2 === 0) {
          this.tone(this.midi(bass), stepSec * 1.65, "square", pattern.bassGain, 0.985, bus, now);
        }
        if (lead != null) {
          this.tone(this.midi(lead), stepSec * 0.86, "square", pattern.leadGain, 1.01, bus, now);
        } else if (step % 4 === 1) {
          this.tone(this.midi(arp), stepSec * 0.45, "triangle", 0.011, 1.03, bus, now);
        }
        if (step % 4 === 0) this.tone(92, 0.055, "triangle", 0.022, 0.55, bus, now);
        if (step % 2 === 1) this.noise(0.035, 0.011, 5200, bus, now);
        bgm.step += 1;
      };
      playStep();
      bgm.timer = window.setInterval(playStep, stepMs);
      this.bgm = bgm;
    }

    stopBgm(fast = false) {
      if (!this.bgm) return;
      const bgm = this.bgm;
      bgm.active = false;
      window.clearInterval(bgm.timer);
      if (this.ctx) bgm.bus.gain.setTargetAtTime(0.001, this.ctx.currentTime, fast ? 0.015 : 0.08);
      window.setTimeout(() => {
        try {
          bgm.bus.disconnect();
        } catch {
          // Already disconnected.
        }
      }, fast ? 80 : 260);
      this.bgm = null;
    }
  }

  class Game {
    constructor(assets) {
      this.assets = assets;
      this.audio = new AudioEngine();
      this.scene = "title";
      this.difficulties = ["EASY", "NORMAL", "HARD"];
      this.diffIndex = 1;
      this.highScore = this.loadHighScore();
      this.t = 0;
      this.last = performance.now();
      this.resetRun();
    }

    loadHighScore() {
      try {
        return Number(localStorage.getItem(STORAGE_KEY) || 0);
      } catch {
        return 0;
      }
    }

    saveHighScore() {
      if (this.score <= this.highScore) return;
      this.highScore = this.score;
      try {
        localStorage.setItem(STORAGE_KEY, String(this.highScore));
      } catch {
        // localStorage can be unavailable in private contexts.
      }
    }

    resetRun() {
      this.score = 0;
      this.lives = 3;
      this.power = 1;
      this.bombs = 1;
      this.scroll = 0;
      this.clearTimer = 0;
      this.hitStop = 0;
      this.player = {
        x: W / 2,
        y: H - 56,
        w: 33,
        h: 35,
        r: 4,
        speed: 190,
        shotCd: 0,
        inv: 2.2,
        blink: 0
      };
      this.enemies = [];
      this.playerBullets = [];
      this.enemyBullets = [];
      this.items = [];
      this.explosions = [];
      this.floatText = [];
      this.currentStage = 0;
      this.setupStage(0);
    }

    setupStage(stageIndex) {
      this.currentStage = stageIndex;
      this.stage = STAGES[this.currentStage];
      this.stageTime = 0;
      this.waveIndex = 0;
      this.clearTimer = 0;
      this.stageBannerTimer = 2.4;
      this.spawnBossDone = false;
      this.waves = this.stage.waves;
      this.enemies = [];
      this.playerBullets = [];
      this.enemyBullets = [];
      this.items = [];
      this.explosions = [];
      this.floatText = [];
      if (this.player) {
        this.player.x = W / 2;
        this.player.y = H - 56;
        this.player.inv = 2.2;
        this.player.shotCd = 0;
      }
    }

    startGame() {
      this.resetRun();
      this.scene = "playing";
      this.audio.ensure();
      this.audio.stageStart(this.stage.id);
      this.audio.startBgm(this.stage.id, "stage");
    }

    advanceStage() {
      if (this.currentStage >= STAGES.length - 1) return;
      this.setupStage(this.currentStage + 1);
      this.scene = "playing";
      this.audio.ensure();
      this.audio.stageStart(this.stage.id);
      this.audio.startBgm(this.stage.id, "stage");
    }

    loop(now) {
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      this.t += dt;
      this.update(dt);
      this.draw();
      input.pressed.clear();
      input.pointerPress = null;
      requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
      if (input.consume("KeyM")) this.audio.toggleMute();

      if (input.consume("Escape")) {
        if (this.scene === "playing" || this.scene === "paused" || this.scene === "stageclear") {
          this.scene = "title";
          this.audio.stopBgm();
        }
      }

      if (this.scene === "title") {
        if (input.consume("Space") || input.consume("Enter")) {
          this.audio.ensure();
          this.audio.menuSelect();
          this.scene = "difficulty";
        }
        return;
      }

      if (this.scene === "difficulty") {
        if (input.consume("ArrowLeft") || input.consume("KeyA") || input.consume("ArrowUp") || input.consume("KeyW")) {
          this.diffIndex = (this.diffIndex + this.difficulties.length - 1) % this.difficulties.length;
          this.audio.menuMove();
        }
        if (input.consume("ArrowRight") || input.consume("KeyD") || input.consume("ArrowDown") || input.consume("KeyS")) {
          this.diffIndex = (this.diffIndex + 1) % this.difficulties.length;
          this.audio.menuMove();
        }
        const tapIndex = input.pointerPress
          ? difficultyIndexAt(input.pointerPress.y, this.difficulties.length)
          : -1;
        if (input.consume("Space") || input.consume("Enter")) {
          if (tapIndex >= 0) this.diffIndex = tapIndex;
          this.audio.menuSelect();
          this.startGame();
        }
        return;
      }

      if (this.scene === "paused") {
        if (input.consume("Enter") || input.consume("KeyP")) {
          this.audio.menuSelect();
          this.scene = "playing";
        }
        return;
      }

      if (this.scene === "stageclear") {
        this.updateEffects(dt);
        this.cleanup();
        if (input.consume("Space") || input.consume("Enter")) {
          this.audio.menuSelect();
          this.advanceStage();
        }
        return;
      }

      if (this.scene === "gameover" || this.scene === "clear") {
        this.updateEffects(dt);
        this.cleanup();
        if (input.consume("Space")) this.startGame();
        if (input.consume("Enter")) {
          this.scene = "title";
          this.audio.stopBgm();
        }
        return;
      }

      if (input.consume("Enter") || input.consume("KeyP")) {
        this.audio.menuMove();
        this.scene = "paused";
        return;
      }

      if (this.hitStop > 0) {
        this.hitStop -= dt;
        this.updateEffects(dt);
        return;
      }

      this.stageTime += dt;
      this.stageBannerTimer = Math.max(0, this.stageBannerTimer - dt);
      this.scroll += dt * (this.stage.scrollBase + Math.min(this.stage.scrollMax, this.stageTime * this.stage.scrollRamp));
      this.updatePlayer(dt);
      this.spawnWaves();
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updateItems(dt);
      this.updateEffects(dt);
      this.checkCollisions();
      this.cleanup();
    }

    updatePlayer(dt) {
      let ax = 0;
      let ay = 0;
      if (input.down("ArrowLeft", "KeyA")) ax -= 1;
      if (input.down("ArrowRight", "KeyD")) ax += 1;
      if (input.down("ArrowUp", "KeyW")) ay -= 1;
      if (input.down("ArrowDown", "KeyS")) ay += 1;

      if (input.pointer) {
        let targetX = input.pointer.x;
        let targetY = input.pointer.y;
        if (input.pointer.pointerType === "touch") {
          if (!input.pointer.dragOrigin) {
            input.pointer.dragOrigin = { x: this.player.x, y: this.player.y };
          }
          targetX = input.pointer.dragOrigin.x + input.pointer.x - input.pointer.startX;
          targetY = input.pointer.dragOrigin.y + input.pointer.y - input.pointer.startY;
        }
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        ax = clamp(dx / 18, -1, 1);
        ay = clamp(dy / 18, -1, 1);
      }

      if (ax !== 0 || ay !== 0) {
        const len = Math.hypot(ax, ay);
        ax /= len;
        ay /= len;
      }
      this.player.x = clamp(this.player.x + ax * this.player.speed * dt, 15, W - 15);
      this.player.y = clamp(this.player.y + ay * this.player.speed * dt, PLAY_TOP + 18, H - 20);
      this.player.tilt = ax;
      this.player.shotCd -= dt;
      this.player.inv = Math.max(0, this.player.inv - dt);
      this.player.blink += dt;

      if (input.consume("Space")) input.shotQueued = true;
      if (input.down("Space", "KeyZ") || input.pointer || input.shotQueued) {
        if (this.firePlayer()) input.shotQueued = false;
      }
      if (input.consume("KeyX")) this.useBomb();
    }

    firePlayer() {
      if (this.player.shotCd > 0) return false;
      const level = this.power;
      const rate = level >= 4 ? 0.09 : 0.115;
      this.player.shotCd = rate;
      const speed = -360 - level * 24;
      const shots = [];

      if (level === 1) {
        shots.push([-5, speed, 0], [5, speed, 0]);
      } else if (level === 2) {
        shots.push([0, speed, 0], [-7, speed, -58], [7, speed, 58]);
      } else {
        shots.push([0, speed, 0], [-7, speed, -70], [7, speed, 70], [-12, speed * 0.96, -132], [12, speed * 0.96, 132]);
        if (level >= 5) {
          shots.push([-17, speed * 0.82, -220], [17, speed * 0.82, 220]);
        }
      }

      for (const [ox, vy, vx] of shots) {
        this.playerBullets.push({
          x: this.player.x + ox,
          y: this.player.y - 17,
          vx,
          vy,
          r: level >= 4 ? 4 : 3,
          damage: level >= 4 && ox === 0 ? 2 : 1,
          dead: false,
          age: 0
        });
      }
      this.audio.shot(this.power);
      return true;
    }

    useBomb() {
      if (this.bombs <= 0) return;
      this.bombs -= 1;
      this.enemyBullets.length = 0;
      for (const enemy of this.enemies) {
        enemy.hp -= enemy.kind === "boss" ? 28 : 6;
        this.spawnExplosion(enemy.x, enemy.y, 44, true);
      }
      this.hitStop = 0.12;
      this.audio.bomb();
    }

    spawnWaves() {
      const params = DIFFICULTY[this.difficulties[this.diffIndex]];
      while (this.waveIndex < this.waves.length && this.stageTime >= this.waves[this.waveIndex].time) {
        const wave = this.waves[this.waveIndex++];
        const copies = Math.max(1, Math.round((wave.count || 1) * params.spawn));
        for (let i = 0; i < copies; i += 1) this.spawnWaveMember(wave, i, copies);
      }

      if (!this.spawnBossDone && this.stageTime >= this.stage.bossTime) {
        this.spawnBossDone = true;
        this.enemies.push(makeEnemy("boss", W / 2, -74, this.difficulties[this.diffIndex], this.stage));
        this.audio.startBgm(this.stage.id, "boss");
      }
    }

    spawnWaveMember(wave, index, count) {
      const spacing = wave.spacing || 28;
      const center = wave.x ?? W / 2;
      let x = center + (index - (count - 1) / 2) * spacing;
      let y = wave.y ?? -24 - index * (wave.delayY || 16);
      let enemy = wave.enemy;

      if (wave.pattern === "v") {
        x = center + (index - (count - 1) / 2) * spacing;
        y = -24 - Math.abs(index - (count - 1) / 2) * 16;
      } else if (wave.pattern === "left") {
        x = -20 - index * 22;
        y = 74 + index * 18;
      } else if (wave.pattern === "right") {
        x = W + 20 + index * 22;
        y = 78 + index * 18;
      } else if (wave.pattern === "ground") {
        x = wave.x + index * spacing;
        y = -30 - index * 56;
      }

      const obj = makeEnemy(enemy, x, y, this.difficulties[this.diffIndex], this.stage);
      obj.pattern = wave.pattern || obj.pattern;
      obj.drop = wave.drop || obj.drop;
      obj.lane = index;
      this.enemies.push(obj);
    }

    updateEnemies(dt) {
      const params = DIFFICULTY[this.difficulties[this.diffIndex]];
      for (const enemy of this.enemies) {
        enemy.age += dt;
        enemy.fire -= dt;

        if (enemy.kind === "boss") {
          if (enemy.y < 82) enemy.y += 46 * dt;
          enemy.x = W / 2 + Math.sin(enemy.age * 0.9) * 62;
        } else if (enemy.ground) {
          enemy.y += (72 + Math.min(42, this.stageTime * 0.5)) * dt;
          if (enemy.kind === "tank") enemy.x += Math.sin(enemy.age * 1.5 + enemy.lane) * 4 * dt;
        } else if (enemy.pattern === "left") {
          enemy.x += enemy.speed * 1.28 * dt;
          enemy.y += enemy.speed * 0.48 * dt;
        } else if (enemy.pattern === "right") {
          enemy.x -= enemy.speed * 1.28 * dt;
          enemy.y += enemy.speed * 0.48 * dt;
        } else if (enemy.pattern === "v") {
          enemy.y += enemy.speed * dt;
          enemy.x += Math.sin(enemy.age * 3 + enemy.lane) * 24 * dt;
        } else if (enemy.pattern === "sine") {
          enemy.y += enemy.speed * dt;
          enemy.x += Math.sin(enemy.age * 4.2) * 72 * dt;
        } else if (enemy.pattern === "hover") {
          if (enemy.y < enemy.targetY) enemy.y += enemy.speed * dt;
          enemy.x += Math.sin(enemy.age * 1.9) * 26 * dt;
        } else {
          enemy.y += enemy.speed * dt;
        }

        if (enemy.fire <= 0 && enemy.y > PLAY_TOP - 8 && enemy.y < H - 38) {
          this.fireEnemy(enemy, params.bulletSpeed);
        }
      }
    }

    fireEnemy(enemy, speedScale) {
      if (enemy.kind === "small") {
        enemy.fire = 1.6 + Math.random() * 0.5;
        this.fireAimed(enemy.x, enemy.y + 10, 92 * speedScale, 2.7);
      } else if (enemy.kind === "medium") {
        enemy.fire = 1.15;
        this.fireSpread(enemy.x, enemy.y + 15, 5, 102 * speedScale, Math.PI / 2, 0.62);
      } else if (enemy.kind === "transport") {
        enemy.fire = 1.6;
        this.fireSpread(enemy.x, enemy.y + 18, 3, 92 * speedScale, Math.PI / 2, 0.42);
      } else if (enemy.kind === "tank") {
        enemy.fire = 1.75;
        this.fireAimed(enemy.x, enemy.y + 7, 118 * speedScale, 3.4);
      } else if (enemy.kind === "turret") {
        enemy.fire = 1.42;
        this.fireSpread(enemy.x, enemy.y + 6, 3, 112 * speedScale, Math.PI / 2, 0.7);
      } else if (enemy.kind === "boss") {
        const hpRatio = enemy.hp / enemy.maxHp;
        const stageId = enemy.stageId || 1;
        const delayScale = enemy.fireDelayScale || 1;
        enemy.fire = (hpRatio > 0.7 ? 0.72 : hpRatio > 0.32 ? 0.54 : 0.34) * delayScale;
        if (hpRatio > 0.7) {
          this.fireSpread(enemy.x, enemy.y + 35, stageId >= 3 ? 7 : 5, 118 * speedScale, Math.PI / 2, 0.82 + stageId * 0.08);
          this.fireAimed(enemy.x - 34, enemy.y + 18, 130 * speedScale, 3.2);
          this.fireAimed(enemy.x + 34, enemy.y + 18, 130 * speedScale, 3.2);
        } else if (hpRatio > 0.32) {
          this.fireCircle(enemy.x, enemy.y + 16, 10 + stageId * 2, 88 * speedScale, enemy.age * (0.9 + stageId * 0.15));
          this.fireSpread(enemy.x, enemy.y + 38, 5 + stageId * 2, 112 * speedScale, Math.PI / 2, 1.05 + stageId * 0.12);
        } else {
          this.fireCircle(enemy.x, enemy.y + 16, 14 + stageId * 2, 100 * speedScale, enemy.age * (1.8 + stageId * 0.25));
          this.fireAimed(enemy.x, enemy.y + 36, 156 * speedScale, 3.5);
          if (stageId >= 2) {
            this.fireSpread(enemy.x, enemy.y + 28, stageId === 3 ? 5 : 3, 136 * speedScale, Math.PI / 2, 0.55);
          }
        }
      }
      this.audio.enemyShot();
    }

    fireAimed(x, y, speed, r) {
      const angle = Math.atan2(this.player.y - y, this.player.x - x);
      this.enemyBullets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        age: 0,
        spin: 0,
        sprite: "enemyBullet2"
      });
    }

    fireSpread(x, y, count, speed, centerAngle, arc) {
      for (let i = 0; i < count; i += 1) {
        const t = count === 1 ? 0.5 : i / (count - 1);
        const angle = centerAngle - arc / 2 + arc * t;
        this.enemyBullets.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3,
          age: 0,
          spin: angle,
          sprite: "enemyBullet"
        });
      }
    }

    fireCircle(x, y, count, speed, phase) {
      for (let i = 0; i < count; i += 1) {
        const angle = phase + (Math.PI * 2 * i) / count;
        this.enemyBullets.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 3.2,
          age: 0,
          spin: angle,
          sprite: i % 2 ? "enemyBullet" : "enemyBullet2"
        });
      }
    }

    updateBullets(dt) {
      for (const bullet of this.playerBullets) {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.age += dt;
      }
      for (const bullet of this.enemyBullets) {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
        bullet.age += dt;
        bullet.spin += dt * 4;
      }
    }

    updateItems(dt) {
      for (const item of this.items) {
        item.age += dt;
        item.y += item.vy * dt;
        item.x += Math.sin(item.age * 3.2) * 16 * dt;
        if (item.x < 18 || item.x > W - 18) item.vx *= -1;
      }
    }

    updateEffects(dt) {
      for (const fx of this.explosions) fx.t += dt;
      for (const txt of this.floatText) {
        txt.t += dt;
        txt.y -= 22 * dt;
      }
    }

    checkCollisions() {
      for (const bullet of this.playerBullets) {
        if (bullet.dead) continue;
        for (const enemy of this.enemies) {
          if (enemy.dead || !circleHit(bullet, enemy)) continue;
          bullet.dead = true;
          enemy.hp -= bullet.damage;
          this.spawnSpark(bullet.x, bullet.y);
          if (enemy.hp <= 0) this.killEnemy(enemy);
          break;
        }
      }

      if (this.player.inv <= 0) {
        for (const bullet of this.enemyBullets) {
          if (circleHit(this.player, bullet)) {
            bullet.dead = true;
            this.playerMiss();
            break;
          }
        }
        for (const enemy of this.enemies) {
          if (!enemy.dead && circleHit(this.player, enemy)) {
            enemy.hp -= 999;
            this.killEnemy(enemy);
            this.playerMiss();
            break;
          }
        }
      }

      for (const item of this.items) {
        if (!item.dead && circleHit(this.player, item)) {
          item.dead = true;
          if (item.kind === "power") {
            if (this.power < 5) this.power += 1;
            else this.score += 500;
          } else if (item.kind === "oneUp") {
            this.lives += 1;
          } else if (item.kind === "bomb") {
            this.bombs += 1;
          }
          this.floatText.push({ x: item.x, y: item.y - 12, text: item.kind.toUpperCase(), t: 0 });
          this.audio.item();
        }
      }
    }

    killEnemy(enemy) {
      if (enemy.dead) return;
      enemy.dead = true;
      this.score += enemy.score;
      this.floatText.push({ x: enemy.x, y: enemy.y, text: `+${enemy.score}`, t: 0 });
      this.spawnExplosion(enemy.x, enemy.y, enemy.kind === "boss" ? 88 : enemy.w, enemy.kind === "boss");
      this.audio.boom(enemy.kind === "boss");
      if (enemy.kind === "boss") {
        this.enemyBullets.length = 0;
        this.saveHighScore();
        this.clearTimer = 1.8;
        const finalStage = this.currentStage >= STAGES.length - 1;
        this.audio.stopBgm();
        this.audio.stageClear(finalStage);
        window.setTimeout(() => {
          if (this.scene === "playing") {
            if (!finalStage) {
              this.scene = "stageclear";
            } else {
              this.scene = "clear";
            }
          }
        }, 1300);
      } else if (enemy.drop || Math.random() < DIFFICULTY[this.difficulties[this.diffIndex]].item) {
        const roll = Math.random();
        const kind = enemy.drop || (roll > 0.93 ? "oneUp" : roll > 0.74 ? "bomb" : "power");
        this.items.push({ kind, x: enemy.x, y: enemy.y, vx: 28, vy: 54, r: 10, age: 0, dead: false });
      }
    }

    playerMiss() {
      this.lives -= 1;
      this.power = Math.max(1, this.power - 1);
      this.spawnExplosion(this.player.x, this.player.y, 62, true);
      this.enemyBullets.length = 0;
      this.hitStop = 0.22;
      this.audio.miss();
      if (this.lives <= 0) {
        this.saveHighScore();
        this.scene = "gameover";
        this.audio.stopBgm();
        this.audio.gameOver();
        return;
      }
      this.player.x = W / 2;
      this.player.y = H - 58;
      this.player.inv = 2.2;
    }

    spawnExplosion(x, y, size, big = false) {
      this.explosions.push({ x, y, t: 0, life: big ? 0.72 : 0.42, size, big });
      if (big) {
        for (let i = 0; i < 4; i += 1) {
          this.explosions.push({
            x: x + Math.cos(i * 1.7) * 22,
            y: y + Math.sin(i * 2.1) * 18,
            t: -i * 0.07,
            life: 0.62,
            size: size * 0.45,
            big: false
          });
        }
      }
    }

    spawnSpark(x, y) {
      this.explosions.push({ x, y, t: 0, life: 0.16, size: 20, big: false, spark: true });
    }

    cleanup() {
      this.playerBullets = this.playerBullets.filter((b) => !b.dead && b.y > -20 && b.y < H + 20 && b.x > -20 && b.x < W + 20);
      this.enemyBullets = this.enemyBullets.filter((b) => b.y > PLAY_TOP - 20 && b.y < H + 30 && b.x > -30 && b.x < W + 30);
      this.enemies = this.enemies.filter((e) => !e.dead && e.y < H + 90 && e.x > -90 && e.x < W + 90);
      this.items = this.items.filter((i) => !i.dead && i.y < H + 24);
      this.explosions = this.explosions.filter((e) => e.t < e.life);
      this.floatText = this.floatText.filter((t) => t.t < 0.7);
    }

    draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.imageSmoothingEnabled = false;
      syncTouchControls(this);
      this.drawBackground();
      if (this.scene === "title") this.drawTitle();
      else if (this.scene === "difficulty") this.drawDifficulty();
      else {
        this.drawWorld();
        this.drawHud();
        if (this.scene === "playing") this.drawStageBanner();
        if (this.scene === "paused") this.drawPause();
        if (this.scene === "stageclear") this.drawStageClear();
        if (this.scene === "gameover") this.drawEnd(false);
        if (this.scene === "clear") this.drawEnd(true);
      }
    }

    drawBackground() {
      const raw = this.assets.raw;
      const stage = this.stage || STAGES[0];
      const tile = 48;
      const offset = -((this.scroll % tile) | 0);
      for (let y = offset - tile; y < H + tile; y += tile) {
        const row = Math.floor((y + this.scroll) / tile);
        for (let x = 0; x < W; x += tile) {
          let img = raw.grass;
          if (stage.terrain === "coast") {
            if (x < 48 && row % 8 < 4) img = raw.water;
            else if (x >= 112 && x < 208) img = raw.road;
            else if ((row + Math.floor(x / tile)) % 13 === 0) img = raw.dirt;
          } else if (stage.terrain === "forest") {
            if (x >= 96 && x < 192) img = raw.road;
            else if ((row + Math.floor(x / tile)) % 4 === 0) img = raw.dirt;
            else img = raw.grass;
          } else {
            if (x >= 96 && x < 224) img = row % 2 === 0 ? raw.runway : raw.road;
            else if ((row + Math.floor(x / tile)) % 3 === 0) img = raw.concrete;
            else img = raw.dirt;
          }
          ctx.drawImage(img, x, y, tile, tile);
        }
        if (stage.terrain === "coast") {
          if (row % 15 === 0) ctx.drawImage(raw.base, 220, y, 68, 68);
          if (row % 19 === 8) ctx.drawImage(raw.runway, 112, y, 96, 96);
          if (row % 17 === 5) ctx.drawImage(raw.concrete, 48, y, 64, 64);
        } else if (stage.terrain === "forest") {
          if (row % 11 === 0) ctx.drawImage(raw.base, 18, y, 66, 66);
          if (row % 13 === 6) ctx.drawImage(raw.concrete, 226, y, 62, 62);
        } else {
          if (row % 7 === 0) ctx.drawImage(raw.concrete, 28, y, 64, 64);
          if (row % 9 === 4) ctx.drawImage(raw.base, 230, y, 70, 70);
          if (row % 12 === 6) ctx.drawImage(raw.runway, 96, y, 128, 96);
        }
      }
      ctx.fillStyle = stage.overlay;
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
      ctx.strokeStyle = "rgba(108, 230, 255, 0.18)";
      ctx.lineWidth = 1;
      for (let y = HUD_H + ((this.scroll * 0.35) % 16); y < H; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }

    drawWorld() {
      for (const item of this.items) this.drawItem(item);
      for (const enemy of this.enemies) this.drawEnemy(enemy);
      for (const bullet of this.playerBullets) this.drawPlayerBullet(bullet);
      for (const bullet of this.enemyBullets) this.drawEnemyBullet(bullet);
      this.drawPlayer();
      for (const fx of this.explosions) this.drawExplosion(fx);
      this.drawFloatText();
    }

    drawPlayer() {
      if (this.player.inv > 0 && Math.floor(this.player.blink * 18) % 2 === 0) return;
      const sprite = this.player.tilt < -0.35 ? "playerLeft" : this.player.tilt > 0.35 ? "playerRight" : "player";
      drawSprite(this.assets.sprites[sprite], this.player.x, this.player.y, this.player.w, this.player.h);
      ctx.fillStyle = "#9ffcff";
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    drawEnemy(enemy) {
      const map = {
        small: enemy.alt ? "smallEnemy2" : "smallEnemy",
        medium: "mediumEnemy",
        transport: "transport",
        tank: "tank",
        turret: "turret",
        boss: "boss"
      };
      drawSprite(this.assets.sprites[map[enemy.kind]], enemy.x, enemy.y, enemy.w, enemy.h);
      if (enemy.kind === "boss") {
        ctx.fillStyle = "#0a101a";
        ctx.fillRect(60, HUD_H + 5, 200, 5);
        ctx.fillStyle = "#ff4057";
        ctx.fillRect(61, HUD_H + 6, 198 * Math.max(0, enemy.hp / enemy.maxHp), 3);
      }
    }

    drawPlayerBullet(bullet) {
      const h = this.power >= 4 ? 22 : 16;
      ctx.globalAlpha = 0.82;
      drawSprite(this.assets.sprites.playerBullet, bullet.x, bullet.y, 7, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#aefbff";
      ctx.fillRect(bullet.x - 1, bullet.y - h / 2, 2, h);
    }

    drawEnemyBullet(bullet) {
      drawRotatedSprite(this.assets.sprites[bullet.sprite], bullet.x, bullet.y, bullet.r * 5.3, bullet.r * 5.3, bullet.spin);
      ctx.strokeStyle = "rgba(255, 244, 160, 0.55)";
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.r + 1, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawItem(item) {
      const sprite = item.kind === "oneUp" ? "oneUp" : item.kind === "bomb" ? "bomb" : "power";
      const bob = Math.sin(item.age * 6) * 2;
      ctx.globalAlpha = 0.78 + Math.sin(item.age * 10) * 0.18;
      drawSprite(this.assets.sprites[sprite], item.x, item.y + bob, 24, 24);
      ctx.globalAlpha = 1;
    }

    drawExplosion(fx) {
      if (fx.t < 0) return;
      const progress = clamp(fx.t / fx.life, 0, 1);
      const frames = ["exp1", "exp2", "exp3", "exp4"];
      const sprite = this.assets.sprites[frames[Math.min(frames.length - 1, Math.floor(progress * frames.length))]];
      const size = fx.size * (0.65 + progress * 0.75);
      ctx.globalAlpha = 1 - progress * 0.35;
      drawSprite(sprite, fx.x, fx.y, size, size);
      ctx.globalAlpha = 1;
    }

    drawFloatText() {
      ctx.textAlign = "center";
      ctx.font = "bold 8px 'Courier New', monospace";
      for (const txt of this.floatText) {
        ctx.globalAlpha = 1 - txt.t / 0.7;
        ctx.fillStyle = txt.text.startsWith("+") ? "#ffe55e" : "#61f7ff";
        ctx.fillText(txt.text, txt.x, txt.y);
      }
      ctx.globalAlpha = 1;
    }

    drawHud() {
      ctx.fillStyle = "#080c12";
      ctx.fillRect(0, 0, W, HUD_H);
      ctx.fillStyle = "#19212e";
      ctx.fillRect(0, HUD_H - 3, W, 3);
      ctx.fillStyle = "#dff7ff";
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE ${padScore(this.score)}`, 8, 14);
      ctx.fillText(`HI ${padScore(this.highScore)}`, 8, 29);
      ctx.textAlign = "right";
      ctx.fillText(`STAGE ${this.stage.id}/${STAGES.length}`, W - 8, 14);
      ctx.fillText(`${this.difficulties[this.diffIndex]}`, W - 8, 29);
      for (let i = 0; i < this.lives; i += 1) {
        drawSprite(this.assets.sprites.player, 172 + i * 13, 18, 10, 11);
      }
      ctx.fillStyle = "#202b38";
      ctx.fillRect(210, 22, 48, 7);
      for (let i = 0; i < 5; i += 1) {
        ctx.fillStyle = i < this.power ? "#48f4ff" : "#304050";
        ctx.fillRect(212 + i * 9, 24, 7, 3);
      }
      ctx.fillStyle = "#ffbd35";
      ctx.fillText(`B ${this.bombs}`, W - 8, 39);
      if (this.audio.muted) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ff4057";
        ctx.fillText("MUTE", W / 2, 39);
      }
    }

    drawTitle() {
      this.drawWorldDecor();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "#56e7ff";
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.fillText("RETRO", W / 2, 110);
      ctx.fillStyle = "#ffbd35";
      ctx.font = "bold 25px 'Courier New', monospace";
      ctx.fillText("SKY RAID", W / 2, 138);
      drawSprite(this.assets.sprites.player, W / 2, 220 + Math.sin(this.t * 3) * 3, 68, 72);
      ctx.fillStyle = "#f2fbff";
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillText("TAP / SPACE TO START", W / 2, 332);
      ctx.fillStyle = "#9ab0c8";
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText(`HI-SCORE ${padScore(this.highScore)}`, W / 2, 356);
      ctx.fillText("DRAG TO MOVE / HOLD TO FIRE", W / 2, 378);
    }

    drawWorldDecor() {
      const y = 166 + Math.sin(this.t * 2) * 5;
      drawSprite(this.assets.sprites.smallEnemy, 64, y, 32, 32);
      drawSprite(this.assets.sprites.smallEnemy2, 256, y + 24, 34, 34);
      drawSprite(this.assets.sprites.tank, 72, 410, 40, 40);
      drawSprite(this.assets.sprites.turret, 245, 406, 38, 38);
    }

    drawDifficulty() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.56)";
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center";
      ctx.fillStyle = "#e8f7ff";
      ctx.font = "bold 17px 'Courier New', monospace";
      ctx.fillText("SELECT DIFFICULTY", W / 2, 148);
      for (let i = 0; i < this.difficulties.length; i += 1) {
        const y = 198 + i * 42;
        const active = i === this.diffIndex;
        ctx.fillStyle = active ? "#1f3c4b" : "#111923";
        ctx.fillRect(88, y - 18, 144, 28);
        ctx.strokeStyle = active ? "#56e7ff" : "#3a4657";
        ctx.strokeRect(88.5, y - 18.5, 143, 27);
        ctx.fillStyle = active ? "#ffdf5f" : "#9caabc";
        ctx.font = "bold 13px 'Courier New', monospace";
        ctx.fillText(this.difficulties[i], W / 2, y);
      }
      ctx.fillStyle = "#9ab0c8";
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText("TAP OPTION / LEFT-RIGHT TO CHANGE", W / 2, 352);
    }

    drawStageBanner() {
      if (this.stageBannerTimer <= 0) return;
      const alpha = Math.min(1, this.stageBannerTimer / 0.5);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 164, W, 72);
      ctx.textAlign = "center";
      ctx.fillStyle = "#56e7ff";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.fillText(`STAGE ${this.stage.id}`, W / 2, 190);
      ctx.fillStyle = "#ffdf5f";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillText(this.stage.name, W / 2, 212);
      ctx.globalAlpha = 1;
    }

    drawStageClear() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.66)";
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
      drawSprite(this.assets.sprites.stageClear, W / 2, 150, 164, 70);
      ctx.textAlign = "center";
      ctx.fillStyle = "#f2fbff";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillText(`STAGE ${this.stage.id} COMPLETE`, W / 2, 224);
      ctx.fillText(`SCORE ${padScore(this.score)}`, W / 2, 246);
      ctx.fillStyle = "#ffdf5f";
      ctx.fillText(`NEXT: ${STAGES[this.currentStage + 1].name}`, W / 2, 276);
      ctx.fillStyle = "#9ab0c8";
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText("SPACE / ENTER TO LAUNCH", W / 2, 314);
      ctx.fillText("ESC TITLE", W / 2, 332);
    }

    drawPause() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
      ctx.fillStyle = "#e8f7ff";
      ctx.textAlign = "center";
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.fillText("PAUSED", W / 2, H / 2);
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText("ENTER / P", W / 2, H / 2 + 24);
    }

    drawEnd(clear) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.64)";
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
      const sprite = clear ? "stageClear" : "gameOver";
      drawSprite(this.assets.sprites[sprite], W / 2, 160, 164, 70);
      ctx.textAlign = "center";
      ctx.fillStyle = "#f2fbff";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillText(clear ? "ALL 3 STAGES COMPLETE" : "FINAL SCORE", W / 2, 224);
      ctx.fillText(`SCORE ${padScore(this.score)}`, W / 2, 246);
      ctx.fillText(`HI ${padScore(this.highScore)}`, W / 2, 266);
      ctx.fillStyle = "#9ab0c8";
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText("SPACE RETRY   ENTER TITLE", W / 2, 316);
    }
  }

  function makeEnemy(kind, x, y, difficulty, stage = STAGES[0]) {
    const diff = DIFFICULTY[difficulty];
    const base = {
      small: { w: 28, h: 27, r: 10, hp: 1, score: 100, speed: 96, fire: 1.2, pattern: "straight" },
      medium: { w: 48, h: 42, r: 17, hp: 8, score: 500, speed: 52, fire: 0.9, pattern: "hover" },
      transport: { w: 54, h: 42, r: 18, hp: 10, score: 700, speed: 45, fire: 1.4, pattern: "sine", drop: "power" },
      tank: { w: 34, h: 34, r: 12, hp: 3, score: 200, speed: 62, fire: 1.2, pattern: "ground", ground: true },
      turret: { w: 36, h: 36, r: 12, hp: 4, score: 300, speed: 62, fire: 0.9, pattern: "ground", ground: true },
      boss: { w: 98, h: 88, r: 35, hp: 300, score: 10000, speed: 25, fire: 1, pattern: "boss" }
    }[kind];
    const data = { ...base, ...(kind === "boss" ? stage.boss : {}) };
    const stageHpScale = kind === "boss" ? 1 : stage.enemyHpScale;
    const stageSpeedScale = kind === "boss" ? 1 : stage.enemySpeedScale;
    const hp = Math.max(1, Math.round(data.hp * diff.hp * stageHpScale));
    return {
      ...data,
      kind,
      x,
      y,
      hp,
      maxHp: hp,
      speed: data.speed * stageSpeedScale,
      age: 0,
      dead: false,
      targetY: kind === "medium" || kind === "transport" ? 118 + Math.random() * 35 : 0,
      alt: Math.random() > 0.5,
      lane: 0
    };
  }

  function drawSprite(sprite, x, y, w, h) {
    ctx.drawImage(sprite, Math.round(x - w / 2), Math.round(y - h / 2), Math.round(w), Math.round(h));
  }

  function drawRotatedSprite(sprite, x, y, w, h, angle) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.rotate(angle);
    ctx.drawImage(sprite, Math.round(-w / 2), Math.round(-h / 2), Math.round(w), Math.round(h));
    ctx.restore();
  }

  function drawLoading(progress) {
    ctx.fillStyle = "#06090f";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#56e7ff";
    ctx.textAlign = "center";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText("LOADING ASSETS", W / 2, 218);
    ctx.fillStyle = "#1b2530";
    ctx.fillRect(72, 240, 176, 8);
    ctx.fillStyle = "#ffbd35";
    ctx.fillRect(74, 242, 172 * progress, 4);
  }

  async function boot() {
    drawLoading(0.1);
    try {
      const assets = await loadAssets();
      drawLoading(1);
      const game = new Game(assets);
      requestAnimationFrame((time) => {
        game.last = time;
        game.loop(time);
      });
    } catch (error) {
      ctx.fillStyle = "#06090f";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff4057";
      ctx.textAlign = "center";
      ctx.font = "bold 12px 'Courier New', monospace";
      ctx.fillText("ASSET LOAD ERROR", W / 2, 220);
      ctx.fillStyle = "#e8f7ff";
      ctx.font = "8px 'Courier New', monospace";
      ctx.fillText(String(error.message || error), W / 2, 244);
      throw error;
    }
  }

  boot();
})();
