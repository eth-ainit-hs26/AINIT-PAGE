/* Click-step scene engine for the Pokemon battle, arcade cut.

   Three scenes, the game only: the title, the tutorial (how to play) and
   the battle. Each scene file at js/scenes/<key>.js registers
     window.scenes.<key> = function(root) { return { onEnter?, onLeave?, onNextKey?, onPrevKey? }; };
   onNextKey / onPrevKey return true to consume the keystroke (advance an
   internal step inside the scene), false to let the driver advance the scene.
   Hash routing #scene=N; &instant disables the fade; 'm' toggles music. */
(function () {
  /* Each entry has an i18n key (titleKey) for the visible title; the literal
     `title` is the fallback. `music` is a key of js/music.js TRACKS. */
  const SCENES = [
    { key: 'scene0',         titleKey: 'scene.title',    title: 'POKEMON',                     music: 'title'    },
    { key: 'sceneHowToPlay', titleKey: 'scene.tutorial', title: 'Tutorial, how to play',       music: 'tutorial' },
    { key: 'scene1',         titleKey: 'scene.battle',   title: 'A wild CHARMANDER appeared!', music: 'boss'     },
  ];
  function titleAt(idx) {
    const s = SCENES[idx];
    if (!s) return '';
    return (window.I18N ? window.I18N.t(s.titleKey) : s.title);
  }

  const sceneNodes = [];
  const sceneState = [];
  let current = -1;

  function readHashScene() {
    const m = (window.location.hash || '').match(/[#&?]scene=(\d+)/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n >= 0 && n < SCENES.length ? n : null;
  }

  function syncHash(idx) {
    const cur = window.location.hash || '';
    const m = cur.match(/[#&?]scene=(\d+)/);
    let next;
    if (m) {
      next = cur.replace(/([#&?])scene=\d+/, `$1scene=${idx}`);
    } else if (cur.length > 1) {
      next = cur + `&scene=${idx}`;
    } else {
      next = `#scene=${idx}`;
    }
    if (next !== cur) history.replaceState(null, '', next);
  }

  function updateDots(idx) {
    document.querySelectorAll('.dot-pager .dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  }
  function updateButtons(idx) {
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    if (prev) prev.disabled = idx <= 0;
    if (next) next.disabled = idx >= SCENES.length - 1;
  }
  function updateTitle(idx) {
    const el = document.getElementById('scene-title');
    if (el) el.textContent = titleAt(idx);
  }

  function goTo(idx) {
    if (idx < 0 || idx >= SCENES.length) return;
    if (idx === current) {
      syncHash(idx);
      return;
    }

    if (current >= 0) {
      const old = sceneNodes[current];
      if (old) old.classList.remove('active');
      const oldState = sceneState[current];
      if (oldState && typeof oldState.onLeave === 'function') {
        try { oldState.onLeave(); } catch (e) { console.error(e); }
      }
    }

    const stage = document.getElementById('stage');
    if (!sceneNodes[idx]) {
      const node = document.createElement('div');
      node.className = 'scene';
      node.dataset.scene = String(idx);
      stage.appendChild(node);
      sceneNodes[idx] = node;
      const builder = window.scenes && window.scenes[SCENES[idx].key];
      if (builder) {
        try {
          sceneState[idx] = builder(node) || {};
        } catch (e) {
          console.error('Scene builder failed:', e);
          node.innerHTML = `<p style="opacity:0.5">Scene ${idx} failed to build: ${e && e.message}</p>`;
          sceneState[idx] = {};
        }
      } else {
        node.innerHTML = `<p style="opacity:0.5">Scene ${idx} not yet implemented.</p>`;
        sceneState[idx] = {};
      }
    } else {
      const st = sceneState[idx];
      if (st && typeof st.onEnter === 'function') {
        try { st.onEnter(); } catch (e) { console.error(e); }
      }
    }

    current = idx;
    /* Cross-fade the soundtrack to this scene's mood (a no-op until the
       MUSIC button has started the AudioContext). */
    if (window.Music && SCENES[idx].music) {
      try { window.Music.setTrack(SCENES[idx].music); } catch (e) {}
    }
    const instant = /[#&?]instant\b/.test(window.location.hash);
    if (instant) {
      sceneNodes[idx].style.transition = 'none';
      sceneNodes[idx].classList.add('active');
    } else {
      setTimeout(() => sceneNodes[idx].classList.add('active'), 20);
    }
    updateDots(idx);
    updateButtons(idx);
    updateTitle(idx);
    syncHash(idx);
    playSceneTransition(SCENES[idx].key);
    window.dispatchEvent(new CustomEvent('scene-change', { detail: { idx: idx, key: SCENES[idx].key } }));
  }

  /* Gen-1-style rotating-hex wipe on entering the battle. The overlay is
     pointer-events: none, so the scene stays interactive during the ~700ms
     reveal. prefers-reduced-motion skips it. */
  const TRANSITION_SCENES = ['scene1'];
  function playSceneTransition(sceneKey) {
    if (TRANSITION_SCENES.indexOf(sceneKey) < 0) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const overlay = document.createElement('div');
    overlay.className = 'scene-transition';
    document.body.appendChild(overlay);
    overlay.addEventListener('animationend', () => {
      try { overlay.remove(); } catch (_e) {}
    }, { once: true });
  }

  function init() {
    function cursorBlip() { if (window.SFX) window.SFX.play('cursor'); }

    const pager = document.getElementById('dot-pager');
    if (pager) {
      for (let i = 0; i < SCENES.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `Go to scene ${i + 1}`);
        dot.addEventListener('click', () => { cursorBlip(); goTo(i); });
        pager.appendChild(dot);
      }
    }

    /* Delegated cursor-blip for every scene control button (.poke-btn). */
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('poke-btn') && !t.disabled) {
        cursorBlip();
      }
    });

    /* Tappable PREV / NEXT step the scene first (same as the arrow keys),
       so a touch screen can walk the six steps of the tutorial. */
    const prev = document.getElementById('prev-btn');
    const next = document.getElementById('next-btn');
    if (prev) prev.addEventListener('click', () => {
      cursorBlip();
      const st = sceneState[current];
      const handled = st && typeof st.onPrevKey === 'function' && st.onPrevKey();
      if (!handled) goTo(current - 1);
    });
    if (next) next.addEventListener('click', () => {
      cursorBlip();
      const st = sceneState[current];
      const handled = st && typeof st.onNextKey === 'function' && st.onNextKey();
      if (!handled) goTo(current + 1);
    });

    window.addEventListener('keydown', (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName || '')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const st = sceneState[current];
      if (e.key === 'ArrowRight') {
        cursorBlip();
        const handled = st && typeof st.onNextKey === 'function' && st.onNextKey();
        if (!handled) goTo(current + 1);
      } else if (e.key === 'ArrowLeft') {
        cursorBlip();
        const handled = st && typeof st.onPrevKey === 'function' && st.onPrevKey();
        if (!handled) goTo(current - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const musicBtn = document.getElementById('music-toggle');
        if (musicBtn) musicBtn.click();
      }
    });

    window.addEventListener('hashchange', () => {
      const n = readHashScene();
      if (n != null) goTo(n);
    });

    const initialScene = readHashScene();
    goTo(initialScene != null ? initialScene : 0);
  }

  if (!window.scenes) window.scenes = {};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PokeViz = {
    goTo, getCurrentScene: () => current,
  };
})();
