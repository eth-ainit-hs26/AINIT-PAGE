/* scene0 i18n fragment, Title / hook.
   Registers this scene's strings into the i18n core.
   English is the source of truth; the Japanese mirror gives parity. */
(function () {
  window.I18N.register({
    en: {
      'scene0.title': 'Last-Minute Pricing',
      'scene0.subtitle': 'A REINFORCEMENT LEARNING ADVENTURE',
      'scene0.tagline': 'Empty seats expire worthless at midnight.',
      'scene0.clockLabel': 'TIME TO DEADLINE',
      'scene0.midnight': 'MIDNIGHT',
      'scene0.shelfLabel': 'TONIGHT’S SHELF',
      'scene0.start': 'PRESS START',
      'scene0.hook': 'You sell something that rots: a seat, a room, a slot. Pricing it is a decision made over time, under uncertainty, not a single number.',
      'scene0.boardLabel': 'EVERY SITUATION YOU COULD BE IN',
      'scene0.boardSub': 'units left × days to deadline. One screen, twenty situations.',
      'scene0.boardGo': 'BEGIN',
      'scene0.credits': 'AI in Industry · ETH ZURICH · CLASSIC RL',
      'scene0.by': 'REVENUE MANAGEMENT, THE RL WAY',
      'scene0.daysAxis': 'DAYS TO DEADLINE',
      'scene0.unitsAxis': 'UNITS LEFT',
    },
  });
})();
