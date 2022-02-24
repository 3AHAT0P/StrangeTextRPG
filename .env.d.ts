export type MainUIKindsType = readonly ['NODE', 'TELEGRAM', 'TELEGRAM_INLINE', 'SOCKET'];

export type MainUIType = MainUIKindsType[number];
export interface Config {
  TELEGRAM_BOT_TOKEN: string;
  DONATE_LINK: string;
  MAIN_CONTACT: string;
  MAIN_UI: MainUIType;
  NEO4J_URL: string;
  NEO4J_LOGIN: string;
  NEO4J_PASSWORD: string;
}