/* Click-step scene pager for Old Bessie (Repair or Replace), arcade cut.
 *
 *   Three scenes, the game only: the title, how it works, and the game.
 *   One builder each at js/scenes/sceneN.js registering:
 *     window.scenes.sceneN = function (root) {
 *       return { onEnter?, onLeave?, onNextKey?, onPrevKey? };
 *     };
 *   onNextKey / onPrevKey return true to CONSUME the keystroke (advance an
 *   internal step inside the scene), false to let the driver change scene.
 *
 *   Features: dot pager + PREV / NEXT (they step a scene first, like the
 *   arrow keys), hash routing #scene=N, 'm' for music. QA flags for headless
 *   checks: &instant (no fade), &run (auto-click a scene's [data-run-primary]
 *   once), &autostep=K (fire onNextKey K times after build).
 *
 *   Exposes window.VanViz { goTo, getCurrentScene, sceneTitles }.
 */
(function () {
  /* key matches window.scenes.<key>; music keys match js/music.js TRACKS. */
  const SCENES = [
    { key: 'scene0', title: 'OLD BESSIE',        music: 'title'    },
    { key: 'scene1', title: 'How it works',      music: 'tutorial' },
    { key: 'scene2', title: 'You run the fleet', music: 'boss'     },
  ];

  function titleAt(idx) {
    const s = SCENES[idx];
    return s ? s.title : '';
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
  function hasRunFlag() { return /[#&?]run\b/.test(window.location.hash || ''); }

  /* &step / &autostep are one-shot QA affordances: scrub them when paging
     away from a shown scene so they do not leak into the next builder. */
  function stripStepParams() {
    const cur = window.location.hash || '';
    if (cur.length < 2) return;
    const kept = cur.slice(1).split('&')
      .filter((tok) => !/^(autostep|step)(=|$)/.test(tok));
    const next = kept.length ? '#' + kept.join('&') : '#';
    if (next !== cur) history.replaceState(null, '', next);
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

  /* Click the scene's primary button once, for &run headless capture. */
  function maybeAutoRun(idx) {
    if (!hasRunFlag()) return;
    const node = sceneNodes[idx];
    if (!node) return;
    setTimeout(() => {
      const btn = node.querySelector('[data-run-primary]');
      if (btn && !btn.disabled) { try { btn.click(); } catch (_e) {} }
    }, 220);
  }

  /* &autostep=K: fire the scene's onNextKey() K times after build. */
  function maybeAutoStep(idx) {
    const m = (window.location.hash || '').match(/[#&?]autostep=(\d+)/);
    if (!m) return;
    const k = parseInt(m[1], 10);
    if (!Number.isFinite(k) || k <= 0) return;
    setTimeout(() => {
      const st = sceneState[idx];
      if (!st || typeof st.onNextKey !== 'function') return;
      let fired = 0;
      (function tick() {
        if (fired >= k) return;
        fired++;
        let consumed = false;
        try { consumed = st.onNextKey(); } catch (_e) { return; }
        if (consumed) setTimeout(tick, 140);
      })();
    }, 450);
  }

  function goTo(idx) {
    if (idx < 0 || idx >= SCENES.length) return;
    if (idx === current) { syncHash(idx); return; }

    if (current >= 0) stripStepParams();

    if (current >= 0) {
      const old = sceneNodes[current];
      if (old) old.classList.remove('active');
      const oldState = sceneState[current];
      if (oldState && typeof oldState.onLeave === 'function') {
        try { oldState.onLeave(); } catch (e) { console.error(e); }
      }
    }

    const stage = document.getElementById('stage');
    let freshlyBuilt = false;
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
          freshlyBuilt = true;
        } catch (e) {
          console.error('Scene builder failed:', e);
          node.innerHTML = `<p class="scene-error">Scene ${idx} failed to build: ${e && e.message}</p>`;
          sceneState[idx] = {};
        }
      } else {
        node.innerHTML = `<p class="scene-error">Scene ${idx} not yet implemented.</p>`;
        sceneState[idx] = {};
      }
    } else {
      const st = sceneState[idx];
      if (st && typeof st.onEnter === 'function') {
        try { st.onEnter(); } catch (e) { console.error(e); }
      }
    }

    /* Re-assert the engine's 'scene' class in case a builder overwrote
       root.className, which would stack scenes. */
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
    if (freshlyBuilt) { maybeAutoRun(idx); maybeAutoStep(idx); }
    window.dispatchEvent(new CustomEvent('scene-change', { detail: { idx, key: SCENES[idx].key } }));
  }

  function init() {
    if (!window.scenes) window.scenes = {};

    function cursorBlip() { if (window.SFX) window.SFX.play('cursor'); }

    /* Dot pager. */
    const pager = document.getElementById('dot-pager');
    if (pager) {
      for (let i = 0; i < SCENES.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Go to scene ' + (i + 1));
        dot.addEventListener('click', () => { cursorBlip(); goTo(i); });
        pager.appendChild(dot);
      }
    }

    /* Delegated cursor blip on scene control buttons. */
    document.addEventListener('click', (e) => {
      const t = e.target;
      if (t && t.classList && t.classList.contains('poke-btn') && !t.disabled) cursorBlip();
    });

    /* Tappable PREV / NEXT step the scene first (like the arrow keys), so a
       touch screen can walk the how-it-works steps. */
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

    /* Keyboard: arrows step / change scene, m toggles music. */
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
      if (n != null && n !== current) goTo(n);
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

  window.VanViz = {
    goTo,
    getCurrentScene: () => current,
    sceneTitles: SCENES.map((s) => s.title),
  };
})();
