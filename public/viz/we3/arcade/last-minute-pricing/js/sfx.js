/* sfx.js: Last-Minute Pricing's sound effects, synthesised with Web Audio (no audio files), on the synth of Old
   Bessie's sfx.js. They play only while the MUSIC button is on (js/music-ui.js calls SFX.setEnabled), so nothing
   sounds on a fresh load.
     cursor   a button               coin     a buyer pays            seat     a passenger sits down
     sad      nobody came            noseat   no seat left            sparkle  a full flight
     takeoff  the plane leaves       win      a flight with a star    loss     a flight without one
   SFX.play(name), SFX.setEnabled(on), SFX.isEnabled(). */
(function () {
  var ctx = null, master = null, noiseBuf = null, enabled = false;

  function ensure() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);
    var sr = ctx.sampleRate;
    noiseBuf = ctx.createBuffer(1, Math.floor(sr * 1.6), sr);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  function tone(type, f0, f1, t, dur, peak) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    g.gain.setValueAtTime(peak, t + Math.max(0.01, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  function hiss(t, dur, peak, filter, f0, f1) {
    var n = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    n.buffer = noiseBuf;
    f.type = filter;
    f.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + Math.min(0.25, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(master);
    n.start(t);
    n.stop(t + dur + 0.02);
  }

  var SOUNDS = {
    cursor: function (t) { tone("square", 660, 660, t, 0.045, 0.2); tone("square", 990, 990, t + 0.03, 0.05, 0.18); },
    coin: function (t) { tone("square", 988, 988, t, 0.07, 0.22); tone("square", 1319, 1319, t + 0.07, 0.22, 0.22); },
    seat: function (t) { tone("triangle", 520, 880, t, 0.09, 0.22); },
    sad: function (t) { tone("triangle", 392, 330, t, 0.28, 0.22); tone("triangle", 330, 262, t + 0.3, 0.4, 0.22); },
    noseat: function (t) { tone("square", 220, 220, t, 0.12, 0.18); tone("square", 175, 175, t + 0.16, 0.2, 0.18); },
    sparkle: function (t) {
      var n = [784, 988, 1175, 1568];
      for (var i = 0; i < n.length; i++) tone("triangle", n[i], n[i], t + i * 0.07, 0.16, 0.25);
    },
    takeoff: function (t) { hiss(t, 1.5, 0.3, "bandpass", 300, 2400); tone("sawtooth", 90, 240, t, 1.4, 0.08); },
    win: function (t) {
      var n = [523.25, 659.25, 783.99, 1046.5];
      for (var i = 0; i < n.length; i++) tone("square", n[i], n[i], t + i * 0.11, 0.16, 0.3);
      tone("square", 261.63, 261.63, t + 0.33, 0.3, 0.2);
    },
    loss: function (t) {
      var n = [392, 311.13, 261.63];
      for (var i = 0; i < n.length; i++) tone("square", n[i], n[i], t + i * 0.16, 0.22, 0.26);
    }
  };

  function play(name) {
    if (!enabled || !SOUNDS[name]) return;
    var c = ensure();
    if (!c || c.state === "suspended") return;
    try { SOUNDS[name](c.currentTime); } catch (e) { /* sound is a nicety */ }
  }
  window.SFX = { play: play, setEnabled: function (b) { enabled = !!b; }, isEnabled: function () { return enabled; } };
})();
