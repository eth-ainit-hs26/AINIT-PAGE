/* art.js: the pictures of the cover as inline SVG strings (window.CoverArt). Flat, saturated, light, ink outlines.
   Copied on 2026-11-17 from the three redesigned games, drawings unchanged unless noted: the van and the garage from
   repair-or-replace/js/art.js; the dog, the ghosts, the bone, the kennel, the trees, bushes and flowers from
   anymal/js/art.js; the plane (with its passengers), the tower and the windsock from last-minute-pricing/js/art.js.
   Changes: text inside a drawing is optional (opts.text false leaves the sign blank), each plane gets ids of its own,
   the kennel's sign is set larger. New and original: the two creatures of the battle game (a blue chick and a lilac
   bunny, generic animals), their health bars and the four scenes (CoverArt.scene). */
(function () {
  "use strict";
  var INK = "#22314D";
  var uid = 0;

  /* put an art string (an <svg> with a viewBox) at x, y with size w x h inside a parent svg */
  function place(svg, x, y, w, h) {
    return svg.replace(/^<svg /, '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" overflow="visible" ');
  }
  function T(x, y, size, text, extra) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + size + '" class="cv-t"' + (extra || "") + '>' + text + '</text>';
  }

  /* ==== Old Bessie ==== */
  function wheel(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><g class="cv-wheel">' +
      '<circle r="16" fill="#2A3550"/><circle r="7.5" fill="#DCE4F0"/>' +
      '<path d="M0 -7.5 V7.5 M-7.5 0 H7.5" stroke="#2A3550" stroke-width="2.6"/></g></g>';
  }
  /* Old Bessie, HEALTHY, facing right, viewBox 200 x 112 */
  function van(opts) {
    var o = opts || {}, body = "#2E8B57", dark = "#1E6B40";
    return '<svg class="cv-van" viewBox="0 0 200 112" aria-hidden="true">' +
      '<ellipse cx="104" cy="105" rx="88" ry="6" fill="' + INK + '" opacity="0.16"/>' +
      '<g class="cv-van-body">' +
      '<rect x="4" y="80" width="20" height="8" rx="4" fill="#8A97AD" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="16" y="14" width="118" height="74" rx="14" fill="' + body + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="20" y="18" width="110" height="9" rx="4.5" fill="' + dark + '" opacity="0.55"/>' +
      '<path d="M132 34 h28 q10 0 16 9 l14 22 q3 5 3 10 v9 q0 4 -4 4 h-57 z" fill="' + body + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M142 41 h17 q6 0 10 6 l10 16 h-37 z" fill="#C8ECFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M147 46 l5 0 l-4 12" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="186" cy="72" r="5" fill="#FFE36B" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="178" y="84" width="20" height="8" rx="4" fill="#C4CEDD" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="27" y="38" width="96" height="30" rx="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      (o.text === false ? "" : T(75, 61, 22, "BESSIE")) +
      '</g>' + wheel(48, 90) + wheel(158, 90) + '</svg>';
  }
  /* the garage, viewBox 240 x 200 */
  function garage(opts) {
    var o = opts || {}, slats = "";
    for (var y = 112; y < 196; y += 12) slats += '<line x1="40" y1="' + y + '" x2="200" y2="' + y + '" stroke="#A9B5C8" stroke-width="3"/>';
    return '<svg viewBox="0 0 240 200" aria-hidden="true">' +
      '<rect x="10" y="40" width="220" height="158" rx="12" fill="#FBE7C6" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="4" y="26" width="232" height="24" rx="9" fill="#A7714A" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="36" y="54" width="168" height="40" rx="11" fill="#E08A00" stroke="' + INK + '" stroke-width="3.5"/>' +
      (o.text === false ? "" : T(120, 84, 27, "GARAGE", ' fill="#FFFFFF" letter-spacing="1"')) +
      '<rect x="34" y="100" width="172" height="98" rx="6" fill="#3E4A63" stroke="' + INK + '" stroke-width="4"/>' +
      '<g><rect x="38" y="104" width="164" height="92" fill="#D7DFEA"/>' + slats +
        '<rect x="106" y="182" width="28" height="7" rx="3.5" fill="#8A97AD"/></g>' +
      '<g transform="translate(214 166)"><circle r="14" fill="#2A3550"/><circle r="6" fill="#8A97AD"/></g>' +
      '<g transform="translate(214 140)"><circle r="14" fill="#2A3550"/><circle r="6" fill="#8A97AD"/></g>' +
      '</svg>';
  }

  /* ==== ANYmal ==== */
  var DOG = { body: "#EF5A3C", shade: "#CC3F27", light: "#FF8F73", leg: "#4A5774", far: "#364260", joint: "#7A88A3" };
  var GHOST = [
    { body: "#FFFFFF", shade: "#DCD2FF", blush: "#FFB3CF" },
    { body: "#FFE3F0", shade: "#FFB1D3", blush: "#FF86B4" }
  ];
  function leg(d, color, cls) {
    return '<g class="' + cls + '"><path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  function foot(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="7" ry="4" fill="' + INK + '"/>'; }
  function knee(x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="4.6" fill="' + DOG.joint + '" stroke="' + INK + '" stroke-width="2.5"/>'; }
  /* ANYmal, the robot dog, facing right, viewBox 120 x 100 */
  function dog() {
    return '<svg class="cv-dog" viewBox="0 0 120 100" aria-hidden="true">' +
      '<ellipse cx="60" cy="93" rx="40" ry="5" fill="' + INK + '" opacity="0.16"/>' +
      '<g>' + leg("M40 58 L33 74 L39 87", DOG.far, "cv-leg") + leg("M80 58 L88 74 L81 87", DOG.far, "cv-leg") + '</g>' +
      '<g class="cv-tail"><path d="M24 44 L12 31" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
        '<circle cx="11" cy="30" r="5" fill="#FFC531" stroke="' + INK + '" stroke-width="3"/></g>' +
      '<rect x="20" y="33" width="72" height="31" rx="14" fill="' + DOG.body + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="27" y="38" width="46" height="6" rx="3" fill="' + DOG.light + '"/>' +
      '<rect x="36" y="48" width="34" height="10" rx="5" fill="' + INK + '"/>' +
      '<circle cx="43" cy="53" r="2.4" fill="#7FF0FF"/><circle cx="51" cy="53" r="2.4" fill="#FFC531"/><circle cx="59" cy="53" r="2.4" fill="#9BE36D"/>' +
      '<g>' + leg("M34 58 L26 74 L33 87", DOG.leg, "cv-leg") + leg("M86 58 L94 74 L87 87", DOG.leg, "cv-leg") + '</g>' +
      knee(26, 74) + knee(94, 74) + foot(34, 89) + foot(88, 89) +
      '<circle cx="34" cy="58" r="6.5" fill="' + DOG.shade + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="86" cy="58" r="6.5" fill="' + DOG.shade + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="cv-head">' +
        '<path d="M92 23 L88 11" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<circle class="cv-bulb" cx="87.5" cy="9.5" r="4.6" fill="#FFC531" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="80" y="20" width="36" height="32" rx="13" fill="' + DOG.body + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<rect x="85" y="23" width="20" height="5" rx="2.5" fill="' + DOG.light + '"/>' +
        '<rect x="91" y="28" width="22" height="18" rx="7.5" fill="' + INK + '"/>' +
        '<ellipse cx="98.5" cy="37" rx="3.2" ry="4.2" fill="#7FF0FF"/><ellipse cx="106.5" cy="37" rx="3.2" ry="4.2" fill="#7FF0FF"/>' +
        '<circle cx="99.6" cy="35.4" r="1.2" fill="#FFFFFF"/><circle cx="107.6" cy="35.4" r="1.2" fill="#FFFFFF"/>' +
        '<ellipse cx="96" cy="48" rx="3.5" ry="2" fill="#FFB3A3" opacity="0.9"/>' +
      '</g></svg>';
  }
  /* a ghost, viewBox 100 x 100; tone 0 lilac, 1 pink; flip mirrors it */
  function ghost(tone, flip) {
    var t = GHOST[tone ? 1 : 0];
    return '<svg class="cv-ghost" viewBox="0 0 100 100" aria-hidden="true"><g' + (flip ? ' transform="translate(100 0) scale(-1 1)"' : "") + '>' +
      '<path d="M18 52 C18 26 32 11 50 11 C68 11 82 26 82 52 L82 83 C78 78 74 78 70 83 C66 89 60 89 56 83 C53 78 47 78 44 83 C40 89 34 89 30 83 C26 78 22 78 18 83 Z" fill="' + t.body + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M64 16 C76 24 80 38 80 52 L80 80 C77 78 74 78 71 81 C73 58 72 32 64 16 Z" fill="' + t.shade + '"/>' +
      '<ellipse cx="32" cy="29" rx="5" ry="8.5" fill="#FFFFFF" opacity="0.85" transform="rotate(28 32 29)"/>' +
      '<ellipse cx="38" cy="46" rx="8.5" ry="10.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="62" cy="46" rx="8.5" ry="10.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="35" cy="47" r="4.8" fill="' + INK + '"/><circle cx="59" cy="47" r="4.8" fill="' + INK + '"/>' +
      '<circle cx="36.6" cy="45" r="1.6" fill="#FFFFFF"/><circle cx="60.6" cy="45" r="1.6" fill="#FFFFFF"/>' +
      '<ellipse cx="27" cy="61" rx="6" ry="3.5" fill="' + t.blush + '" opacity="0.8"/>' +
      '<ellipse cx="73" cy="61" rx="6" ry="3.5" fill="' + t.blush + '" opacity="0.8"/>' +
      '<path d="M44 62 Q50 69 56 62" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '</g></svg>';
  }
  /* the treat, a golden bone, viewBox 100 x 64 */
  function bone() {
    var shapes = function (fill, stroke, sw) {
      var a = ' fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + sw + '"' : "");
      return '<circle cx="19" cy="21" r="13"' + a + '/><circle cx="19" cy="43" r="13"' + a + '/>' +
        '<circle cx="81" cy="21" r="13"' + a + '/><circle cx="81" cy="43" r="13"' + a + '/>' +
        '<rect x="19" y="21" width="62" height="22"' + a + '/>';
    };
    return '<svg class="cv-bone" viewBox="0 0 100 64" aria-hidden="true">' + shapes(INK, INK, 8) + shapes("#FFC531") +
      '<path d="M10 46 q9 9 18 0 h44 q9 9 18 0" fill="none" stroke="#E3A100" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M26 26 h40" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="15" cy="16" r="3.5" fill="#FFFFFF" opacity="0.9"/></svg>';
  }
  /* ANYmal's kennel, viewBox 170 x 150 (the sign's letters 22 in place of 18) */
  function kennel(opts) {
    var o = opts || {};
    return '<svg viewBox="0 0 170 150" aria-hidden="true">' +
      '<ellipse cx="85" cy="145" rx="78" ry="5" fill="' + INK + '" opacity="0.14"/>' +
      '<rect x="22" y="58" width="126" height="86" rx="6" fill="#FFE7BF" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M30 80 h110 M30 102 h110 M30 124 h110" stroke="#F0CD92" stroke-width="3"/>' +
      '<path d="M85 8 L164 66 Q167 70 162 72 L8 72 Q3 70 6 66 Z" fill="#E0452F" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M85 18 L148 64" stroke="#FF7A5E" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M63 144 V121 a22 22 0 0 1 44 0 V144 Z" fill="' + INK + '"/>' +
      '<rect x="31" y="76" width="108" height="27" rx="8" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      (o.text === false ? "" : T(85, 97, 22, "ANYMAL", ' letter-spacing="1"')) +
      '</svg>';
  }
  function tree() {
    return '<svg viewBox="0 0 60 90" aria-hidden="true"><rect x="25" y="46" width="10" height="40" rx="4" fill="#9A6A3C" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="30" cy="32" r="25" fill="#4FBF6A" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="22" cy="24" r="7" fill="#7FD98F" opacity="0.9"/><path d="M16 40 q14 9 28 0" fill="none" stroke="#2E9A4E" stroke-width="3" stroke-linecap="round"/></svg>';
  }
  function bush() {
    return '<svg viewBox="0 0 100 50" aria-hidden="true"><path d="M8 48 C0 30 14 18 26 24 C30 8 52 4 60 18 C70 8 92 14 90 30 C100 34 98 48 90 48 Z" fill="#4FBF6A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<circle cx="34" cy="26" r="4" fill="#FF8FB8"/><circle cx="62" cy="22" r="4" fill="#FFE36B"/><circle cx="76" cy="34" r="4" fill="#FFFFFF"/></svg>';
  }
  function flower(color) {
    return '<svg viewBox="0 0 30 50" aria-hidden="true"><path d="M15 48 V22" stroke="#3E9F55" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M15 36 q-8 -2 -9 -9 q8 1 9 9z" fill="#5CC46E"/>' +
      '<g fill="' + color + '" stroke="' + INK + '" stroke-width="1.8"><circle cx="15" cy="9" r="6"/><circle cx="23" cy="15" r="6"/>' +
      '<circle cx="20" cy="24" r="6"/><circle cx="10" cy="24" r="6"/><circle cx="7" cy="15" r="6"/></g>' +
      '<circle cx="15" cy="17" r="4.5" fill="#FFD84A" stroke="' + INK + '" stroke-width="1.8"/></svg>';
  }

  /* ==== Last-Minute Pricing ==== */
  var LIVERY = "#F2655A", SEAT = "#33B5A5", SEAT_DARK = "#23877B";
  var PAX = [
    { skin: "#FFD8B5", hair: "#5A3A22", shirt: "#E85D75" },
    { skin: "#C98B5E", hair: "#2B2B2B", shirt: "#4AA3DF" },
    { skin: "#F2C29B", hair: "#F2B33D", shirt: "#7BC96F" },
    { skin: "#8D5A3B", hair: "#1F1A17", shirt: "#B07BE0" },
    { skin: "#FFE0C7", hair: "#C65A2E", shirt: "#F2A33A" }
  ];
  var WIN_X = [150, 194, 238, 282, 326], WIN_Y = 96, WIN_R = 18;
  var BODY = "M64 64 H330 C372 64 398 84 406 104 C410 116 402 128 386 132 C376 135 360 136 340 136 H64 C44 136 28 120 28 100 C28 80 44 64 64 64 Z";
  function seated(n, cx, cy) {
    var p = PAX[n % PAX.length];
    return '<path d="M' + (cx - 15) + ' ' + (cy + 20) + ' q0 -11 15 -11 q15 0 15 11 z" fill="' + p.shirt + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + (cy - 1) + '" r="9.5" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M' + (cx - 9.5) + ' ' + (cy - 2) + ' q0 -10 9.5 -10 q9.5 0 9.5 10 q-4 -5 -9.5 -4 q-6 0 -9.5 4 z" fill="' + p.hair + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="' + (cx - 3.5) + '" cy="' + cy + '" r="1.5" fill="' + INK + '"/><circle cx="' + (cx + 3.5) + '" cy="' + cy + '" r="1.5" fill="' + INK + '"/>' +
      '<path d="M' + (cx - 3) + ' ' + (cy + 3.5) + ' q3 3 6 0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
  }
  function wheelP(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2A3550"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.42) + '" fill="#C4CEDD"/>';
  }
  /* the plane, viewBox 420 x 180, facing right; opts.pax: the windows (0 to 4) with a passenger in them */
  function plane(opts) {
    var o = opts || {}, pax = o.pax || [], id = "cvp" + (++uid), wins = "", clips = "";
    for (var i = 0; i < WIN_X.length; i++) {
      var x = WIN_X[i];
      clips += '<clipPath id="' + id + "w" + i + '"><circle cx="' + x + '" cy="' + WIN_Y + '" r="' + (WIN_R - 1.5) + '"/></clipPath>';
      wins += '<g clip-path="url(#' + id + "w" + i + ')">' +
          '<circle cx="' + x + '" cy="' + WIN_Y + '" r="' + WIN_R + '" fill="#FFF1D6"/>' +
          '<rect x="' + (x - 12) + '" y="' + (WIN_Y - 2) + '" width="24" height="26" rx="8" fill="' + SEAT + '" stroke="' + SEAT_DARK + '" stroke-width="2"/>' +
          (pax.indexOf(i) >= 0 ? seated(i, x, WIN_Y) : "") +
        '</g>' +
        '<circle cx="' + x + '" cy="' + WIN_Y + '" r="' + WIN_R + '" fill="none" stroke="' + INK + '" stroke-width="3.5"/>' +
        '<path d="M' + (x - 12) + ' ' + (WIN_Y - 7) + ' a13 13 0 0 1 7 -7" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.85"/>';
    }
    return '<svg class="cv-plane" viewBox="0 0 420 180" aria-hidden="true"><defs>' + clips +
      '<clipPath id="' + id + 'b"><path d="' + BODY + '"/></clipPath></defs>' +
      (o.shadow === false ? "" : '<ellipse cx="225" cy="174" rx="178" ry="6" fill="' + INK + '" opacity="0.16"/>') +
      '<path d="M50 74 L30 16 Q28 7 37 7 L64 7 Q72 7 76 14 L114 74 Z" fill="' + LIVERY + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M58 22 l3.2 7.4 7.8 0.8 -5.9 5.2 1.7 7.7 -6.8 -4 -6.8 4 1.7 -7.7 -5.9 -5.2 7.8 -0.8z" fill="#FFFFFF"/>' +
      '<path d="' + BODY + '" fill="#FFFFFF"/>' +
      '<g clip-path="url(#' + id + 'b)"><rect x="20" y="121" width="400" height="20" fill="#E6ECF5"/>' +
        '<rect x="20" y="112" width="400" height="7" fill="' + LIVERY + '"/></g>' +
      '<path d="M350 78 H376 Q392 84 400 100 H350 Q344 100 344 94 V84 Q344 78 350 78 Z" fill="#C8ECFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M353 95 l7 -12 M361 95 l4 -7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>' +
      '<rect x="100" y="72" width="24" height="56" rx="7" fill="#F4F7FB" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="112" cy="88" r="5" fill="#C8ECFF" stroke="' + INK + '" stroke-width="2"/>' +
      wins +
      '<path d="' + BODY + '" fill="none" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M204 118 L292 118 L240 158 L176 158 Z" fill="#DCE5F1" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<rect x="214" y="140" width="58" height="22" rx="11" fill="#F4F7FB" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="270" cy="151" rx="5" ry="9" fill="#9AA7BC" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M226 162 V164 M372 134 V160" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      wheelP(226, 166, 8) + wheelP(372, 166, 8) + '</svg>';
  }
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
  function windsock() {
    return '<svg viewBox="0 0 70 90" aria-hidden="true">' +
      '<path d="M8 6 V88" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<g class="cv-sock"><path d="M10 8 L64 16 L62 28 L10 34 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M10 8 L24 10 L24 33 L10 34 Z M37 12 L50 14 L50 30 L37 31 Z" fill="' + LIVERY + '"/>' +
      '<path d="M10 8 L64 16 L62 28 L10 34 Z" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/></g>' +
      '</svg>';
  }

  /* ==== the battle game: new, original, generic ==== */
  /* a round blue chick, facing right, viewBox 120 x 120 */
  function chick() {
    return '<svg class="cv-chick" viewBox="0 0 120 120" aria-hidden="true">' +
      '<ellipse cx="60" cy="113" rx="38" ry="5" fill="' + INK + '" opacity="0.16"/>' +
      '<path d="M44 104 l-6 8 h12 z M70 104 l-4 8 h12 z" fill="#FF9F2E" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M50 22 q-2 -14 8 -16 q-2 8 4 12 q4 -10 12 -8 q-6 6 -4 14" fill="#2F9BE0" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<circle cx="60" cy="64" r="44" fill="#53B8F2" stroke="' + INK + '" stroke-width="4"/>' +
      '<ellipse cx="56" cy="80" rx="27" ry="22" fill="#CDEEFF"/>' +
      '<path d="M18 64 q-12 6 -8 20 q10 -2 16 -10" fill="#2F9BE0" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<ellipse cx="42" cy="36" rx="9" ry="5" fill="#FFFFFF" opacity="0.55" transform="rotate(-30 42 36)"/>' +
      '<ellipse cx="68" cy="56" rx="8" ry="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="88" cy="56" rx="8" ry="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="71" cy="58" r="4.6" fill="' + INK + '"/><circle cx="91" cy="58" r="4.6" fill="' + INK + '"/>' +
      '<circle cx="72.4" cy="56.2" r="1.5" fill="#FFFFFF"/><circle cx="92.4" cy="56.2" r="1.5" fill="#FFFFFF"/>' +
      '<path d="M60 43 l14 5 M98 44 l-12 5" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M96 66 l16 4 l-16 6 z" fill="#FFB43C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<ellipse cx="62" cy="72" rx="5" ry="3" fill="#FF8FB8" opacity="0.8"/>' +
      '</svg>';
  }
  /* a round lilac bunny, facing left, viewBox 120 x 120 */
  function bunny() {
    return '<svg class="cv-bunny" viewBox="0 0 120 120" aria-hidden="true">' +
      '<ellipse cx="60" cy="113" rx="38" ry="5" fill="' + INK + '" opacity="0.16"/>' +
      '<path d="M66 30 C62 4 74 -2 80 6 C86 14 80 28 76 34 Z" fill="#B48CF2" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M71 28 C69 12 75 8 78 12 C80 17 78 24 75 30 Z" fill="#FFC2DE"/>' +
      '<path d="M84 36 C92 12 106 12 106 22 C106 32 96 40 90 42 Z" fill="#B48CF2" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M89 36 C95 22 101 21 101 25 C101 30 96 34 92 37 Z" fill="#FFC2DE"/>' +
      '<circle cx="104" cy="84" r="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="62" cy="68" r="42" fill="#C7A4FA" stroke="' + INK + '" stroke-width="4"/>' +
      '<ellipse cx="66" cy="84" rx="25" ry="19" fill="#F1E6FF"/>' +
      '<ellipse cx="84" cy="44" rx="8" ry="5" fill="#FFFFFF" opacity="0.5" transform="rotate(30 84 44)"/>' +
      '<ellipse cx="34" cy="60" rx="8" ry="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="54" cy="60" rx="8" ry="10" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="31" cy="62" r="4.6" fill="' + INK + '"/><circle cx="51" cy="62" r="4.6" fill="' + INK + '"/>' +
      '<circle cx="32.4" cy="60.2" r="1.5" fill="#FFFFFF"/><circle cx="52.4" cy="60.2" r="1.5" fill="#FFFFFF"/>' +
      '<path d="M24 48 l12 4 M62 47 l-13 5" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M40 74 q3 3 6 0 q3 3 6 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="26" cy="74" rx="5" ry="3" fill="#FF8FB8" opacity="0.8"/><ellipse cx="62" cy="76" rx="5" ry="3" fill="#FF8FB8" opacity="0.8"/>' +
      '<path d="M22 100 q8 6 16 0 M70 104 q8 6 16 0" fill="#C7A4FA" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }
  /* a health bar, viewBox 120 x 22: a heart, a white pill, a fill (0 to 1) */
  function health(fill, color) {
    var w = Math.max(0, Math.min(1, fill)) * 84;
    return '<svg viewBox="0 0 120 22" aria-hidden="true">' +
      '<rect x="20" y="3" width="96" height="16" rx="8" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="26" y="7.5" width="' + w + '" height="7" rx="3.5" fill="' + (color || "#2FB463") + '"/>' +
      '<path d="M11 19 C3 13 1 10 1 7 C1 4 3 2 6 2 C8 2 10 3.5 11 5 C12 3.5 14 2 16 2 C19 2 21 4 21 7 C21 10 19 13 11 19 z" fill="#FF6B7A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '</svg>';
  }
  function spark(color) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 C22 15 25 18 38 20 C25 22 22 25 20 38 C18 25 15 22 2 20 C15 18 18 15 20 2 Z" fill="' + (color || "#FFC531") + '" stroke="' + INK + '" stroke-width="2"/></svg>';
  }
  function burst() {
    var p = "", n = 12;
    for (var i = 0; i < n * 2; i++) {
      var r = i % 2 ? 22 : 40, a = Math.PI * i / n;
      p += (i ? "L" : "M") + (50 + r * Math.cos(a)).toFixed(1) + " " + (50 + r * Math.sin(a)).toFixed(1) + " ";
    }
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="' + p + 'Z" fill="#FFE14A" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M50 30 L56 46 L70 50 L56 54 L50 70 L44 54 L30 50 L44 46 Z" fill="#FFFFFF"/></svg>';
  }

  /* ==== sky ==== */
  function cloud() {
    return '<svg viewBox="0 0 160 70" aria-hidden="true"><path d="M24 62 q-20 0 -20 -16 q0 -16 20 -16 q2 -22 28 -22 q18 0 26 14 q8 -10 22 -8 q22 4 20 24 q20 0 20 12 q0 12 -18 12 z" fill="#FFFFFF"/></svg>';
  }
  function hills() {
    return '<svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 60 Q50 20 110 48 T230 40 T340 46 T400 36 V100 H0 Z" fill="#B9E79A"/>' +
      '<path d="M0 78 Q70 48 140 72 T280 66 T400 70 V100 H0 Z" fill="#8FD67A"/></svg>';
  }
  function star(on) {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5l4.1 8.4 9.2 1.3-6.7 6.5 1.6 9.2L16 23.6l-8.2 4.3 1.6-9.2-6.7-6.5 9.2-1.3z" fill="' + (on === false ? "#DCE5F1" : "#FFC531") + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }

  /* ==== the four scenes, viewBox 320 x 220, the ground at y 212 ====
     opts.text false: no letters inside the drawings; opts.trim true: the hero alone with a prop or two */
  function g(cls, inner) { return '<g class="cv-h ' + cls + '">' + inner + '</g>'; }
  function scene(name, opts) {
    var o = opts || {}, s = "", tx = o.text !== false;
    if (name === "bessie") {
      s += place(tree(), 214, 104, 52, 78) + place(tree(), 254, 124, 40, 60);
      s += place(garage({ text: tx }), 6, 44, 186, 155);
      s += g("cv-h1", place(van({ text: tx }), 104, 112, 190, 106));
    } else if (name === "anymal") {
      s += place(tree(), 272, 112, 44, 66);
      s += place(kennel({ text: tx }), 0, 76, 142, 125);
      s += place(bone(), 18, 194, 44, 28);
      s += g("cv-h1", place(dog(), 132, 86, 156, 130));
      s += g("cv-h2", place(ghost(0), 240, 16, 68, 68) + place(ghost(1, true), 176, 0, 50, 50));
      s += place(flower("#FF8FB8"), 280, 180, 17, 28) + place(flower("#FFFFFF"), 297, 186, 15, 25);
    } else if (name === "pricing") {
      s += place(tower(), 6, 40, 48, 128) + place(windsock(), 268, 114, 44, 57);
      s += g("cv-h1", place(plane({ pax: [0, 2, 3] }), 18, 92, 300, 129));
    } else if (name === "battle") {
      s += '<ellipse cx="160" cy="200" rx="150" ry="20" fill="#FFFFFF" opacity="0.55"/>';
      s += '<ellipse cx="160" cy="200" rx="122" ry="14" fill="none" stroke="#FFFFFF" stroke-width="5" opacity="0.9"/>';
      s += place(health(1), 22, 40, 120, 22) + place(health(0.55, "#FFC531"), 178, 40, 120, 22);
      s += g("cv-h1", place(chick(), 18, 76, 126, 126)) + g("cv-h2", place(bunny(), 176, 76, 126, 126));
      s += g("cv-h3", place(burst(), 132, 96, 56, 56));
    }
    return '<svg class="cv-scene cv-' + name + '" viewBox="0 0 320 220" aria-hidden="true" overflow="visible">' + s + '</svg>';
  }

  /* ==== hero shots for box art and screens, viewBox 220 x 180 ==== */
  function hero(name, opts) {
    var o = opts || {}, s = "", tx = o.text !== false;
    if (name === "bessie") {
      s += place(spark("#FFFFFF"), 18, 26, 22, 22) + place(spark("#FFFFFF"), 184, 36, 16, 16);
      s += g("cv-h1", place(van({ text: tx }), 8, 56, 204, 114));
    } else if (name === "anymal") {
      s += place(bone(), 4, 146, 54, 34);
      s += g("cv-h2", place(ghost(1, true), 150, 2, 64, 64));
      s += g("cv-h1", place(dog(), 34, 44, 160, 133));
    } else if (name === "pricing") {
      s += place(cloud(), 4, 120, 80, 35) + place(cloud(), 150, 18, 64, 28);
      s += g("cv-h1", '<g transform="rotate(-11 110 96)">' + place(plane({ pax: [0, 2, 3], shadow: false }), -6, 44, 232, 99) + '</g>');
    } else if (name === "battle") {
      s += place(health(1), 2, 14, 104, 19) + place(health(0.55, "#FFC531"), 114, 14, 104, 19);
      s += g("cv-h1", place(chick(), 0, 56, 116, 116)) + g("cv-h2", place(bunny(), 104, 56, 116, 116));
      s += g("cv-h3", place(burst(), 86, 76, 48, 48));
    }
    return '<svg class="cv-hero cv-' + name + '" viewBox="0 0 220 180" aria-hidden="true" overflow="visible">' + s + '</svg>';
  }
  /* a potted plant, viewBox 80 x 110 */
  function plant() {
    return '<svg viewBox="0 0 80 110" aria-hidden="true">' +
      '<path d="M40 70 C30 50 12 46 6 30 C22 30 36 42 40 62 Z" fill="#4FBF6A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M40 66 C46 40 62 30 76 26 C74 46 58 60 42 70 Z" fill="#55C26E" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M40 68 C36 42 40 18 50 4 C58 24 52 50 42 70 Z" fill="#3FA65A" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M16 66 H64 L58 106 H22 Z" fill="#E8835A" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<rect x="12" y="62" width="56" height="12" rx="4" fill="#F29A72" stroke="' + INK + '" stroke-width="3.5"/></svg>';
  }
  /* a gamepad, generic, viewBox 120 x 72 */
  function gamepad() {
    return '<svg viewBox="0 0 120 72" aria-hidden="true">' +
      '<path d="M30 8 H90 C108 8 118 26 118 46 C118 62 108 70 98 66 C90 63 86 54 78 50 H42 C34 54 30 63 22 66 C12 70 2 62 2 46 C2 26 12 8 30 8 Z" fill="#B48CF2" stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M24 22 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 z" fill="' + INK + '"/>' +
      '<circle cx="86" cy="26" r="6" fill="#FF6B7A" stroke="' + INK + '" stroke-width="2.5"/><circle cx="98" cy="36" r="6" fill="#FFC531" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<rect x="50" y="24" width="8" height="5" rx="2.5" fill="' + INK + '"/><rect x="62" y="24" width="8" height="5" rx="2.5" fill="' + INK + '"/>' +
      '<path d="M30 12 q-12 4 -16 14" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.6"/></svg>';
  }

  window.CoverArt = {
    INK: INK, place: place, van: van, garage: garage, dog: dog, ghost: ghost, bone: bone, kennel: kennel, tree: tree,
    bush: bush, flower: flower, plane: plane, tower: tower, windsock: windsock, chick: chick, bunny: bunny,
    health: health, spark: spark, burst: burst, cloud: cloud, hills: hills, star: star, scene: scene,
    hero: hero, plant: plant, gamepad: gamepad
  };
})();
