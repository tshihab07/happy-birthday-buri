(() => {
  'use strict';

  const dataEl = document.getElementById('story-data');
  if (!dataEl) return;
  const STORY = JSON.parse(dataEl.textContent);

  const CHAPTERS = [
    { id: 'scene-gift', name: 'Gift', label: 'Surprise Gift', arrival: false },
    { id: 'scene-arrival', name: 'Arrival', label: 'Birthday Wish', arrival: false },
    { id: 'scene-candles', name: 'Candles', label: 'Make a Wish', arrival: false },
    { id: 'scene-balloons', name: 'Balloons', label: '5 Whispers', arrival: false },
    { id: 'scene-wishes', name: 'Wishes', label: 'Birthday Wishes', arrival: false },
    { id: 'scene-cake', name: 'Cake', label: 'Cut the Cake', arrival: false },
    { id: 'scene-letter', name: 'Letter', label: 'Love Letter', arrival: false },
    { id: 'scene-memories', name: 'Memories', label: 'A Portrait of You', arrival: false },
    { id: 'scene-quiz', name: 'Quiz', label: 'Birthday Quiz', arrival: false },
    { id: 'scene-scratch', name: 'Secret', label: 'Secret Note', arrival: false },
    { id: 'scene-finale', name: 'With love', label: 'With Love', arrival: false },
  ];

  // DOM References
  const journey = document.getElementById('story-journey');
  const atmosphere = document.getElementById('story-atmosphere');
  const soundPrompt = document.getElementById('sound-prompt');
  const bgMusic = document.getElementById('bg-music');

  const btnStartWithMusic = document.getElementById('btn-start-with-music');
  const btnStartNoSound = document.getElementById('btn-start-no-sound');
  const btnPauseMotion = document.getElementById('btn-pause-motion');
  const iconPause = document.getElementById('icon-pause');
  const iconPlay = document.getElementById('icon-play');
  const btnMusicToggle = document.getElementById('btn-music-toggle');
  const iconMusicOff = document.getElementById('icon-music-off');
  const iconMusicOn = document.getElementById('icon-music-on');

  const chapterLabel = document.getElementById('chapter-label');
  const chapterBars = Array.from(document.querySelectorAll('#chapter-bars span'));
  const floatingStatus = document.getElementById('floating-status');

  // State
  let currentChapterIndex = 0;
  let isMotionPaused = false;
  let isMusicPlaying = false;
  let sfxEnabled = true;
  let audioCtx = null;
  let fallbackMelodyTimer = null;
  let statusTimeout = null;
  let quizAutoTimer = null;
  let arrivalTimers = [];

  function showFloatingStatus(message) {
    if (!floatingStatus) return;
    floatingStatus.textContent = message;
    if (statusTimeout) window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(() => {
      floatingStatus.textContent = '';
    }, 3000);
  }

  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.12, delay = 0) {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  function playChimeSound() {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => {
      playTone(note, 0.28, 'triangle', 0.09, i * 0.07);
    });
  }

  function playPopSound() {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.11);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
    playTone(880, 0.18, 'triangle', 0.06, 0.06);
  }

  function playBlowSound() {
    if (!sfxEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    const bufferSize = ctx.sampleRate * 0.22;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  function playPartyPopperSound() {
    playPopSound();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, idx) => {
      playTone(n, 0.32, 'triangle', 0.1, 0.05 + idx * 0.06);
    });
  }

  function startFallbackMusicBox() {
    stopFallbackMusicBox();
    const melody = [
      [261.63, 0.28], [261.63, 0.28], [293.66, 0.52], [261.63, 0.52], [349.23, 0.52], [329.63, 0.9],
      [261.63, 0.28], [261.63, 0.28], [293.66, 0.52], [261.63, 0.52], [392.0, 0.52], [349.23, 0.9],
      [261.63, 0.28], [261.63, 0.28], [523.25, 0.52], [440.0, 0.52], [349.23, 0.52], [329.63, 0.52], [293.66, 0.85],
      [466.16, 0.28], [466.16, 0.28], [440.0, 0.52], [349.23, 0.52], [392.0, 0.52], [349.23, 0.95],
    ];
    let step = 0;
    function scheduleNext() {
      if (!isMusicPlaying) return;
      const [freq, dur] = melody[step % melody.length];
      playTone(freq, dur * 0.9, 'sine', 0.055, 0);
      step += 1;
      fallbackMelodyTimer = window.setTimeout(scheduleNext, dur * 680);
    }
    scheduleNext();
  }

  function stopFallbackMusicBox() {
    if (fallbackMelodyTimer) {
      window.clearTimeout(fallbackMelodyTimer);
      fallbackMelodyTimer = null;
    }
  }

  function updateMusicUI() {
    btnMusicToggle.setAttribute('aria-pressed', isMusicPlaying ? 'true' : 'false');
    btnMusicToggle.setAttribute('aria-label', isMusicPlaying ? 'Pause music' : 'Play music');
    iconMusicOn.hidden = !isMusicPlaying;
    iconMusicOff.hidden = isMusicPlaying;
  }

  function startMusic() {
    isMusicPlaying = true;
    sfxEnabled = true;
    updateMusicUI();
    if (bgMusic) {
      bgMusic.volume = 0.55;
      const playPromise = bgMusic.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          startFallbackMusicBox();
        });
      }
    } else {
      startFallbackMusicBox();
    }
  }

  function stopMusic() {
    isMusicPlaying = false;
    updateMusicUI();
    if (bgMusic) {
      bgMusic.pause();
    }
    stopFallbackMusicBox();
  }

  if (bgMusic) {
    bgMusic.addEventListener('error', () => {
      if (isMusicPlaying) {
        startFallbackMusicBox();
      }
    });
  }

  function setMotionPaused(paused) {
    isMotionPaused = paused;
    const val = paused ? 'true' : 'false';
    journey.setAttribute('data-paused', val);
    atmosphere.setAttribute('data-paused', val);
    [
      'arrival-stage',
      'gift-reveal',
      'balloons-stage',
      'cake-cut-moment',
      'letter-reveal',
      'finale-parade',
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('data-paused', val);
    });
    ['quiz-container', 'memory-lane'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('data-motion-paused', val);
    });
    const pres = document.querySelector('.I47G9G_presentation');
    if (pres) pres.setAttribute('data-motion-paused', val);

    btnPauseMotion.setAttribute('aria-pressed', val);
    btnPauseMotion.setAttribute('aria-label', paused ? 'Resume story' : 'Pause story');
    iconPause.hidden = paused;
    iconPlay.hidden = !paused;
  }

  function clearQuizAutoTimer() {
    if (quizAutoTimer) {
      window.clearTimeout(quizAutoTimer);
      quizAutoTimer = null;
    }
  }

  function clearArrivalTimers() {
    arrivalTimers.forEach((id) => window.clearTimeout(id));
    arrivalTimers = [];
  }

  function showScene(index) {
    currentChapterIndex = Math.max(0, Math.min(index, CHAPTERS.length - 1));
    const chapter = CHAPTERS[currentChapterIndex];
    if (chapter.id !== 'scene-quiz') {
      clearQuizAutoTimer();
    }

    CHAPTERS.forEach((ch, idx) => {
      const section = document.getElementById(ch.id);
      if (section) {
        section.hidden = idx !== currentChapterIndex;
      }
    });

    journey.setAttribute('data-chapter', chapter.name);
    journey.setAttribute('data-arrival', chapter.arrival ? 'true' : 'false');
    if (chapterLabel) chapterLabel.textContent = chapter.label;

    chapterBars.forEach((bar, idx) => {
      bar.classList.toggle('tyKLZW_progressActive', idx === currentChapterIndex);
      bar.setAttribute('data-done', idx < currentChapterIndex ? 'true' : 'false');
    });

    const activeSection = document.getElementById(chapter.id);
    if (activeSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (chapter.id === 'scene-scratch') {
        window.requestAnimationFrame(() => initScratchCanvas());
      }
    }
  }

  // Party Popper Burst Engine
  function launchPartyPoppers() {
    if (isMotionPaused) return;
    const layer = document.createElement('div');
    layer.className = 'party-popper-layer';
    layer.setAttribute('aria-hidden', 'true');

    const leftCannon = document.createElement('span');
    leftCannon.className = 'party-popper-cannon party-popper-cannon-left';
    leftCannon.textContent = '🎉';

    const rightCannon = document.createElement('span');
    rightCannon.className = 'party-popper-cannon party-popper-cannon-right';
    rightCannon.textContent = '🎉';

    layer.appendChild(leftCannon);
    layer.appendChild(rightCannon);

    const colors = ['#dc8ca5', '#e7bd6d', '#b49ccc', '#8dbbb3', '#a54769', '#ff85b4'];
    const shapes = ['', 'is-circle', 'is-ribbon'];

    for (let i = 0; i < 44; i += 1) {
      const fromLeft = i % 2 === 0;
      const piece = document.createElement('i');
      const shape = shapes[i % shapes.length];
      piece.className = `party-popper-piece${shape ? ` ${shape}` : ''}`;
      piece.style.background = colors[i % colors.length];
      piece.style.left = fromLeft ? `${4 + (i % 6) * 2}%` : `${94 - (i % 6) * 2}%`;
      piece.style.bottom = '16%';

      const spreadX = (80 + Math.random() * 260) * (fromLeft ? 1 : -1);
      const peakY = -(160 + Math.random() * 300);
      const endX = spreadX * 1.45;
      const endY = 140 + Math.random() * 180;
      const dur = (1.1 + Math.random() * 0.7).toFixed(2);
      const delay = (Math.random() * 0.16).toFixed(2);

      piece.style.setProperty('--tx-mid', `${spreadX.toFixed(0)}px`);
      piece.style.setProperty('--ty-mid', `${peakY.toFixed(0)}px`);
      piece.style.setProperty('--tx-end', `${endX.toFixed(0)}px`);
      piece.style.setProperty('--ty-end', `${endY.toFixed(0)}px`);
      piece.style.setProperty('--pop-dur', `${dur}s`);
      piece.style.setProperty('--pop-delay', `${delay}s`);

      layer.appendChild(piece);
    }

    document.body.appendChild(layer);
    window.setTimeout(() => {
      layer.remove();
    }, 2000);
  }

  // Sound Prompt Handlers
  function enterStory(withMusic) {
    if (soundPrompt) soundPrompt.hidden = true;
    setMotionPaused(false);
    sfxEnabled = true;
    if (withMusic) {
      startMusic();
    } else {
      stopMusic();
    }
    const focusEl = document.getElementById('btn-unwrap-gift');
    if (focusEl) focusEl.focus();
  }

  if (btnStartWithMusic) {
    btnStartWithMusic.addEventListener('click', () => enterStory(true));
  }
  if (btnStartNoSound) {
    btnStartNoSound.addEventListener('click', () => enterStory(false));
  }

  // Floating Bar Handlers
  if (btnPauseMotion) {
    btnPauseMotion.addEventListener('click', () => {
      setMotionPaused(!isMotionPaused);
      showFloatingStatus(isMotionPaused ? 'Animations paused' : 'Animations resumed');
    });
  }

  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', () => {
      if (isMusicPlaying) {
        stopMusic();
        showFloatingStatus('Music paused');
      } else {
        startMusic();
        showFloatingStatus(`Playing: ${STORY.musicTitle}`);
      }
    });
  }

  // Video & Share Dialogs
  const videoDialog = document.getElementById('video-dialog');
  const btnVideoDialog = document.getElementById('btn-video-dialog');
  const btnCloseVideo = document.getElementById('btn-close-video');
  const btnPlayKeepsake = document.getElementById('btn-play-keepsake-story');
  const videoDialogStatus = document.getElementById('video-dialog-status');

  if (btnVideoDialog && videoDialog) {
    btnVideoDialog.addEventListener('click', () => {
      if (typeof videoDialog.showModal === 'function') {
        videoDialog.showModal();
      } else {
        videoDialog.setAttribute('open', '');
      }
    });
  }
  if (btnCloseVideo && videoDialog) {
    btnCloseVideo.addEventListener('click', () => {
      if (typeof videoDialog.close === 'function') videoDialog.close();
      else videoDialog.removeAttribute('open');
    });
  }
  if (btnPlayKeepsake && videoDialogStatus) {
    btnPlayKeepsake.addEventListener('click', () => {
      videoDialogStatus.hidden = false;
      videoDialogStatus.textContent = `This interactive birthday keepsake is always ready here for ${STORY.recipientName}! Starting from the beginning...`;
      window.setTimeout(() => {
        if (typeof videoDialog.close === 'function') videoDialog.close();
        resetAndReplayStory();
      }, 950);
    });
  }

  const shareDialog = document.getElementById('share-dialog');
  const btnShareDialog = document.getElementById('btn-share-dialog');
  const btnCloseShare = document.getElementById('btn-close-share');
  const shareUrlInput = document.getElementById('share-url-input');
  const btnDialogCopy = document.getElementById('btn-dialog-copy');
  const btnCopyLink = document.getElementById('btn-copy-link');

  function copyStoryUrl() {
    const url = window.location.href;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(url).then(
        () => showFloatingStatus('Celebration link copied! 💕'),
        () => showFloatingStatus('Link ready to share!')
      );
    } else {
      const temp = document.createElement('textarea');
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand('copy');
        showFloatingStatus('Celebration link copied! 💕');
      } catch (err) {
        showFloatingStatus('Copy the URL from your address bar!');
      }
      temp.remove();
    }
  }

  if (btnCopyLink) btnCopyLink.addEventListener('click', copyStoryUrl);
  if (btnDialogCopy) btnDialogCopy.addEventListener('click', copyStoryUrl);

  if (btnShareDialog && shareDialog) {
    btnShareDialog.addEventListener('click', () => {
      if (shareUrlInput) shareUrlInput.value = window.location.href;
      if (typeof shareDialog.showModal === 'function') {
        shareDialog.showModal();
      } else {
        shareDialog.setAttribute('open', '');
      }
    });
  }
  if (btnCloseShare && shareDialog) {
    btnCloseShare.addEventListener('click', () => {
      if (typeof shareDialog.close === 'function') shareDialog.close();
      else shareDialog.removeAttribute('open');
    });
  }

  // SCENE 1: GIFT UNWRAP (index 0)
  const giftReveal = document.getElementById('gift-reveal');
  const btnUnwrapGift = document.getElementById('btn-unwrap-gift');
  const giftFriendsImg = document.getElementById('gift-friends-img');
  const giftStatus = document.getElementById('gift-status');

  if (giftFriendsImg && giftReveal) {
    giftFriendsImg.addEventListener('error', () => {
      giftReveal.setAttribute('data-artwork-fallback', 'true');
    });
  }

  if (btnUnwrapGift && giftReveal) {
    btnUnwrapGift.addEventListener('click', () => {
      if (giftReveal.getAttribute('data-gift-reveal') !== 'ready') return;
      btnUnwrapGift.disabled = true;
      giftReveal.setAttribute('data-gift-reveal', 'opening');
      if (giftStatus) giftStatus.textContent = 'Unwrapping your birthday surprise...';
      playChimeSound();
      window.setTimeout(() => {
        showScene(1);
      }, 1150);
    });
  }

  // SCENE 2: BOW & ARROW + INTRO GREETING (index 1)
  const arrivalStage = document.getElementById('arrival-stage');
  const arrivalBowStage = document.getElementById('arrival-bow-stage');
  const arrivalRevealed = document.getElementById('arrival-revealed');
  const btnBowShoot = document.getElementById('btn-bow-shoot');
  const loadedArrow = document.getElementById('loaded-arrow');
  const arrivalCakeName = document.getElementById('arrival-cake-name');
  const arrivalImpactRing = document.getElementById('arrival-impact-ring');
  const arrivalBurst = document.getElementById('arrival-burst');
  const btnArrivalContinue = document.getElementById('btn-arrival-continue');

  let arrowFired = false;
  let pointerStartY = null;
  let currentDrawY = 0;

  function fireBirthdayArrow() {
    if (arrowFired || !arrivalStage || !loadedArrow) return;
    arrowFired = true;
    clearArrivalTimers();
    btnBowShoot.disabled = true;

    const drawPx = currentDrawY;
    currentDrawY = 0;
    pointerStartY = null;

    arrivalStage.style.setProperty('--draw-y', '0px');
    arrivalStage.style.setProperty('--draw-ratio', '0');
    loadedArrow.classList.remove('_2gkThW_loadedArrow', '_2gkThW_flyingArrow');
    loadedArrow.style.transform = 'none';

    const cakeTarget = document.getElementById('arrival-cake-target');
    const cakeRect = cakeTarget.getBoundingClientRect();
    const arrowRect = loadedArrow.getBoundingClientRect();
    const dx = cakeRect.left + cakeRect.width / 2 - (arrowRect.left + arrowRect.width / 2);
    const targetY = cakeRect.top + cakeRect.height * 0.42;
    const arrowTipOffset = 14;
    const dy = targetY - (arrowRect.top + arrowTipOffset);
    loadedArrow.style.transform = '';

    loadedArrow.style.setProperty('--from-x', '0px');
    loadedArrow.style.setProperty('--from-y', `${drawPx.toFixed(1)}px`);
    loadedArrow.style.setProperty('--to-x', `${dx.toFixed(1)}px`);
    loadedArrow.style.setProperty('--to-y', `${dy.toFixed(1)}px`);
    void loadedArrow.offsetWidth;
    loadedArrow.classList.add('_2gkThW_flyingArrow');
    arrivalStage.setAttribute('data-phase', 'throwing');

    playTone(320, 0.25, 'sine', 0.12, 0);
    playTone(580, 0.35, 'triangle', 0.1, 0.12);

    arrivalTimers.push(
      window.setTimeout(() => {
        arrivalStage.setAttribute('data-phase', 'landing');
        if (arrivalCakeName) arrivalCakeName.hidden = false;
        if (arrivalImpactRing) arrivalImpactRing.hidden = false;
        if (arrivalBurst) arrivalBurst.hidden = false;
        playChimeSound();
      }, 700)
    );

    arrivalTimers.push(
      window.setTimeout(() => {
        arrivalStage.setAttribute('data-phase', 'revealed');
        if (arrivalBowStage) arrivalBowStage.hidden = true;
        if (arrivalRevealed) arrivalRevealed.hidden = false;
        launchPartyPoppers();
      }, 1650)
    );
  }

  if (btnBowShoot) {
    btnBowShoot.addEventListener('pointerdown', (e) => {
      if (arrowFired) return;
      pointerStartY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (pointerStartY === null || arrowFired || !arrivalStage) return;
      currentDrawY = Math.max(0, Math.min(44, e.clientY - pointerStartY));
      arrivalStage.style.setProperty('--draw-y', `${currentDrawY.toFixed(1)}px`);
      arrivalStage.style.setProperty('--draw-ratio', (currentDrawY / 44).toFixed(3));
    });
    window.addEventListener('pointerup', () => {
      if (pointerStartY === null || arrowFired) return;
      pointerStartY = null;
      fireBirthdayArrow();
    });
    btnBowShoot.addEventListener('click', () => {
      if (!arrowFired) fireBirthdayArrow();
    });
  }

  if (btnArrivalContinue) {
    btnArrivalContinue.addEventListener('click', () => {
      playChimeSound();
      showScene(2);
    });
  }

  // SCENE 3: CANDLES (index 2 — button swaps in-place without expanding height)
  const candleButtons = Array.from(document.querySelectorAll('#candles-row .tyKLZW_candleButton'));
  const btnBlowAllCandles = document.getElementById('btn-blow-all-candles');
  const btnCandlesContinue = document.getElementById('btn-candles-continue');
  const candlesInstruction = document.getElementById('candles-instruction');
  let blownCandles = 0;

  function blowCandle(btn) {
    if (btn.classList.contains('tyKLZW_candleOut')) return;
    btn.classList.add('tyKLZW_candleOut');
    btn.disabled = true;
    blownCandles += 1;
    playBlowSound();

    if (blownCandles >= candleButtons.length) {
      if (btnBlowAllCandles) btnBlowAllCandles.hidden = true;
      if (candlesInstruction) {
        candlesInstruction.textContent = STORY.texts.continueHint;
      }
      if (btnCandlesContinue) btnCandlesContinue.hidden = false;
      playChimeSound();
      launchPartyPoppers();
    }
  }

  candleButtons.forEach((btn) => {
    btn.addEventListener('click', () => blowCandle(btn));
  });

  if (btnBlowAllCandles) {
    btnBlowAllCandles.addEventListener('click', () => {
      const remaining = candleButtons.filter((b) => !b.classList.contains('tyKLZW_candleOut'));
      remaining.forEach((btn, idx) => {
        window.setTimeout(() => blowCandle(btn), idx * 95);
      });
    });
  }

  if (btnCandlesContinue) {
    btnCandlesContinue.addEventListener('click', () => {
      playChimeSound();
      showScene(3);
    });
  }

  // SCENE 4: 5 BALLOONS (index 3)
  const balloonButtons = Array.from(document.querySelectorAll('#balloon-buttons .story-balloon-btn'));
  const balloonReasons = Array.from(document.querySelectorAll('#balloon-reasons-list article'));
  const balloonsComplete = document.getElementById('balloons-complete');
  const btnBalloonsContinue = document.getElementById('btn-balloons-continue');
  let poppedCount = 0;

  balloonButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-popped') === 'true') return;
      btn.setAttribute('data-popped', 'true');
      btn.disabled = true;
      poppedCount += 1;
      playPopSound();

      const burst = btn.querySelector('.vUO_tq_burst');
      const seal = btn.querySelector('.vUO_tq_foundSeal');
      if (burst) burst.hidden = false;
      if (seal) seal.hidden = false;

      const order = btn.getAttribute('data-balloon-order');
      const card = balloonReasons.find((el) => el.getAttribute('data-reason-order') === order);
      if (card) card.hidden = false;

      if (poppedCount >= balloonButtons.length && balloonsComplete) {
        window.setTimeout(() => {
          balloonsComplete.hidden = false;
          playChimeSound();
        }, 420);
      }
    });
  });

  if (btnBalloonsContinue) {
    btnBalloonsContinue.addEventListener('click', () => {
      playChimeSound();
      showScene(4);
    });
  }

  // SCENE 5: TWO WISH CARDS WITH TWO BALLOONS (index 4)
  const btnWishesContinue = document.getElementById('btn-wishes-continue');
  if (btnWishesContinue) {
    btnWishesContinue.addEventListener('click', () => {
      playChimeSound();
      showScene(5);
    });
  }

  // SCENE 6: CUT THE CAKE (index 5 — single view, zero scrolling, in-place button swap)
  const cakeCutMoment = document.getElementById('cake-cut-moment');
  const btnCutCake = document.getElementById('btn-cut-cake');
  const cakeCutBtnLabel = document.getElementById('cake-cut-btn-label');
  const cakeCutStatus = document.getElementById('cake-cut-status');

  if (btnCutCake && cakeCutMoment) {
    btnCutCake.addEventListener('click', () => {
      if (btnCutCake.getAttribute('data-ready-continue') === 'true') {
        playChimeSound();
        showScene(6);
        return;
      }

      if (cakeCutMoment.getAttribute('data-cake-cut') !== 'ready') return;
      btnCutCake.disabled = true;
      cakeCutMoment.setAttribute('data-cake-cut', 'cutting');
      if (cakeCutBtnLabel) cakeCutBtnLabel.textContent = 'Cutting the cake...';
      if (cakeCutStatus) cakeCutStatus.textContent = 'Serving a sweet slice of birthday happiness!';
      playChimeSound();

      window.setTimeout(() => {
        cakeCutMoment.setAttribute('data-cake-cut', 'cut');
        btnCutCake.disabled = false;
        btnCutCake.setAttribute('data-ready-continue', 'true');
        btnCutCake.setAttribute('aria-label', 'Continue story');
        if (cakeCutBtnLabel) cakeCutBtnLabel.textContent = 'Continue story →';
        launchPartyPoppers();
      }, 1150);
    });
  }

  // SCENE 7: WAX-SEALED LETTER (index 6)
  const letterReveal = document.getElementById('letter-reveal');
  const btnOpenEnvelope = document.getElementById('btn-open-envelope');
  const letterPaper = document.getElementById('letter-paper');
  const letterHint = document.getElementById('letter-hint');
  const btnLetterContinue = document.getElementById('btn-letter-continue');

  if (btnOpenEnvelope && letterReveal) {
    btnOpenEnvelope.addEventListener('click', () => {
      if (letterReveal.getAttribute('data-phase') !== 'closed') return;
      btnOpenEnvelope.disabled = true;
      letterReveal.setAttribute('data-phase', 'opening');
      playTone(440, 0.25, 'triangle', 0.1, 0);
      playTone(554.37, 0.3, 'triangle', 0.1, 0.12);

      window.setTimeout(() => {
        letterReveal.setAttribute('data-phase', 'open');
        if (letterHint) letterHint.hidden = true;
        if (btnLetterContinue) btnLetterContinue.hidden = false;
        if (letterPaper) letterPaper.focus();
        playChimeSound();
      }, 1450);
    });
  }

  if (btnLetterContinue) {
    btnLetterContinue.addEventListener('click', () => {
      playChimeSound();
      showScene(7);
    });
  }

  // SCENE 8: MEMORY LANE (index 7 — 5 PHOTOS + QUOTES 1-5, PORTRAIT BOX, OBJECT-CONTAIN, NO DATES)
  const memoryLane = document.getElementById('memory-lane');
  const memoryFeature = document.getElementById('memory-feature');
  const memoryFeatureImg = document.getElementById('memory-feature-img');
  const memoryFeatureQuote = document.getElementById('memory-feature-quote');
  const memoryCounterBadge = document.getElementById('memory-counter-badge');
  const memoryNavCounter = document.getElementById('memory-nav-counter');
  const backPrintLeft = document.getElementById('back-print-left');
  const backPrintRight = document.getElementById('back-print-right');
  const btnMemoryPrev = document.getElementById('btn-memory-prev');
  const btnMemoryNext = document.getElementById('btn-memory-next');
  const btnMemoriesContinue = document.getElementById('btn-memories-continue');

  let memoryIdx = 0;

  function updateMemoryLane(nextIndex, direction) {
    const photos = STORY.memoryLanePhotos || [];
    if (!photos.length) return;

    memoryIdx = (nextIndex + photos.length) % photos.length;
    const current = photos[memoryIdx];
    const prevPhoto = photos[(memoryIdx - 1 + photos.length) % photos.length];
    const nextPhoto = photos[(memoryIdx + 1) % photos.length];

    if (memoryLane) memoryLane.setAttribute('data-direction', direction);

    if (memoryFeature && !isMotionPaused) {
      memoryFeature.style.animation = 'none';
      void memoryFeature.offsetHeight;
      memoryFeature.style.animation = '';
    }

    if (memoryFeatureImg) {
      memoryFeatureImg.src = current.url;
      memoryFeatureImg.alt = `Memory ${current.order} for ${STORY.recipientName}`;
    }
    if (memoryFeatureQuote) memoryFeatureQuote.textContent = current.quote;
    if (memoryCounterBadge) memoryCounterBadge.textContent = `${memoryIdx + 1}/${photos.length}`;
    if (memoryNavCounter) memoryNavCounter.textContent = `${memoryIdx + 1} / ${photos.length}`;
    if (backPrintLeft) backPrintLeft.src = prevPhoto.url;
    if (backPrintRight) backPrintRight.src = nextPhoto.url;
    playTone(587.33, 0.15, 'sine', 0.06);
  }

  if (btnMemoryPrev) {
    btnMemoryPrev.addEventListener('click', () => updateMemoryLane(memoryIdx - 1, 'previous'));
  }
  if (btnMemoryNext) {
    btnMemoryNext.addEventListener('click', () => updateMemoryLane(memoryIdx + 1, 'next'));
  }
  document.addEventListener('keydown', (e) => {
    if (currentChapterIndex !== 7) return;
    if (e.key === 'ArrowLeft') updateMemoryLane(memoryIdx - 1, 'previous');
    if (e.key === 'ArrowRight') updateMemoryLane(memoryIdx + 1, 'next');
  });

  if (btnMemoriesContinue) {
    btnMemoriesContinue.addEventListener('click', () => {
      playChimeSound();
      renderQuiz(0);
      showScene(8);
    });
  }

  // SCENE 9: 5 QUIZZES WITH PARTY POPPERS + QUIZ 03 DODGE (index 8)
  const quizCounter = document.getElementById('quiz-counter');
  const quizQuestionText = document.getElementById('quiz-question-text');
  const quizChoicesEl = document.getElementById('quiz-choices');
  const quizFeedbackEl = document.getElementById('quiz-feedback');
  const quizFeedbackText = document.getElementById('quiz-feedback-text');
  const quizSuccessRing = document.getElementById('quiz-success-ring');
  const quizSparkles = document.getElementById('quiz-sparkles');
  const quizNextWrap = document.getElementById('quiz-next-wrap');
  const btnQuizNext = document.getElementById('btn-quiz-next');

  const LETTERS = ['A', 'B', 'C', 'D'];
  const DODGE_OFFSETS = [
    ['34px', '-10px', '3deg'],
    ['-36px', '8px', '-3deg'],
    ['28px', '10px', '2deg'],
    ['-28px', '-8px', '-2deg'],
  ];

  let currentQuizIndex = 0;
  let quizSolved = false;
  let dodgeSteps = [0, 0, 0, 0];

  function renderQuiz(index) {
    clearQuizAutoTimer();
    currentQuizIndex = index;
    quizSolved = false;
    dodgeSteps = [0, 0, 0, 0];

    const q = STORY.quizzes[index];
    if (!q) return;

    const total = String(STORY.quizzes.length).padStart(2, '0');
    const num = String(index + 1).padStart(2, '0');
    if (quizCounter) quizCounter.textContent = `QUIZ ${num} of ${total}`;
    if (quizQuestionText) quizQuestionText.textContent = q.question;

    const promptBox = document.querySelector('.gNq10q_prompt');
    if (promptBox && !isMotionPaused) {
      promptBox.style.animation = 'none';
      void promptBox.offsetHeight;
      promptBox.style.animation = '';
    }

    if (quizFeedbackEl) quizFeedbackEl.setAttribute('data-feedback', 'idle');
    if (quizFeedbackText) {
      quizFeedbackText.textContent = '';
      quizFeedbackText.classList.remove('quiz-dodge-note');
    }
    if (quizSuccessRing) quizSuccessRing.hidden = true;
    if (quizSparkles) quizSparkles.hidden = true;
    if (quizNextWrap) quizNextWrap.hidden = true;

    quizChoicesEl.innerHTML = '';
    q.choices.forEach((choiceText, choiceIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-choice-index', String(choiceIdx));

      const isDodgeOption = q.answerRule === 'only_c_dodge' && choiceIdx !== 2;
      if (isDodgeOption) {
        btn.classList.add('quiz-option-dodge');
        btn.setAttribute('aria-disabled', 'true');
      }

      const spanWrap = document.createElement('span');
      spanWrap.className = 'gNq10q_choiceText';

      const letterBadge = document.createElement('span');
      letterBadge.className = 'gNq10q_choiceLetter';
      letterBadge.textContent = LETTERS[choiceIdx];

      const labelSpan = document.createElement('span');
      labelSpan.textContent = choiceText;

      const sealSpan = document.createElement('span');
      sealSpan.className = 'gNq10q_answerSeal';

      spanWrap.appendChild(letterBadge);
      spanWrap.appendChild(labelSpan);
      spanWrap.appendChild(sealSpan);
      btn.appendChild(spanWrap);

      if (isDodgeOption) {
        const triggerDodge = (ev) => {
          if (quizSolved) return;
          ev.preventDefault();
          dodgeSteps[choiceIdx] = (dodgeSteps[choiceIdx] + 1) % DODGE_OFFSETS.length;
          const [dx, dy, rot] = DODGE_OFFSETS[dodgeSteps[choiceIdx]];
          btn.style.setProperty('--dodge-x', dx);
          btn.style.setProperty('--dodge-y', dy);
          btn.style.setProperty('--dodge-rot', rot);
          btn.classList.add('quiz-dodged');
          btn.classList.remove('gNq10q_wrong');
          void btn.offsetHeight;
          btn.classList.add('gNq10q_wrong');
          playTone(260, 0.14, 'sine', 0.08);
          if (quizFeedbackText) {
            quizFeedbackText.classList.add('quiz-dodge-note');
            quizFeedbackText.textContent = `Nice try! Only ${q.choices[2]} can be selected 💕`;
          }
        };
        btn.addEventListener('pointerenter', triggerDodge);
        btn.addEventListener('click', triggerDodge);
      } else {
        btn.addEventListener('click', () => handleQuizChoice(btn, choiceIdx, q));
      }

      quizChoicesEl.appendChild(btn);
    });
  }

  function handleQuizChoice(btn, choiceIdx, q) {
    if (quizSolved) return;

    let isCorrect = false;
    if (q.answerRule === 'any') {
      isCorrect = true;
    } else if (q.answerRule === 'only_c_dodge' || q.answerRule === 'c') {
      isCorrect = choiceIdx === 2;
    } else if (q.answerRule === 'd') {
      isCorrect = choiceIdx === 3;
    }

    if (!isCorrect) {
      btn.classList.remove('gNq10q_wrong');
      void btn.offsetHeight;
      btn.classList.add('gNq10q_wrong');
      playTone(230, 0.18, 'sine', 0.09);
      if (quizFeedbackEl) quizFeedbackEl.setAttribute('data-feedback', 'wrong');
      if (quizFeedbackText) {
        quizFeedbackText.classList.remove('quiz-dodge-note');
        quizFeedbackText.textContent = 'Close, Buri! Try another option ✨';
      }
      return;
    }

    quizSolved = true;
    btn.setAttribute('data-selected', 'true');
    btn.setAttribute('data-correct', 'true');

    const seal = btn.querySelector('.gNq10q_answerSeal');
    if (seal) {
      seal.setAttribute('data-revealed', 'true');
      seal.innerHTML = '<span class="gNq10q_check" aria-hidden="true">✓</span>';
    }

    Array.from(quizChoicesEl.querySelectorAll('button')).forEach((b) => {
      b.disabled = true;
    });

    if (quizFeedbackEl) quizFeedbackEl.setAttribute('data-feedback', 'correct');
    if (quizFeedbackText) {
      quizFeedbackText.classList.remove('quiz-dodge-note');
      const praiseList = [
        '🎉 Spot on! Every moment with you deserves a celebration!',
        '🎉 Always our Asmaner Chand! 💕',
        '🎉 Forever and always Tushar Shihab! 💖',
        '🎉 Pure natural radiance, inside and out! ✨',
        '🎉 Every single wish and more for you, Buri! 🎂',
      ];
      quizFeedbackText.textContent = praiseList[currentQuizIndex] || '🎉 Correct! Party time!';
    }
    if (quizSuccessRing) quizSuccessRing.hidden = false;
    if (quizSparkles) quizSparkles.hidden = false;

    playPartyPopperSound();
    launchPartyPoppers();

    if (quizNextWrap) quizNextWrap.hidden = true;
    clearQuizAutoTimer();
    quizAutoTimer = window.setTimeout(() => {
      quizAutoTimer = null;
      playChimeSound();
      if (currentQuizIndex < STORY.quizzes.length - 1) {
        renderQuiz(currentQuizIndex + 1);
      } else {
        showScene(9);
      }
    }, 1550);
  }

  if (btnQuizNext) {
    btnQuizNext.addEventListener('click', () => {
      clearQuizAutoTimer();
      playChimeSound();
      if (currentQuizIndex < STORY.quizzes.length - 1) {
        renderQuiz(currentQuizIndex + 1);
      } else {
        showScene(9);
      }
    });
  }

  // SCENE 10: DEDICATED SCRATCH CARD VIEW (index 9)
  const scratchCard = document.getElementById('scratch-card');
  const scratchCanvas = document.getElementById('scratch-canvas');
  const btnRevealScratch = document.getElementById('btn-reveal-scratch');
  const scratchHint = document.getElementById('scratch-hint');
  const btnScratchContinue = document.getElementById('btn-scratch-continue');

  let scratchRevealed = false;
  let isScratching = false;

  function revealScratchCard() {
    if (scratchRevealed) return;
    scratchRevealed = true;
    if (scratchCanvas) {
      scratchCanvas.style.transition = 'opacity 0.55s ease';
      scratchCanvas.style.opacity = '0';
      scratchCanvas.style.pointerEvents = 'none';
    }
    if (scratchCard) scratchCard.classList.add('WAxGxq_scratchCardRevealed');
    if (btnRevealScratch) btnRevealScratch.hidden = true;
    if (btnScratchContinue) btnScratchContinue.hidden = false;
    if (scratchHint) {
      scratchHint.textContent = `Unlocked! A timeless promise from ${STORY.senderName} 💕`;
    }
    playPartyPopperSound();
    launchPartyPoppers();
  }

  function initScratchCanvas() {
    if (!scratchCanvas || !scratchCard || scratchRevealed) return;
    const rect = scratchCard.getBoundingClientRect();
    const w = Math.max(260, Math.round(rect.width));
    const h = Math.max(200, Math.round(rect.height));
    scratchCanvas.width = w;
    scratchCanvas.height = h;
    scratchCanvas.style.opacity = '1';
    scratchCanvas.style.pointerEvents = 'auto';

    const ctx = scratchCanvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#e9b7c8');
    grad.addColorStop(0.5, '#f2d399');
    grad.addColorStop(1, '#d89fb4');
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 40; i += 1) {
      ctx.beginPath();
      ctx.arc((i * 53) % w, (i * 37) % h, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#553640';
    ctx.font = '700 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Scratch here for a secret note ✨', w / 2, h / 2);
  }

  function scratchAt(clientX, clientY) {
    if (!scratchCanvas || scratchRevealed) return;
    const ctx = scratchCanvas.getContext('2d');
    if (!ctx) return;
    const rect = scratchCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * scratchCanvas.width;
    const y = ((clientY - rect.top) / rect.height) * scratchCanvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
    let cleared = 0;
    const stride = 32;
    let total = 0;
    for (let i = 3; i < imgData.length; i += 4 * stride) {
      total += 1;
      if (imgData[i] < 128) cleared += 1;
    }
    if (total > 0 && cleared / total > 0.42) {
      revealScratchCard();
    }
  }

  if (scratchCanvas) {
    scratchCanvas.addEventListener('pointerdown', (e) => {
      isScratching = true;
      scratchAt(e.clientX, e.clientY);
    });
    window.addEventListener('pointermove', (e) => {
      if (isScratching) scratchAt(e.clientX, e.clientY);
    });
    window.addEventListener('pointerup', () => {
      isScratching = false;
    });
  }

  if (btnRevealScratch) {
    btnRevealScratch.addEventListener('click', revealScratchCard);
  }

  if (btnScratchContinue) {
    btnScratchContinue.addEventListener('click', () => {
      playPartyPopperSound();
      showScene(10);
      launchPartyPoppers();
    });
  }

  // SCENE 11: FINALE REPLAY (index 10)
  const btnReplayStory = document.getElementById('btn-replay-story');

  function resetAndReplayStory() {
    clearArrivalTimers();
    clearQuizAutoTimer();

    // Reset Gift
    if (giftReveal) giftReveal.setAttribute('data-gift-reveal', 'ready');
    if (btnUnwrapGift) btnUnwrapGift.disabled = false;
    if (giftStatus) giftStatus.textContent = '';

    // Reset Bow & Arrow Arrival
    arrowFired = false;
    pointerStartY = null;
    currentDrawY = 0;
    if (arrivalStage) {
      arrivalStage.setAttribute('data-phase', 'ready');
      arrivalStage.style.setProperty('--draw-y', '0px');
      arrivalStage.style.setProperty('--draw-ratio', '0');
    }
    if (btnBowShoot) btnBowShoot.disabled = false;
    if (loadedArrow) {
      loadedArrow.style.transform = '';
      loadedArrow.style.removeProperty('--from-x');
      loadedArrow.style.removeProperty('--from-y');
      loadedArrow.style.removeProperty('--to-x');
      loadedArrow.style.removeProperty('--to-y');
      loadedArrow.classList.remove('_2gkThW_flyingArrow');
      loadedArrow.classList.add('_2gkThW_loadedArrow');
    }
    if (arrivalBowStage) arrivalBowStage.hidden = false;
    if (arrivalRevealed) arrivalRevealed.hidden = true;
    if (arrivalCakeName) arrivalCakeName.hidden = true;
    if (arrivalImpactRing) arrivalImpactRing.hidden = true;
    if (arrivalBurst) arrivalBurst.hidden = true;

    // Reset Candles
    blownCandles = 0;
    candleButtons.forEach((b) => {
      b.classList.remove('tyKLZW_candleOut');
      b.disabled = false;
    });
    if (btnBlowAllCandles) btnBlowAllCandles.hidden = false;
    if (btnCandlesContinue) btnCandlesContinue.hidden = true;
    if (candlesInstruction) {
      candlesInstruction.textContent = 'Tap each glowing candle to blow it out and send your birthday wish skyward.';
    }

    // Reset Balloons
    poppedCount = 0;
    balloonButtons.forEach((b) => {
      b.setAttribute('data-popped', 'false');
      b.disabled = false;
      const burst = b.querySelector('.vUO_tq_burst');
      const seal = b.querySelector('.vUO_tq_foundSeal');
      if (burst) burst.hidden = true;
      if (seal) seal.hidden = true;
    });
    balloonReasons.forEach((card) => {
      card.hidden = true;
    });
    if (balloonsComplete) balloonsComplete.hidden = true;

    // Reset Cake Cut
    if (cakeCutMoment) cakeCutMoment.setAttribute('data-cake-cut', 'ready');
    if (btnCutCake) {
      btnCutCake.disabled = false;
      btnCutCake.setAttribute('data-ready-continue', 'false');
      btnCutCake.setAttribute('aria-label', 'Cut the birthday cake');
    }
    if (cakeCutBtnLabel) cakeCutBtnLabel.textContent = 'Tap to cut the cake';
    if (cakeCutStatus) cakeCutStatus.textContent = '';

    // Reset Letter
    if (letterReveal) letterReveal.setAttribute('data-phase', 'closed');
    if (btnOpenEnvelope) btnOpenEnvelope.disabled = false;
    if (letterHint) letterHint.hidden = false;
    if (btnLetterContinue) btnLetterContinue.hidden = true;

    // Reset Memory Lane, Quiz & Scratch
    updateMemoryLane(0, 'next');
    renderQuiz(0);
    scratchRevealed = false;
    if (scratchCard) scratchCard.classList.remove('WAxGxq_scratchCardRevealed');
    if (btnRevealScratch) btnRevealScratch.hidden = false;
    if (btnScratchContinue) btnScratchContinue.hidden = true;
    if (scratchHint) {
      scratchHint.textContent = `Rub the golden card above with your finger or mouse to uncover ${STORY.senderName}’s note.`;
    }

    showScene(0);
  }

  if (btnReplayStory) {
    btnReplayStory.addEventListener('click', resetAndReplayStory);
  }

  // Initial render setup
  renderQuiz(0);
  showScene(0);
})();
