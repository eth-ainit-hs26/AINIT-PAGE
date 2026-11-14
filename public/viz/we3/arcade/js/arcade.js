/* PRESS START, the arcade of weekend 3: four cartridges, one per game.

   The sprites and the accent colours are those of rl-arcade's cartridges.js
   (commit 05dea09): van for Old Bessie, robot for ANYmal, tag for
   Last-Minute Pricing, pokeball for Pokemon. Each cartridge is a link to its
   game, so a tap, a click or Enter opens it; the arrow keys move between the
   cartridges. */
(function () {
  var PX = {'.':null,K:'#0b0b16',W:'#f4f6ff',R:'#ff4d5e',r:'#c0202e',G:'#6be24a',g:'#1f9a52',
    B:'#41a6ff',b:'#9aa7ff',Y:'#ffd23f',O:'#ff9a3c',P:'#b06bff',C:'#5ad0ff',S:'#c9cee6',s:'#6c7194',N:'#9a6a3c'};
  var SPRITES = {
    robot:[".....R.....",".....K.....","..KKKKKKK..","..KSSSSSK..","..KSSSSSK..",
           "..KCCSCCK..","..KSSSSSK..","..KSKKKSK..","..KKKKKKK..","...K...K..."],
    van:["...........","...KKKKKKK.","..KKWWKbbbK",".KbbbbbbbbK",".KbbbbbbbbK",
         ".KbbbbbbbbK",".KKKKKKKKK.","..KK...KK..","..KK...KK..","..........."],
    tag:["..KKKKKKK..",".KOOOKOOOK.",".KOOOOOOOK.",".KOYYYOOOK.",".KOYOOOOOK.",
         ".KOYYYOOOK.",".KOOOYOOOK.",".KOYYYOOOK.",".KOOOOOOOK.","..KKKKKKK.."],
    pokeball:["...KKKKK...",".KKRRRRRKK.",".KRRRRRRRK.","KRRRRRRRRRK","KRRRWWWRRRK",
              "KKKKWKWKKKK","KWWWWWWWWWK","KWWWWWWWWWK",".KWWWWWWWK.",".KKWWWWWKK.","...KKKKK..."]
  };

  function spriteSvg(rows) {
    var h = rows.length, w = rows[0].length, out = [];
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var col = PX[rows[y][x]];
        if (col) out.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + col + '"/>');
      }
    }
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true">' + out.join('') + '</svg>';
  }

  var carts = Array.prototype.slice.call(document.querySelectorAll('.cart'));
  carts.forEach(function (c) {
    var host = c.querySelector('.cart-sprite');
    var rows = SPRITES[c.getAttribute('data-sprite')];
    if (host && rows) host.innerHTML = spriteSvg(rows);
  });

  /* Arrow keys move the focus from cartridge to cartridge (Enter opens it). */
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    var i = carts.indexOf(document.activeElement);
    var next = i < 0 ? 0 : (i + keys[e.key] + carts.length) % carts.length;
    carts[next].focus();
    e.preventDefault();
  });
})();
