(() => {
  "use strict";

  const W = 320;
  const H = 480;
  const HUD_H = 42;
  const PLAY_TOP = HUD_H + 4;
  const STORAGE_KEY = "retroSkyRaidHighScore";
  const POINTER_EVENT_OPTIONS = { passive: false };
  const POINTER_TARGET_RESPONSE = 18;
  const TOUCH_STICK_DEADZONE = 0.12;
  const TOUCH_STICK_CURVE = 1.1;
  const TOUCH_STICK_CENTER = { x: 52, y: H - 58 };
  const TOUCH_STICK_RADIUS = 42;
  const TOUCH_STICK_HIT_RADIUS = 66;
  const TOUCH_FIRE_CENTER = { x: W - 54, y: H - 58 };
  const TOUCH_FIRE_HIT_RADIUS = 48;
  const TOUCH_CLICK_GUARD_MS = 500;
  const PLAYER_COLLISION_RADIUS = 4;
  const TOUCH_PLAYER_COLLISION_SCALE = 0.9;
  const USER_AGENT = navigator.userAgent || "";
  const HAS_COARSE_POINTER = typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const HAS_REAL_TOUCH = Number(navigator.maxTouchPoints || 0) > 0 || HAS_COARSE_POINTER;
  const IS_SMARTPHONE = Boolean(
    navigator.userAgentData?.mobile ||
    HAS_REAL_TOUCH ||
    /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|BlackBerry/i.test(USER_AGENT)
  );

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

  let activeGame = null;
  const input = {
    keys: new Set(),
    pressed: new Set(),
    stickPointer: null,
    firePointerId: null,
    touchFireDown: false,
    bombPointerId: null,
    mousePointer: null,
    menuPointerId: null,
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
  const touchButtonClickGuards = new WeakMap();
  const stickElement = document.querySelector("[data-control='left-stick']");
  const stickBaseElement = document.querySelector("[data-control-part='stick-base']");
  const stickKnobElement = document.querySelector("[data-control-part='stick-knob']");
  const fireButton = document.querySelector("[data-control='fire']");
  document.querySelectorAll("[data-action]").forEach((button) => {
    const code = actionCodes[button.dataset.action];
    if (!code) return;
    touchButtons[button.dataset.action] = button;

    button.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch") return;
      if (button.dataset.action === "bomb" && input.bombPointerId !== null) return;
      event.preventDefault();
      input.pressed.add(code);
      const guard = { pointerId: event.pointerId };
      touchButtonClickGuards.set(button, guard);
      if (button.dataset.action === "bomb") {
        input.bombPointerId = event.pointerId;
        if (typeof button.setPointerCapture === "function") {
          try {
            button.setPointerCapture(event.pointerId);
          } catch {
            input.bombPointerId = null;
          }
        }
      }
      window.setTimeout(() => {
        if (touchButtonClickGuards.get(button) === guard) {
          touchButtonClickGuards.delete(button);
        }
      }, TOUCH_CLICK_GUARD_MS);
    }, POINTER_EVENT_OPTIONS);

    button.addEventListener("pointercancel", (event) => {
      if (event.pointerType === "touch") {
        touchButtonClickGuards.delete(button);
        releaseBombPointer(event.pointerId, button);
      }
    });

    button.addEventListener("pointerup", (event) => {
      if (event.pointerType === "touch") releaseBombPointer(event.pointerId, button);
    });

    button.addEventListener("lostpointercapture", (event) => {
      if (event.pointerType === "touch") releaseBombPointer(event.pointerId, button);
    });

    // click covers mouse, keyboard, and assistive-technology activation once.
    button.addEventListener("click", (event) => {
      const guard = touchButtonClickGuards.get(button);
      if (guard) {
        touchButtonClickGuards.delete(button);
        event.preventDefault();
        return;
      }
      input.pressed.add(code);
    });
  });

  if (fireButton) {
    fireButton.addEventListener("pointerdown", (event) => {
      if (!isTouchPointer(event) || activeGame?.scene !== "playing") return;
      event.preventDefault();
      if (input.firePointerId !== null) return;
      input.firePointerId = event.pointerId;
      input.touchFireDown = activeGame?.scene === "playing";
      fireButton.classList.add("is-pressed");
      fireButton.setAttribute("aria-pressed", String(input.touchFireDown));
      captureElementPointer(fireButton, event.pointerId);
      const guard = { pointerId: event.pointerId };
      touchButtonClickGuards.set(fireButton, guard);
      window.setTimeout(() => {
        if (touchButtonClickGuards.get(fireButton) === guard) {
          touchButtonClickGuards.delete(fireButton);
        }
      }, TOUCH_CLICK_GUARD_MS);
    }, POINTER_EVENT_OPTIONS);

    fireButton.addEventListener("pointerup", (event) => {
      releasePointer(event.pointerId);
    });

    fireButton.addEventListener("pointercancel", (event) => {
      touchButtonClickGuards.delete(fireButton);
      releasePointer(event.pointerId, true);
    });

    fireButton.addEventListener("lostpointercapture", (event) => {
      touchButtonClickGuards.delete(fireButton);
      releasePointer(event.pointerId, true);
    });

    fireButton.addEventListener("click", (event) => {
      if (touchButtonClickGuards.has(fireButton)) {
        touchButtonClickGuards.delete(fireButton);
        event.preventDefault();
        return;
      }
      if (activeGame?.scene === "playing") input.pressed.add("Space");
    });
  }

  if (stickElement && stickBaseElement && stickKnobElement) {
    stickElement.addEventListener("pointerdown", (event) => {
      if (!isTouchPointer(event) || activeGame?.scene !== "playing") return;
      event.preventDefault();
      if (input.stickPointer !== null) return;
      input.stickPointer = { pointerId: event.pointerId, moveX: 0, moveY: 0 };
      stickElement.classList.add("is-active");
      captureElementPointer(stickElement, event.pointerId);
      updateStickPointer(event);
    }, POINTER_EVENT_OPTIONS);

    stickElement.addEventListener("pointermove", (event) => {
      event.preventDefault();
      if (input.stickPointer?.pointerId !== event.pointerId) return;
      updateStickPointer(event);
    }, POINTER_EVENT_OPTIONS);

    stickElement.addEventListener("pointerup", (event) => {
      releasePointer(event.pointerId);
    });

    stickElement.addEventListener("pointercancel", (event) => {
      releasePointer(event.pointerId, true);
    });

    stickElement.addEventListener("lostpointercapture", (event) => {
      releasePointer(event.pointerId, true);
    });

    stickElement.addEventListener("click", (event) => {
      event.preventDefault();
    });
  }

  function syncTouchControls(game) {
    const moveGuide = document.querySelector('[data-guide-item="move"]');
    const fireGuide = document.querySelector('[data-guide-item="fire"]');
    if (moveGuide) moveGuide.textContent = "STICK TO MOVE";
    if (fireGuide) fireGuide.textContent = "HOLD FIRE TO SHOOT";

    if (fireButton) {
      fireButton.classList.toggle("is-pressed", input.touchFireDown);
      fireButton.setAttribute("aria-pressed", String(input.touchFireDown));
    }

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
    event.preventDefault();
    const position = pointerPosition(event);

    if (isTouchPointer(event) && activeGame?.scene === "playing") {
      const controls = touchControlGeometry();
      if (input.stickPointer === null && isWithinRadius(position, controls.stick, TOUCH_STICK_HIT_RADIUS)) {
        input.stickPointer = {
          pointerId: event.pointerId,
          moveX: 0,
          moveY: 0
        };
        updateStickPointer(event, position);
        captureCanvasPointer(event.pointerId);
        return;
      }
      if (input.firePointerId === null && isWithinRadius(position, controls.fire, TOUCH_FIRE_HIT_RADIUS)) {
        input.firePointerId = event.pointerId;
        input.touchFireDown = true;
        captureCanvasPointer(event.pointerId);
      }
      return;
    }

    if (activeGame && isMenuScene(activeGame.scene) && input.menuPointerId === null) {
      input.menuPointerId = event.pointerId;
      input.pointerPress = { ...position, pointerId: event.pointerId };
      input.pressed.add("Space");
    }

    if (!isTouchPointer(event) && activeGame?.scene === "playing") {
      input.mousePointer = { ...position, pointerId: event.pointerId };
      input.pressed.add("Space");
      captureCanvasPointer(event.pointerId);
    }
  }, POINTER_EVENT_OPTIONS);

  canvas.addEventListener("pointermove", (event) => {
    event.preventDefault();
    const position = pointerPosition(event);
    if (input.stickPointer?.pointerId === event.pointerId) {
      updateStickPointer(event, position);
    } else if (input.mousePointer?.pointerId === event.pointerId) {
      Object.assign(input.mousePointer, position);
    }
  }, POINTER_EVENT_OPTIONS);

  canvas.addEventListener("pointerup", (event) => {
    releasePointer(event.pointerId);
  });

  canvas.addEventListener("pointercancel", (event) => {
    releasePointer(event.pointerId, true);
  });

  canvas.addEventListener("lostpointercapture", (event) => {
    releasePointer(event.pointerId, true);
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    clearTransientInput();
  }, POINTER_EVENT_OPTIONS);

  window.addEventListener("blur", () => {
    clearTransientInput();
  });

  document.addEventListener("visibilitychange", () => {
    clearTransientInput();
  });

  window.addEventListener("pagehide", () => {
    clearTransientInput();
  });

  window.addEventListener("resize", clearTransientInput);
  window.addEventListener("orientationchange", clearTransientInput);

  function releasePointer(pointerId = null, cancelPress = false) {
    const matches = (id) => pointerId === null || id === pointerId;
    if (input.stickPointer && matches(input.stickPointer.pointerId)) {
      const activePointerId = input.stickPointer.pointerId;
      input.stickPointer = null;
      if (stickElement) {
        stickElement.classList.remove("is-active");
        stickElement.style.setProperty("--stick-x", "0px");
        stickElement.style.setProperty("--stick-y", "0px");
      }
      releaseCanvasCapture(activePointerId);
      releaseElementPointer(stickElement, activePointerId);
    }
    if (input.firePointerId !== null && matches(input.firePointerId)) {
      const activePointerId = input.firePointerId;
      input.firePointerId = null;
      input.touchFireDown = false;
      if (fireButton) {
        fireButton.classList.remove("is-pressed");
        fireButton.setAttribute("aria-pressed", "false");
      }
      releaseCanvasCapture(activePointerId);
      releaseElementPointer(fireButton, activePointerId);
    }
    if (input.mousePointer && matches(input.mousePointer.pointerId)) {
      releaseCanvasCapture(input.mousePointer.pointerId);
      input.mousePointer = null;
    }
    if (input.menuPointerId !== null && matches(input.menuPointerId)) {
      input.menuPointerId = null;
      if (cancelPress) input.pointerPress = null;
    }
  }

  function resetTouchState() {
    input.pressed.delete("Space");
    input.shotQueued = false;
    input.touchFireDown = false;
    input.pointerPress = null;
    input.menuPointerId = null;
    releasePointer(null, true);
    if (input.bombPointerId !== null) {
      releaseBombPointer(input.bombPointerId, touchButtons.bomb);
    }
    input.bombPointerId = null;
    input.touchFireDown = false;
  }

  function clearTransientInput() {
    input.keys.clear();
    input.pressed.clear();
    input.shotQueued = false;
    resetTouchState();
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp(rect.width > 0 ? ((event.clientX - rect.left) / rect.width) * W : 0, 0, W),
      y: clamp(rect.height > 0 ? ((event.clientY - rect.top) / rect.height) * H : 0, 0, H)
    };
  }

  function isTouchPointer(event) {
    return IS_SMARTPHONE && event.pointerType === "touch";
  }

  function isMenuScene(scene) {
    return scene === "title" || scene === "difficulty" ||
      scene === "stageclear" || scene === "gameover" || scene === "clear";
  }

  function touchControlGeometry() {
    const canvasRect = canvas.getBoundingClientRect();
    const centerInCanvas = (element, fallback) => {
      if (!element || canvasRect.width <= 0 || canvasRect.height <= 0) return fallback;
      const rect = element.getBoundingClientRect();
      return {
        x: clamp(((rect.left + rect.width / 2 - canvasRect.left) / canvasRect.width) * W, 0, W),
        y: clamp(((rect.top + rect.height / 2 - canvasRect.top) / canvasRect.height) * H, 0, H)
      };
    };
    return {
      stick: centerInCanvas(stickBaseElement, TOUCH_STICK_CENTER),
      fire: centerInCanvas(fireButton, TOUCH_FIRE_CENTER)
    };
  }

  function isWithinRadius(point, center, radius) {
    return distSq(point, center) <= radius * radius;
  }

  function captureCanvasPointer(pointerId) {
    if (typeof canvas.setPointerCapture !== "function") return;
    try {
      canvas.setPointerCapture(pointerId);
    } catch {
      releasePointer(pointerId, true);
    }
  }

  function captureElementPointer(element, pointerId) {
    if (typeof element?.setPointerCapture !== "function") return;
    try {
      element.setPointerCapture(pointerId);
    } catch {
      releasePointer(pointerId, true);
    }
  }

  function releaseCanvasCapture(pointerId) {
    if (typeof canvas.hasPointerCapture !== "function") return;
    let hasCapture = false;
    try {
      hasCapture = canvas.hasPointerCapture(pointerId);
    } catch {
      return;
    }
    if (!hasCapture) return;
    if (typeof canvas.releasePointerCapture !== "function") return;
    try {
      canvas.releasePointerCapture(pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
  }

  function releaseElementPointer(element, pointerId) {
    if (typeof element?.hasPointerCapture !== "function") return;
    try {
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    } catch {
      // Capture may already have been released by the browser.
    }
  }

  function updateStickPointer(event, position = null) {
    if (input.stickPointer?.pointerId !== event.pointerId) return;
    if (event.currentTarget === stickElement && stickBaseElement && stickKnobElement) {
      const baseRect = stickBaseElement.getBoundingClientRect();
      const knobRect = stickKnobElement.getBoundingClientRect();
      const travel = Math.max(1, Math.min(baseRect.width, baseRect.height) / 2 - Math.max(knobRect.width, knobRect.height) / 2);
      const dx = event.clientX - (baseRect.left + baseRect.width / 2);
      const dy = event.clientY - (baseRect.top + baseRect.height / 2);
      const distance = Math.hypot(dx, dy);
      const limitedDistance = Math.min(travel, distance);
      const scale = distance > 0 ? limitedDistance / distance : 0;
      const moveX = (dx * scale) / travel;
      const moveY = (dy * scale) / travel;
      input.stickPointer.moveX = moveX;
      input.stickPointer.moveY = moveY;
      stickElement.style.setProperty("--stick-x", `${moveX * travel}px`);
      stickElement.style.setProperty("--stick-y", `${moveY * travel}px`);
      return;
    }
    if (!position) position = pointerPosition(event);
    const controls = touchControlGeometry();
    const dx = position.x - controls.stick.x;
    const dy = position.y - controls.stick.y;
    const distance = Math.hypot(dx, dy);
    const limitedDistance = Math.min(TOUCH_STICK_RADIUS, distance);
    const scale = distance > 0 ? limitedDistance / distance : 0;
    const moveX = (dx * scale) / TOUCH_STICK_RADIUS;
    const moveY = (dy * scale) / TOUCH_STICK_RADIUS;
    input.stickPointer.moveX = moveX;
    input.stickPointer.moveY = moveY;
    if (stickElement) {
      stickElement.style.setProperty("--stick-x", `${moveX * 28}px`);
      stickElement.style.setProperty("--stick-y", `${moveY * 28}px`);
    }
  }

  function remapStickInput(moveX, moveY) {
    const magnitude = Math.min(1, Math.hypot(moveX, moveY));
    if (magnitude <= TOUCH_STICK_DEADZONE) return { x: 0, y: 0 };
    const remappedMagnitude = Math.pow(
      (magnitude - TOUCH_STICK_DEADZONE) / (1 - TOUCH_STICK_DEADZONE),
      TOUCH_STICK_CURVE
    );
    const directionScale = magnitude > 0 ? 1 / magnitude : 0;
    return {
      x: moveX * directionScale * remappedMagnitude,
      y: moveY * directionScale * remappedMagnitude
    };
  }

  function releaseBombPointer(pointerId, button) {
    if (input.bombPointerId !== pointerId) return;
    input.bombPointerId = null;
    releaseElementPointer(button, pointerId);
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
      this.compressor = null;
      this.musicGain = null;
      this.sfxGain = null;
      this.musicDuck = null;
      this.pauseGain = null;
      this.pauseFilter = null;
      this.sfxGroups = Object.create(null);
      this.noiseBuffer = null;
      this.bgm = null;
      this.enabled = true;
      this.muted = false;
      this.nextShotTime = 0;
      this.nextEnemyShotTime = 0;
      this.nextHitTime = 0;
      this.scheduleAheadTime = 0.16;
      this.schedulerInterval = 25;
      this.paused = false;
      this.manualPaused = false;
      this.visibilityPaused = false;
      this.scenePaused = false;
      this._onVisibilityChange = null;

      if (typeof document !== "undefined" && document.addEventListener) {
        this._onVisibilityChange = () => {
          this.visibilityPaused = Boolean(document.hidden);
          this._applyPauseState();
        };
        document.addEventListener("visibilitychange", this._onVisibilityChange);
      }
    }

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === "suspended" && this.ctx.resume) {
          const resumeResult = this.ctx.resume();
          if (resumeResult && resumeResult.catch) resumeResult.catch(() => {});
        }
        this._syncGameState();
        return;
      }
      if (!this.enabled) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        this.enabled = false;
        return;
      }
      try {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.musicGain = this.ctx.createGain();
        this.musicDuck = this.ctx.createGain();
        this.pauseGain = this.ctx.createGain();
        this.pauseFilter = this.ctx.createBiquadFilter();
        this.sfxGain = this.ctx.createGain();

        this.master.gain.value = this.muted ? 0 : 0.18;
        this.musicGain.gain.value = 0.72;
        this.musicDuck.gain.value = 1;
        this.pauseGain.gain.value = 1;
        this.pauseFilter.type = "lowpass";
        this.pauseFilter.frequency.value = 18000;
        this.pauseFilter.Q.value = 0.55;
        this.sfxGain.gain.value = 0.95;

        this.compressor.threshold.value = -18;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 3.2;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.18;

        this.musicGain.connect(this.pauseFilter);
        this.pauseFilter.connect(this.pauseGain);
        this.pauseGain.connect(this.musicDuck);
        this.musicDuck.connect(this.master);
        this.sfxGain.connect(this.master);
        this.master.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);

        const groupLevels = {
          shot: 0.88,
          enemyShot: 0.68,
          hit: 0.82,
          item: 0.92,
          explosion: 1,
          bomb: 1,
          miss: 0.92,
          warning: 0.82,
          ui: 0.78,
          clear: 0.92,
          gameover: 0.9,
          boss: 1
        };
        Object.entries(groupLevels).forEach(([name, level]) => {
          const group = this.ctx.createGain();
          group.gain.value = level;
          group.connect(this.sfxGain);
          this.sfxGroups[name] = group;
        });
        this.noiseBuffer = this._createNoiseBuffer(2);
        this.paused = false;
        this._applyPauseState();
      } catch {
        this.ctx = null;
        this.enabled = false;
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.master && this.ctx) {
        this._fadeParam(this.master.gain, this.muted ? 0.0001 : 0.18, 0.02);
      }
      return this.muted;
    }

    pause() {
      return this.setPaused(true);
    }

    resume() {
      return this.setPaused(false);
    }

    setPaused(paused = true) {
      this.manualPaused = Boolean(paused);
      this._applyPauseState();
      return this.paused;
    }

    setScenePaused(paused = false) {
      this.scenePaused = Boolean(paused);
      this._applyPauseState();
      return this.paused;
    }

    _applyPauseState() {
      const nextPaused = this.manualPaused || this.visibilityPaused || this.scenePaused;
      if (nextPaused === this.paused) return;
      this.paused = nextPaused;
      if (!this.ctx || !this.pauseFilter) return;
      const now = this.ctx.currentTime;
      const cutoff = this.paused ? 1100 : 18000;
      const pauseLevel = this.paused ? 0.3 : 1;
      this.pauseFilter.frequency.cancelScheduledValues(now);
      this.pauseFilter.frequency.setValueAtTime(Math.max(80, this.pauseFilter.frequency.value || 18000), now);
      this.pauseFilter.frequency.setTargetAtTime(cutoff, now, this.paused ? 0.045 : 0.11);
      this.pauseGain.gain.cancelScheduledValues(now);
      this.pauseGain.gain.setTargetAtTime(pauseLevel, now, this.paused ? 0.045 : 0.12);
      if (this.bgm && !this.paused) this.bgm.nextNoteTime = now + 0.035;
    }

    _syncGameState() {
      this.scenePaused = Boolean(activeGame && activeGame.scene === "paused");
      this._applyPauseState();
      if (this.bgm && this.bgm.mode === "boss") this._syncBossPhase();
    }

    _fadeParam(param, value, timeConstant = 0.08, when = null) {
      if (!param || !this.ctx) return;
      const now = when ?? this.ctx.currentTime;
      if (param.cancelScheduledValues) param.cancelScheduledValues(now);
      if (param.setValueAtTime) param.setValueAtTime(Math.max(0.0001, param.value || 0.0001), now);
      if (param.setTargetAtTime) {
        param.setTargetAtTime(Math.max(0.0001, value), now, Math.max(0.005, timeConstant));
      } else {
        param.value = value;
      }
    }

    _createNoiseBuffer(seconds = 2) {
      if (!this.ctx) return null;
      const length = Math.max(1, Math.ceil(this.ctx.sampleRate * seconds));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    _sfxBus(name = "ui") {
      return this.sfxGroups[name] || this.sfxGain;
    }

    _duckMusic(level = 0.42, hold = 0.34, release = 0.22) {
      if (!this.ctx || !this.musicDuck) return;
      const now = this.ctx.currentTime;
      this.musicDuck.gain.cancelScheduledValues(now);
      this.musicDuck.gain.setValueAtTime(Math.max(0.0001, this.musicDuck.gain.value || 1), now);
      this.musicDuck.gain.setTargetAtTime(Math.max(0.08, Math.min(1, level)), now, 0.018);
      this.musicDuck.gain.setTargetAtTime(1, now + Math.max(0.04, hold), Math.max(0.06, release));
    }

    midi(note) {
      return 440 * 2 ** ((note - 69) / 12);
    }

    tone(freq, time, type = "square", gain = 0.08, slide = 1, destination = this.sfxGain, when = null) {
      if (!this.ctx) return;
      const now = when ?? this.ctx.currentTime;
      const output = typeof destination === "string" ? this._sfxBus(destination) : (destination || this.sfxGain);
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), now + time);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.linearRampToValueAtTime(gain, now + Math.min(0.006, Math.max(0.0015, time * 0.12)));
      amp.gain.exponentialRampToValueAtTime(0.001, now + time);
      osc.connect(amp);
      amp.connect(output);
      osc.start(now);
      osc.stop(now + time + 0.02);
    }

    noise(time = 0.22, gain = 0.12, filterFreq = 900, destination = this.sfxGain, when = null) {
      if (!this.ctx) return;
      const now = when ?? this.ctx.currentTime;
      const source = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const amp = this.ctx.createGain();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(filterFreq, now);
      filter.frequency.exponentialRampToValueAtTime(Math.max(80, filterFreq * 0.28), now + time);
      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.setValueAtTime(gain, now + 0.004);
      amp.gain.exponentialRampToValueAtTime(0.001, now + time);
      source.buffer = this.noiseBuffer || this._createNoiseBuffer(Math.max(0.5, time));
      source.loop = true;
      source.connect(filter);
      filter.connect(amp);
      amp.connect(typeof destination === "string" ? this._sfxBus(destination) : (destination || this.sfxGain));
      source.start(now);
      source.stop(now + time + 0.025);
    }

    shot(power = 1) {
      if (!this.ctx || this.ctx.currentTime < this.nextShotTime) return;
      const now = this.ctx.currentTime;
      this.nextShotTime = now + 0.045;
      const bus = this._sfxBus("shot");
      const jitter = 1 + (Math.random() - 0.5) * 0.04;
      const base = (770 + Math.min(5, power) * 44) * jitter;
      this.tone(base, 0.044, "square", 0.019, 1.78, bus, now);
      if (power >= 3) {
        this.tone(base * 2, 0.026, "triangle", 0.006 + Math.min(2, power - 3) * 0.0015, 1.28, bus, now + 0.008);
      }
      if (power >= 5) {
        this.tone(base * 0.5, 0.06, "square", 0.007, 1.08, bus, now);
      }
    }

    enemyShot(kind = "light", phase = 1) {
      if (!this.ctx || this.ctx.currentTime < this.nextEnemyShotTime) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("enemyShot");
      const config = {
        light: { cooldown: 0.055, freq: 330, length: 0.055, gain: 0.012, type: "triangle", slide: 0.66 },
        cannon: { cooldown: 0.07, freq: 205, length: 0.09, gain: 0.018, type: "square", slide: 0.58 },
        boss: { cooldown: phase >= 3 ? 0.085 : 0.07, freq: phase >= 3 ? 118 : 145, length: phase >= 3 ? 0.14 : 0.11, gain: 0.022, type: "sawtooth", slide: 0.52 }
      }[kind] || { cooldown: 0.055, freq: 260, length: 0.065, gain: 0.014, type: "triangle", slide: 0.62 };
      this.nextEnemyShotTime = now + config.cooldown;
      this.tone(config.freq, config.length, config.type, config.gain, config.slide, bus, now);
      if (kind === "cannon") this.tone(config.freq * 0.5, 0.1, "triangle", 0.009, 0.7, bus, now + 0.012);
      if (kind === "boss") this.tone(config.freq * 1.9, phase >= 3 ? 0.055 : 0.04, "triangle", phase >= 3 ? 0.008 : 0.005, 0.66, bus, now + 0.018);
    }

    hit(kind = "normal") {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const cooldown = kind === "boss" ? 0.065 : 0.05;
      if (now < this.nextHitTime) return;
      this.nextHitTime = now + cooldown;
      const bus = this._sfxBus("hit");
      if (kind === "boss") {
        this.tone(205, 0.075, "triangle", 0.019, 0.72, bus, now);
        this.tone(420, 0.045, "square", 0.007, 0.84, bus, now + 0.012);
      } else {
        this.tone(570 + Math.random() * 35, 0.042, "square", 0.011, 0.72, bus, now);
      }
    }

    playerHit() {
      return this.hit();
    }

    item(kind = "power") {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("item");
      const notes = kind === "oneUp"
        ? [72, 76, 79, 84, 88, 91]
        : kind === "bomb"
          ? [55, 60, 64, 67]
          : [72, 76, 79, 84];
      notes.forEach((note, i) => {
        this.tone(this.midi(note), kind === "oneUp" ? 0.082 : 0.07, kind === "bomb" ? "sawtooth" : "square", kind === "bomb" ? 0.035 : 0.032, 1.02, bus, now + i * (kind === "oneUp" ? 0.065 : 0.055));
      });
      if (kind === "bomb") this.tone(110, 0.18, "triangle", 0.025, 0.78, bus, now);
    }

    boom(big = false) {
      if (!this.ctx) return;
      if (big) {
        this.bossDefeat();
        return;
      }
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("explosion");
      this.noise(0.22, 0.075, 1050, bus, now);
      this.tone(142, 0.16, "sawtooth", 0.038, 0.42, bus, now);
    }

    bossDefeat() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("boss");
      this._duckMusic(0.32, 0.8, 0.5);
      this.noise(0.56, 0.18, 1700, bus, now);
      this.tone(92, 0.42, "sawtooth", 0.08, 0.38, bus, now);
      this.tone(48, 0.62, "square", 0.052, 0.5, bus, now + 0.035);
      [60, 67, 72, 76, 79].forEach((note, i) => {
        this.tone(this.midi(note), 0.22, "triangle", 0.038, 1.02, bus, now + 0.28 + i * 0.1);
      });
    }

    bomb() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("bomb");
      this._duckMusic(0.45, 0.26, 0.22);
      this.noise(0.5, 0.18, 2300, bus, now);
      this.tone(64, 0.48, "sawtooth", 0.09, 2.4, bus, now);
      [48, 55, 60, 67].forEach((note, i) => {
        this.tone(this.midi(note), 0.12, "square", 0.04, 0.75, bus, now + i * 0.055);
      });
    }

    miss() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("miss");
      this._duckMusic(0.7, 0.2, 0.2);
      this.noise(0.38, 0.14, 1250, bus, now);
      this.tone(86, 0.34, "sawtooth", 0.065, 0.46, bus, now);
      [67, 62, 55, 48].forEach((note, i) => {
        this.tone(this.midi(note), 0.11, "triangle", 0.045, 0.9, bus, now + i * 0.075);
      });
    }

    warning(intensity = 1) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("warning");
      const level = Math.max(0.25, Math.min(1, intensity));
      this._duckMusic(0.36, 0.52, 0.24);
      [58, 58, 58].forEach((note, i) => {
        this.tone(this.midi(note), 0.13, "square", 0.042 * level, 1.03, bus, now + i * 0.17);
      });
    }

    bossWarning(stageId = 1) {
      this.ensure();
      if (!this.ctx) return;
      this.stopBgm(false);
      const bus = this._sfxBus("warning");
      const now = this.ctx.currentTime;
      const siren = stageId === 3 ? 520 : 440;
      this._duckMusic(0.42, 0.62, 0.2);
      for (let i = 0; i < 5; i += 1) {
        const when = now + i * 0.14;
        this.tone(i % 2 ? siren * 0.72 : siren, 0.085, "square", 0.026, 1.02, bus, when);
        this.tone(68, 0.12, "triangle", 0.014, 0.72, bus, when + 0.01);
      }
      this.tone(980, 0.1, "square", 0.018, 0.82, bus, now + 0.7);
      window.setTimeout(() => this.startBgm(stageId, "boss"), 760);
    }

    warn(intensity = 1) {
      return this.warning(intensity);
    }

    menuMove() {
      this.tone(380, 0.045, "square", 0.022, 1.25, this._sfxBus("ui"));
    }

    menuSelect() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("ui");
      this.tone(520, 0.07, "square", 0.035, 1.12, bus, now);
      this.tone(780, 0.08, "square", 0.03, 1.18, bus, now + 0.055);
    }

    stageStart(stageId = 1) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const root = [60, 62, 65][stageId - 1] || 60;
      const bus = this._sfxBus("ui");
      [root, root + 7, root + 12].forEach((note, i) => {
        this.tone(this.midi(note), 0.14, "square", 0.042, 1.01, bus, now + i * 0.09);
      });
    }

    stageClear(final = false, delay = 0) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + Math.max(0, delay);
      const bus = this._sfxBus("clear");
      const notes = final ? [60, 64, 67, 72, 76, 79, 84, 88, 91] : [60, 64, 67, 72, 76];
      notes.forEach((note, i) => {
        this.tone(this.midi(note), final ? 0.16 : 0.13, "square", final ? 0.038 : 0.04, 1.03, bus, now + i * (final ? 0.105 : 0.09));
      });
      if (final) this.tone(this.midi(96), 0.4, "triangle", 0.035, 1.01, bus, now + 1.02);
    }

    clear(final = false) {
      return this.stageClear(final);
    }

    gameOver() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bus = this._sfxBus("gameover");
      this._duckMusic(0.28, 0.9, 0.55);
      [55, 52, 48, 43].forEach((note, i) => {
        this.tone(this.midi(note), 0.18, "triangle", 0.052, 0.96, bus, now + i * 0.13);
      });
    }

    musicPattern(stageId = 1, mode = "stage") {
      const flatten = (...sections) => sections.reduce((all, section) => all.concat(section), []);
      const stagePatterns = [
        {
          bpm: 148,
          bassGain: 0.034,
          leadGain: 0.021,
          arpGain: 0.012,
          bassType: "square",
          leadType: "triangle",
          arpType: "square",
          bass: flatten(
            [36, 36, null, 36, 43, 36, 48, 43, 36, 36, null, 36, 50, 48, 43, 36],
            [36, 36, null, 38, 43, 36, 48, 43, 36, 36, null, 36, 50, 48, 43, 31],
            [41, 41, null, 41, 48, 41, 53, 48, 41, 41, null, 41, 55, 53, 48, 41],
            [36, 36, null, 36, 43, 36, 48, 43, 36, 36, null, 36, 50, 48, 43, 35]
          ),
          lead: flatten(
            [72, null, 76, null, 79, null, 76, 74, 72, null, 76, null, 81, 79, 76, null],
            [74, null, 77, 79, null, 77, 74, null, 79, null, 81, null, 84, 81, 79, null],
            [76, null, 79, null, 84, 81, null, 79, 76, null, 79, null, 86, 84, 81, null],
            [72, null, 76, null, 79, null, 76, 74, 72, null, 76, 79, 81, 79, 76, null]
          ),
          arp: flatten(
            [60, 64, 67, 72, 64, 67, 72, 76, 60, 64, 67, 72, 64, 67, 72, 79],
            [60, 64, 69, 72, 64, 69, 72, 76, 60, 64, 69, 72, 64, 69, 76, 81],
            [65, 67, 72, 76, 67, 72, 76, 79, 65, 67, 72, 76, 67, 72, 79, 84],
            [60, 64, 67, 72, 64, 67, 72, 76, 60, 64, 67, 72, 64, 67, 72, 79]
          ),
          kick: flatten(
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
          )
        },
        {
          bpm: 160,
          bassGain: 0.036,
          leadGain: 0.023,
          arpGain: 0.013,
          bassType: "sawtooth",
          leadType: "square",
          arpType: "triangle",
          bass: flatten(
            [38, 38, null, 38, 45, 38, 50, 45, 38, 38, null, 38, 53, 50, 45, 33],
            [41, 41, null, 41, 48, 41, 53, 48, 41, 41, null, 41, 55, 53, 48, 36],
            [38, 38, null, 38, 45, 38, 50, 45, 38, 38, 45, 38, 53, 50, 48, 45],
            [43, 43, null, 43, 50, 43, 55, 50, 43, 43, null, 43, 57, 55, 50, 38]
          ),
          lead: flatten(
            [74, null, 77, 79, null, 77, null, 74, 82, null, 81, 77, 79, null, 74, null],
            [76, 79, null, 81, 84, null, 81, 79, 86, null, 84, 81, 79, null, 77, null],
            [74, null, 77, 79, null, 77, 81, null, 82, null, 81, 77, 79, 81, 84, null],
            [79, null, 81, null, 84, 81, null, 79, 86, null, 84, 81, 79, null, 77, null]
          ),
          arp: flatten(
            [62, 65, 69, 74, 65, 69, 74, 77, 62, 65, 69, 74, 65, 69, 74, 81],
            [64, 67, 71, 76, 67, 71, 76, 79, 64, 67, 71, 76, 67, 71, 79, 83],
            [62, 65, 69, 74, 65, 69, 74, 77, 62, 65, 69, 74, 65, 69, 77, 81],
            [67, 71, 74, 79, 71, 74, 79, 83, 67, 71, 74, 79, 71, 74, 81, 86]
          ),
          kick: flatten(
            [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
            [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1]
          )
        },
        {
          bpm: 172,
          bassGain: 0.039,
          leadGain: 0.025,
          arpGain: 0.014,
          bassType: "triangle",
          leadType: "sawtooth",
          arpType: "square",
          bass: flatten(
            [41, 41, null, 41, 48, 41, 53, 48, 41, 41, null, 41, 55, 53, 50, 36],
            [43, 43, null, 43, 50, 43, 55, 50, 43, 43, null, 43, 57, 55, 50, 38],
            [41, 41, 48, 41, 53, 48, 41, 36, 43, 43, 50, 43, 55, 53, 50, 48],
            [45, 45, null, 45, 52, 45, 57, 52, 45, 45, 52, 45, 59, 57, 52, 40]
          ),
          lead: flatten(
            [76, 79, null, 83, 81, null, 79, 76, 84, null, 83, 81, 79, 76, 74, null],
            [79, null, 83, 86, 84, null, 83, 79, 88, null, 86, 84, 83, 79, 77, null],
            [81, 84, null, 86, 84, null, 81, 79, 88, null, 86, 84, 81, 79, 76, null],
            [76, 79, null, 83, 81, null, 79, 76, 84, 86, null, 84, 81, 79, 76, null]
          ),
          arp: flatten(
            [65, 69, 72, 77, 69, 72, 77, 81, 65, 69, 72, 77, 69, 72, 77, 84],
            [67, 71, 74, 79, 71, 74, 79, 83, 67, 71, 74, 79, 71, 74, 81, 86],
            [65, 69, 72, 77, 69, 72, 77, 81, 65, 69, 72, 77, 69, 72, 79, 84],
            [69, 72, 76, 81, 72, 76, 81, 84, 69, 72, 76, 81, 72, 76, 83, 88]
          ),
          kick: flatten(
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1],
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1]
          )
        }
      ];
      const bossPatterns = [
        {
          bpm: 184,
          bassGain: 0.043,
          leadGain: 0.026,
          arpGain: 0.014,
          bassType: "square",
          leadType: "sawtooth",
          arpType: "triangle",
          bass: flatten(
            [36, 36, 43, 36, 35, 35, 42, 35, 38, 38, 45, 38, 41, 41, 48, 47],
            [36, 36, 43, 36, 35, 35, 42, 35, 38, 38, 45, 38, 41, 41, 50, 47],
            [41, 41, 48, 41, 40, 40, 47, 40, 43, 43, 50, 43, 46, 46, 53, 52],
            [36, 36, 43, 36, 35, 35, 42, 35, 38, 38, 45, 38, 41, 41, 48, 47]
          ),
          lead: flatten(
            [72, null, 72, 75, null, 74, null, 72, 79, null, 77, null, 75, 74, 72, null],
            [74, null, 74, 77, 79, null, 77, 74, 81, null, 79, 77, 75, 74, 72, null],
            [79, null, 77, 79, null, 81, 79, 77, 84, null, 82, 81, 79, 77, 75, null],
            [72, null, 72, 75, null, 74, null, 72, 79, 81, null, 79, 77, 75, 72, null]
          ),
          arp: flatten(
            [60, 67, 72, 79, 60, 67, 72, 79, 62, 69, 74, 81, 62, 69, 74, 81],
            [60, 67, 72, 79, 62, 69, 74, 81, 64, 71, 76, 83, 64, 71, 76, 83],
            [65, 72, 77, 84, 65, 72, 77, 84, 67, 74, 79, 86, 67, 74, 79, 86],
            [60, 67, 72, 79, 60, 67, 72, 79, 62, 69, 74, 81, 64, 71, 76, 83]
          ),
          kick: flatten(
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
            [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
          )
        },
        {
          bpm: 192,
          bassGain: 0.045,
          leadGain: 0.028,
          arpGain: 0.015,
          bassType: "sawtooth",
          leadType: "square",
          arpType: "triangle",
          bass: flatten(
            [38, 38, 45, 38, 37, 37, 44, 37, 41, 41, 48, 41, 44, 44, 51, 50],
            [38, 38, 45, 38, 37, 37, 44, 37, 41, 41, 48, 41, 44, 44, 53, 50],
            [43, 43, 50, 43, 42, 42, 49, 42, 46, 46, 53, 46, 49, 49, 56, 55],
            [38, 38, 45, 38, 37, 37, 44, 37, 41, 41, 48, 41, 44, 44, 51, 50]
          ),
          lead: flatten(
            [74, null, 77, 79, null, 77, null, 74, 82, null, 81, 77, 79, null, 74, null],
            [76, null, 79, 81, 82, null, 81, 77, 84, null, 83, 81, 79, 77, 76, null],
            [81, null, 79, 81, null, 83, 81, 79, 86, null, 84, 83, 81, 79, 77, null],
            [74, null, 77, 79, null, 77, null, 74, 82, 84, null, 82, 81, 79, 76, null]
          ),
          arp: flatten(
            [62, 69, 74, 81, 62, 69, 74, 81, 64, 71, 76, 83, 64, 71, 76, 83],
            [62, 69, 74, 81, 64, 71, 76, 83, 65, 72, 77, 84, 65, 72, 77, 84],
            [67, 74, 79, 86, 67, 74, 79, 86, 69, 76, 81, 88, 69, 76, 81, 88],
            [62, 69, 74, 81, 62, 69, 74, 81, 64, 71, 76, 83, 65, 72, 77, 84]
          ),
          kick: flatten(
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
            [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
          )
        },
        {
          bpm: 200,
          bassGain: 0.047,
          leadGain: 0.03,
          arpGain: 0.016,
          bassType: "triangle",
          leadType: "sawtooth",
          arpType: "square",
          bass: flatten(
            [41, 41, 48, 41, 40, 40, 47, 40, 44, 44, 51, 44, 47, 47, 54, 53],
            [43, 43, 50, 43, 42, 42, 49, 42, 46, 46, 53, 46, 49, 49, 56, 55],
            [45, 45, 52, 45, 44, 44, 51, 44, 48, 48, 55, 48, 51, 51, 58, 57],
            [41, 41, 48, 41, 40, 40, 47, 40, 44, 44, 51, 44, 47, 47, 54, 53]
          ),
          lead: flatten(
            [76, 79, null, 83, 81, null, 79, 76, 84, null, 83, 81, 79, 76, 74, null],
            [79, null, 83, 86, 84, null, 83, 79, 88, null, 86, 84, 83, 79, 77, null],
            [83, 86, null, 88, 86, null, 84, 81, 91, null, 89, 86, 84, 81, 79, null],
            [76, 79, null, 83, 81, null, 79, 76, 84, 86, null, 84, 81, 79, 76, null]
          ),
          arp: flatten(
            [65, 72, 77, 84, 65, 72, 77, 84, 67, 74, 79, 86, 67, 74, 79, 86],
            [67, 74, 79, 86, 69, 76, 81, 88, 67, 74, 79, 86, 69, 76, 81, 88],
            [69, 76, 81, 88, 71, 78, 83, 90, 69, 76, 81, 88, 71, 78, 83, 90],
            [65, 72, 77, 84, 65, 72, 77, 84, 67, 74, 79, 86, 69, 76, 81, 88]
          ),
          kick: flatten(
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1]
          ),
          snare: flatten(
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
            [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
            [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1]
          )
        }
      ];
      const index = Math.max(0, Math.min(2, Number(stageId) - 1 || 0));
      const pattern = mode === "boss" ? bossPatterns[index] : stagePatterns[index];
      if (mode !== "boss") return { ...pattern, steps: 64, mode: "stage" };

      const sharpen = (values, amount) => values.map((note, i) => note == null ? null : note + (i % 8 === 7 ? amount : 0));
      const phaseLayers = {
        high: {
          bass: pattern.bass,
          lead: pattern.lead,
          arp: pattern.arp,
          kick: pattern.kick,
          snare: pattern.snare,
          density: 0.72,
          leadGain: 1
        },
        mid: {
          bass: pattern.bass.map((note, i) => note == null ? null : note + (i % 16 > 11 ? 12 : 0)),
          lead: sharpen(pattern.lead, 1),
          arp: pattern.arp.map((note, i) => note == null ? null : note + (i % 4 === 3 ? 12 : 0)),
          kick: pattern.kick,
          snare: pattern.snare,
          density: 0.9,
          leadGain: 1.08
        },
        low: {
          bass: pattern.bass.map((note, i) => note == null ? null : note + (i % 4 === 3 ? 12 : 0)),
          lead: sharpen(pattern.lead, 2),
          arp: pattern.arp.map((note, i) => note == null ? null : note + (i % 2 ? 12 : 0)),
          kick: pattern.kick.map((beat, i) => beat || i % 8 === 6 ? 1 : 0),
          snare: pattern.snare.map((beat, i) => beat || i % 8 === 7 ? 1 : 0),
          density: 1,
          leadGain: 1.18
        }
      };
      return { ...pattern, steps: 64, mode: "boss", phaseLayers };
    }

    startBgm(stageId = 1, mode = "stage") {
      this.ensure();
      if (!this.ctx) return;
      if (this.bgm && this.bgm.stageId === stageId && this.bgm.mode === mode) return;
      this.stopBgm(false);
      const pattern = this.musicPattern(stageId, mode);
      const bus = this.ctx.createGain();
      bus.gain.value = 0.0001;
      bus.connect(this.musicGain);
      const now = this.ctx.currentTime;
      const bgm = {
        stageId,
        mode,
        pattern,
        phase: "high",
        pendingPhase: "high",
        step: 0,
        nextNoteTime: now + 0.045,
        timer: null,
        bus,
        active: true
      };
      this.bgm = bgm;
      this._fadeParam(bus.gain, mode === "boss" ? 0.16 : 0.13, 0.085, now);
      this._scheduleBgm();
      bgm.timer = window.setInterval(() => this._scheduleBgm(), this.schedulerInterval);
    }

    _scheduleBgm() {
      const bgm = this.bgm;
      if (!bgm || !bgm.active || !this.ctx) return;
      this._syncGameState();
      if (this.paused) {
        bgm.nextNoteTime = this.ctx.currentTime + 0.04;
        return;
      }
      const stepSec = 60 / bgm.pattern.bpm / 4;
      const horizon = this.ctx.currentTime + this.scheduleAheadTime;
      let scheduled = 0;
      while (bgm.nextNoteTime < horizon && scheduled < 32) {
        this._scheduleBgmStep(bgm, bgm.step, bgm.nextNoteTime, stepSec);
        bgm.nextNoteTime += stepSec;
        bgm.step = (bgm.step + 1) % bgm.pattern.steps;
        scheduled += 1;
      }
    }

    _scheduleBgmStep(bgm, step, when, stepSec) {
      const pattern = bgm.pattern;
      if (bgm.mode === "boss" && step % 16 === 0) bgm.phase = bgm.pendingPhase || bgm.phase;
      const phase = pattern.phaseLayers ? (pattern.phaseLayers[bgm.phase] || pattern.phaseLayers.high) : pattern;
      const index = step % pattern.steps;
      const bass = phase.bass[index];
      const lead = phase.lead[index];
      const arp = phase.arp[index];
      const density = phase.density == null ? 1 : phase.density;

      if (bass != null && step % 2 === 0) {
        this.tone(this.midi(bass), stepSec * 1.72, pattern.bassType, pattern.bassGain, 0.985, bgm.bus, when);
      }
      if (lead != null && (density >= 1 || step % 4 !== 3 || Math.random() < density)) {
        this.tone(this.midi(lead), stepSec * 0.82, pattern.leadType, pattern.leadGain * (phase.leadGain || 1), 1.01, bgm.bus, when);
      } else if (arp != null && step % 2 === 1) {
        this.tone(this.midi(arp), stepSec * 0.42, pattern.arpType, pattern.arpGain, 1.025, bgm.bus, when);
      }
      if (phase.kick[index]) {
        this.tone(pattern.kickFreq || 92, stepSec * 0.72, "triangle", 0.021, 0.52, bgm.bus, when);
      }
      if (phase.snare[index]) {
        this.noise(stepSec * 0.64, 0.0095, 4700, bgm.bus, when);
      }
      if (step % 2 === 1 || (bgm.mode === "boss" && phase === pattern.phaseLayers?.low && step % 4 === 2)) {
        this.noise(stepSec * 0.34, bgm.mode === "boss" ? 0.008 : 0.006, 5800, bgm.bus, when);
      }
      if (step % 16 === 0) {
        const padNote = bass == null ? 48 : bass + 12;
        this.tone(this.midi(padNote), stepSec * 7.2, "sine", 0.009, 1.002, bgm.bus, when);
      }
    }

    setBossPhase(hpRatio = 1) {
      if (!this.bgm || this.bgm.mode !== "boss") return "high";
      const ratio = Math.max(0, Math.min(1, Number(hpRatio) || 0));
      const nextPhase = ratio > 0.7 ? "high" : ratio > 0.32 ? "mid" : "low";
      if (this.bgm.phase !== nextPhase || this.bgm.pendingPhase !== nextPhase) {
        this.bgm.pendingPhase = nextPhase;
        this._duckMusic(nextPhase === "low" ? 0.58 : 0.72, 0.18, 0.16);
      }
      return this.bgm.phase;
    }

    bossPhase(hpRatio = 1) {
      return this.setBossPhase(hpRatio);
    }

    bossHp(currentHp, maxHp) {
      return this.setBossPhase(maxHp ? currentHp / maxHp : 0);
    }

    _syncBossPhase() {
      if (!this.bgm || this.bgm.mode !== "boss") return;
      const enemies = activeGame && Array.isArray(activeGame.enemies) ? activeGame.enemies : [];
      const boss = enemies.find((enemy) => enemy && enemy.kind === "boss");
      if (boss && Number.isFinite(boss.hp) && Number.isFinite(boss.maxHp) && boss.maxHp > 0) {
        this.setBossPhase(boss.hp / boss.maxHp);
      }
    }

    stopBgm(fast = false) {
      if (!this.bgm) return;
      const bgm = this.bgm;
      bgm.active = false;
      window.clearInterval(bgm.timer);
      if (this.ctx) this._fadeParam(bgm.bus.gain, 0.0001, fast ? 0.018 : 0.18);
      window.setTimeout(() => {
        try {
          bgm.bus.disconnect();
        } catch {
          // Already disconnected.
        }
      }, fast ? 100 : 420);
      this.bgm = null;
    }
  }

  class Game {
    constructor(assets) {
      this.assets = assets;
      this.audio = new AudioEngine();
      this.scene = "title";
      activeGame = this;
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
        r: PLAYER_COLLISION_RADIUS * (IS_SMARTPHONE ? TOUCH_PLAYER_COLLISION_SCALE : 1),
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
      this.setScene("playing");
      this.audio.ensure();
      this.audio.stageStart(this.stage.id);
      this.audio.startBgm(this.stage.id, "stage");
    }

    advanceStage() {
      if (this.currentStage >= STAGES.length - 1) return;
      this.setupStage(this.currentStage + 1);
      this.setScene("playing");
      this.audio.ensure();
      this.audio.stageStart(this.stage.id);
      this.audio.startBgm(this.stage.id, "stage");
    }

    setScene(scene) {
      if (this.scene === scene) return;
      this.scene = scene;
      resetTouchState();
      this.audio.setScenePaused(scene === "paused");
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
          this.setScene("title");
          this.audio.stopBgm();
        }
      }

      if (this.scene === "title") {
        if (input.consume("Space") || input.consume("Enter")) {
          this.audio.ensure();
          this.audio.menuSelect();
          this.setScene("difficulty");
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
          this.setScene("playing");
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
          this.setScene("title");
          this.audio.stopBgm();
        }
        return;
      }

      if (input.consume("Enter") || input.consume("KeyP")) {
        this.audio.menuMove();
        this.setScene("paused");
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

      if (input.stickPointer) {
        const stick = remapStickInput(input.stickPointer.moveX, input.stickPointer.moveY);
        ax = stick.x;
        ay = stick.y;
      } else if (input.mousePointer) {
        const targetX = input.mousePointer.x;
        const targetY = input.mousePointer.y;
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        ax = clamp(dx / POINTER_TARGET_RESPONSE, -1, 1);
        ay = clamp(dy / POINTER_TARGET_RESPONSE, -1, 1);
      }

      const inputMagnitude = Math.hypot(ax, ay);
      if (inputMagnitude > 1) {
        ax /= inputMagnitude;
        ay /= inputMagnitude;
      }
      this.player.x = clamp(this.player.x + ax * this.player.speed * dt, 15, W - 15);
      this.player.y = clamp(this.player.y + ay * this.player.speed * dt, PLAY_TOP + 18, H - 20);
      this.player.tilt = ax;
      this.player.shotCd -= dt;
      this.player.inv = Math.max(0, this.player.inv - dt);
      this.player.blink += dt;

      if (input.consume("Space")) input.shotQueued = true;
      if (input.down("Space", "KeyZ") || input.touchFireDown || input.mousePointer || input.shotQueued) {
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
        if (enemy.kind === "boss") this.audio.bossHp(enemy.hp, enemy.maxHp);
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
        this.audio.bossWarning(this.stage.id);
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
      let shotType = "light";
      let bossPhase = 1;
      if (enemy.kind === "small") {
        enemy.fire = 1.6 + Math.random() * 0.5;
        this.fireAimed(enemy.x, enemy.y + 10, 92 * speedScale, 2.7);
      } else if (enemy.kind === "medium") {
        shotType = "cannon";
        enemy.fire = 1.15;
        this.fireSpread(enemy.x, enemy.y + 15, 5, 102 * speedScale, Math.PI / 2, 0.62);
      } else if (enemy.kind === "transport") {
        enemy.fire = 1.6;
        this.fireSpread(enemy.x, enemy.y + 18, 3, 92 * speedScale, Math.PI / 2, 0.42);
      } else if (enemy.kind === "tank") {
        shotType = "cannon";
        enemy.fire = 1.75;
        this.fireAimed(enemy.x, enemy.y + 7, 118 * speedScale, 3.4);
      } else if (enemy.kind === "turret") {
        shotType = "cannon";
        enemy.fire = 1.42;
        this.fireSpread(enemy.x, enemy.y + 6, 3, 112 * speedScale, Math.PI / 2, 0.7);
      } else if (enemy.kind === "boss") {
        shotType = "boss";
        const hpRatio = enemy.hp / enemy.maxHp;
        bossPhase = hpRatio > 0.7 ? 1 : hpRatio > 0.32 ? 2 : 3;
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
      this.audio.enemyShot(shotType, bossPhase);
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
          if (enemy.kind === "boss") this.audio.bossHp(enemy.hp, enemy.maxHp);
          if (enemy.hp > 0) this.audio.hit(enemy.kind === "boss" ? "boss" : "normal");
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
          this.audio.item(item.kind);
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
        this.audio.stageClear(finalStage, 0.78);
        window.setTimeout(() => {
          if (this.scene === "playing") {
            if (!finalStage) {
              this.setScene("stageclear");
            } else {
              this.setScene("clear");
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
        this.setScene("gameover");
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
      // Snap the scroll to whole canvas pixels and move the ground toward the
      // player. Positive scroll therefore places newer rows farther down the
      // screen, matching the enemies' approach direction.
      const scrollPx = Math.floor(this.scroll);
      const offset = scrollPx % tile;
      const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
      for (let y = offset - tile; y < H + tile; y += tile) {
        const row = Math.floor((y - scrollPx) / tile);
        for (let x = 0; x < W; x += tile) {
          let img = raw.grass;
          if (stage.terrain === "coast") {
            if (x < 48 && mod(row, 8) < 4) img = raw.water;
            else if (x >= 112 && x < 208) img = raw.road;
            else if (mod(row + Math.floor(x / tile), 13) === 0) img = raw.dirt;
          } else if (stage.terrain === "forest") {
            if (x >= 96 && x < 192) img = raw.road;
            else if (mod(row + Math.floor(x / tile), 4) === 0) img = raw.dirt;
            else img = raw.grass;
          } else {
            if (x >= 96 && x < 224) img = mod(row, 2) === 0 ? raw.runway : raw.road;
            else if (mod(row + Math.floor(x / tile), 3) === 0) img = raw.concrete;
            else img = raw.dirt;
          }
          ctx.drawImage(img, x, y, tile, tile);
        }
        if (stage.terrain === "coast") {
          if (mod(row, 15) === 0) ctx.drawImage(raw.base, 220, y, 68, 68);
          if (mod(row, 19) === 8) ctx.drawImage(raw.runway, 112, y, 96, 96);
          if (mod(row, 17) === 5) ctx.drawImage(raw.concrete, 48, y, 64, 64);
        } else if (stage.terrain === "forest") {
          if (mod(row, 11) === 0) ctx.drawImage(raw.base, 18, y, 66, 66);
          if (mod(row, 13) === 6) ctx.drawImage(raw.concrete, 226, y, 62, 62);
        } else {
          if (mod(row, 7) === 0) ctx.drawImage(raw.concrete, 28, y, 64, 64);
          if (mod(row, 9) === 4) ctx.drawImage(raw.base, 230, y, 70, 70);
          if (mod(row, 12) === 6) ctx.drawImage(raw.runway, 96, y, 128, 96);
        }
      }
      ctx.fillStyle = stage.overlay;
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
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
      ctx.fillText(IS_SMARTPHONE ? "TAP TO START" : "PRESS SPACE / ENTER", W / 2, 332);
      ctx.fillStyle = "#9ab0c8";
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText(`HI-SCORE ${padScore(this.highScore)}`, W / 2, 356);
      ctx.fillText(
        IS_SMARTPHONE ? "LEFT STICK TO MOVE / HOLD FIRE" : "3 STAGES  ARROWS/WASD  Z/SPACE  X  M",
        W / 2,
        378
      );
      if (IS_SMARTPHONE) ctx.fillText("FIRE TO SHOOT / BOMB IN DANGER", W / 2, 396);
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
      ctx.fillText(
        IS_SMARTPHONE ? "TAP A DIFFICULTY TO START" : "LEFT / RIGHT TO CHANGE",
        W / 2,
        352
      );
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
      ctx.fillText(IS_SMARTPHONE ? "TAP TO CONTINUE" : "SPACE / ENTER TO LAUNCH", W / 2, 314);
      if (!IS_SMARTPHONE) ctx.fillText("ESC TITLE", W / 2, 332);
    }

    drawPause() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
      ctx.fillRect(0, HUD_H, W, H - HUD_H);
      ctx.fillStyle = "#e8f7ff";
      ctx.textAlign = "center";
      ctx.font = "bold 24px 'Courier New', monospace";
      ctx.fillText("PAUSED", W / 2, H / 2);
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText(IS_SMARTPHONE ? "USE PAUSE BUTTON TO RESUME" : "ENTER / P", W / 2, H / 2 + 24);
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
      ctx.fillText(IS_SMARTPHONE ? "TAP TO RETRY" : "SPACE RETRY   ENTER TITLE", W / 2, 316);
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
      activeGame = new Game(assets);
      requestAnimationFrame((time) => {
        activeGame.last = time;
        activeGame.loop(time);
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
