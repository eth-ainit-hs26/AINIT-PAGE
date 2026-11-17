/* kit/music.js: the music of the arcade's redesigned games, a small synthesizer and sequencer in Web Audio.
   No audio files and nothing from the network. Old Bessie, ANYmal and Last-Minute Pricing load it, and each game
   writes its own songs in its js/tracks.js with Music.define. The battle game keeps rl-arcade's js/music.js.

   A song (gain scales the whole song, 1 when left out):
     { bpm: 120, swing: 0.58, intro: 1, gain: 1,
       voices: { lead: { inst: "harmonica", gain: 0.9, pan: 0.1, rev: 0.25 },
                 bass: { inst: "bass", range: "E2 D3", pat: "B - . . F - . ." }, ... },
       bars: [ { c: "G", lead: "B4 - A4 G4 - B4 D5 -", bass: "G2 - . . A2 - B2 -" }, ... ] }

   A bar has 4 beats. A voice's string in a bar holds 1, 2, 3, 4, 6, 8, 12, 16 or 24 tokens that share it evenly:
     C5 Fs4 Bb3      a note (s sharp, b flat); A3+C4+E4 several at once
     .               silence;  -  the note before goes on
     R T F S O B     the chord's root, third, fifth, seventh (the octave when it has none), the root an octave up,
                     the bass note (after a slash, else the root), each placed in the voice's range
     C               the chord's notes in the lowest octave of the range (rootless: true leaves the root out of
                     chords of four notes or more);  a b c d e f g h  the chord's notes upward from the range's bottom
     k s h o c r z t u w v b x p q   kit voices: kick, snare, closed hat, open hat, clap, rim, shaker, low tom,
                     high tom, woodblock, low woodblock, brush, crash, blip, low blip
     suffix ^ louder, _ softer; prefix ~ glides from the note before; % the voice's string of the bar before
   A bar without a string for a voice plays the voice's pattern (pat: a string, or a list taken in turn, bar by
   bar from the first looped bar); an empty string is silence. c is the chord of the bar, or two or four chords
   sharing it ("D7 G"); a bar without c keeps the chord before. The first `intro` bars play once, the others loop.
   swing places the second eighth of each beat (0.5 straight, 0.67 triplets).

   Voice options: inst, gain, pan (-1 to 1), rev (reverb send), range ("lo hi"), pat, legato (part of a note's
   length that sounds, 0.92), strum (seconds between the notes of a chord), rootless.

   API: Music.define(songs), start(), stop(), toggle() (true when it plays), isPlaying(), setVolume(v),
        setTrack(key, { gap: seconds of silence first }), track(), keys(), render(key, seconds, { only: voice })
        (a Promise of an AudioBuffer, for the checks), compile(key) (the notes, for the checks), heard() (the notes
        the live player has started), state() (its AudioContext's state and time). */
(function () {
  "use strict";

  /* ====== pitches and chords ====== */
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(name) {
    var m = /^([A-G])(s|b)?(\d)$/.exec(name);
    if (!m) return null;
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === "s" ? 1 : m[2] === "b" ? -1 : 0);
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function pcOf(letter, acc) { return (PC[letter] + (acc === "s" ? 1 : acc === "b" ? 11 : 0)) % 12; }
  var QUAL = {
    "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10],
    dim: [0, 3, 6], dim7: [0, 3, 6, 9], aug: [0, 4, 8], sus4: [0, 5, 7], sus2: [0, 2, 7], "7sus4": [0, 5, 7, 10],
    "6": [0, 4, 7, 9], m6: [0, 3, 7, 9], "9": [0, 4, 7, 10, 14], maj9: [0, 4, 7, 11, 14], m9: [0, 3, 7, 10, 14],
    add9: [0, 4, 7, 14], "69": [0, 4, 7, 9, 14], "7b9": [0, 4, 7, 10, 13], mmaj7: [0, 3, 7, 11]
  };
  function chordOf(sym) {
    var m = /^([A-G])(s|b)?([a-z0-9]*)(?:\/([A-G])(s|b)?)?$/.exec(sym);
    if (!m || !QUAL[m[3]]) throw new Error("chord " + sym);
    var root = pcOf(m[1], m[2]), iv = QUAL[m[3]];
    return {
      sym: sym, root: root, iv: iv, bass: m[4] ? pcOf(m[4], m[5]) : root,
      pcs: iv.map(function (i) { return (root + i) % 12; })
    };
  }
  function near(pc, lo, hi, target) {
    var best = null;
    for (var m = lo; m <= hi; m++) {
      if (m % 12 !== pc) continue;
      if (target == null) return m;
      if (best === null || Math.abs(m - target) < Math.abs(best - target)) best = m;
    }
    return best;
  }

  /* ====== songs into notes ====== */
  var COUNTS = { 1: 1, 2: 1, 3: 1, 4: 1, 6: 1, 8: 1, 12: 1, 16: 1, 24: 1 };
  var DRUMS = "kshocrztuwvbxpq";
  var songs = {}, built = {};

  function define(obj) { Object.keys(obj).forEach(function (k) { songs[k] = obj[k]; delete built[k]; }); }

  function compile(key) {
    if (built[key]) return built[key];
    var s = songs[key];
    if (!s) return null;
    var bpb = 4, intro = s.intro || 0, events = [], chords = [], held = null;
    s.bars.forEach(function (bar) {
      var syms = (bar.c || "").trim().split(/\s+/).filter(Boolean);
      if (syms.length) held = syms.map(chordOf);
      chords.push(held || [chordOf("C")]);
    });
    function chordAt(bi, inBar) { var cs = chords[bi]; return cs[Math.min(cs.length - 1, Math.floor(inBar / (bpb / cs.length)))]; }

    Object.keys(s.voices).forEach(function (vn) {
      var vd = s.voices[vn], kit = vd.inst === "kit";
      var rg = (vd.range || "C3 C5").split(/\s+/).map(midi), lo = rg[0], hi = rg[1];
      var pats = vd.pat == null ? [""] : [].concat(vd.pat), prev = "", last = null, lastHz = null;
      s.bars.forEach(function (bar, bi) {
        var own = Object.prototype.hasOwnProperty.call(bar, vn);
        var pi = ((bi - intro) % pats.length + pats.length) % pats.length;
        var str = own ? bar[vn] : pats[pi];
        if (str === "%") str = prev;
        prev = str;
        var toks = str.trim() ? str.trim().split(/\s+/) : [];
        if (!toks.length) { last = null; return; }
        if (!COUNTS[toks.length]) throw new Error(key + ", bar " + (bi + 1) + ", " + vn + ": " + toks.length + " tokens");
        var step = bpb / toks.length;
        toks.forEach(function (tk, i) {
          if (tk === "-") { if (last) last.beats += step; return; }
          if (tk === ".") { last = null; return; }
          var ch = chordAt(bi, i * step);
          var ev = { beat: bi * bpb + i * step, beats: step, voice: vn, vel: 0.75, midi: [], drums: [], lit: true, chord: ch.sym, bar: bi };
          var m = /^(~?)(.+?)([\^_]?)$/.exec(tk);
          if (m[3] === "^") ev.vel = 1;
          if (m[3] === "_") ev.vel = 0.45;
          m[2].split("+").forEach(function (p) {
            if (kit) {
              if (p.length !== 1 || DRUMS.indexOf(p) < 0) throw new Error(key + ", bar " + (bi + 1) + ", " + vn + ": drum " + p);
              ev.drums.push(p);
              return;
            }
            var n = midi(p);
            if (n === null) { n = degree(p, ch, lo, hi, vd); ev.lit = false; }
            if (n === null) throw new Error(key + ", bar " + (bi + 1) + ", " + vn + ": token " + p);
            [].concat(n).forEach(function (x) { ev.midi.push(x); });
          });
          if (m[1] === "~" && lastHz) ev.from = lastHz;
          if (ev.midi.length) lastHz = hz(ev.midi[ev.midi.length - 1]);
          events.push(ev);
          last = ev;
        });
      });
    });
    events.sort(function (a, b) { return a.beat - b.beat; });
    var loopFrom = intro * bpb, loopIdx = events.length;
    for (var i = 0; i < events.length; i++) if (events[i].beat >= loopFrom - 1e-9) { loopIdx = i; break; }
    built[key] = {
      key: key, bpm: s.bpm, swing: s.swing || 0.5, gain: s.gain || 1, bpb: bpb, len: s.bars.length * bpb, loopFrom: loopFrom,
      loopIdx: loopIdx, events: events, voices: s.voices, chords: chords
    };
    return built[key];
  }

  /* R T F S O B C and a to h, the chord's notes placed in a voice's range */
  function degree(p, ch, lo, hi, vd) {
    var r = near(ch.root, lo, hi);
    if (r === null) return null;
    function at(iv) { return near((ch.root + iv) % 12, lo, hi, r + iv); }
    if (p === "R") return r;
    if (p === "B") return near(ch.bass, lo, hi);
    if (p === "T") return at(ch.iv[1]);
    if (p === "F") return at(ch.iv[2]);
    if (p === "S") return at(ch.iv.length > 3 && ch.iv[3] < 12 ? ch.iv[3] : 12);
    if (p === "O") return r + 12 <= hi ? r + 12 : r;
    var pcs = ch.pcs;
    if (vd.rootless && pcs.length >= 4) pcs = pcs.filter(function (x) { return x !== ch.root; });
    if (p === "C") {
      var out = [];
      for (var m = lo; m < lo + 12; m++) if (pcs.indexOf(m % 12) >= 0) out.push(m);
      return out;
    }
    if (/^[a-h]$/.test(p)) {
      var k = p.charCodeAt(0) - 97, list = [];
      for (var q = lo; q <= lo + 48 && list.length <= k; q++) if (pcs.indexOf(q % 12) >= 0) list.push(q);
      return list[k] == null ? null : list[k];
    }
    return null;
  }

  /* ====== sound ====== */
  function lcg(seed) {
    var x = seed >>> 0;
    return function () { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; };
  }
  function makeEnv(c) {
    var E = { ctx: c, waves: {}, rnd: lcg(20261117) };
    var sr = c.sampleRate, r = lcg(99);
    E.noise = c.createBuffer(1, sr, sr);
    var d = E.noise.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = r() * 2 - 1;
    E.vol = c.createGain();
    E.vol.gain.value = volume;
    var comp = c.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 3;
    comp.attack.value = 0.004; comp.release.value = 0.25;
    E.vol.connect(comp);
    comp.connect(c.destination);
    E.mix = c.createGain();
    E.mix.connect(E.vol);
    E.revIn = c.createGain();
    var conv = c.createConvolver(), wet = c.createGain();
    conv.buffer = impulse(c, 1.8, 0.42);
    wet.gain.value = 0.7;
    E.revIn.connect(conv);
    conv.connect(wet);
    wet.connect(E.mix);
    return E;
  }
  function impulse(c, secs, tau) {
    var sr = c.sampleRate, n = Math.floor(sr * secs), b = c.createBuffer(2, n, sr), r = lcg(7);
    for (var ch = 0; ch < 2; ch++) {
      var d = b.getChannelData(ch), y = 0;
      for (var i = 0; i < n; i++) { y += 0.3 * ((r() * 2 - 1) - y); d[i] = y * Math.exp(-i / sr / tau); }
    }
    return b;
  }

  /* custom waves: a function gives cosine terms (pulses), a list gives sine harmonics */
  var WAVES = {
    pulse25: function (n) { return 2 / (n * Math.PI) * Math.sin(n * Math.PI * 0.25); },
    pulse12: function (n) { return 2 / (n * Math.PI) * Math.sin(n * Math.PI * 0.125); },
    reed: [1, 0.75, 0.62, 0.5, 0.42, 0.33, 0.26, 0.2, 0.15, 0.11, 0.08, 0.06],
    organ: [1, 0.7, 0.45, 0.32, 0, 0.22, 0, 0.14, 0, 0.08]
  };
  function setWave(E, o, w) {
    if (w === "sine" || w === "square" || w === "sawtooth" || w === "triangle") { o.type = w; return; }
    if (!E.waves[w]) {
      var N = 40, re = new Float32Array(N), im = new Float32Array(N), def = WAVES[w];
      for (var n = 1; n < N; n++) { if (typeof def === "function") re[n] = def(n); else im[n] = def[n - 1] || 0; }
      E.waves[w] = E.ctx.createPeriodicWave(re, im);
    }
    o.setPeriodicWave(E.waves[w]);
  }

  /* An instrument from a description:
       osc: oscillators { w: wave, m: frequency multiple, g: gain, d: detune in cents, dec: decay of this partial }
       amp: [attack, decay time constant, sustain level, release], level: loudness at full velocity
       filter: { type, f, to, time, q, track } (track: f and to are multiples of the note's frequency)
       vib: [rate, cents, delay], trem: [rate, depth], glide: seconds, scoop: cents below the note at the attack */
  function synth(spec) {
    return function (E, out, t, gate, f, v, from) {
      var c = E.ctx, A = spec.amp, end = t + Math.max(gate, A[0]), stop = end + A[3] * 2.5 + 0.05;
      var g = c.createGain(), peak = v * spec.level, into = g;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(peak, t + A[0]);
      if (A[1] > 0) g.gain.setTargetAtTime(peak * A[2], t + A[0], A[1]);
      g.gain.setTargetAtTime(0, end, A[3] / 3);
      if (spec.filter) {
        var F = spec.filter, fl = c.createBiquadFilter();
        fl.type = F.type || "lowpass";
        fl.Q.value = F.q || 0.7;
        fl.frequency.setValueAtTime(Math.min(F.track ? F.f * f : F.f, 16000), t);
        if (F.to) fl.frequency.setTargetAtTime(Math.min(F.track ? F.to * f : F.to, 16000), t, F.time || 0.1);
        fl.connect(g);
        into = fl;
      }
      if (spec.trem) {
        var tg = c.createGain(), tl = c.createOscillator(), td = c.createGain();
        tg.gain.value = 1 - spec.trem[1];
        tl.frequency.value = spec.trem[0];
        td.gain.value = spec.trem[1];
        tl.connect(td);
        td.connect(tg.gain);
        g.connect(tg);
        tg.connect(out);
        tl.start(t);
        tl.stop(stop);
      } else {
        g.connect(out);
      }
      var vg = null;
      if (spec.vib) {
        var vl = c.createOscillator();
        vg = c.createGain();
        vl.frequency.value = spec.vib[0];
        vg.gain.setValueAtTime(0, t);
        vg.gain.setValueAtTime(0, t + spec.vib[2]);
        vg.gain.linearRampToValueAtTime(spec.vib[1], t + spec.vib[2] + 0.2);
        vl.connect(vg);
        vl.start(t);
        vl.stop(stop);
      }
      spec.osc.forEach(function (o) {
        var os = c.createOscillator(), og = c.createGain(), fm = f * (o.m || 1);
        setWave(E, os, o.w);
        if (from && spec.glide) {
          os.frequency.setValueAtTime(from * (o.m || 1), t);
          os.frequency.exponentialRampToValueAtTime(fm, t + spec.glide);
        } else {
          os.frequency.setValueAtTime(fm, t);
        }
        if (spec.scoop) {
          os.detune.setValueAtTime((o.d || 0) - spec.scoop, t);
          os.detune.linearRampToValueAtTime(o.d || 0, t + 0.06);
        } else if (o.d) {
          os.detune.setValueAtTime(o.d, t);
        }
        og.gain.setValueAtTime(o.g, t);
        if (o.dec) og.gain.setTargetAtTime(0, t, o.dec);
        os.connect(og);
        og.connect(into);
        if (vg) vg.connect(os.detune);
        os.start(t);
        os.stop(stop);
      });
    };
  }

  /* an electric piano by frequency modulation: a 1:1 bell that mellows, and a short tine */
  function epiano(E, out, t, gate, f, v) {
    var c = E.ctx, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain();
    var tine = c.createOscillator(), tg = c.createGain(), g = c.createGain(), stop = t + gate + 0.5;
    car.frequency.setValueAtTime(f, t);
    mod.frequency.setValueAtTime(f, t);
    mg.gain.setValueAtTime(f * (0.9 + 0.9 * v), t);
    mg.gain.setTargetAtTime(f * 0.18, t, 0.3);
    tine.frequency.setValueAtTime(f * 14, t);
    tg.gain.setValueAtTime(f * 0.7 * v, t);
    tg.gain.setTargetAtTime(0, t, 0.015);
    mod.connect(mg);
    mg.connect(car.frequency);
    tine.connect(tg);
    tg.connect(car.frequency);
    var peak = v * 0.3;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.004);
    g.gain.setTargetAtTime(peak * 0.25, t + 0.004, 0.9);
    g.gain.setTargetAtTime(0, t + gate, 0.06);
    car.connect(g);
    g.connect(out);
    [car, mod, tine].forEach(function (o) { o.start(t); o.stop(stop); });
  }

  var INST = {
    chip: synth({ osc: [{ w: "pulse25", g: 1 }], amp: [0.004, 0.3, 0.7, 0.05], level: 0.2 }),
    square: synth({ osc: [{ w: "square", g: 1 }], filter: { f: 5200 }, amp: [0.004, 0.25, 0.65, 0.05], level: 0.14 }),
    robot: synth({ osc: [{ w: "pulse12", g: 1 }, { w: "square", g: 0.35, d: 9 }], filter: { f: 7, to: 3, time: 0.08, track: true, q: 2 },
      amp: [0.003, 0.18, 0.55, 0.04], level: 0.24 }),
    whistle: synth({ osc: [{ w: "sine", g: 1 }, { w: "sine", m: 2, g: 0.05 }, { w: "triangle", m: 1, g: 0.12 }],
      amp: [0.035, 0, 1, 0.09], vib: [5.2, 14, 0.18], level: 0.36 }),
    flute: synth({ osc: [{ w: "sine", g: 1 }, { w: "triangle", g: 0.22 }, { w: "sine", m: 2, g: 0.12 }],
      amp: [0.05, 0.6, 0.85, 0.1], vib: [4.8, 12, 0.25], scoop: 25, level: 0.36 }),
    harmonica: synth({ osc: [{ w: "reed", g: 1 }, { w: "reed", g: 0.55, d: 7 }], filter: { f: 2400, q: 0.8 },
      amp: [0.025, 0.5, 0.8, 0.07], vib: [5.4, 10, 0.25], scoop: 30, level: 0.45 }),
    theremin: synth({ osc: [{ w: "sine", g: 1 }, { w: "triangle", g: 0.18 }], amp: [0.08, 0, 1, 0.18],
      vib: [6.2, 30, 0.04], glide: 0.12, level: 0.34 }),
    pluck: synth({ osc: [{ w: "sawtooth", g: 1 }], filter: { f: 9, to: 2, time: 0.12, track: true, q: 1.1 },
      amp: [0.003, 0.3, 0, 0.06], level: 0.36 }),
    banjo: synth({ osc: [{ w: "sawtooth", g: 0.8 }, { w: "pulse25", g: 0.5 }], filter: { f: 14, to: 3, time: 0.05, track: true, q: 2.2 },
      amp: [0.002, 0.15, 0, 0.05], level: 0.5 }),
    marimba: synth({ osc: [{ w: "sine", g: 1, dec: 0.28 }, { w: "sine", m: 4, g: 0.22, dec: 0.04 }, { w: "sine", m: 10, g: 0.05, dec: 0.01 }],
      amp: [0.002, 0, 1, 0.08], level: 0.5 }),
    vibes: synth({ osc: [{ w: "sine", g: 1, dec: 0.9 }, { w: "sine", m: 4, g: 0.14, dec: 0.22 }, { w: "sine", m: 3, g: 0.04, dec: 0.1 }],
      amp: [0.002, 0, 1, 0.25], trem: [5, 0.22], level: 0.65 }),
    bell: synth({ osc: [{ w: "sine", g: 1, dec: 1.2 }, { w: "sine", m: 2.01, g: 0.45, dec: 0.6 }, { w: "sine", m: 3, g: 0.22, dec: 0.35 },
      { w: "sine", m: 4.17, g: 0.12, dec: 0.18 }], amp: [0.002, 0, 1, 0.6], level: 0.32 }),
    organ: synth({ osc: [{ w: "organ", g: 1 }], amp: [0.006, 0, 1, 0.05], level: 0.15 }),
    bass: synth({ osc: [{ w: "square", g: 0.55 }, { w: "triangle", g: 1 }], filter: { f: 900, q: 0.8 },
      amp: [0.004, 0.3, 0.55, 0.05], level: 0.3 }),
    upright: synth({ osc: [{ w: "triangle", g: 1 }, { w: "sine", m: 2, g: 0.25 }, { w: "sawtooth", g: 0.12 }], filter: { f: 700, q: 0.6 },
      amp: [0.006, 0.45, 0.3, 0.08], level: 0.5 }),
    synthbass: synth({ osc: [{ w: "sawtooth", g: 1 }, { w: "square", m: 0.5, g: 0.35 }], filter: { f: 10, to: 2.4, time: 0.07, track: true, q: 6 },
      amp: [0.003, 0.2, 0.6, 0.04], level: 0.26 }),
    pad: synth({ osc: [{ w: "sawtooth", g: 0.6, d: -8 }, { w: "sawtooth", g: 0.6, d: 8 }], filter: { f: 1700, q: 0.5 },
      amp: [0.25, 0, 1, 0.45], level: 0.11 }),
    brass: synth({ osc: [{ w: "sawtooth", g: 1 }, { w: "sawtooth", g: 0.7, d: 7 }], filter: { f: 2, to: 5, time: 0.05, track: true, q: 1.5 },
      amp: [0.03, 0.3, 0.75, 0.08], level: 0.16 }),
    epiano: epiano
  };

  /* drums: a filtered noise burst, a falling tone */
  function hit(E, out, t, v, f, type, q, peak, tau, attack) {
    var c = E.ctx, n = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), a = attack || 0.002;
    n.buffer = E.noise;
    fl.type = type;
    fl.frequency.value = f;
    fl.Q.value = q;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * peak, t + a);
    g.gain.setTargetAtTime(0, t + a, tau);
    n.connect(fl);
    fl.connect(g);
    g.connect(out);
    n.start(t, E.rnd() * 0.5);
    n.stop(t + a + tau * 7 + 0.02);
  }
  function thump(E, out, t, v, f0, f1, sweep, peak, tau, type) {
    var c = E.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * peak, t + 0.002);
    g.gain.setTargetAtTime(0, t + 0.004, tau);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + tau * 7 + 0.02);
  }
  var DRUM = {
    k: function (E, o, t, v) { thump(E, o, t, v, 165, 48, 0.1, 1.0, 0.09); thump(E, o, t, v, 330, 96, 0.05, 0.25, 0.03); hit(E, o, t, v, 2500, "lowpass", 0.5, 0.12, 0.004); },
    s: function (E, o, t, v) { hit(E, o, t, v, 1900, "bandpass", 0.7, 0.5, 0.05); thump(E, o, t, v, 230, 170, 0.05, 0.28, 0.03, "triangle"); },
    h: function (E, o, t, v) { hit(E, o, t, v, 8000, "highpass", 0.7, 0.26, 0.012); },
    o: function (E, o, t, v) { hit(E, o, t, v, 7000, "highpass", 0.7, 0.2, 0.09); },
    c: function (E, o, t, v) {
      [0, 0.011, 0.022].forEach(function (d) { hit(E, o, t + d, v, 1300, "bandpass", 1.1, 0.45, 0.006); });
      hit(E, o, t + 0.03, v, 1300, "bandpass", 1.1, 0.4, 0.05);
    },
    r: function (E, o, t, v) { thump(E, o, t, v, 1750, 1650, 0.02, 0.5, 0.012, "triangle"); hit(E, o, t, v, 3500, "bandpass", 1.5, 0.35, 0.006); },
    z: function (E, o, t, v) { hit(E, o, t, v, 6500, "bandpass", 0.9, 0.5, 0.03, 0.012); },
    t: function (E, o, t, v) { thump(E, o, t, v, 170, 95, 0.18, 0.7, 0.12); },
    u: function (E, o, t, v) { thump(E, o, t, v, 260, 160, 0.15, 0.6, 0.1); },
    w: function (E, o, t, v) { thump(E, o, t, v, 1200, 1150, 0.02, 0.6, 0.02); thump(E, o, t, v, 2600, 2500, 0.01, 0.15, 0.008); },
    v: function (E, o, t, v) { thump(E, o, t, v, 820, 790, 0.02, 0.6, 0.025); },
    b: function (E, o, t, v) { hit(E, o, t, v, 3800, "bandpass", 0.5, 0.7, 0.07, 0.02); },
    x: function (E, o, t, v) { hit(E, o, t, v, 5500, "highpass", 0.5, 0.18, 0.45); },
    p: function (E, o, t, v) { blip(E, o, t, v, 1568); },
    q: function (E, o, t, v) { blip(E, o, t, v, 784); }
  };
  function blip(E, out, t, v, f) {
    var c = E.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = "square";
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v * 0.1, t + 0.002);
    g.gain.setValueAtTime(v * 0.1, t + 0.03);
    g.gain.linearRampToValueAtTime(0, t + 0.04);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + 0.06);
  }

  /* ====== playing a song ====== */
  function warp(S, beat) {
    var w = Math.floor(beat), p = beat - w, s = S.swing;
    return w + (p <= 0.5 ? p * 2 * s : s + (p - 0.5) * 2 * (1 - s));
  }
  function begin(E, key, when, only) {
    var S = compile(key);
    if (!S) return null;
    var c = E.ctx, I = { S: S, E: E, base: when, idx: 0, v: {}, only: only || null };
    I.bus = c.createGain();
    I.wet = c.createGain();
    [I.bus, I.wet].forEach(function (g) {
      g.gain.setValueAtTime(0, Math.max(0, c.currentTime));
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(S.gain, when + 0.08);
    });
    I.bus.connect(E.mix);
    I.wet.connect(E.revIn);
    Object.keys(S.voices).forEach(function (vn) {
      var vd = S.voices[vn], g = c.createGain();
      g.gain.value = vd.gain == null ? 1 : vd.gain;
      if (c.createStereoPanner) {
        var p = c.createStereoPanner();
        p.pan.value = vd.pan || 0;
        g.connect(p);
        p.connect(I.bus);
      } else {
        g.connect(I.bus);
      }
      if (vd.rev) {
        var sg = c.createGain();
        sg.gain.value = vd.rev;
        g.connect(sg);
        sg.connect(I.wet);
      }
      I.v[vn] = g;
    });
    return I;
  }
  function fill(I, until) {
    var S = I.S, ev = S.events, spb = 60 / S.bpm;
    if (!ev.length) return;
    for (;;) {
      if (I.idx >= ev.length) {
        if (S.loopIdx >= ev.length) return;
        I.base += (S.len - S.loopFrom) * spb;
        I.idx = S.loopIdx;
      }
      var e = ev[I.idx], t = I.base + warp(S, e.beat) * spb;
      if (t >= until) return;
      I.idx += 1;
      if (I.only && I.only !== e.voice) continue;
      if (I.E === live) heard += 1;
      var vd = S.voices[e.voice], out = I.v[e.voice];
      var gate = (warp(S, e.beat + e.beats) - warp(S, e.beat)) * spb * (vd.legato || 0.92);
      try {
        if (vd.inst === "kit") e.drums.forEach(function (d) { DRUM[d](I.E, out, t, e.vel); });
        else e.midi.forEach(function (m, j) { INST[vd.inst](I.E, out, t + j * (vd.strum || 0), gate, hz(m), e.vel, e.from); });
      } catch (err) { /* a note that cannot sound is skipped */ }
    }
  }
  function finish(I, at) {
    [I.bus, I.wet].forEach(function (g) {
      g.gain.cancelScheduledValues(at);
      g.gain.setValueAtTime(g.gain.value, at);
      g.gain.linearRampToValueAtTime(0, at + 0.25);
    });
    setTimeout(function () { try { I.bus.disconnect(); I.wet.disconnect(); } catch (e) { /* gone */ } }, 1500);
  }

  /* ====== the live player ====== */
  var live = null, cur = "title", inst = null, playing = false, timer = 0, volume = 0.37, heard = 0;
  function liveEnv() {
    if (live) return live;
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    live = makeEnv(new C());
    return live;
  }
  function tick() {
    if (!playing || !inst) return;
    fill(inst, live.ctx.currentTime + 0.4);
    timer = setTimeout(tick, 90);
  }
  function start() {
    var E = liveEnv();
    if (!E) return false;
    if (E.ctx.state === "suspended" && E.ctx.resume) E.ctx.resume();
    if (playing) return true;
    playing = true;
    E.vol.gain.cancelScheduledValues(E.ctx.currentTime);
    E.vol.gain.setValueAtTime(volume, E.ctx.currentTime);
    inst = begin(E, cur, E.ctx.currentTime + 0.06);
    tick();
    return true;
  }
  function stop() {
    if (!playing) return false;
    playing = false;
    clearTimeout(timer);
    if (inst) finish(inst, live.ctx.currentTime);
    inst = null;
    return false;
  }
  function setTrack(key, opt) {
    if (!songs[key] || key === cur) return;
    cur = key;
    if (!playing) return;
    var now = live.ctx.currentTime, gap = opt && opt.gap != null ? opt.gap : 0.25;
    if (inst) finish(inst, now);
    inst = begin(live, key, now + Math.max(0.25, gap));
    clearTimeout(timer);
    tick();
  }
  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (live) live.vol.gain.setTargetAtTime(volume, live.ctx.currentTime, 0.05);
  }
  function render(key, seconds, opt) {
    var OC = window.OfflineAudioContext || window.webkitOfflineAudioContext, sr = 44100;
    var c = new OC(2, Math.ceil(sr * seconds), sr), E = makeEnv(c), I = begin(E, key, 0.02, opt && opt.only);
    if (!I) return Promise.reject(new Error("no song " + key));
    fill(I, seconds);
    return c.startRendering();
  }

  window.Music = {
    define: define, compile: compile, render: render, start: start, stop: stop,
    keys: function () { return Object.keys(songs); },
    heard: function () { return heard; },
    state: function () { return live ? { state: live.ctx.state, time: live.ctx.currentTime } : null; },
    toggle: function () { return playing ? stop() : start(); },
    isPlaying: function () { return playing; },
    setVolume: setVolume, setTrack: setTrack, track: function () { return cur; }
  };
})();
