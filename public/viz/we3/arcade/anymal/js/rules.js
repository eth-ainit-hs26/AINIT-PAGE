/* rules.js: the rules of ANYmal, window.AnymalRules. No drawing: js/game.js draws the garden and plays the screens.

   The rule code of js/game.js at commit 17178db (the playable part of rl-arcade's anymal-mdp page), kept line for
   line. ANYmal starts in the centre; two ghosts and one treat (`reward` below) sit on random empty cells. Every step
   costs 1 point; reaching the treat gives 10 and a new one appears; a ghost on ANYmal's cell costs 100 and ends the
   game; the game also ends after MAX_ROUNDS steps. With probability MALFUNCTION a step goes in a random direction
   (a glitch). A ghost stays put with probability 1 - p and moves otherwise, with extra weight on the directions
   towards ANYmal (p = GHOST_RANDOMNESS).

   What changed, all of it plumbing (anymal/CLAUDE.md has the list; tools/same-rules.js replays 2,000 games through
   the old file and this one and finds the same boards after every step):
     1. Math.random() became rnd(): Math.random unless seed(n) set a seeded generator (mulberry32).
     2. The drawing (buildGrid, cellAt, the body of render, the HUD and end panel) moved to js/game.js; render() is
        an empty hook here.
     3. log(text) became note(kind, dir): the screen reads notes() after a step and shows its own words.
     4. endGame keeps `running = false; state.over = reason;` and notes the end; its panel moved to js/game.js.
     5. start() lost its log line; load(s) is new: the tutorial puts a scripted board in place.
   Loads in a browser and in node (tools/stars.js, tools/same-rules.js run it in a vm with a bare `window`). */
(function () {
  const GRID = 7;
  const MAX_ROUNDS = 100;
  const MALFUNCTION = 0.08;
  const GHOST_RANDOMNESS = 0.6;

  let state = null;
  let running = false;
  let rnd = Math.random;
  let notes = [];

  function randInt(n) { return Math.floor(rnd() * n); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function placeEmpty(occupied) {
    let r, c, tries = 0;
    do { r = randInt(GRID); c = randInt(GRID); tries++; if (tries > 500) break; }
    while (occupied.some(o => o.r === r && o.c === c));
    return { r, c };
  }

  function newState() {
    const anymal = { r: Math.floor(GRID / 2), c: Math.floor(GRID / 2) };
    const g1 = placeEmpty([anymal]);
    const g2 = placeEmpty([anymal, g1]);
    const reward = placeEmpty([anymal, g1, g2]);
    state = { anymal, ghosts: [g1, g2], reward, round: 0, score: 0, over: null };
    render();
  }

  function render() { /* the drawing lives in js/game.js */ }

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
    const r = rnd() * cum[cum.length - 1];
    let pick = 0; while (r > cum[pick]) pick++;
    const d = dirDelta(choices[pick]);
    return { r: clamp(g.r + d.dr, 0, GRID - 1), c: clamp(g.c + d.dc, 0, GRID - 1) };
  }

  function step(dir) {
    if (!state || !running) return;
    notes = [];
    if (state.round >= MAX_ROUNDS) { endGame('maxRounds'); return; }
    state.round += 1;
    state.score -= 1;

    let move = dir;
    if (rnd() < MALFUNCTION) {
      move = ['up', 'left', 'down', 'right'][randInt(4)];
      note('glitch', move);
    } else {
      note('');
    }

    const d = dirDelta(move);
    state.anymal.r = clamp(state.anymal.r + d.dr, 0, GRID - 1);
    state.anymal.c = clamp(state.anymal.c + d.dc, 0, GRID - 1);

    if (state.anymal.r === state.reward.r && state.anymal.c === state.reward.c) {
      state.score += 10;
      note('treat');
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
    note('end', reason);
  }

  function note(kind, what) { if (kind) notes.push({ kind: kind, what: what || null }); }

  function start() {
    newState();
    running = true;
  }

  /* The tutorial: a scripted board (a copy of s), and the game running on it. */
  function load(s) {
    state = JSON.parse(JSON.stringify(s));
    running = !state.over;
    notes = [];
  }

  /* The dice: mulberry32 for a whole number n (the same n gives the same draws), Math.random for null. */
  function seed(n) {
    if (n == null) { rnd = Math.random; return; }
    let a = n >>> 0;
    rnd = function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  window.AnymalRules = {
    start,
    step,
    load,
    seed,
    isRunning: () => running,
    state: () => state,
    notes: () => notes.slice(),
    GRID, MAX_ROUNDS, MALFUNCTION, GHOST_RANDOMNESS,
  };
})();
