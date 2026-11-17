/* fullscreen.js: the full-screen button of the AINIT games (2026-11-11; Carlos shows the games from his iPad).
   The same file in every game. The button goes after the light or dark switch (.themebtn) and takes its look; a
   page without that switch marks the place with data-fullscreen. One tap and the page fills the whole screen, with
   no address bar or tabs, in Safari and Chrome on an iPad and on a computer. The button is left out where the
   browser cannot do that (an iPhone, a frame that does not allow it), and hidden on screens under 561 px and while
   the page is full screen. The browser's own exit button, a swipe down on an iPad, or Escape leave full screen. */
(function () {
  var doc = document, root = doc.documentElement;
  var request = root.requestFullscreen || root.webkitRequestFullscreen;
  if (!request || !(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)) return;
  var host = doc.querySelector("[data-fullscreen]"), twin = host ? null : doc.querySelector(".themebtn");
  if (!host && !twin) return;

  var btn = doc.createElement("button");
  btn.type = "button";
  btn.className = twin ? twin.className + " fullbtn" : "fullbtn";
  btn.title = "Full screen";
  btn.setAttribute("aria-label", "Full screen");
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" style="display:block; margin:auto" aria-hidden="true"' +
    ' fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/></svg>';

  var narrow = window.matchMedia ? window.matchMedia("(max-width: 560px)") : null;
  function isFull() { return !!(doc.fullscreenElement || doc.webkitFullscreenElement); }
  function sync() { btn.style.display = isFull() || (narrow && narrow.matches) ? "none" : ""; }

  btn.addEventListener("click", function () {
    btn.blur();
    var p = request.call(root);
    if (p && typeof p.catch === "function") p.catch(function () {});
  });
  doc.addEventListener("fullscreenchange", sync);
  doc.addEventListener("webkitfullscreenchange", sync);
  if (narrow && narrow.addEventListener) narrow.addEventListener("change", sync);
  else if (narrow && narrow.addListener) narrow.addListener(sync);

  if (twin) twin.parentNode.insertBefore(btn, twin.nextSibling);
  else host.appendChild(btn);
  sync();
})();
