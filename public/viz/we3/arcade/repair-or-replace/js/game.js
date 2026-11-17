/* game.js: OLD BESSIE, the game (redesign of 2026-11-16, ../REDESIGN.md). Four screens on one page: the title,
   the tutorial (scripted, on the real game screen, with the coach of ../kit/kit.js), the game (13 weeks, one call
   a week: RUN, SERVICE or REPLACE) and the end card. The rules and the numbers are js/van.js, unchanged: every
   number on screen comes from it, from WEEKS below, or from STARS (computed by tools/stars.js).

   URL flags, in the hash:
     #scene=0   the title (the default)
     #scene=1   the tutorial;  &step=N  opens it at step N, 1 to 6
     #scene=2   a quarter at once, without the tutorial
     &seed=N    the quarter's dice: week w draws from Van.makeRng((N + w * 0x9E3779B1) >>> 0); PLAY AGAIN replays it
     &run       with scene=2: seed 20260610 and RUN pressed once (week 1 earns $95, she wears down to WORN)
     &instant   no motion and no pauses (checks) */
(function () {
  "use strict";
  var V = window.Van, A = window.Actions, K = window.Kit, ART = window.OBArt;

  var WEEKS = 13;
  var STARS = [280, 430, 510];
  var RUN_SEED = 20260610;
  var BEST_KEY = "old-bessie.best";
  var TUT_KEY = "old-bessie.tutorial-done";
  var TUT_STEPS = 6;

  var INSTANT = K.flag("instant") || K.flag("run");
  var REDUCED = K.reduced();
  function D(ms) { return INSTANT ? 0 : (REDUCED ? Math.min(ms, 450) : ms); }
  function M(ms) { return INSTANT || REDUCED ? 0 : ms; }
  function money(n) { return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
  function signed(n) { return (n > 0 ? "+$" : n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
  function NAME(w) { return V.STATE_DISPLAY[w]; }
  function sfx(n) { if (window.SFX) window.SFX.play(n); }

  /* ====== the page ====== */
  var stage = document.getElementById("stage");
  stage.innerHTML =
    '<section class="ob-hud" aria-label="Week, money and condition">' +
      '<div class="ob-pill ob-week" id="ob-week">' + ART.calendar() +
        '<div class="ob-pill-col"><span class="ob-lab" id="ob-week-lab">WEEK</span>' +
        '<div class="ob-val"><span class="ob-num"><span id="ob-week-num">1</span> <span class="ob-of">/ ' + WEEKS + '</span></span>' +
        '<span class="ob-pips" id="ob-pips"></span></div></div></div>' +
      '<div class="ob-pill ob-money" id="ob-money">' + ART.coin() +
        '<div class="ob-pill-col"><span class="ob-lab">MONEY</span><span class="ob-num" id="ob-money-num">$0</span></div></div>' +
      '<div class="ob-pill ob-cond w0" id="ob-cond">' + ART.heart() +
        '<div class="ob-pill-col"><span class="ob-lab">CONDITION</span><div class="ob-val"><span class="ob-meter"><i></i><i></i><i></i><i></i></span>' +
        '<span class="ob-cond-name" id="ob-cond-name"></span></div></div></div>' +
    '</section>' +
    '<section class="ob-field" id="ob-field" aria-label="The town of Old Bessie">' +
      '<div class="ob-sun"></div>' +
      '<div class="ob-cloud c1">' + ART.cloud() + '</div><div class="ob-cloud c2">' + ART.cloud() + '</div>' +
      '<div class="ob-cloud c3">' + ART.cloud() + '</div>' +
      '<div class="ob-hills">' + ART.hills() + '</div>' +
      '<div class="ob-tree t1">' + ART.tree(false) + '</div><div class="ob-tree t2">' + ART.tree(true) + '</div>' +
      '<div class="ob-tree t3">' + ART.tree(false) + '</div>' +
      '<div class="ob-garage" id="ob-garage">' + ART.garage() + '</div>' +
      '<div class="ob-dealer" id="ob-dealer">' + ART.dealer() + '</div>' +
      '<div class="ob-walk"></div><div class="ob-road"></div>' +
      '<div class="ob-tow" id="ob-tow" hidden>' + ART.tow() + '</div>' +
      '<div class="ob-vanpos" id="ob-vanpos"><div class="ob-van w0" id="ob-van"></div></div>' +
    '</section>' +
    '<div class="ob-msg" id="ob-msg" aria-live="polite"></div>' +
    '<section class="ob-calls" id="ob-calls" aria-label="Your call this week"></section>' +
    '<div class="ob-title" id="ob-title">' +
      '<h1 class="ob-logo"><span>OLD</span> BESSIE</h1>' +
      '<div class="ob-ribbon">REPAIR OR REPLACE</div>' +
      '<div class="ob-tagline">One old van, ' + WEEKS + ' weeks: make as much money as you can!</div>' +
      '<div class="ob-title-btns"><button type="button" class="k-btn k-btn-big ob-play">▶ PLAY</button>' +
      '<button type="button" class="k-btn k-btn-white k-btn-big ob-how">HOW TO PLAY</button></div>' +
      '<div class="ob-title-best" hidden></div>' +
    '</div>';

  function $(id) { return document.getElementById(id); }
  var field = $("ob-field"), vanPos = $("ob-vanpos"), vanBox = $("ob-van"), towEl = $("ob-tow");
  var garageEl = $("ob-garage"), dealerEl = $("ob-dealer");
  var weekPill = $("ob-week"), weekLab = $("ob-week-lab"), weekNum = $("ob-week-num"), pipsEl = $("ob-pips");
  var moneyPill = $("ob-money"), moneyNum = $("ob-money-num"), condPill = $("ob-cond"), condName = $("ob-cond-name");
  var msgEl = $("ob-msg"), callsEl = $("ob-calls"), titleEl = $("ob-title");
  var playBtn = titleEl.querySelector(".ob-play"), howBtn = titleEl.querySelector(".ob-how");
  var bestEl = titleEl.querySelector(".ob-title-best");

  var callBtns = {};
  A.ACTIONS.forEach(function (a, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "k-btn ob-call ob-" + a.id;
    b.setAttribute("data-call", a.id);
    b.innerHTML = '<kbd aria-hidden="true">' + (i + 1) + '</kbd><span class="ob-ic">' + A.leverIconSvg(a.id) + "</span>" +
      '<span class="ob-call-name">' + a.name + '</span><span class="ob-tag-price"></span>';
    b.addEventListener("click", function () { onCall(a.id); });
    callsEl.appendChild(b);
    callBtns[a.id] = b;
  });
  callBtns.service.querySelector(".ob-tag-price").textContent = signed(-V.C_SERVICE);
  callBtns.replace.querySelector(".ob-tag-price").textContent = signed(-V.C_REPLACE);
  for (var p = 0; p < WEEKS; p++) pipsEl.appendChild(document.createElement("i"));

  /* ====== the state of a quarter ====== */
  var mode = "title", gen = 0, wear = V.HEALTHY, week = 1, bank = 0, busy = false, baseSeed = 0;
  var stats = null, log = [], endCard = null, coach = null, tutCall = null, script = null, weekWaiter = null;

  function setMode(m) {
    mode = m;
    stage.setAttribute("data-mode", m);
    if (window.Music && window.Music.setTrack) {
      try { window.Music.setTrack(m); } catch (e) { /* no music */ }
    }
  }

  /* ====== motion: every animation and pause can be cut short by a new quarter ====== */
  var anims = [], waits = [], fx = [];
  function wait(ms) {
    return new Promise(function (res) {
      var w = { res: res, t: setTimeout(function () { waits.splice(waits.indexOf(w), 1); res(); }, ms) };
      waits.push(w);
    });
  }
  function animate(el, frames, ms, easing, done) {
    return new Promise(function (res) {
      if (!ms || !el.animate) { done(); res(); return; }
      var a = el.animate(frames, { duration: ms, easing: easing || "ease-in-out", fill: "forwards" });
      anims.push(a);
      function end() {
        var i = anims.indexOf(a);
        if (i >= 0) anims.splice(i, 1);
        res();
      }
      a.onfinish = function () { done(); a.cancel(); end(); };
      a.oncancel = end;
    });
  }
  function move(el, x0, x1, ms, easing) {
    return animate(el, [{ transform: "translateX(" + x0 + "px)" }, { transform: "translateX(" + x1 + "px)" }], ms, easing,
      function () { el.style.transform = x1 ? "translateX(" + x1 + "px)" : ""; });
  }
  function fade(el, to, ms) {
    var from = to ? 0 : 1;
    return animate(el, [{ opacity: from, transform: "translateY(" + (to ? -6 : 0) + "%) scale(" + (to ? 0.92 : 1) + ")" },
      { opacity: to, transform: "translateY(" + (to ? 0 : -6) + "%) scale(" + (to ? 1 : 0.92) + ")" }], ms, "ease-out",
      function () { el.style.opacity = to ? "" : "0"; });
  }
  function stopMotion() {
    anims.slice().forEach(function (a) { try { a.cancel(); } catch (e) { /* gone */ } });
    anims = [];
    waits.slice().forEach(function (w) { clearTimeout(w.t); w.res(); });
    waits = [];
    clearFx();
  }
  function clearFx() {
    fx.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
    fx = [];
  }

  /* where things are, in px inside the field */
  function fr() { return field.getBoundingClientRect(); }
  function dxTo(el) { var f = fr(), r = el.getBoundingClientRect(); return r.left + r.width / 2 - (f.left + f.width / 2); }
  function topOf(el, dy) {
    var f = fr(), r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - f.left, y: r.top - f.top + (dy || 0) };
  }
  function popAbove(el, text, tone, dy, dx) { var p = topOf(el, dy); fx.push(K.pop(field, p.x + (dx || 0), p.y, text, tone)); }
  function tagAbove(el, html, cls) {
    var p = topOf(el, -6), t = document.createElement("div");
    t.className = "ob-tag " + (cls || "");
    t.innerHTML = html;
    t.style.left = p.x + "px";
    t.style.top = p.y + "px";
    field.appendChild(t);
    fx.push(t);
    return t;
  }
  function fxAt(el, cls, html, fx0, fy0) {
    var f = fr(), r = el.getBoundingClientRect(), n = document.createElement("div");
    n.className = "ob-fx " + cls;
    n.innerHTML = html;
    n.style.left = (r.left - f.left + r.width * fx0) + "px";
    n.style.top = (r.top - f.top + r.height * fy0) + "px";
    field.appendChild(n);
    fx.push(n);
    return n;
  }
  function drop(n) {
    if (n && n.parentNode) n.parentNode.removeChild(n);
    var i = fx.indexOf(n);
    if (i >= 0) fx.splice(i, 1);
  }
  function sparkles(el, n) {
    var spots = [[0.1, 0.1], [0.9, 0.05], [0.5, -0.1], [0.2, 0.6], [0.85, 0.55]];
    for (var i = 0; i < n; i++) {
      var s = fxAt(el, "ob-spark", ART.sparkle(i % 2 ? "#FFFFFF" : "#FFC531"), spots[i % 5][0], spots[i % 5][1]);
      s.style.animationDelay = (i * 120) + "ms";
    }
  }
  function flyCoins() {
    if (!M(1) || !document.body.animate) return;
    var a = vanBox.getBoundingClientRect(), b = moneyPill.querySelector("svg").getBoundingClientRect();
    for (var i = 0; i < 4; i++) {
      var c = document.createElement("div");
      c.className = "ob-flycoin";
      c.innerHTML = ART.coin();
      var x0 = a.left + a.width * (0.3 + 0.12 * i) - 14, y0 = a.top + a.height * 0.2;
      c.style.left = x0 + "px";
      c.style.top = y0 + "px";
      document.body.appendChild(c);
      fx.push(c);
      var dx = b.left + b.width / 2 - 14 - x0, dy = b.top + b.height / 2 - 14 - y0;
      c.animate([{ transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx * 0.4 + "px, " + (dy * 0.4 - 60) + "px) scale(1.2)", opacity: 1, offset: 0.4 },
        { transform: "translate(" + dx + "px, " + dy + "px) scale(0.7)", opacity: 0.9 }],
        { duration: 750, delay: i * 90, easing: "ease-in", fill: "forwards" });
      (function (node) { setTimeout(function () { drop(node); }, 750 + i * 90 + 30); })(c);
    }
  }

  /* ====== the HUD and the van ====== */
  function setVanLook(w) {
    vanBox.classList.remove("w0", "w1", "w2", "w3");
    vanBox.classList.add("w" + w);
    vanBox.innerHTML = ART.van(w) + '<div class="ob-puffs"><i></i><i></i><i></i></div>';
  }
  function bump(el) {
    if (!M(1)) return;
    el.classList.remove("ob-bump");
    void el.offsetWidth;
    el.classList.add("ob-bump");
  }
  function setCond(w, withBump) {
    condPill.className = "ob-pill ob-cond w" + w;
    var segs = condPill.querySelectorAll(".ob-meter i");
    for (var i = 0; i < segs.length; i++) segs[i].className = i < segs.length - w ? "lit" : "";
    condName.textContent = NAME(w);
    callBtns.run.querySelector(".ob-tag-price").textContent = signed(V.REV_RUN[w]);
    if (withBump) bump(condPill);
  }
  var shown = 0, countRaf = 0;
  function showMoney(to, ms) {
    if (countRaf) cancelAnimationFrame(countRaf);
    var from = shown, t0 = performance.now();
    function frame(now) {
      var k = ms ? Math.min(1, (now - t0) / ms) : 1;
      shown = Math.round(from + (to - from) * k);
      moneyNum.textContent = money(shown);
      moneyNum.classList.toggle("neg", shown < 0);
      countRaf = k < 1 ? requestAnimationFrame(frame) : 0;
    }
    frame(t0);
  }
  function addMoney(delta) {
    bank += delta;
    showMoney(bank, M(500));
    bump(moneyPill);
  }
  function renderWeek() {
    weekLab.textContent = mode === "tutorial" ? "PRACTICE" : "WEEK";
    weekNum.textContent = String(Math.min(week, WEEKS));
    var pips = pipsEl.children;
    for (var i = 0; i < pips.length; i++) {
      var e = log[i];
      pips[i].className = e ? e.call + (e.bd ? " bd" : "") : (i === week - 1 && mode !== "end" ? "now" : "");
    }
  }
  function setMsg(text) { msgEl.textContent = text; }
  function setButtons() {
    A.MOVE_IDS.forEach(function (id) {
      callBtns[id].disabled = busy || (mode !== "play" && mode !== "tutorial") ||
        (mode === "tutorial" && tutCall !== id) || (mode === "play" && week > WEEKS);
    });
  }

  function resetBoard(seed) {
    gen++;
    stopMotion();
    if (endCard) { endCard.close(); endCard = null; }
    wear = V.HEALTHY;
    week = 1;
    bank = 0;
    busy = false;
    baseSeed = seed >>> 0;
    stats = { run: 0, service: 0, replace: 0, breakdowns: 0 };
    log = [];
    vanPos.style.transform = "";
    vanBox.style.opacity = "";
    vanBox.classList.remove("driving", "shake");
    towEl.hidden = true;
    towEl.style.transform = "";
    garageEl.classList.remove("open");
    setVanLook(wear);
    setCond(wear, false);
    showMoney(0, 0);
    renderWeek();
    setMsg("");
    setButtons();
  }
  function pinnedSeed() {
    var p = K.param("seed");
    if (p != null && /^\d+$/.test(p)) return Number(p) >>> 0;
    if (K.flag("run")) return RUN_SEED;
    return (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  }

  /* ====== one week ====== */
  function announce(call) {
    if (call === "run") return "Off she goes on her delivery route...";
    if (call === "service") return "Off to the garage...";
    return "Off to the van dealer...";
  }
  function outcomeLine(call, out) {
    var lg = out.log, to = NAME(lg.toWear);
    if (call === "run") {
      if (lg.breakdown) {
        var earn = V.REV_RUN[lg.fromWear];
        return "Breakdown! " + signed(earn) + " for the trip, " + signed(out.reward - earn) + " for the tow truck.";
      }
      if (lg.toWear === lg.fromWear) return "Delivered! " + signed(out.reward) + ". Still " + to + ".";
      return "Delivered! " + signed(out.reward) + ". She wore down: " + to + ".";
    }
    if (call === "service") {
      if (lg.fromWear === V.HEALTHY) return "A week in the garage: " + signed(out.reward) + ". She was already " + to + ".";
      if (lg.toWear === lg.fromWear) return "A week in the garage: " + signed(out.reward) + ". No luck: still " + to + ".";
      return "A week in the garage: " + signed(out.reward) + ". Fixed up: " + to + ".";
    }
    return "A brand-new van: " + signed(out.reward) + ". " + to + "!";
  }

  function onCall(call) {
    if (busy) return;
    if (mode === "tutorial") { if (call !== tutCall) return; }
    else if (mode !== "play" || week > WEEKS) return;
    busy = true;
    setButtons();
    clearFx();
    sfx("cursor");
    var from = { wear: wear, terminal: false };
    var out = (mode === "tutorial" && script) ? scripted(wear, call, script.face)
      : V.sample(from, call, V.makeRng((baseSeed + week * 0x9E3779B1) >>> 0));
    var my = gen;
    setMsg(announce(call));
    var run = call === "run" ? (out.log.breakdown ? animBreakdown : animRun) : call === "service" ? animService : animReplace;
    run(out, my).then(function () { if (my === gen) book(call, out); });
  }

  function book(call, out) {
    stats[call] += 1;
    if (out.log.breakdown) stats.breakdowns += 1;
    log.push({ call: call, bd: out.log.breakdown });
    wear = out.sNext.wear;
    setVanLook(wear);
    setCond(wear, false);
    week += 1;
    busy = false;
    setMsg(outcomeLine(call, out));
    renderWeek();
    setButtons();
    if (mode === "play" && week > WEEKS) {
      mode = "end";
      stage.setAttribute("data-mode", "end");
      setButtons();
      renderWeek();
      var my = gen;
      wait(D(700)).then(function () { if (my === gen) showEnd(); });
    }
    if (weekWaiter) { var w = weekWaiter; weekWaiter = null; w(out); }
  }

  function drive(on, el) { (el || vanBox).classList.toggle("driving", !!on && !!M(1)); }

  async function animRun(out, my) {
    var W = field.clientWidth, off = W / 2 + vanPos.offsetWidth;
    drive(true);
    await move(vanPos, 0, off, M(950), "ease-in");
    if (my !== gen) return;
    await wait(D(250));
    if (my !== gen) return;
    await move(vanPos, -off, 0, M(950), "ease-out");
    if (my !== gen) return;
    drive(false);
    addMoney(out.reward);
    popAbove(vanBox, signed(out.reward), "good", -80);
    flyCoins();
    sfx("coin");
    await wait(D(750));
    if (my !== gen) return;
    if (out.log.toWear !== out.log.fromWear) {
      setVanLook(out.log.toWear);
      setCond(out.log.toWear, true);
      tagAbove(vanBox, NAME(out.log.toWear), "t" + out.log.toWear);
      await wait(D(1000));
    } else {
      tagAbove(vanBox, NAME(out.log.toWear), "t" + out.log.toWear);
      await wait(D(500));
    }
  }

  async function animBreakdown(out, my) {
    var W = field.clientWidth, vw = vanPos.offsetWidth;
    var stop = Math.max(0, Math.min(W * 0.22, W / 2 - vw * 0.8));
    var earn = V.REV_RUN[out.log.fromWear], towCost = out.reward - earn;
    drive(true);
    await move(vanPos, 0, stop, M(850), "ease-in");
    if (my !== gen) return;
    drive(false);
    if (M(1)) vanBox.classList.add("shake");
    sfx("hit");
    fxAt(vanBox, "ob-fx-smoke", ART.smoke(), 0.25, 0.25);
    var bdTag = tagAbove(vanBox, ART.warn() + "BREAKDOWN!", "bad");
    addMoney(earn);
    popAbove(vanBox, signed(earn), "good", 30, vanBox.offsetWidth * 0.3);
    await wait(D(1100));
    if (my !== gen) return;
    vanBox.classList.remove("shake");
    setVanLook(V.FAILING);
    setCond(V.FAILING, true);
    towEl.hidden = false;
    var tw = towEl.offsetWidth, start = -(W / 2 + tw), hook = stop - vw / 2 - tw / 2 + vw * 0.05;
    towEl.style.transform = "translateX(" + start + "px)";
    drive(true, towEl);
    sfx("beep");
    await move(towEl, start, hook, M(1100), "ease-out");
    if (my !== gen) return;
    drive(false, towEl);
    drop(bdTag);
    addMoney(towCost);
    popAbove(towEl, signed(towCost), "bad", -10);
    await wait(D(900));
    if (my !== gen) return;
    clearFx();
    drive(true, towEl);
    drive(true);
    await Promise.all([move(vanPos, stop, 0, M(1300)), move(towEl, hook, hook - stop, M(1300))]);
    if (my !== gen) return;
    drive(false);
    await move(towEl, hook - stop, start, M(800), "ease-in");
    if (my !== gen) return;
    drive(false, towEl);
    towEl.hidden = true;
    tagAbove(vanBox, NAME(V.FAILING), "t" + V.FAILING);
    await wait(D(500));
  }

  async function animService(out, my) {
    var gx = dxTo(garageEl), to = out.log.toWear, from = out.log.fromWear;
    garageEl.classList.add("open");
    drive(true);
    await move(vanPos, 0, gx, M(1000));
    if (my !== gen) return;
    drive(false);
    await fade(vanBox, 0, M(320));
    if (my !== gen) return;
    garageEl.classList.remove("open");
    await wait(D(400));
    if (my !== gen) return;
    var wr = fxAt(garageEl, "ob-wrench", A.leverIconSvg("service"), 0.5, 0.05);
    addMoney(out.reward);
    popAbove(garageEl, signed(out.reward), "bad", -30);
    sfx("wrench");
    await wait(D(1200));
    if (my !== gen) return;
    drop(wr);
    setVanLook(to);
    garageEl.classList.add("open");
    await wait(D(400));
    if (my !== gen) return;
    await fade(vanBox, 1, M(320));
    if (my !== gen) return;
    drive(true);
    await move(vanPos, gx, 0, M(1000));
    if (my !== gen) return;
    drive(false);
    garageEl.classList.remove("open");
    setCond(to, true);
    if (to < from) { sparkles(vanBox, 3); sfx("sparkle"); }
    tagAbove(vanBox, NAME(to), "t" + to);
    await wait(D(800));
  }

  async function animReplace(out, my) {
    var dx = dxTo(dealerEl);
    drive(true);
    await move(vanPos, 0, dx, M(1000));
    if (my !== gen) return;
    drive(false);
    await fade(vanBox, 0, M(320));
    if (my !== gen) return;
    addMoney(out.reward);
    popAbove(dealerEl, signed(out.reward), "bad", -30);
    sparkles(dealerEl, 5);
    sfx("sparkle");
    await wait(D(1000));
    if (my !== gen) return;
    setVanLook(V.HEALTHY);
    await fade(vanBox, 1, M(320));
    if (my !== gen) return;
    drive(true);
    await move(vanPos, dx, 0, M(1000));
    if (my !== gen) return;
    drive(false);
    setCond(V.HEALTHY, true);
    sparkles(vanBox, 4);
    tagAbove(vanBox, ART.sparkle("#FFFFFF") + "BRAND NEW!", "t" + V.HEALTHY);
    await wait(D(900));
  }

  /* ====== the end of a quarter ====== */
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function icon(id) { return '<span style="color:' + ART.CALL[id] + '; display:inline-flex">' + A.leverIconSvg(id) + "</span>"; }
  function showEnd() {
    var have = STARS.filter(function (t) { return bank >= t; }).length;
    var b = K.best(BEST_KEY, bank);
    sfx(bank > 0 ? "win" : "loss");
    if (window.Music && window.Music.setTrack) {
      try { window.Music.setTrack("end", { gap: 1.4 }); } catch (e) { /* no music */ }
    }
    endCard = K.endScreen(stage, {
      title: WEEKS + " WEEKS DONE!",
      big: money(bank),
      bigTone: bank < 0 ? "bad" : "good",
      line: bank >= 0 ? "Old Bessie made " + money(bank) + " in " + WEEKS + " weeks." :
        "Old Bessie lost " + money(-bank) + " in " + WEEKS + " weeks.",
      stars: { have: have, marks: STARS.map(money) },
      best: { text: "BEST: " + money(b.best), isNew: b.isNew },
      chips: [
        icon("run") + plural(stats.run, "trip", "trips"),
        icon("service") + plural(stats.service, "week in the garage", "weeks in the garage"),
        icon("replace") + plural(stats.replace, "new van", "new vans"),
        ART.warn() + plural(stats.breakdowns, "breakdown", "breakdowns")
      ],
      again: { label: "PLAY AGAIN", onClick: function () { startQuarter(); } },
      arcade: { label: "BACK TO THE ARCADE", href: "../index.html" }
    });
  }

  /* ====== the screens ====== */
  function closeCoach() {
    if (coach) { coach.close(); coach = null; }
    tutCall = null;
    script = null;
    weekWaiter = null;
  }
  function showTitle() {
    closeCoach();
    setMode("title");
    resetBoard(0);
    var b = parseFloat(K.store.get(BEST_KEY));
    bestEl.hidden = !isFinite(b);
    if (isFinite(b)) bestEl.textContent = "BEST: " + money(b);
    try { playBtn.focus({ preventScroll: true }); } catch (e) { /* nicety */ }
  }
  function startQuarter() {
    closeCoach();
    setMode("play");
    resetBoard(pinnedSeed());
    setMsg("Week 1 of " + WEEKS + ". Make your call!");
  }

  /* The tutorial: scripted weeks on the real screen. Each outcome is a real draw of van.js, on the first seed that
     gives the face the script asks for, so the tutorial always shows the same things. */
  function scripted(w, call, face) {
    for (var seed = 1; seed < 100000; seed++) {
      var out = V.sample({ wear: w, terminal: false }, call, V.makeRng(seed));
      if (out.log.face === face) return out;
    }
    return V.sample({ wear: w, terminal: false }, call, V.makeRng(1));
  }
  var SCRIPT = [
    { k: 2, call: "run", face: "wear1", look: condPill, ask: "Tap RUN to drive her delivery route.",
      tell: function (o) { return "She earned " + money(o.reward) + ". The trip wore her down: " + NAME(o.log.toWear) + "."; } },
    { k: 3, call: "run", face: "breakdown", look: moneyPill, ask: "Tap RUN again.",
      tell: function (o) { return "Breakdown! The tow truck cost " + money(V.BREAKDOWN_COST) + ". Now she is " + NAME(o.log.toWear) + "."; } },
    { k: 4, call: "service", face: "fix1", look: condPill, ask: "Tap SERVICE to take her to the garage.",
      tell: function (o) { return "The garage cost " + money(V.C_SERVICE) + " and fixed her up: " + NAME(o.log.toWear) + "."; } },
    { k: 5, call: "replace", face: "new", look: condPill, ask: "Tap REPLACE to buy a brand-new van.",
      tell: function (o) { return "The new van cost " + money(V.C_REPLACE) + ". She is " + NAME(o.log.toWear) + " again!"; } }
  ];

  async function runTutorial(first) {
    closeCoach();
    setMode("tutorial");
    resetBoard(0);
    var my = gen;
    coach = K.coach({ root: stage, onSkip: finishTutorial, labels: { next: "NEXT", skip: "SKIP" } });
    var s = Math.max(1, Math.min(TUT_STEPS, first || 1)), r;
    SCRIPT.forEach(function (st) {
      if (st.k >= s) return;
      var o = scripted(wear, st.call, st.face);
      bank += o.reward;
      showMoney(bank, 0);
      book(st.call, o);
    });
    setMsg("Practice weeks: nothing here counts.");
    if (s <= 1) {
      r = await coach.step({ target: vanBox, text: "Meet OLD BESSIE, your delivery van.", wait: "next", index: 1, count: TUT_STEPS, pad: 6 });
      if (r !== "next" || my !== gen) return;
    }
    for (var i = 0; i < SCRIPT.length; i++) {
      var st = SCRIPT[i];
      if (st.k < s) continue;
      script = st;
      tutCall = st.call;
      setButtons();
      var done = new Promise(function (res) { weekWaiter = res; });
      r = await coach.step({ target: callBtns[st.call], text: st.ask, wait: "tap", index: st.k, count: TUT_STEPS });
      if (r !== "tap" || my !== gen) return;
      var out = await done;
      if (my !== gen) return;
      tutCall = null;
      script = null;
      setButtons();
      r = await coach.step({ target: st.look, text: st.tell(out), wait: "next", index: st.k, count: TUT_STEPS, pointer: false });
      if (r !== "next" || my !== gen) return;
    }
    r = await coach.step({ target: null, text: "Make as much money as you can in " + WEEKS + " weeks!", wait: "next",
      next: "▶ PLAY", index: TUT_STEPS, count: TUT_STEPS, skip: false });
    if (r !== "next" || my !== gen) return;
    finishTutorial();
  }
  function finishTutorial() {
    K.store.set(TUT_KEY, "1");
    startQuarter();
  }

  playBtn.addEventListener("click", function () {
    sfx("cursor");
    if (K.store.get(TUT_KEY)) startQuarter(); else runTutorial(1);
  });
  howBtn.addEventListener("click", function () { sfx("cursor"); runTutorial(1); });

  /* keys: 1, 2, 3 press RUN, SERVICE, REPLACE; m the MUSIC button (the coach takes Enter and Escape) */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && /input|textarea|select/i.test(t.tagName || "")) return;
    if (e.key === "m" || e.key === "M") {
      var mb = document.getElementById("music-toggle");
      if (mb) { mb.click(); e.preventDefault(); }
      return;
    }
    var i = ["1", "2", "3"].indexOf(e.key);
    if (i >= 0) {
      var b = callBtns[A.MOVE_IDS[i]];
      if (b && !b.disabled) { b.click(); e.preventDefault(); }
    }
  });

  var scene = K.param("scene");
  if (scene === "1") runTutorial(parseInt(K.param("step"), 10) || 1);
  else if (scene === "2") {
    startQuarter();
    if (K.flag("run")) setTimeout(function () { if (!callBtns.run.disabled) callBtns.run.click(); }, 220);
  } else showTitle();

  window.OldBessie = {
    mode: function () { return mode; },
    week: function () { return week; },
    bank: function () { return bank; },
    STARS: STARS,
    WEEKS: WEEKS
  };
})();
