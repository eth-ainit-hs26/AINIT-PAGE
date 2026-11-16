/* art.js: the pictures of Old Bessie's town, as inline SVG strings (window.OBArt). Flat, saturated, light.
   The van is coloured by her wear with the colours of the slides (02_old_bessie/source/game/art.js: wear,
   wearDark), and her wear shows as scratches (WORN), a plaster and a dent (SHAKY), rust and a cracked window
   (FAILING). The garage is amber like SERVICE and the dealer red like REPLACE (js/actions.js). */
(function () {
  "use strict";
  var INK = "#22314D";
  var WEAR = ["#2E8B57", "#C99A33", "#E07A2A", "#D33A2C"];
  var WEAR_DARK = ["#1E6B40", "#9C7417", "#B85A16", "#9E2A20"];
  var WEAR_TEXT = ["#2E8B57", "#9C7417", "#C25F14", "#D33A2C"];
  var CALL = { run: "#1666C8", service: "#E08A00", replace: "#D33A2C" };

  function wheel(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="ob-wheel">' +
      '<circle r="16" fill="#2A3550"/><circle r="7.5" fill="#DCE4F0"/>' +
      '<path d="M0 -7.5 V7.5 M-7.5 0 H7.5" stroke="#2A3550" stroke-width="2.6"/></g></g>';
  }

  /* Old Bessie, facing right, viewBox 200 x 112. wear 0 to 3. */
  function van(wear, name) {
    var w = Math.max(0, Math.min(3, wear | 0)), body = WEAR[w], dark = WEAR_DARK[w];
    var s = '<svg class="ob-van-svg" viewBox="0 0 200 112" aria-hidden="true">' +
      '<ellipse cx="104" cy="105" rx="88" ry="6" fill="' + INK + '" opacity="0.16"/>' +
      '<g class="ob-body">' +
      '<rect x="4" y="80" width="20" height="8" rx="4" fill="#8A97AD" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="16" y="14" width="118" height="74" rx="14" fill="' + body + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="20" y="18" width="110" height="9" rx="4.5" fill="' + dark + '" opacity="0.55"/>' +
      '<path d="M132 34 h28 q10 0 16 9 l14 22 q3 5 3 10 v9 q0 4 -4 4 h-57 z" fill="' + body + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M142 41 h17 q6 0 10 6 l10 16 h-37 z" fill="#C8ECFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M147 46 l5 0 l-4 12" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="186" cy="72" r="5" fill="' + (w === 3 ? "#9AA3B5" : "#FFE36B") + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="178" y="84" width="20" height="8" rx="4" fill="#C4CEDD" stroke="' + INK + '" stroke-width="3"' +
        (w === 3 ? ' transform="rotate(8 188 88)"' : "") + '/>' +
      '<rect x="27" y="38" width="96" height="30" rx="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<text x="75" y="61" text-anchor="middle" class="ob-van-name">' + (name || "BESSIE") + '</text>';
    if (w >= 1) {
      s += '<path d="M30 80 l12 -5 M36 84 l14 -6 M108 30 l10 -4" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" opacity="0.55"/>' +
        '<circle cx="70" cy="84" r="3.5" fill="#8B6A43"/><circle cx="78" cy="82" r="2.5" fill="#8B6A43"/><circle cx="168" cy="86" r="3" fill="#8B6A43"/>';
    }
    if (w >= 2) {
      s += '<g transform="rotate(-18 104 30)"><rect x="92" y="23" width="26" height="12" rx="5" fill="#F6D7A8" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="101" y="23" width="8" height="12" fill="#EBC28A"/><circle cx="96" cy="29" r="1.3" fill="' + INK + '"/><circle cx="114" cy="29" r="1.3" fill="' + INK + '"/></g>' +
        '<path d="M148 70 q6 -6 12 0" fill="none" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>';
    }
    if (w >= 3) {
      s += '<path d="M24 74 q6 -7 13 -2 q5 5 0 10 q-8 3 -13 -8z" fill="#8E4A26" opacity="0.85"/>' +
        '<path d="M118 76 q7 -5 12 1 q2 6 -5 8 q-8 0 -7 -9z" fill="#8E4A26" opacity="0.85"/>' +
        '<path d="M156 44 l4 6 l-3 4 l5 6" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    s += '</g>' + wheel(48, 90) + wheel(158, 90) + '</svg>';
    return s;
  }

  /* The tow truck, facing left (it pulls Old Bessie back by her rear), viewBox 200 x 112. */
  function tow() {
    return '<svg viewBox="0 0 200 112" aria-hidden="true">' +
      '<ellipse cx="100" cy="105" rx="88" ry="6" fill="' + INK + '" opacity="0.16"/>' +
      '<path d="M150 62 L182 26" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M150 62 L182 26" stroke="#FFC531" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M182 26 L194 30 L194 54 q0 6 -6 6 q-5 0 -5 -5" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="62" y="56" width="120" height="32" rx="7" fill="#FFC531" stroke="' + INK + '" stroke-width="4"/>' +
      '<text x="122" y="80" text-anchor="middle" class="ob-tow-name">TOW</text>' +
      '<path d="M72 88 H16 q-4 0 -4 -4 v-14 q0 -6 4 -10 l14 -20 q5 -6 12 -6 h30 z" fill="#FFC531" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M62 40 h-17 q-5 0 -8 4 l-10 15 h35 z" fill="#C8ECFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<rect x="36" y="22" width="24" height="9" rx="4.5" class="ob-beacon" fill="#FF7A2F" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="16" cy="72" r="4.5" fill="#FFE36B" stroke="' + INK + '" stroke-width="3"/>' +
      wheel(40, 90) + wheel(152, 90) + '</svg>';
  }

  /* The garage (SERVICE), viewBox 240 x 200; the roll-up door is g.ob-door. */
  function garage() {
    var slats = "";
    for (var y = 112; y < 196; y += 12) slats += '<line x1="40" y1="' + y + '" x2="200" y2="' + y + '" stroke="#A9B5C8" stroke-width="3"/>';
    return '<svg viewBox="0 0 240 200" aria-hidden="true">' +
      '<rect x="10" y="40" width="220" height="158" rx="12" fill="#FBE7C6" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="4" y="26" width="232" height="24" rx="9" fill="#A7714A" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="36" y="54" width="168" height="40" rx="11" fill="' + CALL.service + '" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<text x="120" y="84" text-anchor="middle" class="ob-sign">GARAGE</text>' +
      '<rect x="34" y="100" width="172" height="98" rx="6" fill="#3E4A63" stroke="' + INK + '" stroke-width="4"/>' +
      '<g class="ob-door"><rect x="38" y="104" width="164" height="92" fill="#D7DFEA"/>' + slats +
        '<rect x="106" y="182" width="28" height="7" rx="3.5" fill="#8A97AD"/></g>' +
      '<g transform="translate(214 166)"><circle r="14" fill="#2A3550"/><circle r="6" fill="#8A97AD"/></g>' +
      '<g transform="translate(214 140)"><circle r="14" fill="#2A3550"/><circle r="6" fill="#8A97AD"/></g>' +
      '</svg>';
  }

  /* The van dealer (REPLACE), viewBox 260 x 200: bunting, balloons, a shiny van in the window. */
  function dealer() {
    var flags = "", cols = ["#FFC531", "#1666C8", "#2FB463", "#D33A2C", "#B06BFF"];
    for (var i = 0; i < 9; i++) {
      var x = 20 + i * 26;
      flags += '<path d="M' + x + ' 46 l12 0 l-6 12 z" fill="' + cols[i % cols.length] + '" stroke="' + INK + '" stroke-width="2"/>';
    }
    return '<svg viewBox="0 0 260 200" aria-hidden="true">' +
      '<path d="M226 30 q-6 -14 4 -24" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
      '<ellipse cx="231" cy="-2" rx="11" ry="13" fill="#B06BFF" stroke="' + INK + '" stroke-width="3" transform="translate(0 10)"/>' +
      '<path d="M238 30 q8 -12 2 -20" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
      '<rect x="10" y="40" width="240" height="158" rx="12" fill="#FFFFFF" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="4" y="26" width="252" height="24" rx="9" fill="' + CALL.replace + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M14 46 Q130 54 246 46" fill="none" stroke="' + INK + '" stroke-width="2"/>' + flags +
      '<rect x="40" y="62" width="180" height="40" rx="11" fill="' + CALL.replace + '" stroke="' + INK + '" stroke-width="3.5"/>' +
      '<text x="130" y="92" text-anchor="middle" class="ob-sign">NEW VANS</text>' +
      '<rect x="34" y="108" width="192" height="90" rx="6" fill="#CBEFFF" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M60 118 l-18 30 M80 118 l-24 40" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.8"/>' +
      '<g transform="translate(128 140) scale(0.42)">' +
        '<rect x="16" y="14" width="118" height="74" rx="14" fill="' + WEAR[0] + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<path d="M132 34 h28 q10 0 16 9 l14 22 q3 5 3 10 v9 q0 4 -4 4 h-57 z" fill="' + WEAR[0] + '" stroke="' + INK + '" stroke-width="6"/>' +
        '<circle cx="48" cy="90" r="16" fill="#2A3550"/><circle cx="158" cy="90" r="16" fill="#2A3550"/></g>' +
      '<path d="M120 122 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3z" fill="#FFC531"/>' +
      '<path d="M206 126 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2z" fill="#FFC531"/>' +
      '</svg>';
  }

  function cloud() {
    return '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M24 62 q-20 0 -20 -16 q0 -16 20 -16 q2 -22 28 -22 q18 0 26 14 q8 -10 22 -8 q22 4 20 24 q20 0 20 12 q0 12 -18 12 z" fill="#FFFFFF"/></svg>';
  }
  function tree(shade) {
    var c = shade ? "#3FA65A" : "#55C26E", d = shade ? "#2F8A49" : "#3FA65A";
    return '<svg viewBox="0 0 60 90" aria-hidden="true"><rect x="25" y="52" width="10" height="36" rx="4" fill="#9A6A3C" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="30" cy="34" r="26" fill="' + c + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="21" cy="26" r="7" fill="#FFFFFF" opacity="0.28"/><path d="M14 44 q16 10 32 0" fill="none" stroke="' + d + '" stroke-width="3" stroke-linecap="round"/></svg>';
  }
  function hills() {
    return '<svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 60 Q50 20 110 48 T230 40 T340 46 T400 36 V100 H0 Z" fill="#B9E79A"/>' +
      '<path d="M0 78 Q70 48 140 72 T280 66 T400 70 V100 H0 Z" fill="#8FD67A"/></svg>';
  }
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
  function heart() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 28 C6 20 3 15 3 10.5 C3 6.5 6 4 9.5 4 C12.5 4 14.5 6 16 8 C17.5 6 19.5 4 22.5 4 C26 4 29 6.5 29 10.5 C29 15 26 20 16 28 z" fill="#FF6B7A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M8 10 q1 -3 4 -3" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/></svg>';
  }
  function sparkle(color) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l2.4 7.1 7.1 2.4 -7.1 2.4 -2.4 7.1 -2.4 -7.1 -7.1 -2.4 7.1 -2.4z" fill="' + (color || "#FFC531") + '" stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  }
  function warn() {
    return '<svg viewBox="0 0 48 44" aria-hidden="true"><path d="M24 3 L45 40 H3 Z" fill="#FFC531" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M24 15 v12" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="33.5" r="3" fill="' + INK + '"/></svg>';
  }
  function smoke() {
    return '<svg viewBox="0 0 100 70" aria-hidden="true"><g fill="#B7BFCC" stroke="#8D97A8" stroke-width="3">' +
      '<circle cx="30" cy="44" r="20"/><circle cx="56" cy="30" r="24"/><circle cx="78" cy="46" r="18"/></g></svg>';
  }

  window.OBArt = {
    INK: INK, WEAR: WEAR, WEAR_DARK: WEAR_DARK, WEAR_TEXT: WEAR_TEXT, CALL: CALL,
    van: van, tow: tow, garage: garage, dealer: dealer, cloud: cloud, tree: tree, hills: hills,
    coin: coin, calendar: calendar, heart: heart, sparkle: sparkle, warn: warn, smoke: smoke
  };
})();
