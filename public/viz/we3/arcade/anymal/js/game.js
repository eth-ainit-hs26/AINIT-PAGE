/* game.js: ANYMAL, the game (redesign of 2026-11-16, ../REDESIGN.md). Four screens on one page: the title, the
   tutorial (scripted, on the real game screen, with the coach of ../kit/kit.js), the game (a robot dog in a garden of
   7 x 7 tiles, 100 steps) and the end card. The rules are js/rules.js (the rule code of the old game.js, kept line for
   line): every number on screen comes from it, or from STARS (computed by tools/stars.js).

   URL flags, in the hash:
     #scene=0   the title (the default)
     #scene=1   the tutorial;  &step=N  opens it at step N, 1 to 6, the earlier scripted steps already played
     #scene=2   a game at once, without the tutorial
     &seed=N    the game's dice (AnymalRules.seed(N)); PLAY AGAIN replays the same dice
     &instant   no motion and no pauses (checks) */
(function () {
  "use strict";
  var R = window.AnymalRules, K = window.Kit, ART = window.AMArt;

  var N = R.GRID, STEPS = R.MAX_ROUNDS;
  var STARS = [-100, -40, 20];
  var BEST_KEY = "anymal.best";
  var TUT_KEY = "anymal.tutorial-done";
  var TUT_STEPS = 6;
  var DIRS = ["up", "left", "down", "right"];
  var KEYS = { up: "W", left: "A", down: "S", right: "D" };
  var DEFAULT_MSG = "Grab the treats, dodge the ghosts!";
  var TUT_MSG = "Practice steps: nothing here counts.";

  var INSTANT = K.flag("instant");
  var REDUCED = K.reduced();
  function D(ms) { return INSTANT ? 0 : (REDUCED ? Math.min(ms, 450) : ms); }
  function M(ms) { return INSTANT || REDUCED ? 0 : ms; }
  function num(n) { return (n < 0 ? "-" : "") + Math.abs(n).toLocaleString("en-US"); }
  function plural(n, one, many) { return num(n) + " " + (n === 1 ? one : many); }
  function sfx(n) { if (window.SFX) window.SFX.play(n); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function same(a, b) { return a.r === b.r && a.c === b.c; }
  function dist(a, b) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c); }

  /* ====== the page ====== */
  var stage = document.getElementById("stage");
  var tiles = "";
  for (var tr = 0; tr < N; tr++) for (var tc = 0; tc < N; tc++) tiles += "<i" + ((tr + tc) % 2 ? ' class="d"' : "") + "></i>";
  var FLOWERS = ["#FF8FB8", "#FFFFFF", "#B79CFF", "#FF8FB8", "#FFE36B", "#FFFFFF"];
  var flowers = "";
  FLOWERS.forEach(function (c, i) { flowers += '<div class="am-flower f' + i + '">' + ART.flower(c) + "</div>"; });

  stage.innerHTML =
    '<div class="am-field" aria-hidden="true">' +
      '<div class="am-sun"></div>' +
      '<div class="am-cloud c1">' + ART.cloud() + '</div><div class="am-cloud c2">' + ART.cloud() + '</div>' +
      '<div class="am-cloud c3">' + ART.cloud() + '</div>' +
      '<div class="am-hills">' + ART.hills() + '</div>' +
      '<div class="am-lawn"></div>' +
      '<div class="am-tree t1">' + ART.tree() + '</div><div class="am-tree t2">' + ART.tree() + '</div>' +
      '<div class="am-kennel">' + ART.kennel() + '</div>' +
      '<div class="am-bush b1">' + ART.bush() + '</div><div class="am-bush b2">' + ART.bush() + '</div>' +
      flowers +
      '<div class="am-title-cast">' +
        '<div class="am-cast-dog">' + ART.dog() + '</div>' +
        '<div class="am-cast-bone">' + ART.bone() + '</div>' +
        '<div class="am-cast-ghost c0">' + ART.ghost(0) + '</div>' +
        '<div class="am-cast-ghost c1">' + ART.ghost(1) + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="am-play">' +
      '<div class="am-boardwrap">' +
        '<div class="am-board" id="am-board" aria-label="The garden">' +
          '<div class="am-tiles">' + tiles + '</div>' +
          '<div class="am-sprites" id="am-sprites">' +
            '<div class="am-sp am-treat" id="am-treat"><div class="am-art">' + ART.bone() + '</div></div>' +
            '<div class="am-sp am-dog" id="am-dog"><div class="am-art"><div class="am-flip">' + ART.dog() + '</div></div></div>' +
            '<div class="am-sp am-ghost g0" id="am-g0"><i class="am-gshadow"></i><div class="am-art">' + ART.ghost(0) + '</div></div>' +
            '<div class="am-sp am-ghost g1" id="am-g1"><i class="am-gshadow"></i><div class="am-art">' + ART.ghost(1) + '</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="am-side">' +
        '<section class="am-hud" aria-label="Steps, points and treats">' +
          '<div class="am-pill am-steps" id="am-steps">' + ART.paw() +
            '<div class="am-pill-col"><span class="am-lab" id="am-steps-lab">STEPS</span>' +
            '<span class="am-num"><span id="am-steps-num">0</span> <span class="am-of">/ ' + STEPS + '</span></span>' +
            '<span class="am-bar"><i id="am-bar"></i></span></div></div>' +
          '<div class="am-pill am-treats" id="am-treats">' + ART.boneIcon() +
            '<div class="am-pill-col"><span class="am-lab">TREATS</span><span class="am-num" id="am-treats-num">0</span></div></div>' +
          '<div class="am-pill am-points" id="am-points">' + ART.star() +
            '<div class="am-pill-col"><span class="am-lab">POINTS</span><span class="am-num" id="am-points-num">0</span></div>' +
            '<span class="am-cost" id="am-cost">-1</span></div>' +
        '</section>' +
        '<section class="am-pad" id="am-pad" aria-label="Move ANYmal"><span class="am-hub" aria-hidden="true">' + ART.paw("#FFFFFF") + '</span></section>' +
        '<div class="am-msg" id="am-msg" aria-live="polite"></div>' +
      '</div>' +
    '</div>' +
    '<div class="am-title" id="am-title">' +
      '<h1 class="am-logo"><span>ANY</span>MAL</h1>' +
      '<div class="am-ribbon">TREAT HUNT</div>' +
      '<div class="am-tagline">Grab the treats, dodge the ghosts: you have ' + STEPS + ' steps!</div>' +
      '<div class="am-title-btns"><button type="button" class="k-btn k-btn-big am-go">▶ PLAY</button>' +
      '<button type="button" class="k-btn k-btn-white k-btn-big am-how">HOW TO PLAY</button></div>' +
      '<div class="am-title-best" hidden></div>' +
    '</div>';

  function $(id) { return document.getElementById(id); }
  var board = $("am-board"), sprites = $("am-sprites"), dogEl = $("am-dog"), treatEl = $("am-treat");
  var ghostEls = [$("am-g0"), $("am-g1")];
  var stepsLab = $("am-steps-lab"), stepsNum = $("am-steps-num"), bar = $("am-bar");
  var pointsPill = $("am-points"), pointsNum = $("am-points-num"), costEl = $("am-cost");
  var treatsPill = $("am-treats"), treatsNum = $("am-treats-num"), msgEl = $("am-msg"), padEl = $("am-pad");
  var titleEl = $("am-title"), goBtn = titleEl.querySelector(".am-go"), howBtn = titleEl.querySelector(".am-how");
  var bestEl = titleEl.querySelector(".am-title-best");

  var padBtns = {};
  DIRS.forEach(function (d) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "k-btn am-arrow am-" + d;
    b.setAttribute("data-dir", d);
    b.setAttribute("aria-label", "Move " + d);
    b.innerHTML = '<span class="am-ar">' + ART.arrow() + '</span><kbd aria-hidden="true">' + KEYS[d] + "</kbd>";
    b.addEventListener("click", function () { onMove(d); });
    padEl.appendChild(b);
    padBtns[d] = b;
  });

  /* ====== the state of a game on screen ====== */
  var mode = "title", gen = 0, busy = false, queued = null, treats = 0, glitches = 0, faceLeft = false;
  var practice = false, ready = false; /* the tutorial's board; a fresh game already behind the coach's last step */
  var endCard = null, coach = null, tutDir = null, stepWaiter = null, treatTok = 0, msgTimer = 0;

  function setMode(m) {
    mode = m;
    stage.setAttribute("data-mode", m);
    if (window.Music && window.Music.setTrack) {
      /* the end card: the win or loss jingle of js/sfx.js sounds alone first */
      try { window.Music.setTrack(m, m === "end" ? { gap: 1.4 } : undefined); } catch (e) { /* no music */ }
    }
  }
  if (INSTANT) stage.setAttribute("data-instant", "");

  /* ====== motion: every pause and effect can be cut short by a new game ====== */
  var waits = [], fx = [], timers = [];
  function wait(ms) {
    return new Promise(function (res) {
      var w = { res: res, t: setTimeout(function () { waits.splice(waits.indexOf(w), 1); res(); }, ms) };
      waits.push(w);
    });
  }
  function later(ms, fn) {
    var my = gen, t = setTimeout(function () { timers.splice(timers.indexOf(t), 1); if (my === gen) fn(); }, ms);
    timers.push(t);
  }
  function stopMotion() {
    waits.slice().forEach(function (w) { clearTimeout(w.t); w.res(); });
    waits = [];
    timers.forEach(clearTimeout);
    timers = [];
    fx.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    fx = [];
  }
  function drop(n) {
    if (n && n.parentNode) n.parentNode.removeChild(n);
    var i = fx.indexOf(n);
    if (i >= 0) fx.splice(i, 1);
  }

  /* where a tile is, in px inside the sprite layer */
  function cellPx(p) {
    var s = sprites.clientWidth / N;
    return { x: (p.c + 0.5) * s, y: (p.r + 0.5) * s, s: s };
  }
  function place(el, p, jump) {
    if (jump) el.style.transition = "none";
    el.style.setProperty("--r", p.r);
    el.style.setProperty("--c", p.c);
    if (jump) { void el.offsetWidth; el.style.transition = ""; }
  }
  function cls(el, name, ms) {
    if (!M(1)) return;
    el.classList.remove(name);
    void el.offsetWidth;
    el.classList.add(name);
    later(ms, function () { el.classList.remove(name); });
  }
  function tag(p, html, kind, ms) {
    var c = cellPx(p), t = document.createElement("div");
    t.className = "am-tag " + (kind || "") + (p.r === 0 ? " below" : "");
    t.innerHTML = html;
    t.style.top = (p.r === 0 ? c.y + c.s * 0.42 : c.y - c.s * 0.42) + "px";
    sprites.appendChild(t);
    var w = t.offsetWidth, W = sprites.clientWidth;
    t.style.left = Math.min(Math.max(c.x, w / 2), Math.max(w / 2, W - w / 2)) + "px";
    fx.push(t);
    if (ms) later(ms, function () { drop(t); });
    return t;
  }
  function pop(p, text, tone, dy) {
    var c = cellPx(p), n = K.pop(sprites, c.x, c.y - c.s * (dy == null ? 0.55 : dy), text, tone);
    fx.push(n);
    if (INSTANT) later(1, function () { drop(n); });
  }
  function burst(p) {
    var c = cellPx(p), b = document.createElement("div"), rays = "";
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, x = 50 + Math.cos(a) * 36, y = 50 + Math.sin(a) * 36;
      rays += i % 2 ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="#FFFFFF" stroke="#22314D" stroke-width="2"/>' :
        '<g transform="translate(' + (x - 8).toFixed(1) + " " + (y - 8).toFixed(1) + ') scale(0.4)">' + ART.sparkle("#FFC531").replace(/^<svg[^>]*>|<\/svg>$/g, "") + "</g>";
    }
    b.className = "am-burst";
    b.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="22" fill="none" stroke="#FFC531" stroke-width="5"/>' + rays + "</svg>";
    b.style.left = c.x + "px";
    b.style.top = c.y + "px";
    b.style.width = b.style.height = (c.s * 1.5) + "px";
    sprites.appendChild(b);
    fx.push(b);
    later(Math.max(M(600), 30), function () { drop(b); });
  }

  /* ====== the HUD and the garden ====== */
  var shown = 0;
  function showPoints(v) { shown = v; pointsNum.textContent = num(v); }
  function setSteps(n) {
    stepsLab.textContent = practice ? "PRACTICE" : "STEPS";
    stepsNum.textContent = num(n);
    bar.style.width = (100 * Math.min(n, STEPS) / STEPS) + "%";
  }
  function setTreats(n) { treatsNum.textContent = num(n); }
  function bump(el) { cls(el, "am-bump", 420); }
  function setMsg(text, hold) {
    msgEl.textContent = text;
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = 0;
    if (hold) {
      msgTimer = setTimeout(function () {
        msgTimer = 0;
        if (mode === "play") msgEl.textContent = DEFAULT_MSG;
        else if (mode === "tutorial") msgEl.textContent = TUT_MSG;
      }, hold);
    }
  }
  function look(s) {
    ghostEls.forEach(function (g, i) {
      var p = s.ghosts[i];
      g.style.setProperty("--px", 3.4 * Math.sign(s.anymal.c - p.c));
      g.style.setProperty("--py", 3 * Math.sign(s.anymal.r - p.r));
    });
  }
  function scared(s) {
    dogEl.classList.toggle("scared", !s.over && s.ghosts.some(function (g) { return dist(g, s.anymal) <= 1; }));
  }
  function renderAll() {
    var s = R.state();
    place(dogEl, s.anymal, true);
    place(treatEl, s.reward, true);
    ghostEls.forEach(function (g, i) { place(g, s.ghosts[i], true); });
    dogEl.classList.toggle("face-left", faceLeft);
    treatEl.classList.remove("gone", "pop");
    look(s);
    scared(s);
    setSteps(s.round);
    showPoints(s.score);
    setTreats(treats);
  }
  function setPad() {
    DIRS.forEach(function (d) {
      padBtns[d].disabled = !(mode === "play" || (mode === "tutorial" && tutDir === d && !busy));
    });
  }

  function resetBoard() {
    gen++;
    stopMotion();
    if (endCard) { endCard.close(); endCard = null; }
    busy = false;
    queued = null;
    treats = 0;
    glitches = 0;
    faceLeft = false;
    treatTok++;
    dogEl.className = "am-sp am-dog";
    ghostEls.forEach(function (g) { g.classList.remove("boo"); });
  }
  function pinnedSeed() {
    var p = K.param("seed");
    return p != null && /^\d+$/.test(p) ? Number(p) : null;
  }

  /* ====== one step ====== */
  function onMove(dir) {
    if (mode === "tutorial") { if (dir !== tutDir || busy) return; }
    else if (mode !== "play") return;
    if (busy) { queued = dir; return; }
    doStep(dir);
  }

  function doStep(dir) {
    if (!R.isRunning()) return;
    busy = true;
    setPad();
    var before = clone(R.state());
    R.step(dir);
    var after = clone(R.state()), ev = { dir: dir, glitch: null, treat: false, end: null };
    R.notes().forEach(function (n) {
      if (n.kind === "glitch" && n.what !== dir) ev.glitch = n.what;
      if (n.kind === "treat") ev.treat = true;
      if (n.kind === "end") ev.end = n.what;
    });
    if (ev.glitch) glitches += 1;
    if (ev.treat) treats += 1;
    var my = gen;
    playStep(before, after, ev, my).then(function () {
      if (my !== gen) return;
      busy = false;
      if (ev.end && mode === "play") { finish(ev.end); return; }
      setPad();
      if (stepWaiter) { var w = stepWaiter; stepWaiter = null; w(ev); }
      if (queued && mode === "play") { var q = queued; queued = null; doStep(q); }
    });
  }

  async function playStep(b, a, ev, my) {
    var move = ev.glitch || ev.dir, moved = !same(b.anymal, a.anymal), msg = null, hold = 2400;
    setSteps(a.round);
    showPoints(b.score - 1);
    cls(costEl, "go", 700);
    sfx("step");
    if (ev.glitch) {
      cls(dogEl, "glitch", 420);
      tag(b.anymal, ART.bolt() + "GLITCH!", "zap", Math.max(D(950), 1));
      sfx("glitch");
      await wait(D(300));
      if (my !== gen) return;
    }
    if (move === "left") faceLeft = true;
    else if (move === "right") faceLeft = false;
    dogEl.classList.toggle("face-left", faceLeft);
    if (moved) {
      place(dogEl, a.anymal);
      cls(dogEl, "hop", 240);
    } else {
      cls(dogEl, "bump-" + move, 240);
      sfx("bump");
    }
    a.ghosts.forEach(function (g, i) { place(ghostEls[i], g); });
    look(a);
    if (ev.glitch) msg = moved ? "Glitch! ANYmal slipped " + move + "." : "Glitch! ANYmal bumped into the fence.";
    else if (!moved) msg = "Bump! That's the fence.";
    await wait(D(230));
    if (my !== gen) return;
    if (ev.treat) {
      burst(a.anymal);
      pop(a.anymal, "+10", "gold");
      showPoints(b.score + 9);
      setTreats(treats);
      bump(treatsPill);
      sfx("treat");
      treatEl.classList.remove("pop");
      treatEl.classList.add("gone");
      var tok = ++treatTok;
      later(D(420), function () {
        if (tok !== treatTok) return;
        place(treatEl, R.state().reward, true);
        treatEl.classList.remove("gone");
        cls(treatEl, "pop", 500);
      });
      msg = "Yum! A treat: +10 points.";
    }
    if (ev.end === "collision") {
      await wait(D(140));
      if (my !== gen) return;
      var gi = a.ghosts.findIndex(function (g) { return same(g, a.anymal); });
      if (gi >= 0) ghostEls[gi].classList.add("boo");
      dogEl.classList.add("caught");
      dogEl.classList.remove("scared");
      tag(a.anymal, "CAUGHT! -100", "bad");
      showPoints(a.score);
      bump(pointsPill);
      sfx("boo");
      setMsg("Caught by a ghost! -100 points.");
      await wait(D(1100));
      return;
    }
    scared(a);
    if (ev.end === "maxRounds") {
      setMsg(STEPS + " steps done!");
      await wait(D(600));
      return;
    }
    if (msg) setMsg(msg, hold);
  }

  /* ====== the end of a game ====== */
  function finish(reason) {
    setMode("end");
    setPad();
    showEnd(reason);
  }
  function chipIcon(svg) { return '<span class="am-chip-ic">' + svg + "</span>"; }
  function showEnd(reason) {
    var s = R.state(), pts = s.score;
    var have = STARS.filter(function (t) { return pts >= t; }).length;
    var b = K.best(BEST_KEY, pts);
    sfx(reason === "collision" ? "loss" : "win");
    endCard = K.endScreen(stage, {
      title: reason === "collision" ? "CAUGHT BY A GHOST!" : STEPS + " STEPS DONE!",
      big: num(pts) + " POINTS",
      bigTone: pts < 0 ? "bad" : "good",
      line: reason === "collision" ? "A ghost caught ANYmal after " + plural(s.round, "step", "steps") + "." :
        "ANYmal grabbed " + plural(treats, "treat", "treats") + " in " + STEPS + " steps!",
      stars: { have: have, marks: STARS.map(num) },
      best: { text: "BEST: " + num(b.best) + " POINTS", isNew: b.isNew },
      chips: [
        chipIcon(ART.boneIcon()) + plural(treats, "treat", "treats"),
        chipIcon(ART.paw()) + plural(s.round, "step", "steps"),
        chipIcon(ART.bolt()) + plural(glitches, "glitch", "glitches")
      ],
      again: { label: "PLAY AGAIN", onClick: function () { startGame(); } },
      arcade: { label: "BACK TO THE ARCADE", href: "../index.html" }
    });
  }

  /* ====== the screens ====== */
  function closeCoach() {
    if (coach) { coach.close(); coach = null; }
    tutDir = null;
    stepWaiter = null;
  }
  function showTitle() {
    closeCoach();
    resetBoard();
    ready = false;
    setMode("title");
    var b = parseFloat(K.store.get(BEST_KEY));
    bestEl.hidden = !isFinite(b);
    if (isFinite(b)) bestEl.textContent = "BEST: " + num(b) + " POINTS";
    try { goBtn.focus({ preventScroll: true }); } catch (e) { /* nicety */ }
  }
  function freshGame() {
    resetBoard();
    practice = false;
    R.seed(pinnedSeed());
    R.start();
    renderAll();
  }
  function startGame() {
    closeCoach();
    if (!ready) freshGame();
    ready = false;
    setMode("play");
    setPad();
    setMsg(DEFAULT_MSG);
  }

  /* The tutorial: a scripted board, and for each step the first seed on which the rules give the face the script
     asks for (where ANYmal, the ghosts and the next treat end up), so the tutorial always shows the same things with
     the game's own rules. */
  var TUT_BOARD = { anymal: { r: 3, c: 3 }, ghosts: [{ r: 0, c: 1 }, { r: 6, c: 3 }], reward: { r: 3, c: 5 }, round: 0, score: 0, over: null };
  function at(p, r, c) { return p.r === r && p.c === c; }
  function noted(n, kind) { var f = n.filter(function (x) { return x.kind === kind; })[0]; return f ? (f.what || true) : null; }
  var SCRIPT = [
    { k: 2, dir: "right", ask: "Tap the right arrow to take a step.", look: "points", tell: "Each step costs 1 point.",
      want: function (s, n) { return !noted(n, "glitch") && at(s.anymal, 3, 4) && at(s.ghosts[0], 0, 1) && at(s.ghosts[1], 5, 3); } },
    { k: 3, dir: "right", ask: "Tap the right arrow again to grab the treat.", look: "points", tell: "Yum! A treat is worth 10 points.",
      want: function (s, n) {
        return !noted(n, "glitch") && noted(n, "treat") && at(s.anymal, 3, 5) && at(s.ghosts[0], 0, 2) && at(s.ghosts[1], 5, 4) &&
          s.reward.c <= 1 && s.reward.r >= 1 && s.reward.r <= 5;
      } },
    { k: 4, dir: "up", ask: "Now tap the up arrow.", look: "dog", tell: "Glitch! Sometimes ANYmal slips the wrong way.",
      want: function (s, n) { return noted(n, "glitch") === "down" && at(s.anymal, 4, 5) && at(s.ghosts[0], 1, 2) && at(s.ghosts[1], 4, 4); } },
    { k: 5, dir: "left", ask: "A ghost! Tap the left arrow to see what happens.", look: "points",
      tell: "Caught! A ghost costs 100 points and ends the game.",
      want: function (s, n) { return !noted(n, "glitch") && s.over === "collision" && at(s.anymal, 4, 4) && at(s.ghosts[1], 4, 4) && at(s.ghosts[0], 1, 2); } }
  ];
  function scriptSeed(st) {
    var snap = clone(R.state());
    for (var seed = 1; seed < 400000; seed++) {
      R.load(snap);
      R.seed(seed);
      R.step(st.dir);
      if (st.want(R.state(), R.notes())) { R.load(snap); return seed; }
    }
    R.load(snap);
    return 1;
  }

  async function runTutorial(first) {
    closeCoach();
    resetBoard();
    practice = true;
    ready = false;
    setMode("tutorial");
    R.load(TUT_BOARD);
    var s = Math.max(1, Math.min(TUT_STEPS, first || 1)), r, my = gen;
    SCRIPT.forEach(function (st) {
      if (st.k >= s) return;
      R.seed(scriptSeed(st));
      R.step(st.dir);
      if (noted(R.notes(), "glitch")) glitches += 1;
      if (noted(R.notes(), "treat")) treats += 1;
      var mv = noted(R.notes(), "glitch") || st.dir;
      if (mv === "left") faceLeft = true; else if (mv === "right") faceLeft = false;
    });
    renderAll();
    if (R.state().over === "collision") {
      dogEl.classList.add("caught");
      ghostEls[1].classList.add("boo");
    }
    setPad();
    setMsg(TUT_MSG);
    coach = K.coach({ root: stage, onSkip: finishTutorial, labels: { next: "NEXT", skip: "SKIP" } });
    if (s <= 1) {
      r = await coach.step({ target: dogEl, text: "Meet ANYMAL, your robot dog!", wait: "next", index: 1, count: TUT_STEPS, pad: 2 });
      if (r !== "next" || my !== gen) return;
    }
    for (var i = 0; i < SCRIPT.length; i++) {
      var st = SCRIPT[i];
      if (st.k < s) continue;
      R.seed(scriptSeed(st));
      tutDir = st.dir;
      setPad();
      var done = new Promise(function (res) { stepWaiter = res; });
      r = await coach.step({ target: padBtns[st.dir], text: st.ask, wait: "tap", index: st.k, count: TUT_STEPS });
      if (r !== "tap" || my !== gen) return;
      await done;
      if (my !== gen) return;
      tutDir = null;
      setPad();
      r = await coach.step({ target: st.look === "dog" ? dogEl : pointsPill, text: st.tell, wait: "next", index: st.k,
        count: TUT_STEPS, pointer: false, pad: st.look === "dog" ? 2 : 8 });
      if (r !== "next" || my !== gen) return;
    }
    /* the last step: a fresh game is already on the board, PLAY lets it go */
    freshGame();
    ready = true;
    my = gen;
    setPad();
    setMsg(DEFAULT_MSG);
    r = await coach.step({ target: $("am-steps"), text: "Collect as many treats as you can in " + STEPS + " steps!", wait: "next",
      next: "▶ PLAY", index: TUT_STEPS, count: TUT_STEPS, skip: false, pointer: false, pad: 8 });
    if (r !== "next" || my !== gen) return;
    finishTutorial();
  }
  function finishTutorial() {
    K.store.set(TUT_KEY, "1");
    startGame();
  }

  goBtn.addEventListener("click", function () {
    sfx("cursor");
    if (K.store.get(TUT_KEY)) startGame(); else runTutorial(1);
  });
  howBtn.addEventListener("click", function () { sfx("cursor"); runTutorial(1); });

  /* keys: the arrows and W, A, S, D move ANYmal; m presses the MUSIC button (the coach takes Enter and Escape) */
  var KEYMAP = { arrowup: "up", arrowdown: "down", arrowleft: "left", arrowright: "right", w: "up", a: "left", s: "down", d: "right" };
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && /input|textarea|select/i.test(t.tagName || "")) return;
    var k = typeof e.key === "string" ? e.key.toLowerCase() : "";
    if (k === "m") {
      var mb = document.getElementById("music-toggle");
      if (mb) { mb.click(); e.preventDefault(); }
      return;
    }
    var d = KEYMAP[k];
    if (!d) return;
    if (mode === "play") { e.preventDefault(); onMove(d); }
    else if (mode === "tutorial") {
      e.preventDefault();
      if (tutDir === d && !padBtns[d].disabled) padBtns[d].click();
    }
  });

  /* touch: a swipe on the garden moves ANYmal that way; a tap moves it one step towards the tapped tile */
  var swipe = null;
  board.addEventListener("pointerdown", function (e) {
    if (mode !== "play") return;
    swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  board.addEventListener("pointercancel", function () { swipe = null; });
  board.addEventListener("pointerup", function (e) {
    if (!swipe || e.pointerId !== swipe.id || mode !== "play") { swipe = null; return; }
    var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
    swipe = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 24) {
      onMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
      return;
    }
    var rc = sprites.getBoundingClientRect(), s = rc.width / N;
    var c = Math.floor((e.clientX - rc.left) / s), r = Math.floor((e.clientY - rc.top) / s), p = R.state().anymal;
    var tr = r - p.r, tc = c - p.c;
    if (!tr && !tc) return;
    onMove(Math.abs(tc) >= Math.abs(tr) ? (tc > 0 ? "right" : "left") : (tr > 0 ? "down" : "up"));
  });

  var scene = K.param("scene");
  if (scene === "1") runTutorial(parseInt(K.param("step"), 10) || 1);
  else if (scene === "2") startGame();
  else showTitle();

  window.AnymalGame = {
    mode: function () { return mode; },
    busy: function () { return busy; },
    steps: function () { return R.state() ? R.state().round : 0; },
    points: function () { return R.state() ? R.state().score : 0; },
    treats: function () { return treats; },
    glitches: function () { return glitches; },
    over: function () { return R.state() ? R.state().over : null; },
    dog: function () { return R.state() ? clone(R.state().anymal) : null; },
    board: function () { return R.state() ? clone(R.state()) : null; },
    STARS: STARS,
    STEPS: STEPS
  };
})();
