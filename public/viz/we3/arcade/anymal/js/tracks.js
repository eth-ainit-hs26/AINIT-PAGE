/* tracks.js: ANYmal's songs for ../kit/music.js, written for this game (a robot dog, treats, two ghosts).
     title     "Boot Up": three low beeps and a high one, a rising arpeggio, then the theme on the robot lead over
               synth bass, pad and a funk beat (E minor)
     tutorial  the theme slower on marimba over bass, pad, kick, rim and shaker (E minor)
     play      "Treat Hunt": a faster funk on the robot lead (E minor); in the middle part the ghosts' theremin
               glides over a marimba figure and a half-time beat
     end       "Good Dog": a slow tune on marimba (G major) that closes with a falling arpeggio, the robot powering down
   js/game.js calls Music.setTrack with the screen's name; the notation is in ../kit/music.js. */
(function () {
  var M = window.Music;
  if (!M) return;

  function tune(rows, voice) {
    return rows.map(function (r) { var b = { c: r[0] }; b[voice] = r[1]; return b; });
  }
  function put(list, i, more) { Object.keys(more).forEach(function (k) { list[i][k] = more[k]; }); }

  /* the theme, 16 bars: a funk riff (bars 1 to 8), longer notes (bars 9 to 16) */
  var THEME = [
    ["Em7", "E5 . . E5 . . D5 . E5 . . G5 . . E5 ."],
    ["Em7", "B5 - - - G5 - - - E5 - D5 - B4 - - -"],
    ["Am7", "A5 . . A5 . . G5 . A5 . . C6 . . A5 ."],
    ["Am7", "E5 - - - C5 - - - A4 - G4 - A4 - - -"],
    ["Cmaj7", "G5 . . G5 . . E5 . G5 . . B5 . . G5 ."],
    ["D", "A5 - - - Fs5 - - - D5 - - - . . . ."],
    ["Em7", "E5 . . E5 . . D5 . E5 . . G5 . . B5 ."],
    ["B7", "A5 - Fs5 - Ds5 - B4 -"],
    ["Cmaj7", "G5 - - E5 - - C5 -"],
    ["D", "D5 - - Fs5 - - A5 -"],
    ["Bm7", "B5 - - A5 - - Fs5 -"],
    ["Em7", "G5 - - - E5 - - -"],
    ["Am7", "C6 - - A5 - - E5 -"],
    ["D", "Fs5 - - D5 - - A4 -"],
    ["Cmaj7", "G5 - - - E5 - B4 -"],
    ["B7", "B4 - Ds5 - Fs5 - Ds5 -"]
  ];

  /* ====== title: Boot Up ====== */
  var title = tune(THEME, "lead");
  title.unshift(
    { c: "Em7", beep: "q . . . q . . . q . . . p . . .", lead: "", pad: "", bass: "", kit: "", hat: "" },
    { c: "Em7", boot: "E3 G3 B3 D4 E4 G4 B4 D5 E5 - - - . . . .", lead: "", bass: "", hat: "",
      kit: ". . . . . . . . . . . . s_ s_ s s^" }
  );

  /* ====== tutorial ====== */
  var tutorial = tune(THEME, "lead");

  /* ====== play: Treat Hunt ====== */
  var HUNT_A = [
    ["Em7", "E5 - G5 E5 . B4 D5 E5"],
    ["A7", "Cs5 - E5 Cs5 . A4 G4 A4"],
    ["Em7", "E5 - G5 E5 . B5 - G5"],
    ["A7", "A5 - G5 E5 . Cs5 - A4"],
    ["G", "D5 - - B4 D5 - G5 -"],
    ["A", "E5 - - Cs5 E5 - A5 -"],
    ["Em7", "B5 - - G5 - - E5 -"],
    ["B7", "A5 - Fs5 - Ds5 - B4 Ds5"]
  ];
  /* the ghosts: a theremin that glides */
  var HUNT_B = [
    ["Cmaj7", "G5 - - - - - ~E5 -"],
    ["B7", "Ds5 - - - - - ~Fs5 -"],
    ["Em7", "G5 - - - ~B5 - - -"],
    ["Em7", "~E5 - - - - - . ."],
    ["Cmaj7", "E5 - - - ~G5 - - -"],
    ["B7", "~Fs5 - - - ~A5 - - -"],
    ["Am7", "~G5 - - - ~E5 - - -"],
    ["B7", "Ds5 - - - - - - -"]
  ];
  var HUNT_A2 = HUNT_A.slice(0, 6).concat([
    ["Em7", "B5 - G5 - E5 - D5 -"],
    ["B7", "Fs5 - Ds5 - B4 - Ds5 -"]
  ]);
  var play = tune(HUNT_A, "lead").concat(tune(HUNT_B, "ghost"), tune(HUNT_A2, "lead"));
  play.unshift({ c: "Em7", lead: "", pad: "", kit: "k . k . k s s^ s^" });
  put(play, 8, { kit: "k . k+s . u u t t" });
  for (var i = 9; i <= 16; i++) {
    put(play, i, { bass: "R", kit: "k . . . . . . . s . . . . . . .", hat: "h_ . h_ . h_ . h_ .",
      arp: "a c d c a c d c a c d c a c d c" });
  }
  put(play, 9, { kit: "x+k . . . . . . . s . . . . . . ." });
  put(play, 17, { kit: "x+k . k+s . k . k+s ." });
  put(play, 24, { kit: "k . k+s . k s s^ s^" });

  /* ====== end: Good Dog ====== */
  var end = tune([
    ["Gmaj7", "B4 - D5 - Fs5 - D5 -"],
    ["Em7", "E5 - G5 - B5 - G5 -"],
    ["Cmaj7", "C5 - E5 - G5 - E5 -"],
    ["D", "Fs5 - - - A5 - - -"],
    ["Gmaj7", "B5 - A5 - G5 - Fs5 -"],
    ["Em7", "G5 - E5 - D5 - B4 -"],
    ["Am7 D", "C5 - E5 - D5 - Fs5 -"],
    ["G", "G5 - - - - - - -"]
  ], "lead");
  put(end, 7, { boot: ". . D5 B4 G4 D4 B3 G3" });

  var PAD = { inst: "pad", gain: 1.05, range: "E3 E4", rootless: true, pat: "C" };
  var BOOT = { inst: "chip", gain: 1, pan: -0.1, rev: 0.3, legato: 0.9 };

  M.define({
    title: {
      bpm: 112, intro: 2, gain: 0.88, bars: title,
      voices: {
        lead: { inst: "robot", gain: 1.5, pan: 0.1, rev: 0.18, legato: 0.7 },
        beep: { inst: "kit", gain: 1, rev: 0.3 }, boot: BOOT, pad: PAD,
        bass: { inst: "synthbass", gain: 1.55, range: "E2 Eb4", legato: 0.6, pat: "R . . R . . O . R . . O . . F ." },
        kit: { inst: "kit", gain: 0.55, rev: 0.05, pat: "k . . k s . . . k . . k s . . ." },
        hat: { inst: "kit", gain: 1.1, pan: 0.2, pat: "h_ h_ h h_ h_ h_ h h_ h_ h_ h h_ h_ h_ o_ h_" }
      }
    },
    tutorial: {
      bpm: 100, gain: 0.82, bars: tutorial,
      voices: {
        lead: { inst: "marimba", gain: 1.5, pan: 0.05, rev: 0.25 }, pad: PAD,
        bass: { inst: "bass", gain: 1.3, range: "E2 D3", pat: "R - . . F - . ." },
        kit: { inst: "kit", gain: 0.6, rev: 0.08, pat: "k . r_ . k k r_ ." },
        shaker: { inst: "kit", gain: 1.05, pan: 0.2, pat: "z_ z z_ z z_ z z_ z" }
      }
    },
    play: {
      bpm: 136, intro: 1, gain: 0.79, bars: play,
      voices: {
        lead: { inst: "robot", gain: 1.4, pan: 0.1, rev: 0.15, legato: 0.75 },
        ghost: { inst: "theremin", gain: 0.75, pan: -0.1, rev: 0.4 },
        arp: { inst: "marimba", gain: 0.28, pan: 0.25, rev: 0.25, range: "E4 E5" },
        pad: PAD,
        bass: { inst: "synthbass", gain: 1, range: "E2 Eb4", legato: 0.6, pat: "R R O R R R O F" },
        kit: { inst: "kit", gain: 0.65, rev: 0.05, pat: "k . k+s . k . k+s ." },
        hat: { inst: "kit", gain: 1.2, pan: 0.2, pat: "h_ h h_ h h_ h h_ o_" }
      }
    },
    end: {
      bpm: 88, gain: 0.83, bars: end,
      voices: {
        lead: { inst: "marimba", gain: 1.6, pan: 0.05, rev: 0.3 }, boot: BOOT, pad: PAD,
        bass: { inst: "bass", gain: 1.05, range: "E2 D3", pat: "R - - - F - - -" },
        kit: { inst: "kit", gain: 0.95, rev: 0.1, pat: "k_ . r_ . k_ . r_ ." }
      }
    }
  });
})();
