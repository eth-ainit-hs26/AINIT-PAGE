/* art.js: the pictures of ANYmal's garden as inline SVG strings (window.AMArt). Flat, saturated, light, with the
   ink outline of Old Bessie's town (../repair-or-replace/js/art.js). ANYmal is a red robot dog (the real ANYmal is
   red with dark legs), the ghosts are lilac and pink, the treat is a golden bone. Parts that move carry classes that
   css/game.css animates: am-leg-*, am-tail, am-bulb, am-eyes, am-eyes-x, am-sweat, am-pupils. */
(function () {
  "use strict";
  var INK = "#22314D";
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

  /* ANYmal, the robot dog, facing right, viewBox 120 x 100. */
  function dog() {
    return '<svg class="am-dog-svg" viewBox="0 0 120 100" aria-hidden="true">' +
      '<ellipse cx="60" cy="93" rx="40" ry="5" fill="' + INK + '" opacity="0.16"/>' +
      '<g class="am-legs-far">' +
        leg("M40 58 L33 74 L39 87", DOG.far, "am-leg am-leg-b2") + leg("M80 58 L88 74 L81 87", DOG.far, "am-leg am-leg-f2") +
      '</g>' +
      '<g class="am-tail"><path d="M24 44 L12 31" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>' +
        '<circle cx="11" cy="30" r="5" fill="#FFC531" stroke="' + INK + '" stroke-width="3"/></g>' +
      '<rect x="20" y="33" width="72" height="31" rx="14" fill="' + DOG.body + '" stroke="' + INK + '" stroke-width="4"/>' +
      '<rect x="27" y="38" width="46" height="6" rx="3" fill="' + DOG.light + '"/>' +
      '<rect x="36" y="48" width="34" height="10" rx="5" fill="' + INK + '"/>' +
      '<circle cx="43" cy="53" r="2.4" fill="#7FF0FF"/><circle cx="51" cy="53" r="2.4" fill="#FFC531"/><circle cx="59" cy="53" r="2.4" fill="#9BE36D"/>' +
      '<g class="am-legs-near">' +
        leg("M34 58 L26 74 L33 87", DOG.leg, "am-leg am-leg-b1") + leg("M86 58 L94 74 L87 87", DOG.leg, "am-leg am-leg-f1") +
      '</g>' +
      knee(26, 74) + knee(94, 74) + foot(34, 89) + foot(88, 89) +
      '<circle cx="34" cy="58" r="6.5" fill="' + DOG.shade + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="86" cy="58" r="6.5" fill="' + DOG.shade + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="am-head">' +
        '<path d="M92 23 L88 11" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
        '<circle class="am-bulb" cx="87.5" cy="9.5" r="4.6" fill="#FFC531" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<rect x="80" y="20" width="36" height="32" rx="13" fill="' + DOG.body + '" stroke="' + INK + '" stroke-width="4"/>' +
        '<rect x="85" y="23" width="20" height="5" rx="2.5" fill="' + DOG.light + '"/>' +
        '<rect x="91" y="28" width="22" height="18" rx="7.5" fill="' + INK + '"/>' +
        '<g class="am-eyes"><ellipse cx="98.5" cy="37" rx="3.2" ry="4.2" fill="#7FF0FF"/><ellipse cx="106.5" cy="37" rx="3.2" ry="4.2" fill="#7FF0FF"/>' +
          '<circle cx="99.6" cy="35.4" r="1.2" fill="#FFFFFF"/><circle cx="107.6" cy="35.4" r="1.2" fill="#FFFFFF"/></g>' +
        '<g class="am-eyes-x" stroke="#FF8F73" stroke-width="2.4" stroke-linecap="round">' +
          '<path d="M96 34 l5 6 M101 34 l-5 6 M104 34 l5 6 M109 34 l-5 6"/></g>' +
        '<ellipse cx="96" cy="48" rx="3.5" ry="2" fill="#FFB3A3" opacity="0.9"/>' +
        '<path class="am-sweat" d="M76 18 q-5 8 0 11 q5 -3 0 -11z" fill="#8FD8FF" stroke="' + INK + '" stroke-width="2"/>' +
      '</g>' +
      '</svg>';
  }

  /* A ghost, viewBox 100 x 100; tone 0 lilac, 1 pink. The pupils (am-pupils) look towards ANYmal. */
  function ghost(tone) {
    var t = GHOST[tone ? 1 : 0];
    return '<svg class="am-ghost-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<path d="M18 52 C18 26 32 11 50 11 C68 11 82 26 82 52 L82 83 C78 78 74 78 70 83 C66 89 60 89 56 83 C53 78 47 78 44 83 C40 89 34 89 30 83 C26 78 22 78 18 83 Z" fill="' + t.body + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M64 16 C76 24 80 38 80 52 L80 80 C77 78 74 78 71 81 C73 58 72 32 64 16 Z" fill="' + t.shade + '"/>' +
      '<ellipse cx="32" cy="29" rx="5" ry="8.5" fill="#FFFFFF" opacity="0.85" transform="rotate(28 32 29)"/>' +
      '<ellipse cx="38" cy="46" rx="8.5" ry="10.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<ellipse cx="62" cy="46" rx="8.5" ry="10.5" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<g class="am-pupils"><circle cx="38" cy="47" r="4.8" fill="' + INK + '"/><circle cx="62" cy="47" r="4.8" fill="' + INK + '"/>' +
        '<circle cx="39.6" cy="45" r="1.6" fill="#FFFFFF"/><circle cx="63.6" cy="45" r="1.6" fill="#FFFFFF"/></g>' +
      '<ellipse cx="27" cy="61" rx="6" ry="3.5" fill="' + t.blush + '" opacity="0.8"/>' +
      '<ellipse cx="73" cy="61" rx="6" ry="3.5" fill="' + t.blush + '" opacity="0.8"/>' +
      '<path class="am-mouth" d="M44 62 Q50 69 56 62" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }

  /* The treat: a golden bone, viewBox 100 x 64. */
  function bone(small) {
    var shapes = function (fill, stroke, sw) {
      var a = ' fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="' + sw + '"' : "");
      return '<circle cx="19" cy="21" r="13"' + a + '/><circle cx="19" cy="43" r="13"' + a + '/>' +
        '<circle cx="81" cy="21" r="13"' + a + '/><circle cx="81" cy="43" r="13"' + a + '/>' +
        '<rect x="19" y="21" width="62" height="22"' + a + '/>';
    };
    return '<svg class="am-bone-svg" viewBox="0 0 100 64" aria-hidden="true">' +
      shapes(INK, INK, 8) + shapes("#FFC531") +
      '<path d="M10 46 q9 9 18 0 h44 q9 9 18 0" fill="none" stroke="#E3A100" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M26 26 h40" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.85"/>' +
      '<circle cx="15" cy="16" r="3.5" fill="#FFFFFF" opacity="0.9"/>' +
      (small ? "" : '') +
      '</svg>';
  }

  function cloud() {
    return '<svg viewBox="0 0 120 60" aria-hidden="true"><path d="M22 54 C7 54 3 37 16 32 C14 18 31 12 41 20 C45 7 67 5 73 20 C81 12 99 16 97 31 C111 31 115 54 99 54 Z" fill="#FFFFFF"/></svg>';
  }
  function hills() {
    return '<svg viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 52 C50 18 110 16 170 44 C230 72 300 22 400 34 L400 100 L0 100 Z" fill="#B6E79A"/>' +
      '<path d="M0 74 C70 48 150 56 215 70 C285 86 335 56 400 64 L400 100 L0 100 Z" fill="#94D676"/></svg>';
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
  /* ANYmal's kennel, with the name on its sign, viewBox 170 x 150. */
  function kennel() {
    return '<svg viewBox="0 0 170 150" aria-hidden="true">' +
      '<ellipse cx="85" cy="145" rx="78" ry="5" fill="' + INK + '" opacity="0.14"/>' +
      '<rect x="22" y="58" width="126" height="86" rx="6" fill="#FFE7BF" stroke="' + INK + '" stroke-width="4"/>' +
      '<path d="M30 80 h110 M30 102 h110 M30 124 h110" stroke="#F0CD92" stroke-width="3"/>' +
      '<path d="M85 8 L164 66 Q167 70 162 72 L8 72 Q3 70 6 66 Z" fill="#E0452F" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M85 18 L148 64" stroke="#FF7A5E" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M63 144 V121 a22 22 0 0 1 44 0 V144 Z" fill="' + INK + '"/>' +
      '<rect x="33" y="76" width="104" height="24" rx="8" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3"/>' +
      '<text x="85" y="94.5" text-anchor="middle" class="am-sign">ANYMAL</text>' +
      '</svg>';
  }

  /* HUD and chip icons, viewBox 32 x 32 */
  function paw(color) {
    var c = color || "#EF5A3C";
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><g fill="' + c + '" stroke="' + INK + '" stroke-width="2">' +
      '<ellipse cx="16" cy="21" rx="8" ry="6.5"/><circle cx="7" cy="13" r="3.4"/><circle cx="12.5" cy="7.5" r="3.4"/>' +
      '<circle cx="19.5" cy="7.5" r="3.4"/><circle cx="25" cy="13" r="3.4"/></g></svg>';
  }
  function star() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5l4.1 8.4 9.2 1.3-6.7 6.5 1.6 9.2L16 23.6l-8.2 4.3 1.6-9.2-6.7-6.5 9.2-1.3z" fill="#FFC531" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M11 13l3-0.6" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/></svg>';
  }
  function boneIcon() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><g transform="rotate(-30 16 16)">' +
      '<g fill="' + INK + '"><circle cx="7" cy="12.5" r="5.4"/><circle cx="7" cy="19.5" r="5.4"/><circle cx="25" cy="12.5" r="5.4"/><circle cx="25" cy="19.5" r="5.4"/><rect x="7" y="12" width="18" height="8"/></g>' +
      '<g fill="#FFC531"><circle cx="7" cy="12.5" r="3.6"/><circle cx="7" cy="19.5" r="3.6"/><circle cx="25" cy="12.5" r="3.6"/><circle cx="25" cy="19.5" r="3.6"/><rect x="7" y="13.6" width="18" height="4.8"/></g></g></svg>';
  }
  function bolt() {
    return '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M18.5 2 L6 18 H14.5 L12 30 L26 12.5 H17.5 Z" fill="#FFE14A" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }
  /* an arrow for the pad, pointing up; the pad turns it */
  function arrow() {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6 L35 24 H26 V34 H14 V24 H5 Z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></svg>';
  }
  function sparkle(color) {
    return '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 C22 15 25 18 38 20 C25 22 22 25 20 38 C18 25 15 22 2 20 C15 18 18 15 20 2 Z" fill="' + (color || "#FFC531") + '" stroke="' + INK + '" stroke-width="2"/></svg>';
  }

  window.AMArt = {
    INK: INK, dog: dog, ghost: ghost, bone: bone, cloud: cloud, hills: hills, tree: tree, bush: bush, flower: flower,
    kennel: kennel, paw: paw, star: star, boneIcon: boneIcon, bolt: bolt, arrow: arrow, sparkle: sparkle
  };
})();
