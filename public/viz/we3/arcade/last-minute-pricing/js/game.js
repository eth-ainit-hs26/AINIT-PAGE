/* game.js: LAST-MINUTE PRICING, the game (redesign of 2026-11-16, ../REDESIGN.md, stage 3). Four screens on one
   page: the title, the tutorial (scripted, on the real game screen, with the coach of ../kit/kit.js), the game (a
   plane with 5 seats that takes off in 4 days; each day one price, PREMIUM $5 or STANDARD $2) and the end card. The
   rules and the numbers are js/levers.js and js/pricing.js, unchanged: every number on screen comes from them, or
   from STARS (computed by tools/stars.js).

   URL flags, in the hash:
     #scene=0   the title (the default)
     #scene=1   the tutorial;  &step=N  opens it at step N, 1 to 6, the earlier practice days already played
     #scene=2   a flight at once, without the tutorial
     &seed=N    the flight's buyers: day d draws from Pricing.makeRng((N + d * 0x9E3779B1) >>> 0); PLAY AGAIN replays it
     &run       with scene=2: seed 20260530 and PREMIUM on day 1, STANDARD on every later day, pressed to the end
                (day 1 nobody, day 2 three buyers, day 3 two: a full flight on day 3 and $10); no motion
     &instant   no motion and no pauses (the checks) */
(function () {
  "use strict";
  var P = window.Pricing, L = window.Levers, K = window.Kit, ART = window.LMArt;

  var DAYS = P.NUM_DAYS;
  var SEATS = P.NUM_UNITS;
  var STARS = [10, 13, 14];
  var RUN_SEED = 20260530;
  var RUN_PLAN = ["premium", "standard", "standard", "standard"];
  var BEST_KEY = "last-minute-pricing.best";
  var TUT_KEY = "last-minute-pricing.tutorial-done";
  var TUT_STEPS = 6;

  var INSTANT = K.flag("instant") || K.flag("run");
  var REDUCED = K.reduced();
  function D(ms) { return INSTANT ? 0 : (REDUCED ? Math.min(ms, 450) : ms); }
  function M(ms) { return INSTANT || REDUCED ? 0 : ms; }
  function money(n) { return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
  function signed(n) { return (n > 0 ? "+$" : n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString("en-US"); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function lever(id) { return L.LEVER_BY_ID[id]; }
  function sfx(n) { if (window.SFX) window.SFX.play(n); }

  /* ====== the page ====== */
  var stage = document.getElementById("stage");
  stage.innerHTML =
    '<section class="lm-hud" aria-label="Day, seats left and money">' +
      '<div class="lm-pill lm-day" id="lm-day">' + ART.calendar() +
        '<div class="lm-pill-col"><span class="lm-lab" id="lm-day-lab">DAY</span>' +
        '<div class="lm-val"><span class="lm-num"><span id="lm-day-num">1</span> <span class="lm-of">/ ' + DAYS + '</span></span>' +
        '<span class="lm-pips" id="lm-pips"></span></div></div></div>' +
      '<div class="lm-pill lm-seats" id="lm-seats">' + ART.seatIcon() +
        '<div class="lm-pill-col"><span class="lm-lab">SEATS LEFT</span>' +
        '<div class="lm-val"><span class="lm-num" id="lm-seats-num">' + SEATS + '</span><span class="lm-minis" id="lm-minis"></span></div></div></div>' +
      '<div class="lm-pill lm-money" id="lm-money">' + ART.coin() +
        '<div class="lm-pill-col"><span class="lm-lab">MONEY</span><span class="lm-num" id="lm-money-num">$0</span></div></div>' +
    '</section>' +
    '<section class="lm-field" id="lm-field" aria-label="The airport">' +
      '<div class="lm-sun"></div>' +
      '<div class="lm-cloud c1">' + ART.cloud() + '</div><div class="lm-cloud c2">' + ART.cloud() + '</div>' +
      '<div class="lm-cloud c3">' + ART.cloud() + '</div>' +
      '<div class="lm-hills">' + ART.hills() + '</div>' +
      '<div class="lm-apron"></div><div class="lm-walk"></div>' +
      '<div class="lm-tower">' + ART.tower() + '</div>' +
      '<div class="lm-sockpole">' + ART.windsock() + '</div>' +
      '<div class="lm-board" id="lm-board"><div class="lm-board-head" id="lm-board-head">TAKEOFF IN</div>' +
        '<div class="lm-board-row"><span class="lm-flip" id="lm-flip">' + DAYS + '</span>' +
        '<span class="lm-board-unit" id="lm-board-unit">DAYS</span></div></div>' +
      '<div class="lm-gate" id="lm-gate">' +
        '<div class="lm-sign" id="lm-sign"><span class="lm-sign-name" id="lm-sign-name">PRICE</span>' +
        '<span class="lm-sign-price" id="lm-sign-price">?</span></div>' +
        '<div class="lm-counter">' + ART.counter() + '</div></div>' +
      '<div class="lm-planepos" id="lm-planepos"><div class="lm-stairs" id="lm-stairs">' + ART.stairs() + '</div>' +
        '<div class="lm-plane" id="lm-plane">' + ART.plane() + '</div></div>' +
    '</section>' +
    '<div class="lm-msg" id="lm-msg" aria-live="polite"></div>' +
    '<section class="lm-prices" id="lm-prices" aria-label="Today\'s price"></section>' +
    '<div class="lm-title" id="lm-title">' +
      '<h1 class="lm-logo"><span class="l1">LAST-MINUTE</span><span class="l2">PRICING</span></h1>' +
      '<div class="lm-ribbon">FILL THE FLIGHT</div>' +
      '<div class="lm-tagline">' + SEATS + ' seats, ' + DAYS + ' days to takeoff: make as much money as you can!</div>' +
      '<div class="lm-title-btns"><button type="button" class="k-btn k-btn-big lm-play">▶ PLAY</button>' +
      '<button type="button" class="k-btn k-btn-white k-btn-big lm-how">HOW TO PLAY</button></div>' +
      '<div class="lm-title-best" hidden></div>' +
    '</div>';

  function $(id) { return document.getElementById(id); }
  var field = $("lm-field"), planePos = $("lm-planepos"), planeEl = $("lm-plane"), stairsEl = $("lm-stairs");
  var gateEl = $("lm-gate"), signEl = $("lm-sign"), signName = $("lm-sign-name"), signPrice = $("lm-sign-price");
  var boardEl = $("lm-board"), boardHead = $("lm-board-head"), flipEl = $("lm-flip"), boardUnit = $("lm-board-unit");
  var dayPill = $("lm-day"), dayLab = $("lm-day-lab"), dayNum = $("lm-day-num"), pipsEl = $("lm-pips");
  var seatsPill = $("lm-seats"), seatsNum = $("lm-seats-num"), minisEl = $("lm-minis");
  var moneyPill = $("lm-money"), moneyNum = $("lm-money-num");
  var msgEl = $("lm-msg"), pricesEl = $("lm-prices"), titleEl = $("lm-title");
  var playBtn = titleEl.querySelector(".lm-play"), howBtn = titleEl.querySelector(".lm-how");
  var bestEl = titleEl.querySelector(".lm-title-best");
  var winEls = Array.prototype.slice.call(planeEl.querySelectorAll(".lm-win"));

  var priceBtns = {};
  L.LEVERS.forEach(function (lv, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "k-btn lm-price-btn lm-" + lv.id;
    b.setAttribute("data-price", lv.id);
    b.innerHTML = '<kbd aria-hidden="true">' + (i + 1) + '</kbd><span class="lm-ic">' + ART.priceIcon(lv.id) + "</span>" +
      '<span class="lm-price-name">' + lv.name + '</span><span class="lm-tag-price">' + money(lv.price) + " a seat</span>";
    b.addEventListener("click", function () { onPrice(lv.id); });
    pricesEl.appendChild(b);
    priceBtns[lv.id] = b;
  });
  var p;
  for (p = 0; p < DAYS; p++) pipsEl.appendChild(document.createElement("i"));
  for (p = 0; p < SEATS; p++) minisEl.appendChild(document.createElement("i"));

  /* ====== the state of a flight ====== */
  var mode = "title", gen = 0, seatsLeft = SEATS, day = 1, bank = 0, soldSeats = 0, busy = false, baseSeed = 0;
  var over = false, full = false, stats = null, log = [], endCard = null, coach = null;
  var tutPrice = null, script = null, dayWaiter = null;

  function state() { return { u: seatsLeft, d: DAYS - day + 1, terminal: false }; }
  function setMode(m) {
    mode = m;
    stage.setAttribute("data-mode", m);
    if (window.Music && window.Music.setTrack) {
      try { window.Music.setTrack(m === "title" ? "title" : m === "tutorial" ? "tutorial" : "boss"); } catch (e) { /* no music */ }
    }
  }

  /* ====== motion: every animation and pause can be cut short by a new flight ====== */
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
  function tween(el, t0, t1, ms, easing) {
    return animate(el, [{ transform: t0 }, { transform: t1 }], ms, easing, function () { el.style.transform = t1; });
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
  function drop(n) {
    if (n && n.parentNode) n.parentNode.removeChild(n);
    var i = fx.indexOf(n);
    if (i >= 0) fx.splice(i, 1);
  }

  /* where things are, in px inside the field */
  function box(el) {
    var f = field.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - f.left, t: r.top - f.top, r: r.right - f.left, b: r.bottom - f.top, w: r.width, h: r.height,
      cx: r.left - f.left + r.width / 2 };
  }
  function popAt(x, y, text, tone) { fx.push(K.pop(field, x, y, text, tone)); }
  function tagAt(x, y, html, cls) {
    var t = document.createElement("div");
    t.className = "lm-tag " + (cls || "");
    t.innerHTML = html;
    t.style.left = x + "px";
    t.style.top = y + "px";
    field.appendChild(t);
    fx.push(t);
    return t;
  }
  function tagAbove(el, html, cls, dy) { var b = box(el); return tagAt(b.cx, b.t - 6 + (dy || 0), html, cls); }
  function sparkles(el, n) {
    var b = box(el), spots = [[0.1, 0.1], [0.92, 0.12], [0.5, -0.06], [0.25, 0.7], [0.8, 0.62]];
    for (var i = 0; i < n; i++) {
      var s = document.createElement("div");
      s.className = "lm-fx lm-spark";
      s.innerHTML = ART.sparkle(i % 2 ? "#FFFFFF" : "#FFC531");
      s.style.left = (b.l + b.w * spots[i % 5][0]) + "px";
      s.style.top = (b.t + b.h * spots[i % 5][1]) + "px";
      s.style.animationDelay = (i * 120) + "ms";
      field.appendChild(s);
      fx.push(s);
    }
  }
  function flyCoins(fromEl, n) {
    if (!M(1) || !document.body.animate) return;
    var a = fromEl.getBoundingClientRect(), b = moneyPill.querySelector("svg").getBoundingClientRect();
    for (var i = 0; i < n; i++) {
      var c = document.createElement("div");
      c.className = "lm-flycoin";
      c.innerHTML = ART.coin();
      var x0 = a.left + a.width * (0.3 + 0.4 * i / Math.max(1, n - 1)) - 14, y0 = a.top + a.height * 0.15;
      c.style.left = x0 + "px";
      c.style.top = y0 + "px";
      document.body.appendChild(c);
      fx.push(c);
      var dx = b.left + b.width / 2 - 14 - x0, dy = b.top + b.height / 2 - 14 - y0;
      c.animate([{ transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx * 0.4 + "px, " + (dy * 0.4 - 50) + "px) scale(1.2)", opacity: 1, offset: 0.4 },
        { transform: "translate(" + dx + "px, " + dy + "px) scale(0.7)", opacity: 0.9 }],
        { duration: 700, delay: i * 90, easing: "ease-in", fill: "forwards" });
      (function (node, ms) { setTimeout(function () { drop(node); }, ms); })(c, 700 + i * 90 + 30);
    }
  }

  /* ====== the HUD, the board, the sign, the cabin ====== */
  function bump(el) {
    if (!M(1)) return;
    el.classList.remove("lm-bump");
    void el.offsetWidth;
    el.classList.add("lm-bump");
  }
  var shown = 0, countRaf = 0;
  function showMoney(to, ms) {
    if (countRaf) cancelAnimationFrame(countRaf);
    var from = shown, t0 = performance.now();
    function frame(now) {
      var k = ms ? Math.min(1, (now - t0) / ms) : 1;
      shown = Math.round(from + (to - from) * k);
      moneyNum.textContent = money(shown);
      countRaf = k < 1 ? requestAnimationFrame(frame) : 0;
    }
    frame(t0);
  }
  function addMoney(delta) {
    bank += delta;
    showMoney(bank, M(450));
    bump(moneyPill);
  }
  function renderSeats(withBump) {
    seatsNum.textContent = String(SEATS - soldSeats);
    var m = minisEl.children;
    for (var i = 0; i < m.length; i++) {
      m[i].className = i < soldSeats ? "sold" : "";
      m[i].style.color = i < soldSeats ? ART.PAX[i % ART.PAX.length].skin : "";
    }
    if (withBump) bump(seatsPill);
  }
  function fillWindow(i, popIt) {
    var g = winEls[i] && winEls[i].querySelector(".lm-pax");
    if (!g) return;
    g.innerHTML = ART.seated(i, ART.WIN_X[i], ART.WIN_Y);
    g.classList.remove("pop");
    if (popIt && M(1)) { void g.getBoundingClientRect(); g.classList.add("pop"); }
  }
  function renderDay() {
    dayLab.textContent = mode === "tutorial" ? "PRACTICE" : "DAY";
    dayNum.textContent = String(Math.min(over ? day - 1 : day, DAYS));
    var pips = pipsEl.children;
    for (var i = 0; i < pips.length; i++) {
      var e = log[i];
      pips[i].className = e ? e.id : (i === day - 1 && !over ? "now" : "");
    }
  }
  function renderBoard(flipIt) {
    if (over) {
      boardEl.classList.add("now");
      boardHead.textContent = "GATE 4";
      boardUnit.textContent = "TAKEOFF!";
      return;
    }
    var left = DAYS - day + 1;
    boardEl.classList.remove("now");
    boardHead.textContent = "TAKEOFF IN";
    flipEl.textContent = String(left);
    boardUnit.textContent = left === 1 ? "DAY" : "DAYS";
    if (flipIt && M(1)) {
      flipEl.classList.remove("flipping");
      void flipEl.offsetWidth;
      flipEl.classList.add("flipping");
    }
  }
  function setSign(id) {
    var lv = id ? lever(id) : null;
    signEl.className = "lm-sign" + (lv ? " " + lv.id : "");
    signName.textContent = lv ? lv.name : "PRICE";
    signPrice.textContent = lv ? money(lv.price) : "?";
    if (lv && M(1)) { void signEl.offsetWidth; signEl.classList.add("pop"); }
  }
  function setMsg(text) { msgEl.textContent = text; }
  function setButtons() {
    L.LEVER_IDS.forEach(function (id) {
      priceBtns[id].disabled = busy || over || (mode !== "play" && mode !== "tutorial") ||
        (mode === "tutorial" && tutPrice !== id);
    });
  }

  function resetBoard(seed) {
    gen++;
    stopMotion();
    if (endCard) { endCard.close(); endCard = null; }
    seatsLeft = SEATS;
    day = 1;
    bank = 0;
    soldSeats = 0;
    busy = false;
    over = false;
    full = false;
    baseSeed = seed >>> 0;
    stats = { premium: 0, standard: 0 };
    log = [];
    planePos.style.transform = "";
    planePos.style.visibility = "";
    stairsEl.style.opacity = "";
    stairsEl.style.transform = "";
    planeEl.classList.remove("open", "rumble");
    winEls.forEach(function (w) {
      w.classList.remove("empty");
      var g = w.querySelector(".lm-pax");
      g.innerHTML = "";
      g.classList.remove("pop");
    });
    setSign(null);
    renderSeats(false);
    showMoney(0, 0);
    renderDay();
    renderBoard(false);
    setMsg("");
    setButtons();
  }
  function pinnedSeed() {
    var s = K.param("seed");
    if (s != null && /^\d+$/.test(s)) return Number(s) >>> 0;
    if (K.flag("run")) return RUN_SEED;
    return (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
  }

  /* ====== one day ====== */
  function announce(id) { var lv = lever(id); return lv.name + " today: who buys a seat at " + money(lv.price) + "?"; }
  function outcomeLine(out) {
    var lg = out.log, pr = money(lg.price);
    if (lg.k === 0) return "Nobody bought a seat at " + pr + " today.";
    var s = plural(lg.sold, "passenger", "passengers") + " paid " + pr + (lg.sold > 1 ? " each" : "") + ": " + signed(out.reward) + ".";
    if (lg.k > lg.sold) s += " " + plural(lg.k - lg.sold, "more buyer", "more buyers") + " found no seat.";
    return s;
  }

  function onPrice(id) {
    if (busy || over) return;
    if (mode === "tutorial") { if (id !== tutPrice) return; }
    else if (mode !== "play") return;
    busy = true;
    setButtons();
    clearFx();
    sfx("cursor");
    var out = (mode === "tutorial" && script) ? scripted(state(), id, script.buyers)
      : P.sample(state(), id, P.makeRng((baseSeed + day * 0x9E3779B1) >>> 0));
    setMsg(announce(id));
    playDay(id, out, gen);
  }

  async function playDay(id, out, my) {
    await animDay(id, out, my);
    if (my !== gen) return;
    book(id, out);
    if (out.terminal) {
      await animDeparture(my);
      if (my !== gen) return;
    }
    busy = false;
    setButtons();
    if (out.terminal && mode === "play") {
      mode = "end";
      stage.setAttribute("data-mode", "end");
      setButtons();
      await wait(D(500));
      if (my !== gen) return;
      showEnd();
    }
    if (dayWaiter) { var w = dayWaiter; dayWaiter = null; w(out); }
  }

  function book(id, out) {
    var lg = out.log;
    log.push({ id: id, k: lg.k, sold: lg.sold });
    stats[id] += 1;
    seatsLeft = lg.uAfter;
    soldSeats = SEATS - seatsLeft;
    day += 1;
    over = !!out.terminal;
    full = !!lg.soldout;
    setSign(null);
    renderSeats(false);
    renderDay();
    renderBoard(true);
    setMsg(outcomeLine(out));
  }

  async function animDay(id, out, my) {
    var lv = lever(id), k = out.log.k, sold = out.log.sold, before = soldSeats, i;
    setSign(id);
    planeEl.classList.add("open");
    await wait(D(450));
    if (my !== gen) return;
    if (k === 0) {
      await animNobody(my);
      if (my !== gen) return;
    } else {
      var all = [];
      for (i = 0; i < k; i++) all.push(animBuyer(i, before + i, i < sold, lv.price, my));
      await Promise.all(all);
      if (my !== gen) return;
    }
    planeEl.classList.remove("open");
    await wait(D(350));
  }

  /* A buyer walks in from the left, pays at the counter (+$ over the head, coins to MONEY, one seat fewer left),
     climbs the steps and sits at window n. A buyer who finds no seat left frowns and walks back out. */
  async function animBuyer(i, n, boards, price, my) {
    await wait(D(i * 650));
    if (my !== gen) return;
    var w = document.createElement("div");
    w.className = "lm-walker";
    w.innerHTML = ART.walker(n, false);
    field.appendChild(w);
    fx.push(w);
    var ww = w.offsetWidth, base = box(w).b, g = box(gateEl), st = box(stairsEl), pl = box(planeEl);
    var speed = Math.max(0.3, field.clientWidth / 2400);
    var x0 = -ww, xDesk = g.l + g.w * 0.8, xFoot = st.l + st.w * 0.1, yFoot = Math.min(0, st.b - base);
    var xDoor = pl.l + pl.w * 112 / 420, yDoor = pl.t + pl.h * 128 / 180 - base;
    function T(x, y, s) { return "translate(" + Math.round(x - ww / 2) + "px, " + Math.round(y) + "px)" + (s ? " scale(" + s + ")" : ""); }
    w.style.transform = T(x0, 0);
    w.classList.toggle("walking", !!M(1));
    await tween(w, T(x0, 0), T(xDesk, 0), M((xDesk - x0) / speed), "linear");
    if (my !== gen) return;
    w.classList.remove("walking");
    if (!boards) {
      w.innerHTML = ART.walker(n, true);
      var sorry = tagAbove(signEl, "NO SEATS LEFT", "bad small", -4);
      sfx("noseat");
      await wait(D(900));
      if (my !== gen) return;
      w.classList.add("left");
      w.classList.toggle("walking", !!M(1));
      await tween(w, T(xDesk, 0), T(x0, 0), M((xDesk - x0) / speed), "linear");
      if (my !== gen) return;
      if (M(1)) { drop(w); drop(sorry); }
      return;
    }
    addMoney(price);
    soldSeats = Math.max(soldSeats, n + 1);
    renderSeats(true);
    var wb = box(w);
    popAt(wb.cx, wb.t - 4, signed(price), "good");
    flyCoins(w, 2);
    sfx("coin");
    await wait(D(420));
    if (my !== gen) return;
    /* on a phone the steps stand further back, up and to the left of the gate: the buyer turns round and shrinks a
       little on the way, as if walking away from you */
    var sF = yFoot < -0.12 * field.clientHeight ? 0.8 : 1;
    w.classList.toggle("walking", !!M(1));
    w.classList.toggle("left", xFoot < xDesk);
    await tween(w, T(xDesk, 0), T(xFoot, yFoot, sF), M(Math.max(200, Math.hypot(xFoot - xDesk, yFoot) / speed)), "linear");
    if (my !== gen) return;
    w.classList.remove("left");
    await tween(w, T(xFoot, yFoot, sF), T(xDoor, yDoor, 0.85 * sF), M(650), "ease-in-out");
    if (my !== gen) return;
    await animate(w, [{ opacity: 1, transform: T(xDoor, yDoor, 0.85 * sF) }, { opacity: 0, transform: T(xDoor, yDoor, 0.6 * sF) }],
      M(220), "ease-in", function () { w.style.opacity = "0"; });
    if (my !== gen) return;
    drop(w);
    fillWindow(n, true);
    sfx("seat");
  }

  /* Nobody comes: a tumbleweed rolls past the gate. */
  async function animNobody(my) {
    var t = document.createElement("div");
    t.className = "lm-tumble";
    t.innerHTML = ART.tumbleweed();
    field.appendChild(t);
    fx.push(t);
    var W = field.clientWidth, tw = t.offsetWidth, g = box(gateEl), pl = box(planeEl);
    if (pl.l > g.r) tagAt((g.r + pl.l) / 2, g.t + g.h * 0.4, "NOBODY CAME", "bad small");
    else tagAbove(signEl, "NOBODY CAME", "bad small", -4);
    sfx("sad");
    await animate(t, [{ transform: "translateX(" + (-tw) + "px) rotate(0deg)" },
      { transform: "translateX(" + Math.round(W * 0.7) + "px) rotate(900deg)" }], M(2000), "linear", function () { drop(t); });
    if (my !== gen) return;
    drop(t);
    await wait(D(300));
  }

  /* Takeoff: a full flight sparkles, empty seats show red rings; the steps roll away and the plane flies off. */
  async function animDeparture(my) {
    renderBoard(false);
    planeEl.classList.remove("open");
    var empty = SEATS - soldSeats;
    if (full) {
      setMsg("FULL FLIGHT! All " + SEATS + " seats are sold.");
      tagAbove(planeEl, ART.sparkle("#FFFFFF") + "FULL FLIGHT!", "gold", -4);
      sparkles(planeEl, 5);
      sfx("sparkle");
    } else {
      setMsg("Takeoff! " + plural(empty, "seat", "seats") + " flew empty.");
      for (var i = soldSeats; i < SEATS; i++) winEls[i].classList.add("empty");
      tagAbove(planeEl, plural(empty, "EMPTY SEAT", "EMPTY SEATS"), "bad", -4);
      sfx("noseat");
    }
    await wait(D(1600));
    if (my !== gen) return;
    clearFx();
    await animate(stairsEl, [{ transform: "translateX(0)", opacity: 1 }, { transform: "translateX(-45%)", opacity: 0 }],
      M(420), "ease-in", function () { stairsEl.style.opacity = "0"; });
    if (my !== gen) return;
    planeEl.classList.toggle("rumble", !!M(1));
    sfx("takeoff");
    await wait(D(450));
    if (my !== gen) return;
    var W = field.clientWidth, H = field.clientHeight;
    await animate(planePos, [
      { transform: "translate(0, 0) rotate(0deg)" },
      { transform: "translate(" + Math.round(W * 0.1) + "px, 0) rotate(0deg)", offset: 0.35 },
      { transform: "translate(" + Math.round(W * 0.75) + "px, " + Math.round(-H * 0.7) + "px) rotate(-14deg)" }
    ], M(1700), "ease-in", function () { planePos.style.visibility = "hidden"; });
    planeEl.classList.remove("rumble");
  }
  function departNow() {
    renderBoard(false);
    for (var i = soldSeats; i < SEATS; i++) winEls[i].classList.add("empty");
    planePos.style.visibility = "hidden";
  }

  /* ====== the end of a flight ====== */
  function chipIcon(svg, color) { return '<span style="color:' + color + '; display:inline-flex">' + svg + "</span>"; }
  function showEnd() {
    var have = STARS.filter(function (t) { return bank >= t; }).length;
    var b = K.best(BEST_KEY, bank), empty = SEATS - soldSeats;
    sfx(have > 0 ? "win" : "loss");
    endCard = K.endScreen(stage, {
      title: full ? "FULL FLIGHT!" : "TAKEOFF!",
      big: money(bank),
      bigTone: bank > 0 ? "good" : "bad",
      line: full ? "You sold all " + SEATS + " seats and made " + money(bank) + "." :
        "You made " + money(bank) + ". " + plural(empty, "seat", "seats") + " flew empty.",
      stars: { have: have, marks: STARS.map(money) },
      best: { text: "BEST: " + money(b.best), isNew: b.isNew },
      chips: [
        chipIcon(ART.crown(), ART.PRICE.premium) + plural(stats.premium, "day at PREMIUM", "days at PREMIUM"),
        chipIcon(ART.ticket(), ART.PRICE.standard) + plural(stats.standard, "day at STANDARD", "days at STANDARD"),
        ART.paxIcon(0) + plural(soldSeats, "passenger", "passengers"),
        ART.seatIcon() + plural(empty, "empty seat", "empty seats")
      ],
      again: { label: "PLAY AGAIN", onClick: function () { startFlight(); } },
      arcade: { label: "BACK TO THE ARCADE", href: "../index.html" }
    });
  }

  /* ====== the screens ====== */
  function closeCoach() {
    if (coach) { coach.close(); coach = null; }
    tutPrice = null;
    script = null;
    dayWaiter = null;
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
  function startFlight() {
    closeCoach();
    setMode("play");
    resetBoard(pinnedSeed());
    setMsg("Day 1 of " + DAYS + ": pick today's price!");
  }

  /* The tutorial: four practice days on the real screen. Each day is a real draw of pricing.js, on the first seed
     that brings the number of buyers the script asks for, so the tutorial always shows the same days. */
  function scripted(s, id, buyers) {
    for (var seed = 1; seed < 100000; seed++) {
      var out = P.sample(s, id, P.makeRng(seed));
      if (out.log.k === buyers) return out;
    }
    return P.sample(s, id, P.makeRng(1));
  }
  var SCRIPT = [
    { k: 2, price: "premium", buyers: 1, look: moneyPill, ask: "Tap PREMIUM: each seat sells for " + money(lever("premium").price) + ".",
      tell: function (o) { return "A buyer paid " + money(o.log.price) + "! PREMIUM brings one buyer or nobody."; } },
    { k: 3, price: "standard", buyers: 2, look: seatsPill, ask: "Now tap STANDARD: each seat sells for " + money(lever("standard").price) + ".",
      tell: function (o) { return o.log.sold + " buyers paid " + money(o.log.price) + " each. STANDARD brings more buyers."; } },
    { k: 4, price: "premium", buyers: 0, look: boardEl, ask: "Tap PREMIUM again.",
      tell: function () { return "Nobody came today. One day left before takeoff!"; } },
    { k: 5, price: "premium", buyers: 1, look: seatsPill, ask: "Last day! Tap PREMIUM.",
      tell: function (o) { return "The plane left with " + plural(o.log.uAfter, "empty seat", "empty seats") + ". Empty seats earn nothing."; } }
  ];

  function replayDay(st) {
    var o = scripted(state(), st.price, st.buyers);
    bank += o.reward;
    showMoney(bank, 0);
    for (var i = 0; i < o.log.sold; i++) fillWindow(soldSeats + i, false);
    book(st.price, o);
    if (o.terminal) departNow();
  }

  async function runTutorial(first) {
    closeCoach();
    setMode("tutorial");
    resetBoard(0);
    var my = gen;
    coach = K.coach({ root: stage, onSkip: finishTutorial, labels: { next: "NEXT", skip: "SKIP" } });
    var s = Math.max(1, Math.min(TUT_STEPS, first || 1)), r;
    SCRIPT.forEach(function (st) { if (st.k < s) replayDay(st); });
    renderDay();
    setButtons();
    setMsg("Practice flight: nothing here counts.");
    if (s <= 1) {
      r = await coach.step({ target: planePos, text: "Your plane has " + SEATS + " seats and takes off in " + DAYS + " days.",
        wait: "next", index: 1, count: TUT_STEPS, pad: 6 });
      if (r !== "next" || my !== gen) return;
    }
    for (var i = 0; i < SCRIPT.length; i++) {
      var st = SCRIPT[i];
      if (st.k < s) continue;
      script = st;
      tutPrice = st.price;
      setButtons();
      var done = new Promise(function (res) { dayWaiter = res; });
      r = await coach.step({ target: priceBtns[st.price], text: st.ask, wait: "tap", index: st.k, count: TUT_STEPS });
      if (r !== "tap" || my !== gen) return;
      var out = await done;
      if (my !== gen) return;
      tutPrice = null;
      script = null;
      setButtons();
      r = await coach.step({ target: st.look, text: st.tell(out), wait: "next", index: st.k, count: TUT_STEPS, pointer: false });
      if (r !== "next" || my !== gen) return;
    }
    r = await coach.step({ target: null, text: "Make as much money as you can before the plane leaves!", wait: "next",
      next: "▶ PLAY", index: TUT_STEPS, count: TUT_STEPS, skip: false });
    if (r !== "next" || my !== gen) return;
    finishTutorial();
  }
  function finishTutorial() {
    K.store.set(TUT_KEY, "1");
    startFlight();
  }

  playBtn.addEventListener("click", function () {
    sfx("cursor");
    if (K.store.get(TUT_KEY)) startFlight(); else runTutorial(1);
  });
  howBtn.addEventListener("click", function () { sfx("cursor"); runTutorial(1); });

  /* keys: 1 and 2 press PREMIUM and STANDARD, the arrows pick one for Enter; m the MUSIC button (the coach takes
     Enter, the right arrow and Escape while its bubble has a NEXT button) */
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target;
    if (t && /input|textarea|select/i.test(t.tagName || "")) return;
    if (e.key === "m" || e.key === "M") {
      var mb = document.getElementById("music-toggle");
      if (mb) { mb.click(); e.preventDefault(); }
      return;
    }
    var b = null, i = ["1", "2"].indexOf(e.key);
    if (i >= 0) b = priceBtns[L.LEVER_IDS[i]];
    if (b) { if (!b.disabled) { b.click(); e.preventDefault(); } return; }
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      b = priceBtns[e.key === "ArrowLeft" ? "premium" : "standard"];
      if (b && !b.disabled) { b.focus(); e.preventDefault(); }
    }
  });

  function autoRun() {
    if (mode !== "play" || over) return;
    var b = priceBtns[RUN_PLAN[Math.min(day, RUN_PLAN.length) - 1]];
    if (b && !b.disabled) b.click();
    setTimeout(autoRun, 150);
  }

  var scene = K.param("scene");
  if (scene === "1") runTutorial(parseInt(K.param("step"), 10) || 1);
  else if (scene === "2") {
    startFlight();
    if (K.flag("run")) setTimeout(autoRun, 220);
  } else showTitle();

  window.LastMinutePricing = {
    mode: function () { return mode; },
    day: function () { return day; },
    bank: function () { return bank; },
    seats: function () { return seatsLeft; },
    over: function () { return over; },
    full: function () { return full; },
    STARS: STARS,
    DAYS: DAYS,
    SEATS: SEATS
  };
})();
