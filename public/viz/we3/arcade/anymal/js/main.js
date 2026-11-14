/* Scene pager of the ANYmal page: three scenes written in index.html
   (title, how to play, the game), one shown at a time.

   Hash routing #scene=N; &instant disables the fade. PREV / NEXT, the dots
   and the buttons with data-go="N" change scene. The left and right arrow
   keys change scene on the title and the how-to-play scene; on the game
   scene they drive ANYmal (js/game.js). */
(function () {
  const scenes = Array.from(document.querySelectorAll('#stage > .scene'));
  let current = -1;

  function readHashScene() {
    const m = (window.location.hash || '').match(/[#&?]scene=(\d+)/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n >= 0 && n < scenes.length ? n : null;
  }

  function syncHash(idx) {
    const cur = window.location.hash || '';
    let next;
    if (/[#&?]scene=\d+/.test(cur)) next = cur.replace(/([#&?])scene=\d+/, '$1scene=' + idx);
    else if (cur.length > 1) next = cur + '&scene=' + idx;
    else next = '#scene=' + idx;
    if (next !== cur) history.replaceState(null, '', next);
  }

  function goTo(idx) {
    if (idx < 0 || idx >= scenes.length || idx === current) return;
    const instant = /[#&?]instant\b/.test(window.location.hash);
    scenes.forEach((s, i) => {
      if (i === idx) {
        if (instant) s.style.transition = 'none';
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
    current = idx;
    document.querySelectorAll('.dot-pager .dot').forEach((d, i) => d.classList.toggle('active', i === idx));
    document.getElementById('prev-btn').disabled = idx <= 0;
    document.getElementById('next-btn').disabled = idx >= scenes.length - 1;
    document.getElementById('scene-title').textContent = scenes[idx].dataset.title || '';
    syncHash(idx);
    window.scrollTo(0, 0);
  }

  const pager = document.getElementById('dot-pager');
  scenes.forEach((s, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to scene ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    pager.appendChild(dot);
  });
  document.getElementById('prev-btn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('next-btn').addEventListener('click', () => goTo(current + 1));
  document.querySelectorAll('[data-go]').forEach(b => {
    b.addEventListener('click', () => goTo(parseInt(b.dataset.go, 10)));
  });

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (scenes[current] && scenes[current].dataset.key === 'game') return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    else if (e.key === 'ArrowLeft') goTo(current - 1);
  });
  window.addEventListener('hashchange', () => {
    const n = readHashScene();
    if (n != null) goTo(n);
  });

  const first = readHashScene();
  goTo(first != null ? first : 0);

  window.AnymalViz = { goTo, getCurrentScene: () => current };
})();
