/* Music toggle wired to the topbar button (arcade cut).
 *
 *   Music is off on every page load: nothing plays until the MUSIC button
 *   is pressed (that click also unlocks the browser's AudioContext). The
 *   same button turns the sound effects on and off with the music (js/sfx.js
 *   gates every effect on it). 'm' presses the button (js/main.js).
 *
 *   The button label always reflects the current state.
 */
(function () {
  function setLabel(btn, on) {
    btn.textContent = on ? '♪ MUSIC ON' : '♪ MUSIC OFF';
    btn.classList.toggle('active', on);
  }

  function init() {
    if (!window.Music) return;
    const btn = document.getElementById('music-toggle');
    if (!btn) return;
    setLabel(btn, false);
    btn.addEventListener('click', () => {
      const on = window.Music.toggle();
      setLabel(btn, on);
      if (window.SFX) window.SFX.setEnabled(on);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
