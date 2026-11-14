/* ANYmal on a 7 x 7 grid: the playable part of rl-arcade's anymal-mdp page
   (its "Try the game" section), ported unchanged in its rules and numbers.

   ANYmal starts in the centre; two ghosts and one reward sit on random empty
   cells. Every step costs -1; reaching the reward gives +10 and a new reward
   spawns; a ghost on ANYmal's cell costs -100 and ends the game; the game
   also ends after MAX_ROUNDS steps. With probability MALFUNCTION a step goes
   in a random direction. A ghost stays put with probability 1 - p and moves
   otherwise, with extra weight on the directions towards ANYmal
   (p = GHOST_RANDOMNESS). The source page let the player set these three
   numbers with sliders; the arcade fixes them at the sliders' defaults.

   Controls: the on-screen arrow pad, w/a/s/d or the arrow keys (only while
   the game scene is on screen). window.AnymalGame exposes start / step /
   state for headless checks. */
(function () {
  const GRID = 7;
  const MAX_ROUNDS = 100;
  const MALFUNCTION = 0.08;
  const GHOST_RANDOMNESS = 0.6;

  const gridEl = document.getElementById('g_grid');
  const roundEl = document.getElementById('g_round');
  const maxEl = document.getElementById('g_max');
  const scoreEl = document.getElementById('g_score');
  const startBtn = document.getElementById('g_start');
  const logEl = document.getElementById('g_log');
  const endEl = document.getElementById('g_end');
  const endReasonEl = document.getElementById('g_endReason');
  const finalEl = document.getElementById('g_final');
  const againBtn = document.getElementById('g_again');
  if (!gridEl) return;

  let state = null;
  let running = false;

  function randInt(n) { return Math.floor(Math.random() * n); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function buildGrid() {
    gridEl.innerHTML = '';
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        const cell = document.createElement('div');
        cell.className = 'am-cell';
        cell.dataset.r = r; cell.dataset.c = c;
        gridEl.appendChild(cell);
      }
    }
  }
  function cellAt(r, c) { return gridEl.querySelector('.am-cell[data-r="' + r + '"][data-c="' + c + '"]'); }

  function placeEmpty(occupied) {
    let r, c, tries = 0;
    do { r = randInt(GRID); c = randInt(GRID); tries++; if (tries > 500) break; }
    while (occupied.some(o => o.r === r && o.c === c));
    return { r, c };
  }

  function newState() {
    buildGrid();
    const anymal = { r: Math.floor(GRID / 2), c: Math.floor(GRID / 2) };
    const g1 = placeEmpty([anymal]);
    const g2 = placeEmpty([anymal, g1]);
    const reward = placeEmpty([anymal, g1, g2]);
    state = { anymal, ghosts: [g1, g2], reward, round: 0, score: 0, over: null };
    maxEl.textContent = MAX_ROUNDS;
    endEl.hidden = true;
    render();
  }

  function render() {
    gridEl.querySelectorAll('.am-cell').forEach(el => { el.className = 'am-cell'; el.textContent = ''; });
    const rc = cellAt(state.reward.r, state.reward.c);
    rc.classList.add('reward'); rc.textContent = '★';
    state.ghosts.forEach(g => {
      const gc = cellAt(g.r, g.c);
      gc.classList.add('ghost'); gc.textContent = '👻';
    });
    const a = cellAt(state.anymal.r, state.anymal.c);
    a.classList.add('anymal');
    const img = document.createElement('img');
    img.src = 'img/anymal.jpg';
    img.alt = 'ANYmal';
    img.className = 'am-cell-img';
    a.appendChild(img);
    roundEl.textContent = state.round;
    scoreEl.textContent = state.score;
  }

  function dirDelta(dir) {
    switch (dir) {
      case 'up': return { dr: -1, dc: 0 };
      case 'down': return { dr: 1, dc: 0 };
      case 'left': return { dr: 0, dc: -1 };
      case 'right': return { dr: 0, dc: 1 };
    }
    return { dr: 0, dc: 0 };
  }

  function moveGhost(g) {
    const p = GHOST_RANDOMNESS;
    const towards = { dr: state.anymal.r - g.r, dc: state.anymal.c - g.c };
    const prefer = [];
    if (Math.abs(towards.dr) > Math.abs(towards.dc)) {
      prefer.push(towards.dr < 0 ? 'up' : 'down');
      if (towards.dc !== 0) prefer.push(towards.dc < 0 ? 'left' : 'right');
    } else {
      if (towards.dc !== 0) prefer.push(towards.dc < 0 ? 'left' : 'right');
      if (towards.dr !== 0) prefer.push(towards.dr < 0 ? 'up' : 'down');
    }
    const choices = ['stay', 'up', 'down', 'left', 'right'];
    const weights = choices.map(ch => {
      if (ch === 'stay') return 1 - p;
      let w = p / 4;
      if (prefer.includes(ch)) w += 0.25 * p;
      return w;
    });
    const cum = []; weights.reduce((acc, w, i) => { cum[i] = acc + w; return cum[i]; }, 0);
    const r = Math.random() * cum[cum.length - 1];
    let pick = 0; while (r > cum[pick]) pick++;
    const d = dirDelta(choices[pick]);
    return { r: clamp(g.r + d.dr, 0, GRID - 1), c: clamp(g.c + d.dc, 0, GRID - 1) };
  }

  function step(dir) {
    if (!state || !running) return;
    if (state.round >= MAX_ROUNDS) { endGame('maxRounds'); return; }
    state.round += 1;
    state.score -= 1;

    let move = dir;
    if (Math.random() < MALFUNCTION) {
      move = ['up', 'left', 'down', 'right'][randInt(4)];
      log('Malfunction! Moved ' + move + '.');
    } else {
      log('');
    }

    const d = dirDelta(move);
    state.anymal.r = clamp(state.anymal.r + d.dr, 0, GRID - 1);
    state.anymal.c = clamp(state.anymal.c + d.dc, 0, GRID - 1);

    if (state.anymal.r === state.reward.r && state.anymal.c === state.reward.c) {
      state.score += 10;
      log('★ Reward collected (+10).');
      state.reward = placeEmpty([state.anymal, state.ghosts[0], state.ghosts[1]]);
    }

    state.ghosts = state.ghosts.map(moveGhost);
    render();

    for (const g of state.ghosts) {
      if (g.r === state.anymal.r && g.c === state.anymal.c) {
        state.score -= 100;
        render();
        endGame('collision');
        return;
      }
    }

    if (state.round >= MAX_ROUNDS) endGame('maxRounds');
  }

  function endGame(reason) {
    running = false;
    state.over = reason;
    const tail = reason === 'collision' ? 'Ghost collision.' : 'Max rounds reached.';
    log('Game over: ' + tail.toLowerCase() + ' Final score ' + state.score + '.');
    endReasonEl.textContent = tail;
    finalEl.textContent = state.score;
    endEl.hidden = false;
  }

  function log(t) { logEl.textContent = t; }

  function start() {
    newState();
    running = true;
    log('New game started.');
  }

  /* Keys drive ANYmal only while the game scene is the active one. */
  const keyMap = { w: 'up', a: 'left', s: 'down', d: 'right', arrowup: 'up', arrowleft: 'left', arrowdown: 'down', arrowright: 'right' };
  function gameOnScreen() {
    const sec = gridEl.closest('.scene');
    return !!(sec && sec.classList.contains('active'));
  }
  window.addEventListener('keydown', (ev) => {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (!gameOnScreen()) return;
    const k = (typeof ev.key === 'string') ? ev.key.toLowerCase() : ev.key;
    const dir = keyMap[k];
    if (dir) { ev.preventDefault(); step(dir); }
  });

  document.querySelectorAll('.am-dpad button[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => step(btn.dataset.dir));
  });
  startBtn.addEventListener('click', start);
  againBtn.addEventListener('click', start);

  window.AnymalGame = {
    start,
    step,
    isRunning: () => running,
    state: () => state,
    GRID, MAX_ROUNDS, MALFUNCTION, GHOST_RANDOMNESS,
  };

  newState();
  running = true;
})();
