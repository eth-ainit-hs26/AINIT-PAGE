/* tracks.js: Old Bessie's songs for ../kit/music.js, written for this game (country, the van and her town).
     title     "Old Bessie": the theme on harmonica over a country two-step, a horn's honk honk to open (G major)
     tutorial  the theme slower, whistled over a picked guitar (G major)
     play      "On the Road": a train beat, harmonica and banjo for the 13 weeks (C major)
     end       "Home Again": whistled, for the end card (G major)
   js/game.js calls Music.setTrack with the screen's name; the notation is in ../kit/music.js. */
(function () {
  var M = window.Music;
  if (!M) return;

  function tune(rows, voice) {
    return rows.map(function (r) { var b = { c: r[0] }; b[voice] = r[1]; return b; });
  }
  function put(list, i, more) { Object.keys(more).forEach(function (k) { list[i][k] = more[k]; }); }

  /* the theme, 16 bars */
  var THEME = [
    ["G", "B4 - A4 G4 - B4 D5 -"],
    ["C", "E5 - D5 - C5 B4 A4 -"],
    ["G", "B4 - A4 G4 - B4 D5 -"],
    ["D7", "Fs5 - E5 - D5 - C5 -"],
    ["G", "B4 - D5 G5 - Fs5 E5 D5"],
    ["C", "E5 - C5 - - D5 E5 G5"],
    ["D7", "A5 - Fs5 - D5 - C5 -"],
    ["G", "B4 - G4 - - - . ."],
    ["C", "G5 - - - E5 - G5 -"],
    ["G", "D5 - - - B4 - D5 -"],
    ["C", "E5 - G5 - A5 - G5 E5"],
    ["G", "D5 - - B4 - - G4 A4"],
    ["Em", "B4 - - C5 B4 - G4 -"],
    ["A7", "A4 - Cs5 - E5 - G5 -"],
    ["D7", "Fs5 - - E5 D5 - C5 -"],
    ["D7", "A4 - - - . . Fs4 A4"]
  ];

  /* ====== title ====== */
  var title = tune(THEME, "lead");
  title.unshift({ c: "D7", horn: "A4+C5^ . A4+C5^ - . . . .", lead: ". . . . . . Fs4 A4", gtr: "", bass: ". . . . D3 - C3 -",
    drums: ". . . . s_ s s^ s" });
  [1, 10].forEach(function (i) { put(title, i, { bass: "G2 - . . A2 - B2 -" }); });
  put(title, 4, { bass: "D3 - C3 - B2 - A2 -" });
  put(title, 8, { horn: ". . . . . . B4+D5^ B4+D5^", bass: "G2 - . . A2 - B2 -", drums: "k h_ s h_ k h_ s s" });
  [9, 10, 11, 12].forEach(function (i) { put(title, i, { banjo: "a c b d a c b d" }); });
  put(title, 12, { bass: "G2 - . . D3 - B2 -" });
  put(title, 16, { bass: "D3 - . . A2 - Fs2 -", banjo: ". . D5 C5 A4 Fs4 . .", drums: "k h_ s h_ k s_ s s^" });

  /* ====== tutorial ====== */
  var tutorial = tune(THEME, "lead");
  [0, 9].forEach(function (i) { put(tutorial, i, { bass: "G2 - . . A2 - B2 -" }); });
  put(tutorial, 3, { bass: "D3 - C3 - B2 - A2 -" });
  put(tutorial, 7, { bass: "G2 - . . A2 - B2 -" });
  put(tutorial, 15, { bass: "D3 - . . A2 - Fs2 -" });

  /* ====== play: On the Road ====== */
  var ROAD_A = [
    ["C", "G4 - C5 - E5 - D5 C5"],
    ["C", "E5 - - D5 C5 - A4 G4"],
    ["F", "A4 - C5 - F5 - C5 D5"],
    ["C", "E5 - - - . . G4 G4"],
    ["C", "G4 - C5 - E5 - G5 -"],
    ["Am", "A5 - G5 - E5 - C5 -"],
    ["D7", "D5 - Fs5 A5 - - Fs5 E5"],
    ["G7", "D5 - B4 - G4 - . ."]
  ];
  var ROAD_B = [
    ["F", "F5 - - - A5 - - -"],
    ["F", "G5 - F5 - C5 - - -"],
    ["C", "E5 - - - G5 - - -"],
    ["C", "F5 - E5 - C5 - - -"],
    ["D7", "Fs5 - - - A5 - - -"],
    ["D7", "G5 - Fs5 - D5 - - -"],
    ["G", "G5 - - - D5 - B4 -"],
    ["G7", "F5 - - - D5 - B4 -"]
  ];
  var ROAD_A2 = ROAD_A.slice(0, 4).concat([
    ["F", "A5 - G5 - F5 - C5 -"],
    ["G7", "B4 - D5 - F5 - D5 B4"],
    ["C", "C5 - - - G4 - - -"],
    ["C", ". . . . . . . ."]
  ]);
  var play = tune(ROAD_A.concat(ROAD_B, ROAD_A2), "lead");
  play.unshift(
    { c: "C", lead: "", gtr: "", bass: "C3 C3 C3 C3 C3 C3 C3 C3", drums: "k . . . k . . ." },
    { c: "C", lead: "", bass: "C3 C3 C3 C3 G2 G2 G2 G2", banjo: "a c b d a c b d", drums: "k b_ s b_ k b_ s s^" }
  );
  /* bars 1 to 8 of the loop are play[2] to play[9], the B part play[10] to play[17], the last part play[18] to play[25] */
  [3, 19, 21].forEach(function (i) { put(play, i, { bass: "C3 - . . A2 - G2 -" }); });
  [4, 20].forEach(function (i) { put(play, i, { bass: "F2 - . . G2 - A2 -" }); });
  [8, 15].forEach(function (i) { put(play, i, { bass: "D3 - . . A2 - Fs2 -" }); });
  put(play, 9, { banjo: ". . . . G4 B4 D5 F5", bass: "G2 - . . D3 - B2 -" });
  for (var i = 10; i <= 17; i++) put(play, i, { banjo: "a c b d a c b d" });
  put(play, 17, { bass: "G2 - . . D3 - B2 -", drums: "k b_ s b_ k s_ s s^" });
  put(play, 25, { banjo: "c b a b c d e d", bass: "C3 - . . E2 - G2 -", drums: "k b_ s b_ k s_ s s^" });

  /* ====== end: Home Again ====== */
  var end = tune([
    ["G", "D5 - - - B4 - G4 -"],
    ["C", "E5 - - - C5 - E5 -"],
    ["G", "D5 - - - B4 - - -"],
    ["D7", "A4 - - - Fs4 - A4 -"],
    ["G", "B4 - - - D5 - G5 -"],
    ["C", "E5 - - - G5 - E5 -"],
    ["D7", "D5 - - - C5 - A4 -"],
    ["G", "G4 - - - - - - -"]
  ], "lead");

  var HARP = { inst: "harmonica", gain: 1, pan: 0.08, rev: 0.22 };
  var WHISTLE = { inst: "whistle", gain: 0.9, pan: 0.05, rev: 0.3 };
  var CHICK = { inst: "pluck", gain: 0.55, pan: -0.25, rev: 0.12, range: "G3 Fs4", strum: 0.014, legato: 0.4, pat: ". C . C" };
  var PICK = { inst: "pluck", gain: 0.8, pan: -0.2, rev: 0.18, range: "G3 G4", legato: 0.95, pat: "a c b c a c b c" };
  var BASS = { inst: "bass", gain: 0.85, range: "E2 D3", pat: "B - . . F - . ." };
  var BANJO = { inst: "banjo", gain: 0.45, pan: 0.3, rev: 0.12, range: "G4 G5", legato: 0.9 };

  M.define({
    title: {
      bpm: 120, swing: 0.58, intro: 1, bars: title,
      voices: {
        lead: HARP, horn: { inst: "chip", gain: 0.8, rev: 0.1, legato: 0.8 }, gtr: CHICK, bass: BASS, banjo: BANJO,
        drums: { inst: "kit", gain: 0.7, rev: 0.05, pat: "k h_ s h_ k h_ s h_" }
      }
    },
    tutorial: {
      bpm: 92, swing: 0.6, bars: tutorial,
      voices: {
        lead: WHISTLE, gtr: PICK, bass: { inst: "bass", gain: 0.6, range: "E2 D3", pat: "B - . . F - . ." },
        drums: { inst: "kit", gain: 0.5, rev: 0.1, pat: ". . b_ . . . b_ ." }
      }
    },
    play: {
      bpm: 132, swing: 0.55, intro: 2, bars: play,
      voices: {
        lead: HARP, gtr: CHICK, bass: BASS, banjo: BANJO,
        drums: { inst: "kit", gain: 0.6, rev: 0.05, pat: "k b_ s b_ k b_ s b_" }
      }
    },
    end: {
      bpm: 96, swing: 0.6, bars: end,
      voices: {
        lead: WHISTLE, gtr: PICK, bass: { inst: "bass", gain: 0.55, range: "E2 D3", pat: "B - . . F - . ." },
        drums: { inst: "kit", gain: 0.45, rev: 0.1, pat: ". . b_ . . . b_ ." }
      }
    }
  });
})();
