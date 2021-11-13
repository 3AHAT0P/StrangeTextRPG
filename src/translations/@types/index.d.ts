export interface HandshakeTranslations {
  readonly text: string;
  readonly START_NEW_GAME: string;
  readonly DONATE_LINK: string;
  readonly MAIN_CONTACT: string;
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
  SHOW_HELP: '❓ Справка',
  MOVE_TO_NORTH: '⬆️ На север',
  SHOW_MAP: '🗺 Карта',
  MOVE_TO_WEST: '⬅️ На запад',
  INVENTORY_OPEN: '🎒 Инвентарь',
  MOVE_TO_EAST: '➡️ На восток',
  TAKE_A_REST: '🛏 Отдохнуть',
  MOVE_TO_SOUTH: '⬇️ На юг',
  OPEN_MAIN_MENU: '⚙️ Меню',
}

export interface Translations {
  readonly handshake: HandshakeTranslations;
  readonly rarity: RarityTranslations;
  readonly potions: PoitionTranslations;

  readonly onMapActions: OnMapActionsTranslations;

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
