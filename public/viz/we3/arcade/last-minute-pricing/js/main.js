/* Click-step scene engine for Last-Minute Pricing, arcade cut.
 *
 *   Three scenes, the game only: 0 title, 1 how to read the shelf (the
 *   tutorial), 2 the game (you run the cabin).
 *
 *   Each scene file at js/scenes/sceneN.js registers
 *     window.scenes.sceneN = function(root){ return { onEnter?, onLeave?, onNextKey?, onPrevKey? }; };
 *   onNextKey / onPrevKey return true to CONSUME the keystroke (advance a step
 *   inside the scene), false to let the driver advance the scene.
 *
 *   Hash routing #scene=N; &instant disables the fade; &run sets
 *   window.PRICING_AUTORUN so the game plays a fixed sequence with a fixed
 *   seed to its end (headless checks). 'm' toggles music.
 *
 *   Exposed as window.PriceViz (aliased to window.PokeViz). */
(function () {
  /* titleKey is looked up via I18N; `title` is the fallback. `music` is the
     soundtrack mood (a key of js/music.js TRACKS). */
  const SCENES = [
    { key: 'scene0', titleKey: 'scene0.title', title: 'Last-Minute Pricing',   music: 'title'    },
    { key: 'scene1', titleKey: 'scene1.title', title: 'How to read the shelf', music: 'tutorial' },
    { key: 'scene2', titleKey: 'scene2.title', title: 'You run the shelf',     music: 'battle'   },
  ];

  function titleAt(idx) {
    const s = SCENES[idx];
    if (!s) return '';
    return (window.I18N ? window.I18N.t(s.titleKey) : s.title);
  }

  const sceneNodes = [];
  const sceneState = [];
  let current = -1;

  /* &run passthrough: scenes read window.PRICING_AUTORUN to auto-trigger
     their primary button for headless capture. Never auto-runs otherwise. */
  window.PRICING_AUTORUN = /[#&?]run\b/.test(window.location.hash || '');

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
    if (m) next = cur.replace(/([#&?])scene=\d+/, `$1scene=${idx}`);
    else if (cur.length > 1) next = cur + `&scene=${idx}`;
    else next = `#scene=${idx}`;
    if (next !== cur) history.replaceState(null, '', next);
  }

  function updateDots(idx) {
    document.querySelectorAll('.dot-pager .dot').forEach((dot, i) =>
      dot.classList.toggle('active', i === idx));
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
    if (idx === current) { syncHash(idx); return; }

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
        try { sceneState[idx] = builder(node) || {}; }
        catch (e) {
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

    /* Some builders overwrite root.className; re-assert the engine's
       'scene' class so scenes do not stack. */
    if (sceneNodes[idx]) sceneNodes[idx].classList.add('scene');

    current = idx;
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
    window.dispatchEvent(new CustomEvent('scene-change', { detail: { idx: idx, key: SCENES[idx].key } }));
  }

  function cursorBlip() { if (window.SFX) window.SFX.play('cursor'); }

  function init() {
    /* Dot pager. */
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

    /* Delegated cursor-blip for scene control buttons (.poke-btn). */
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('poke-btn') && !t.disabled) cursorBlip();
    });

    /* Tappable PREV / NEXT step the scene first (same as the arrow keys),
       so a touch screen can walk the tutorial. */
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

    /* Keys: arrows (delegate to the scene), m for music. */
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

  window.PriceViz = {
    goTo, getCurrentScene: () => current, SCENES: SCENES,
  };
  window.PokeViz = window.PriceViz;
})();
