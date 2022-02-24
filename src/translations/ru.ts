import { Translations } from './@types';

export const MESSAGES: Translations = {
  handshake: {
    text: 'Привет!\nЯ бот-рассказчик одной маленькой текстовой РПГ.\nЧто тебе интересно?',
    START_NEW_GAME: 'Начать новую игру',
    DONATE_LINK: 'Поддержать проект (RUB)',
    MAIN_CONTACT: 'Написать автору отзыв/идею/предложение',
  },

  intro: {
    welcome: 'Добро пожаловать в эту странную текстовую РПГ (Демо версия).\nЧто бы ты хотел попробовать?',
    START_MAIN_SCENARIO: 'Начать сценарий!',
    GO_TO_TEST_MECHANICS: 'Перейти к списку механик',

    testDescription: 'Это режим в котором можно попробовать те или иные механики игры.\nВыбери что тебе интересно.',
    TRY_SIMPLE_SCENARIO: 'Попробовать демо сюжет',
    TRY_DEMO_MERCHANT: 'Попробовать демо торговца',
    TRY_DEMO_BATTLE: 'Попробовать демо бой',
    TRY_DEMO_LOCATION: 'Начать сценарий!',
  },

  rarity: {
    male: {
      COMMON: 'Обычный',
      RARE: 'Редкий',
      EPIC: 'Эпический',
      LEGENDARY: 'Легендарный',
      DIVINE: 'Божественный',
    },
    female: {
      COMMON: 'Обычная',
      RARE: 'Редкая',
      EPIC: 'Эпическая',
      LEGENDARY: 'Легендарная',
      DIVINE: 'Божественная',
    },
  },

  potions: {
    size: {
      SMALL: 'Малое',
      MEDIUM: 'Среднее',
      BIG: 'Большое',
    },
  },

  onMapActions: {
    SHOW_HELP: '❓ Справка',
    MOVE_TO_NORTH: '⬆️ На север',
    SHOW_MAP: '🗺 Карта',
    MOVE_TO_WEST: '⬅️ На запад',
    INVENTORY_OPEN: '🎒 Инвентарь',
    MOVE_TO_EAST: '➡️ На восток',
    TAKE_A_REST: '🛏 Отдохнуть',
    MOVE_TO_SOUTH: '⬇️ На юг',
    OPEN_MAIN_MENU: '⚙️ Меню',
  },

  inventoryActions: {
    OPEN_WEAPON: 'Оружие',
    OPEN_ARMOR: 'Броня',
    OPEN_POTIONS: 'Зелья',
    OPEN_MISCELLANEOUS: 'Разное',
    CLOSE_INVENTORY: 'Закрыть инвентарь',
    DROP: 'Выбросить',
  },

  battleActions: {
    ATTACK: 'Атаковать 🗡',
    EXAMINE: 'Осмотреть 👀',
    LEAVE: 'Убежать из боя',
  },

  commonActions: {
    EXIT: 'Закончить приключение',
    BACK: 'Назад',
  },

  actionPlaceholder: '——————————————————————————',

  prompt: 'Твои действия> ',
  title: 'БЕРИ МЕЧ И РУБИ!\n',
  actions: {
    takeSword: 'ВЗЯТЬ МЕЧ\n',
    attack: 'РУБИТЬ\n',
    lookAround: 'ПОПЫТАТЬСЯ ОСМОТРЕТЬСЯ\n',
    again: 'НАЧАТЬ ЗАНОВО\n',
    exit: 'ВСЕ! ХВАТИТ С МЕНЯ!\n',
  },
  afterTakeSword: 'Ладонь сжимает рукоять меча - шершавую и тёплую.\n',
  afterAttack: 'Воздух свистит, рассекаемый сталью, и расплывчатый силуэт перед тобой делает сальто назад.\n',
  afterLookAround: 'Серый песок, фиолетовое небо, и расплывчатый клинок, торчащий из твоей грудины.\nВремени не было уже секунду назад; сейчас последние секунды с кровью утекают в песок.\nВы проиграли\n',
};
