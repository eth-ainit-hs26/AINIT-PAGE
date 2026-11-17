/* tracks.js: Last-Minute Pricing's songs for ../kit/music.js, written for this game (an airport gate, lounge bossa).
     title     "Now Boarding": the gate's three-note chime, then the theme on vibraphone over a bossa (F major)
     tutorial  the theme slower on flute, electric piano and shaker (F major)
     play      "Fill the Flight": a faster bossa in D minor with a ticking clock, vibraphone, a brighter middle part
     end       "Landed": vibraphone and electric piano, the chime to close (F major)
   js/game.js calls Music.setTrack with the screen's name; the notation is in ../kit/music.js. */
(function () {
  var M = window.Music;
  if (!M) return;

  function tune(rows, voice) {
    return rows.map(function (r) { var b = { c: r[0] }; b[voice] = r[1]; return b; });
  }
  function put(list, i, more) { Object.keys(more).forEach(function (k) { list[i][k] = more[k]; }); }
  var CHIME = "A4 . C5 . F5 - - -";

  /* the theme, 16 bars */
  var THEME = [
    ["Fmaj7", "E5 - - D5 E5 - - -"],
    ["Fmaj7", ". C5 D5 E5 - - D5 C5"],
    ["Gm7", "D5 - - C5 D5 - - -"],
    ["C7", ". Bb4 C5 D5 - - C5 Bb4"],
    ["Am7", "E5 - - C5 - - A4 -"],
    ["D7", "Fs4 - - A4 - - C5 -"],
    ["Gm7", "Bb4 - - A4 Bb4 - - D5"],
    ["C7", "- - - C5 - - Bb4 -"],
    ["Bbmaj7", "D5 - - - F5 - - -"],
    ["Bbm6", "G5 - - F5 - - Db5 -"],
    ["Am7", "C5 - - - E5 - - -"],
    ["D7", "Fs5 - - E5 - - D5 C5"],
    ["Gm7", "Bb4 - - - D5 - F5 -"],
    ["C7", "E5 - - D5 - - C5 -"],
    ["Fmaj7", "A4 - - C5 - - E5 -"],
    ["C7", "G5 - - E5 - - C5 -"]
  ];

  /* ====== title: Now Boarding ====== */
  var title = tune(THEME, "lead");
  title.unshift(
    { c: "Fmaj7", bell: CHIME, lead: "", keys: "", bass: "", perc: "", kick: "" },
    { c: "C7", lead: "" }
  );

  /* ====== tutorial ====== */
  var tutorial = tune(THEME, "lead");

  /* ====== play: Fill the Flight ====== */
  var FLIGHT_A = [
    ["Dm7", "A4 - D5 - F5 - D5 C5"],
    ["Dm7", "- - - A4 - - . ."],
    ["Gm7", "Bb4 - D5 - G5 - F5 D5"],
    ["A7", "E5 - - Cs5 - - . ."],
    ["Dm7", "F5 - - E5 F5 - A5 -"],
    ["Bbmaj7", "A5 - - G5 F5 - D5 -"],
    ["Em7b5", "Bb4 - - D5 - - E5 -"],
    ["A7", "Cs5 - - - E5 - A4 -"]
  ];
  var FLIGHT_B = [
    ["Bbmaj7", "D5 - - - F5 - - -"],
    ["C7", "E5 - - - G5 - - -"],
    ["Fmaj7", "A5 - - G5 - - E5 -"],
    ["Dm7", "F5 - - - D5 - - -"],
    ["Gm7", "Bb4 - - D5 - - F5 -"],
    ["C7", "E5 - - G5 - - Bb5 -"],
    ["Fmaj7", "A5 - - - - - E5 -"],
    ["A7", "E5 - - Cs5 - - A4 -"]
  ];
  var FLIGHT_A2 = FLIGHT_A.slice(0, 4).concat([
    ["Dm7", "F5 - - D5 - - A4 -"],
    ["Bbmaj7", "Bb4 - - D5 - - F5 -"],
    ["Em7b5", "E5 - - D5 - - Bb4 -"],
    ["A7", "A4 - - - . . . ."]
  ]);
  var play = tune(FLIGHT_A.concat(FLIGHT_B, FLIGHT_A2), "lead");
  play.unshift({ c: "A7", lead: "", keys: "", perc: "", kick: "", bass: "A2 - - - E2 - - -" });
  for (var i = 9; i <= 16; i++) put(play, i, { clock: "" });

  /* ====== end: Landed ====== */
  var end = tune([
    ["Fmaj7", "E5 - - - C5 - - -"],
    ["Bbmaj7", "D5 - - - F5 - - -"],
    ["Am7", "E5 - - - C5 - - -"],
    ["D7", "C5 - - - A4 - - -"],
    ["Gm7", "Bb4 - - - D5 - - -"],
    ["C7", "E5 - - - G5 - - -"],
    ["Fmaj7", "A5 - - - - - - -"],
    ["Fmaj7", ""]
  ], "lead");
  put(end, 7, { bell: CHIME });

  var KEYS = { inst: "epiano", gain: 0.45, pan: -0.2, rev: 0.2, range: "A3 A4", rootless: true, legato: 0.85,
    pat: ["C - . C - . C -", ". . C - . C - -"] };
  var BASS = { inst: "upright", gain: 1, range: "E2 D3", pat: "B - - F F - - -" };
  var PERC = { inst: "kit", gain: 1, pan: 0.15, rev: 0.08, pat: ["r+z z_ z r+z z_ z r+z z_", "z z_ r+z z z_ r+z z z_"] };
  var KICK = { inst: "kit", gain: 0.6, pat: "k_ . . k_ k_ . . k_" };
  var BELL = { inst: "bell", gain: 0.9, rev: 0.35 };

  M.define({
    title: {
      bpm: 126, intro: 2, gain: 0.75, bars: title,
      voices: { lead: { inst: "vibes", gain: 1, pan: 0.1, rev: 0.3 }, bell: BELL, keys: KEYS, bass: BASS, perc: PERC, kick: KICK }
    },
    tutorial: {
      bpm: 100, gain: 0.8, bars: tutorial,
      voices: {
        lead: { inst: "flute", gain: 0.9, pan: 0.05, rev: 0.3 }, keys: KEYS, bass: BASS,
        perc: { inst: "kit", gain: 0.8, pan: 0.15, rev: 0.08, pat: "z z_ z z_ z z_ z z_" }
      }
    },
    play: {
      bpm: 138, intro: 1, gain: 0.73, bars: play,
      voices: {
        lead: { inst: "vibes", gain: 1, pan: 0.1, rev: 0.25 }, keys: KEYS, bass: BASS, perc: PERC, kick: KICK,
        clock: { inst: "kit", gain: 1, pan: -0.1, pat: "w . v . w . v ." }
      }
    },
    end: {
      bpm: 92, gain: 0.88, bars: end,
      voices: {
        lead: { inst: "vibes", gain: 1, pan: 0.1, rev: 0.35 }, bell: BELL, keys: KEYS, bass: BASS,
        perc: { inst: "kit", gain: 0.8, pan: 0.15, rev: 0.08, pat: "z . z_ . z . z_ ." }
      }
    }
  });
})();
