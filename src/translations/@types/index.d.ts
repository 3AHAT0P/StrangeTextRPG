export interface CommonActionsTranslations {
  readonly EXIT: string;
  readonly BACK: string;
}

export interface InventoryActionsTranslations {
  readonly OPEN_WEAPON: string;
  readonly OPEN_ARMOR: string;
  readonly OPEN_POTIONS: string;
  readonly OPEN_MISCELLANEOUS: string;
  readonly CLOSE_INVENTORY: string;

  readonly DROP: string;
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
  readonly SHOW_HELP: string;
  readonly MOVE_TO_NORTH: string;
  readonly SHOW_MAP: string;
  readonly MOVE_TO_WEST: string;
  readonly INVENTORY_OPEN: string;
  readonly MOVE_TO_EAST: string;
  readonly TAKE_A_REST: string;
  readonly MOVE_TO_SOUTH: string;
  readonly OPEN_MAIN_MENU: string;
}

export interface BattleActionsTranslations {
  readonly ATTACK: string;
  readonly EXAMINE: string;
  readonly LEAVE: string;
}

export interface Translations {
  readonly handshake: HandshakeTranslations;
  readonly intro: IntroTranslations;

  readonly rarity: RarityTranslations;
  readonly potions: PoitionTranslations;

  readonly onMapActions: OnMapActionsTranslations;
  readonly battleActions: BattleActionsTranslations;
  readonly commonActions: CommonActionsTranslations;
  readonly inventoryActions: InventoryActionsTranslations;

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
