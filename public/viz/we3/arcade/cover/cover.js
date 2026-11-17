/* cover.js: what every concept of the cover does (design round of 2026-11-17).
   The pictures: an element with data-scene="bessie|anymal|pricing|battle" gets CoverArt.scene, data-hero the same
   names CoverArt.hero (data-text="off" leaves the letters out of the drawings); data-art="cloud" (or "fn:arg") gets CoverArt[fn](arg).
   The selection: the first game is selected at start (class is-sel on its a.cart, data-sel on body), as the cursor
   of a game menu sits on its first item. The arrow keys move the selection and the focus; a pointer over a game
   selects it; Enter or Space with no game in focus opens the selected game; Enter on a game in focus is the link's
   own. Each change sends the event "cover:select" with detail { index, focus }. */
(function () {
  "use strict";
  var A = window.CoverArt;
  [].forEach.call(document.querySelectorAll("[data-scene]"), function (el) {
    el.innerHTML = A.scene(el.getAttribute("data-scene"), { text: el.getAttribute("data-text") !== "off" });
  });
  [].forEach.call(document.querySelectorAll("[data-hero]"), function (el) {
    el.innerHTML = A.hero(el.getAttribute("data-hero"), { text: el.getAttribute("data-text") !== "off" });
  });
  [].forEach.call(document.querySelectorAll("[data-art]"), function (el) {
    var p = el.getAttribute("data-art").split(":"), fn = A[p[0]];
    if (fn) el.innerHTML = fn(p[1] === undefined ? undefined : (isNaN(+p[1]) ? p[1] : +p[1]));
  });

  var carts = [].slice.call(document.querySelectorAll("a.cart"));
  var sel = 0, body = document.body;
  function show(i, focus) {
    sel = (i + carts.length) % carts.length;
    carts.forEach(function (c, k) { c.classList.toggle("is-sel", k === sel); });
    body.setAttribute("data-sel", String(sel));
    if (focus && document.activeElement !== carts[sel]) carts[sel].focus();
    document.dispatchEvent(new CustomEvent("cover:select", { detail: { index: sel, focus: !!focus } }));
  }
  carts.forEach(function (c, k) {
    c.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse" && k !== sel) show(k, false); });
    c.addEventListener("focus", function () { if (k !== sel) show(k, false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    var cur = carts.indexOf(document.activeElement);
    if (step) { show((cur < 0 ? sel : cur) + step, true); e.preventDefault(); return; }
    var free = !document.activeElement || document.activeElement === body || document.activeElement === document.documentElement;
    if ((e.key === "Enter" || e.key === " ") && cur < 0 && free) { e.preventDefault(); carts[sel].click(); }
    else if (e.key === " " && cur >= 0) { e.preventDefault(); carts[cur].click(); }
  });
  show(0, false);
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add("ready"); }); });
})();
