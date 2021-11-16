export interface CommonActionsTranslations {
  readonly BACK: string;
}

export interface HandshakeTranslations {
  readonly text: string;
  readonly START_NEW_GAME: string;
  readonly DONATE_LINK: string;
  readonly MAIN_CONTACT: string;
}

export interface IntroTranslations {
  readonly welcome: string;
  readonly START_MAIN_SCENARIO: string;
  readonly GO_TO_TEST_MECHANICS: string;

  readonly testDescription: string;
  readonly TRY_SIMPLE_SCENARIO: string;
  readonly TRY_DEMO_MERCHANT: string;
  readonly TRY_DEMO_BATTLE: string;
  readonly TRY_DEMO_LOCATION: string;
}

export interface RarityTranslations {
  readonly male: {
    readonly COMMON: string;
    readonly RARE: string;
    readonly EPIC: string;
    readonly LEGENDARY: string;
    readonly DIVINE: string;
  },
  readonly female: {
    readonly COMMON: string;
    readonly RARE: string;
    readonly EPIC: string;
    readonly LEGENDARY: string;
    readonly DIVINE: string;
  }
}

export interface PoitionTranslations {
  readonly size: {
    readonly SMALL: string;
    readonly MEDIUM: string;
    readonly BIG: string;
  };
}

export interface OnMapActionsTranslations {
  SHOW_HELP: string;
  MOVE_TO_NORTH: string;
  SHOW_MAP: string;
  MOVE_TO_WEST: string;
  INVENTORY_OPEN: string;
  MOVE_TO_EAST: string;
  TAKE_A_REST: string;
  MOVE_TO_SOUTH: string;
  OPEN_MAIN_MENU: string;
}

export interface BattleActionsTranslations {
  ATTACK: string;
  EXAMINE: string;
  LEAVE: string;
}

export interface Translations {
  readonly handshake: HandshakeTranslations;
  readonly intro: IntroTranslations;

  readonly rarity: RarityTranslations;
  readonly potions: PoitionTranslations;

  readonly onMapActions: OnMapActionsTranslations;
  readonly battleActions: BattleActionsTranslations;
  readonly commonActions: CommonActionsTranslations;

  readonly actionPlaceholder: string;

  readonly prompt: string;
  readonly title: string;
  readonly actions: {
    readonly takeSword: string;
    readonly attack: string;
    readonly lookAround: string;
    readonly again: string;
    readonly exit: string;
  };
  readonly afterTakeSword: string;
  readonly afterAttack: string;
  readonly afterLookAround: string;
}
