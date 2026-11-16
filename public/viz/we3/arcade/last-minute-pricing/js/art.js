/* art.js: the pictures of Last-Minute Pricing's little airport, as inline SVG strings (window.LMArt). Flat,
   saturated, light, drawn like Old Bessie's town (../../repair-or-replace/js/art.js): ink outlines, round shapes.
   The plane faces right; its five windows each show a seat, and a passenger's face once the seat is sold. PREMIUM
   is blue and STANDARD amber, the colours of the price tags in the FS26 game. */
(function () {
  "use strict";
  var INK = "#22314D";
  var PRICE = { premium: "#2F6CB1", standard: "#EE8A12" };
  var PRICE_DARK = { premium: "#1C4B82", standard: "#A85C00" };
  var LIVERY = "#F2655A", LIVERY_DARK = "#C4473D", SEAT = "#33B5A5", SEAT_DARK = "#23877B";

  /* The passengers: skin, hair, shirt. Passenger n wears PAX[n % PAX.length], at the counter and in the cabin. */
  var PAX = [
    { skin: "#FFD8B5", hair: "#5A3A22", shirt: "#E85D75" },
    { skin: "#C98B5E", hair: "#2B2B2B", shirt: "#4AA3DF" },
    { skin: "#F2C29B", hair: "#F2B33D", shirt: "#7BC96F" },
    { skin: "#8D5A3B", hair: "#1F1A17", shirt: "#B07BE0" },
    { skin: "#FFE0C7", hair: "#C65A2E", shirt: "#F2A33A" },
    { skin: "#E8B48C", hair: "#8E8E99", shirt: "#3DC1B3" },
    { skin: "#B97A50", hair: "#4A2C1A", shirt: "#FF7FA8" }
  ];
  function pax(n) { return PAX[((n % PAX.length) + PAX.length) % PAX.length]; }

  /* windows of the cabin, in the plane's viewBox 420 x 180 */
  var WIN_X = [150, 194, 238, 282, 326], WIN_Y = 96, WIN_R = 18;
  var BODY = "M64 64 H330 C372 64 398 84 406 104 C410 116 402 128 386 132 C376 135 360 136 340 136 H64 C44 136 28 120 28 100 C28 80 44 64 64 64 Z";

  function wheel(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2A3550"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.42) + '" fill="#C4CEDD"/>';
  }

  /* A seated passenger, seen through window i (centre cx, cy): head and shoulders, smiling at you. */
  function seated(n, cx, cy) {
    var p = pax(n);
    return '<path d="M' + (cx - 15) + ' ' + (cy + 20) + ' q0 -11 15 -11 q15 0 15 11 z" fill="' + p.shirt + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + (cy - 1) + '" r="9.5" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + (cx - 9.5) + ' ' + (cy - 2) + ' q0 -10 9.5 -10 q9.5 0 9.5 10 q-4 -5 -9.5 -4 q-6 0 -9.5 4 z" fill="' + p.hair + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="' + (cx - 3.5) + '" cy="' + cy + '" r="1.5" fill="' + INK + '"/><circle cx="' + (cx + 3.5) + '" cy="' + cy + '" r="1.5" fill="' + INK + '"/>' +
      '<path d="M' + (cx - 3) + ' ' + (cy + 3.5) + ' q3 3 6 0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<circle cx="' + (cx - 6) + '" cy="' + (cy + 3) + '" r="1.8" fill="#FF8FA3" opacity="0.7"/><circle cx="' + (cx + 6) + '" cy="' + (cy + 3) + '" r="1.8" fill="#FF8FA3" opacity="0.7"/>';
  }

  /* The plane, viewBox 420 x 180, facing right. Window i is g.lm-win[data-i=i]; its passenger goes into its
     g.lm-pax (LMArt.seated), and a red ring (circle.lm-win-x) shows round it with the class .empty at takeoff. The
     door's leaf (g.lm-door-leaf) slides open with the class .open on the plane box. */
  function plane() {
    var wins = "", clips = "";
    for (var i = 0; i < WIN_X.length; i++) {
      var x = WIN_X[i];
      clips += '<clipPath id="lm-win-' + i + '"><circle cx="' + x + '" cy="' + WIN_Y + '" r="' + (WIN_R - 1.5) + '"/></clipPath>';
      wins += '<g class="lm-win" data-i="' + i + '">' +
        '<g clip-path="url(#lm-win-' + i + ')">' +
          '<circle cx="' + x + '" cy="' + WIN_Y + '" r="' + WIN_R + '" fill="#FFF1D6"/>' +
          '<rect x="' + (x - 12) + '" y="' + (WIN_Y - 2) + '" width="24" height="26" rx="8" fill="' + SEAT + '" stroke="' + SEAT_DARK + '" stroke-width="2"/>' +
          '<rect x="' + (x - 8) + '" y="' + WIN_Y + '" width="16" height="6" rx="3" fill="#FFFFFF" opacity="0.75"/>' +
          '<g class="lm-pax"></g>' +
        '</g>' +
        '<circle cx="' + x + '" cy="' + WIN_Y + '" r="' + WIN_R + '" fill="none" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<path d="M' + (x - 12) + ' ' + (WIN_Y - 7) + ' a13 13 0 0 1 7 -7" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>' +
        '<circle class="lm-win-x" cx="' + x + '" cy="' + WIN_Y + '" r="' + (WIN_R + 5) + '" fill="none" stroke="#E0452F" stroke-width="4.5"/>' +
        '</g>';
    }
    return '<svg class="lm-plane-svg" viewBox="0 0 420 180" aria-hidden="true"><defs>' + clips +
      '<clipPath id="lm-body"><path d="' + BODY + '"/></clipPath></defs>' +
      '<ellipse cx="225" cy="174" rx="178" ry="6" fill="' + INK + '" opacity="0.16"/>' +
      /* the tail fin */
      '<path d="M50 74 L30 16 Q28 7 37 7 L64 7 Q72 7 76 14 L114 74 Z" fill="' + LIVERY + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M58 22 l3.2 7.4 7.8 0.8 -5.9 5.2 1.7 7.7 -6.8 -4 -6.8 4 1.7 -7.7 -5.9 -5.2 7.8 -0.8z" fill="#FFFFFF"/>' +
      /* the body, its belly and its stripe */
      '<path d="' + BODY + '" fill="#FFFFFF"/>' +
      '<g clip-path="url(#lm-body)"><rect x="20" y="121" width="400" height="20" fill="#E6ECF5"/>' +
        '<rect x="20" y="112" width="400" height="7" fill="' + LIVERY + '"/></g>' +
      /* the cockpit window */
      '<path d="M350 78 H376 Q392 84 400 100 H350 Q344 100 344 94 V84 Q344 78 350 78 Z" fill="#C8ECFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M353 95 l7 -12 M361 95 l4 -7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>' +
      /* the door: a dark doorway behind a leaf that slides open */
      '<rect x="100" y="72" width="24" height="56" rx="7" fill="#3E4A63" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="lm-door-leaf"><rect x="100" y="72" width="24" height="56" rx="7" fill="#F4F7FB" stroke="' + INK + '" stroke-width="3"/>' +
        '<circle cx="112" cy="88" r="5" fill="#C8ECFF" stroke="' + INK + '" stroke-width="2"/></g>' +
      wins +
      /* the outline on top */
      '<path d="' + BODY + '" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      /* the wing, the engine, the wheels */
      '<path d="M204 118 L292 118 L240 158 L176 158 Z" fill="#DCE5F1" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<rect x="214" y="140" width="58" height="22" rx="11" fill="#F4F7FB" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="270" cy="151" rx="5" ry="9" fill="#9AA7BC" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M226 162 V164 M372 134 V160" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      wheel(226, 166, 8) + wheel(372, 166, 8) +
      '</svg>';
  }

  /* A passenger on foot, facing right, viewBox 60 x 100: a rolling suitcase behind, legs that walk (.lm-leg). */
  function walker(n, sad) {
    var p = pax(n);
    var mouth = sad ? '<path d="M28 33 q4 -3 8 0" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>'
      : '<path d="M28 31 q4 4 8 0" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 60 100" aria-hidden="true">' +
      '<ellipse cx="32" cy="97" rx="22" ry="3" fill="' + INK + '" opacity="0.18"/>' +
      '<path d="M8 66 L18 56" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="1" y="64" width="16" height="24" rx="4" fill="#5B7BD5" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M4 72 h10" stroke="#FFFFFF" stroke-width="2" opacity="0.7"/>' +
      '<circle cx="5" cy="91" r="3" fill="' + INK + '"/><circle cx="13" cy="91" r="3" fill="' + INK + '"/>' +
      '<g class="lm-leg lm-leg-a"><rect x="24" y="72" width="8" height="22" rx="4" fill="#3E4A63"/></g>' +
      '<g class="lm-leg lm-leg-b"><rect x="33" y="72" width="8" height="22" rx="4" fill="#4E5D7A"/></g>' +
      '<rect x="19" y="44" width="27" height="34" rx="11" fill="' + p.shirt + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M20 58 Q14 60 17 56" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="25" r="17" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M15 25 q0 -18 17 -18 q17 0 17 16 q-7 -7 -17 -6 q-10 0 -17 8 z" fill="' + p.hair + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<circle cx="31" cy="26" r="2.1" fill="' + INK + '"/><circle cx="40" cy="26" r="2.1" fill="' + INK + '"/>' +
      '<circle cx="26" cy="31" r="2.6" fill="#FF8FA3" opacity="0.6"/><circle cx="44" cy="30" r="2.4" fill="#FF8FA3" opacity="0.6"/>' +
      mouth + '</svg>';
  }

  /* The gate counter, viewBox 220 x 150: the gate agent behind a desk, GATE 4 on the desk. */
  function counter() {
    return '<svg viewBox="0 0 220 150" aria-hidden="true">' +
      '<ellipse cx="110" cy="146" rx="104" ry="4" fill="' + INK + '" opacity="0.14"/>' +
      /* the agent */
      '<path d="M70 92 q0 -24 34 -24 q34 0 34 24 z" fill="#2F6CB1" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M98 70 l6 10 l6 -10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="104" cy="50" r="19" fill="#F2C29B" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M84 44 q2 -18 20 -18 q18 0 20 18 z" fill="#2F6CB1" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="80" y="40" width="48" height="7" rx="3.5" fill="#1C4B82" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="104" cy="33" r="4" fill="#FFC531" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<circle cx="97" cy="53" r="2.2" fill="' + INK + '"/><circle cx="111" cy="53" r="2.2" fill="' + INK + '"/>' +
      '<path d="M98 60 q6 5 12 0" fill="none" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/>' +
      '<circle cx="91" cy="58" r="3" fill="#FF8FA3" opacity="0.6"/><circle cx="117" cy="58" r="3" fill="#FF8FA3" opacity="0.6"/>' +
      /* the desk */
      '<rect x="8" y="84" width="204" height="14" rx="6" fill="#A7714A" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<rect x="16" y="96" width="188" height="48" rx="8" fill="#FBE7C6" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<rect x="64" y="106" width="92" height="28" rx="8" fill="' + LIVERY + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<text x="110" y="127" text-anchor="middle" class="lm-desk-sign">GATE 4</text>' +
      '<path d="M156 84 v-10 h16 v10" fill="#DCE5F1" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<circle cx="40" cy="80" r="6" fill="#FFC531" stroke="' + INK + '" stroke-width="2.5"/><rect x="38" y="70" width="4" height="5" rx="2" fill="' + INK + '"/>' +
      '</svg>';
  }

  /* The steps up to the plane's door, viewBox 84 x 46: the box of .lm-stairs in the plane's units (x 40 to 124,
     y 128 to 174), so the platform at the top right meets the door. The handrail rises above the box. */
  function stairs() {
    var treads = "";
    for (var i = 0; i < 4; i++) {
      var xc = 13 + i * 11, y = 46 - (xc - 2) * 44 / 54;
      treads += '<rect x="' + (xc - 7) + '" y="' + (y - 2.5).toFixed(1) + '" width="14" height="4" rx="1.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 84 46" aria-hidden="true">' +
      '<path d="M2 46 L56 2 H84 V9 H61 L14 46 Z" fill="#FFC531" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      treads +
      '<rect x="55" y="-1" width="29" height="5" rx="2" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M5 27 L55 -15 H82" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M15 36 V18.6 M35 19 V1.8 M55 2 V-15 M81 0 V-15" stroke="' + INK + '" stroke-width="2"/>' +
      '</svg>';
  }

  /* The control tower, viewBox 60 x 160. */
  function tower() {
    return '<svg viewBox="0 0 60 160" aria-hidden="true">' +
      '<path d="M30 2 V16" stroke="' + INK + '" stroke-width="3"/><circle cx="30" cy="4" r="3.5" fill="' + LIVERY + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M22 60 L18 158 H42 L38 60 Z" fill="#F4F7FB" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M21 90 H39 M20 120 H40" stroke="#C4CEDD" stroke-width="3"/>' +
      '<path d="M6 30 H54 L48 58 H12 Z" fill="#8FD3FF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M18 32 V56 M30 32 V56 M42 32 V56" stroke="' + INK + '" stroke-width="2"/>' +
      '<rect x="2" y="16" width="56" height="14" rx="5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="10" y="58" width="40" height="8" rx="3" fill="#DCE5F1" stroke="' + INK + '" stroke-width="3"/>' +
      '</svg>';
  }

  /* A windsock on its pole, viewBox 70 x 90. */
  function windsock() {
    return '<svg viewBox="0 0 70 90" aria-hidden="true">' +
      '<path d="M8 6 V88" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g class="lm-sock"><path d="M10 8 L64 16 L62 28 L10 34 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M10 8 L24 10 L24 33 L10 34 Z M37 12 L50 14 L50 30 L37 31 Z" fill="' + LIVERY + '"/>' +
      '<path d="M10 8 L64 16 L62 28 L10 34 Z" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/></g>' +
      '</svg>';
  }

  function tumbleweed() {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#B0844F" stroke-width="2.4" stroke-linecap="round">' +
      '<circle cx="20" cy="20" r="16"/><path d="M6 14 q14 10 28 -2 M8 28 q10 -14 26 -6 M14 6 q4 16 -2 28 M26 6 q-6 14 4 28"/></g>' +
      '<circle cx="20" cy="20" r="16" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity="0.35"/></svg>';
  }

  function cloud() {
    return '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M24 62 q-20 0 -20 -16 q0 -16 20 -16 q2 -22 28 -22 q18 0 26 14 q8 -10 22 -8 q22 4 20 24 q20 0 20 12 q0 12 -18 12 z" fill="#FFFFFF"/></svg>';
  }
  function hills() {
    return '<svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 60 Q50 20 110 48 T230 40 T340 46 T400 36 V100 H0 Z" fill="#B9E79A"/>' +
      '<path d="M0 78 Q70 48 140 72 T280 66 T400 70 V100 H0 Z" fill="#8FD67A"/></svg>';
  }

  /* ---- icons (HUD, buttons, chips) ---- */
  function coin() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#FFC531" stroke="#B57F00" stroke-width="3"/>' +
      '<circle cx="16" cy="16" r="9" fill="none" stroke="#FFE38A" stroke-width="2"/>' +
      '<text x="16" y="21.5" text-anchor="middle" font-size="15" font-family="Lilita One, sans-serif" fill="#B57F00">$</text></svg>';
  }
  function calendar() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="24" height="21" rx="4" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M4 13 h24" stroke="' + INK + '" stroke-width="3"/><rect x="5.5" y="8.5" width="21" height="4" fill="#D33A2C"/>' +
      '<path d="M10 4 v6 M22 4 v6" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="11" cy="19" r="1.8" fill="' + INK + '"/><circle cx="16" cy="19" r="1.8" fill="' + INK + '"/><circle cx="21" cy="19" r="1.8" fill="' + INK + '"/>' +
      '<circle cx="11" cy="24" r="1.8" fill="' + INK + '"/></svg>';
  }
  function seatIcon() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="8" y="3" width="15" height="21" rx="6" fill="' + SEAT + '" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<rect x="10.5" y="5" width="10" height="4" rx="2" fill="#FFFFFF" opacity="0.8"/>' +
      '<rect x="5" y="20" width="22" height="7" rx="3.5" fill="' + SEAT_DARK + '" stroke="' + INK + '" stroke-width="2.6"/>' +
      '<path d="M10 27 v3 M22 27 v3" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/></svg>';
  }
  function paxIcon(n) {
    var p = pax(n || 0);
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 31 q0 -12 11 -12 q11 0 11 12 z" fill="' + p.shirt + '" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<circle cx="16" cy="12" r="8" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="2.4"/>' +
      '<path d="M8 11 q0 -8 8 -8 q8 0 8 8 q-4 -3 -8 -3 q-5 0 -8 3 z" fill="' + p.hair + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/></svg>';
  }
  function crown() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18 L4.5 7.5 L9 11.5 L12 5 L15 11.5 L19.5 7.5 L21 18 Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<rect x="3.5" y="18.5" width="17" height="2.6" rx="1.3" fill="currentColor"/></svg>';
  }
  function ticket() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7 Q3 5 5 5 H19 Q21 5 21 7 V9.5 Q18.5 9.5 18.5 12 Q18.5 14.5 21 14.5 V17 Q21 19 19 19 H5 Q3 19 3 17 V14.5 Q5.5 14.5 5.5 12 Q5.5 9.5 3 9.5 Z" fill="currentColor"/>' +
      '<path d="M9 8 V16" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="1.6 1.6"/></svg>';
  }
  function planeIcon() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 18 L8 18 L11 13 L14 13 L12 18 L22 18 Q29 18 29 21 Q29 23 22 23 L6 23 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M14 23 L18 28 L21 28 L19 23" fill="#DCE5F1" stroke="' + INK + '" stroke-width="2.2" stroke-linejoin="round"/><rect x="5" y="19.5" width="20" height="2" fill="' + LIVERY + '"/></svg>';
  }
  function sparkle(color) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.4 7.1 7.1 2.4 -7.1 2.4 -2.4 7.1 -2.4 -7.1 -7.1 -2.4 7.1 -2.4z" fill="' + (color || "#FFC531") + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  function priceIcon(id) { return id === "premium" ? crown() : ticket(); }

  window.LMArt = {
    INK: INK, PRICE: PRICE, PRICE_DARK: PRICE_DARK, LIVERY: LIVERY, SEAT: SEAT, PAX: PAX,
    WIN_X: WIN_X, WIN_Y: WIN_Y,
    plane: plane, seated: seated, walker: walker, counter: counter, stairs: stairs, tower: tower, windsock: windsock,
    tumbleweed: tumbleweed, cloud: cloud, hills: hills,
    coin: coin, calendar: calendar, seatIcon: seatIcon, paxIcon: paxIcon, crown: crown, ticket: ticket,
    planeIcon: planeIcon, sparkle: sparkle, priceIcon: priceIcon
  };
})();
