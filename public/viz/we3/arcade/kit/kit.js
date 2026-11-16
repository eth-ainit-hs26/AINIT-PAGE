/* kit.js: the parts the four arcade games share (from 2026-11-16, REDESIGN.md), window.Kit.
   No dependencies; load it after kit.css. kit/CLAUDE.md has the API with examples.

     Kit.flag(name)             true when the URL hash holds `name` (#scene=2&instant: flag('instant'))
     Kit.param(name)            the value of `name=value` in the hash, or null
     Kit.reduced()              the player asked the system for reduced motion
     Kit.store.get(k), Kit.store.set(k, v)   localStorage, every access inside try/catch (small things only)
     Kit.best(key, score)       keeps the highest score under `key`; returns { best, isNew }
     Kit.pop(host, x, y, text, tone)   a word that pops up and floats away (tone: 'good', 'bad', 'gold', 'ink')
     Kit.coach(opts)            the tutorial coach: a light veil, a ring and a pointer on the target, a bubble
     Kit.endScreen(host, opts)  the end card: result, stars, best, chips, PLAY AGAIN, BACK TO THE ARCADE
     Kit.starSvg(on)            the star of the end card, filled or empty */
(function () {
  "use strict";

  function hash() { return window.location.hash || ""; }
  function flag(name) { return new RegExp("[#&?]" + name + "(?=$|[&=])").test(hash()); }
  function param(name) {
    var m = hash().match(new RegExp("[#&?]" + name + "=([^&]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, String(v)); } catch (e) { /* private mode */ } }
  };
  function best(key, score) {
    var old = parseFloat(store.get(key));
    var has = isFinite(old);
    var isNew = !has || score > old;
    if (isNew) store.set(key, score);
    return { best: isNew ? score : old, isNew: isNew && has };
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* A word that pops up at (x, y), in px inside `host` (host needs position: relative or absolute). */
  function pop(host, x, y, text, tone) {
    var p = el("div", "k-pop" + (tone && tone !== "good" ? " k-" + tone : ""));
    p.textContent = text;
    p.style.left = x + "px";
    p.style.top = y + "px";
    host.appendChild(p);
    setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1600);
    return p;
  }

  /* ====== the coach ====== */
  var POINTER = '<svg viewBox="0 0 76 52" aria-hidden="true">' +
    '<path d="M4 26 L30 6 L30 17 L66 17 Q72 17 72 23 L72 29 Q72 35 66 35 L30 35 L30 46 Z" fill="#FFC531" stroke="#22314D" stroke-width="4" stroke-linejoin="round"/>' +
    '<path d="M33 22 L64 22" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.8"/></svg>';

  function coach(opts) {
    opts = opts || {};
    var root = opts.root || document.body;
    var labels = opts.labels || {};
    var els = null, cur = null, raf = 0, tapTarget = null, tapFn = null;

    function build() {
      if (els) return;
      els = { veils: [] };
      for (var i = 0; i < 4; i++) {
        var v = el("div", "k-veil");
        v.addEventListener("click", function (e) { e.stopPropagation(); bump(); });
        document.body.appendChild(v);
        els.veils.push(v);
      }
      els.ring = el("div", "k-ring");
      els.hand = el("div", "k-hand", POINTER);
      els.bubble = el("div", "k-bubble");
      els.bubble.setAttribute("role", "dialog");
      els.bubble.setAttribute("aria-live", "polite");
      els.bubble.innerHTML = '<div class="k-bubble-text"></div><div class="k-bubble-row"><span class="k-dots"></span>' +
        '<button type="button" class="k-skip"></button><button type="button" class="k-btn k-next"></button></div>' +
        '<i class="k-tail"></i>';
      els.text = els.bubble.querySelector(".k-bubble-text");
      els.dots = els.bubble.querySelector(".k-dots");
      els.skip = els.bubble.querySelector(".k-skip");
      els.next = els.bubble.querySelector(".k-next");
      els.tail = els.bubble.querySelector(".k-tail");
      els.skip.textContent = labels.skip || "SKIP";
      els.skip.addEventListener("click", skip);
      els.next.addEventListener("click", function () { finish("next"); });
      document.body.appendChild(els.ring);
      document.body.appendChild(els.hand);
      document.body.appendChild(els.bubble);
      document.addEventListener("keydown", onKey, true);
    }

    /* A tap on the veil nudges the ring, so the player sees where to tap. */
    function bump() {
      if (!els || reduced() || !els.ring.animate) return;
      els.ring.animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 300 });
    }

    function onKey(e) {
      if (!cur) return;
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); skip(); return; }
      if (cur.wait === "next" && (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) {
        if (document.activeElement === els.skip) return;
        e.preventDefault();
        e.stopPropagation();
        finish("next");
      }
    }

    function show(on) {
      if (!els) return;
      var d = on ? "" : "none";
      els.veils.forEach(function (v) { v.style.display = d; });
      els.ring.style.display = on && cur && cur.target ? "" : "none";
      els.hand.style.display = on && cur && cur.target && cur.pointer ? "" : "none";
      els.bubble.style.display = d;
    }

    function rect(x1, y1, x2, y2) { return { l: x1, t: y1, r: Math.max(x1, x2), b: Math.max(y1, y2) }; }
    function put(node, r) {
      node.style.left = r.l + "px";
      node.style.top = r.t + "px";
      node.style.width = Math.max(0, r.r - r.l) + "px";
      node.style.height = Math.max(0, r.b - r.t) + "px";
    }

    function place() {
      raf = 0;
      if (!cur || !els) return;
      var R0 = root.getBoundingClientRect();
      var R = { l: Math.max(0, R0.left), t: Math.max(0, R0.top), r: Math.min(window.innerWidth, R0.right),
        b: Math.min(window.innerHeight, R0.bottom) };
      var hole = null;
      if (cur.target && cur.target.isConnected) {
        var t = cur.target.getBoundingClientRect(), p = cur.pad;
        if (t.width && t.height) {
          hole = { l: Math.max(R.l, t.left - p), t: Math.max(R.t, t.top - p),
            r: Math.min(R.r, t.right + p), b: Math.min(R.b, t.bottom + p) };
        }
      }
      if (hole) {
        put(els.veils[0], rect(R.l, R.t, R.r, hole.t));
        put(els.veils[1], rect(R.l, hole.b, R.r, R.b));
        put(els.veils[2], rect(R.l, hole.t, hole.l, hole.b));
        put(els.veils[3], rect(hole.r, hole.t, R.r, hole.b));
        put(els.ring, hole);
        els.ring.style.display = "";
      } else {
        put(els.veils[0], R);
        for (var i = 1; i < 4; i++) put(els.veils[i], rect(0, 0, 0, 0));
        els.ring.style.display = "none";
      }

      /* the bubble: above the target when there is room, else below, else at the top */
      var B = els.bubble, bw = B.offsetWidth, bh = B.offsetHeight, M = 10, G = 20, x, y, side;
      if (!hole) {
        x = R.l + (R.r - R.l - bw) / 2;
        y = R.t + (R.b - R.t - bh) / 2;
        side = "k-mid";
      } else {
        var above = hole.t - R.t, below = R.b - hole.b;
        var wantBelow = cur.place === "below";
        if (!wantBelow && above >= bh + G + M) { y = hole.t - G - bh; side = "k-up"; }
        else if (below >= bh + G + M) { y = hole.b + G; side = "k-down"; }
        else if (above >= bh + G + M) { y = hole.t - G - bh; side = "k-up"; }
        else { y = R.t + M; side = "k-mid"; }
        var cx = (hole.l + hole.r) / 2;
        x = Math.min(Math.max(cx - bw / 2, R.l + M), R.r - bw - M);
        els.tail.style.left = Math.min(Math.max(cx - x - 12, 18), bw - 36) + "px";
      }
      B.classList.remove("k-up", "k-down", "k-mid");
      B.classList.add(side);
      B.style.left = Math.max(R.l + 4, x) + "px";
      B.style.top = Math.max(R.t + 4, y) + "px";

      /* the pointer: beside the target, pointing at it, on the side with room */
      if (hole && cur.pointer) {
        var H = els.hand, hw = 76, hh = 52, cy = (hole.t + hole.b) / 2;
        var right = hole.r + hw + 6 <= R.r || hole.l - hw - 6 < R.l;
        H.classList.toggle("k-flip", !right);
        H.style.left = (right ? hole.r + 4 : hole.l - hw - 4) + "px";
        H.style.top = Math.min(Math.max(cy - hh / 2, R.t), R.b - hh) + "px";
        H.style.display = "";
      } else {
        els.hand.style.display = "none";
      }
      raf = window.requestAnimationFrame(place);
    }

    function clearTap() {
      if (tapTarget && tapFn) tapTarget.removeEventListener("click", tapFn, true);
      tapTarget = null;
      tapFn = null;
    }

    function finish(how) {
      if (!cur) return;
      var c = cur;
      cur = null;
      clearTap();
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      show(false);
      c.resolve(how);
    }

    function skip() {
      var had = !!cur;
      finish("skip");
      if (had && typeof opts.onSkip === "function") opts.onSkip();
    }

    /* One step. s.target: the element to tap or to look at (null: a bubble in the middle). s.text: one line.
       s.wait: 'tap' (wait for a click on the target, which then reaches the game as usual) or 'next' (a NEXT
       button; Enter, Space and the right arrow press it). Resolves with 'tap', 'next' or 'skip'. */
    function step(s) {
      build();
      if (cur) finish("replaced");
      return new Promise(function (resolve) {
        cur = {
          target: s.target || null,
          wait: s.wait === "tap" && s.target ? "tap" : "next",
          pointer: s.pointer != null ? !!s.pointer : (s.wait === "tap"),
          place: s.place || "auto",
          pad: s.pad != null ? s.pad : 8,
          resolve: resolve
        };
        els.text.textContent = s.text || "";
        els.dots.innerHTML = "";
        if (s.count) {
          for (var i = 1; i <= s.count; i++) els.dots.appendChild(el("i", i <= (s.index || 0) ? "on" : ""));
        }
        els.skip.hidden = s.skip === false;
        els.next.hidden = cur.wait !== "next";
        els.next.textContent = s.next || labels.next || "NEXT";
        if (cur.wait === "tap") {
          tapTarget = cur.target;
          tapFn = function () { finish("tap"); };
          tapTarget.addEventListener("click", tapFn, true);
        }
        show(true);
        place();
        try {
          if (cur.wait === "tap") cur.target.focus({ preventScroll: true });
          else els.next.focus({ preventScroll: true });
        } catch (e) { /* focus is a nicety */ }
      });
    }

    function hide() { if (!cur) show(false); }
    function close() {
      finish("closed");
      if (!els) return;
      document.removeEventListener("keydown", onKey, true);
      els.veils.concat([els.ring, els.hand, els.bubble]).forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      els = null;
    }

    return {
      step: step,
      hide: hide,
      close: close,
      isOpen: function () { return !!cur; },
      target: function () { return cur ? cur.target : null; }
    };
  }

  /* ====== the end screen ====== */
  function starSvg(on) {
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3.5l6.2 12.6 13.9 2l-10 9.8 2.4 13.8L24 35.2l-12.4 6.5L14 27.9 4 18.1l13.8-2z" ' +
      'fill="' + (on ? "#FFC531" : "#E3EAF4") + '" stroke="' + (on ? "#B57F00" : "#B9C6D8") + '" stroke-width="3" stroke-linejoin="round"/>' +
      (on ? '<path d="M17 19l4-1" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>' : "") + "</svg>";
  }

  /* opts: title, big, bigTone ('good' or 'bad'), line, stars { have, marks: [three labels] }, best { text, isNew,
     newLabel }, chips [html strings], again { label, onClick }, arcade { label, href }. Returns { el, close }. */
  function endScreen(host, o) {
    o = o || {};
    var wrap = el("div", "k-end");
    var card = el("div", "k-end-card");
    card.setAttribute("role", "dialog");
    wrap.appendChild(card);
    if (o.title) card.appendChild(el("div", "k-end-title")).textContent = o.title;
    if (o.big != null) {
      var big = el("div", "k-end-big" + (o.bigTone === "bad" ? " k-bad" : ""));
      big.textContent = o.big;
      card.appendChild(big);
    }
    if (o.line) card.appendChild(el("div", "k-end-line")).textContent = o.line;
    if (o.stars) {
      var row = el("div", "k-stars");
      for (var i = 0; i < 3; i++) {
        var on = i < (o.stars.have || 0);
        var s = el("div", "k-star" + (on ? " on" : ""), starSvg(on));
        if (o.stars.marks && o.stars.marks[i] != null) s.appendChild(el("span")).textContent = o.stars.marks[i];
        row.appendChild(s);
      }
      card.appendChild(row);
    }
    if (o.best) {
      var b = el("div", "k-end-best");
      b.textContent = o.best.text;
      if (o.best.isNew) b.appendChild(el("b")).textContent = o.best.newLabel || "NEW BEST!";
      card.appendChild(b);
    }
    if (o.chips && o.chips.length) {
      var chips = el("div", "k-chips");
      o.chips.forEach(function (h) { chips.appendChild(el("span", "k-chip", h)); });
      card.appendChild(chips);
    }
    var acts = el("div", "k-end-actions");
    var again = el("button", "k-btn k-btn-big k-again");
    again.type = "button";
    again.textContent = (o.again && o.again.label) || "PLAY AGAIN";
    again.addEventListener("click", function () { if (o.again && o.again.onClick) o.again.onClick(); });
    acts.appendChild(again);
    var back = el("a", "k-btn k-btn-white k-btn-big k-arcade");
    back.href = (o.arcade && o.arcade.href) || "../index.html";
    back.textContent = (o.arcade && o.arcade.label) || "BACK TO THE ARCADE";
    acts.appendChild(back);
    card.appendChild(acts);
    host.appendChild(wrap);
    try { again.focus({ preventScroll: true }); } catch (e) { /* nicety */ }
    return {
      el: wrap,
      close: function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }
    };
  }

  window.Kit = {
    flag: flag, param: param, reduced: reduced, store: store, best: best, pop: pop,
    coach: coach, endScreen: endScreen, starSvg: starSvg
  };
})();
