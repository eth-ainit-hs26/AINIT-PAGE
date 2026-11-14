/* English strings of the Pokemon battle, arcade cut.
 *
 *   Every visible string of the three kept scenes (title, tutorial,
 *   battle) flows through I18N.t(key, vars); {var} placeholders are
 *   filled from vars. English only: the Japanese mode, the language
 *   toggle and the strings of the cut scenes are gone.
 *
 *   Public API:
 *     I18N.lang            always 'en'
 *     I18N.t(key, vars)    lookup; a missing key returns the key itself
 */
(function () {
  const STRINGS = {
    en: {

      /*, scene titles (shown in the topbar), */
      'scene.title':      'POKEMON',
      'scene.tutorial':   'Tutorial, how to play',
      'scene.battle':     'A wild CHARMANDER appeared!',

      /*, scene 0, title screen, */
      'title.pokemon':    'POKEMON',
      'title.subtitle':   'A REINFORCEMENT LEARNING ADVENTURE',
      'title.start':      '▶ PRESS START',
      'title.credits':    'AI in Industry · ETH ZURICH · CLASSIC RL',
      'title.by':         'BY CARLOS COTRINI',

      /*, Pokemon display names, */
      'pokemon.pikachu':    'PIKACHU',
      'pokemon.charmander': 'CHARMANDER',
      'pokemon.charmeleon': 'CHARMELEON',
      'pokemon.charizard':  'CHARIZARD',
      'pokemon.wild':       'Wild',

      /*, move names, */
      'move.quick_attack':  'QUICK ATTACK',
      'move.thunderbolt':   'THUNDERBOLT',
      'move.thunder':       'THUNDER',
      'move.ember':         'EMBER',
      'move.flamethrower':  'FLAMETHROWER',
      'move.outrage':       'OUTRAGE',
      'move.short.quick_attack': 'QUICK',
      'move.short.thunderbolt':  'BOLT',
      'move.short.thunder':      'THUN',

      /*, HP bar + bucket names, */
      'hp.label':           'HP',
      'hp.bucket.full':     'FULL',
      'hp.bucket.high':     'HIGH',
      'hp.bucket.mid':      'MID',
      'hp.bucket.low':      'LOW',
      'hp.bucket.critical': 'CRITICAL',
      'hp.bucket.fainted':  'FAINTED',
      'hp.bucket.faint_short': 'FAINT',
      'hp.damage_flash':    '-{n} HP',
      'hp.damage_minus':    '−{n} HP',
      'hp.faint_flash':     'FAINT!',

      /*, battle dialog (scene 1), */
      'battle.section_title': 'YOU ARE PIKACHU. PICK A MOVE EACH TURN.',
      'battle.used':          '{name} used {move}!',
      'battle.wild_used':     'Wild {name} used {move}!',
      'battle.missed':        "{name}'s attack missed!",
      'battle.evolving':      'What? Wild {name} is evolving!',
      'battle.evolved_into':  'Evolved into {name}!',
      'battle.fainted':       '{name} fainted!',
      'battle.wild_fainted':  'Wild {name} fainted!',
      'battle.pika_wins':     'PIKACHU wins!',
      'battle.you_lost':      'You lost!',
      'battle.what_now':      'What will PIKACHU do?',
      'battle.opening_wild':  'A wild CHARMANDER appeared!',
      'battle.go_pika':       'Go, PIKACHU!',
      'battle.what_will':     'What will PIKACHU do?',
      'battle.critical_hit':  'A critical hit!',
      'battle.caption':
        'Click a move to attack.  Once you pick the move, the game rolls a damage die, different rolls can shrink the foe\'s HP bar by different amounts, ' +
        'and a stronger move can fail to land at all.  The state of the battle is the pair (your HP, opponent HP), so the new state depends on how the roll comes out.',
      'battle.hud.reward':    'REWARD',
      'battle.restart':       'RESTART BATTLE',

      /*, Tutorial scene, */
      'tut.skip':                'SKIP TUTORIAL →',
      'tut.go_to_battle':        'GO TO BATTLE →',
      'tut.skip_title':          'Jump straight to the battle',
      'tut.step_of':             'STEP {i} / {total}',
      'tut.nav.hint':
        'Press <kbd>→</kbd> to continue · <kbd>←</kbd> back · ' +
        'Press <kbd>↓</kbd> to fast-fill the dialog text',

      'tut.step.welcome.title':  'Welcome, trainer!',
      'tut.step.welcome.dialog':
        'Hello there, {name}!  Welcome to the world of POKEMON!  ' +
        'Before you battle, here is a quick refresher.',
      'tut.welcome.big':         'PIKACHU CHOOSES YOU!',
      'tut.welcome.small':       'Five quick lessons.  Then you fight.',

      'tut.step.battle.title':   'The battle screen',
      'tut.step.battle.dialog':
        "Look at the screen.  Your PIKACHU faces away from you.  " +
        "The wild CHARMANDER faces you.  Each has an HP box.",
      'tut.callout.you':         'YOU, back view',
      'tut.callout.wild':        'WILD POKEMON, front view',
      'tut.callout.your_hp':     'YOUR HP',
      'tut.callout.their_hp':    'THEIR HP',

      'tut.step.hp.title':       'HP has five buckets',
      'tut.step.hp.dialog':
        "Each POKEMON's HP is split into five buckets: FULL, HIGH, MID, " +
        "LOW, CRITICAL.  Past CRITICAL, the POKEMON faints!",
      'tut.hp.watch':            'WATCH CHARMANDER TAKE A HIT',
      'tut.hp.fainted_flash':    'FAINTED!',
      'tut.hp.footnote':
        'Each attack drops the bar by <b>0 to 3</b> buckets.  Past CRITICAL, the POKEMON faints.',

      'tut.step.moves.title':    'Pick a move',
      'tut.step.moves.dialog':
        "Three moves to pick from.  Read them from left to right: weak but reliable, strong but risky.  " +
        "THUNDER hits hardest but lands only half the time.  " +
        "And here is the twist: as your foe evolves mid-battle, the damage of each move also changes.",
      'tut.moves.axis.l':        '← WEAK · RELIABLE',
      'tut.moves.axis.m':        'DAMAGE ↑   ACCURACY ↓',
      'tut.moves.axis.r':        'STRONG · RISKY →',

      'tut.step.turn.title':     'How a turn flows',
      'tut.step.turn.dialog':
        "A turn flows like this: PIKACHU picks an attack, " +
        "then the wild CHARMANDER strikes back.  Then it repeats.",
      'tut.turn.row1.who':       'PIKACHU',
      'tut.turn.row1.action':    'You pick a move.  PIKACHU attacks first.',
      'tut.turn.row2.who':       'CHARMANDER',
      'tut.turn.row2.action':    'Wild CHARMANDER strikes back with EMBER.',
      'tut.turn.row3.who':       ', , , ',
      'tut.turn.row3.action':    'Both HP bars update.  State has changed.',

      'tut.step.winlose.title':  'Win, lose, and reward',
      'tut.step.winlose.dialog':
        "Faint CHARMANDER to WIN (+10 reward).  Faint yourself to LOSE " +
        "(-10).  Each turn costs -1.  Now you are ready.  GO!",
      'tut.winlose.win.title':   'YOU WIN!',
      'tut.winlose.win.reward':  '+10 reward',
      'tut.winlose.win.detail':  'CHARMANDER fainted.  Episode ends.',
      'tut.winlose.lose.title':  'YOU LOSE.',
      'tut.winlose.lose.reward': '-10 reward',
      'tut.winlose.lose.detail': 'PIKACHU fainted.  Try again.',
      'tut.winlose.footnote':
        'Each turn that does not end the battle costs -1 reward.  ' +
        'Short, decisive battles are more rewarding than long grinds.',

      /*, The name in the tutorial's welcome line (the arcade cut has no trainer modal), */

      'trainer.modal.placeholder':'TRAINER',

      /*, arcade cut: the end of a battle, */
      'battle.end.again':     'PLAY AGAIN',
      'battle.end.arcade':    'BACK TO THE ARCADE',
    },
  };

  function t(key, vars) {
    let s = STRINGS.en[key];
    if (s === undefined) s = key;
    if (vars) {
      s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : '{' + k + '}'));
    }
    return s;
  }

  window.I18N = {
    get lang() { return 'en'; },
    t,
  };
})();
