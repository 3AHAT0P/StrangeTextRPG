/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import config from '../.env.json';

export interface Config {
  TELEGRAM_BOT_TOKEN: string;
  DONATE_LINK: string;
  MAIN_CONTACT: string;
  MAIN_UI: 'NODE' | 'TELEGRAM' | 'TELEGRAM_INLINE';
  NEO4J_URL: string;
  NEO4J_LOGIN: string;
  NEO4J_PASSWORD: string;
}

let cacheIsDirty = true;
const cache: Config = {
  TELEGRAM_BOT_TOKEN: '',
  DONATE_LINK: '',
  MAIN_CONTACT: '',
  MAIN_UI: 'NODE',
  NEO4J_URL: '',
  NEO4J_LOGIN: '',
  NEO4J_PASSWORD: '',
};

class ConfigValidationError extends Error {}

const isEmptyStringOrNull = (value: string | void): value is void => value == null || value === '';

const validateMainUIType = (value: string | void): value is Config['MAIN_UI'] => {
  if (isEmptyStringOrNull(value)) throw new ConfigValidationError('MAIN_UI is required');

  if (!['NODE', 'TELEGRAM', 'TELEGRAM_INLINE'].includes(value)) {
    throw new ConfigValidationError('MAIN_UI value is incorrect');
  }

  return true;
};

export const getConfig = (): Config => {
  if (cacheIsDirty) {
    if (isEmptyStringOrNull(config.DONATE_LINK)) throw new ConfigValidationError('DONATE_LINK is required');
    cache.DONATE_LINK = config.DONATE_LINK;

    if (isEmptyStringOrNull(config.MAIN_CONTACT)) throw new ConfigValidationError('MAIN_CONTACT is required');
    cache.MAIN_CONTACT = config.MAIN_CONTACT;

    if (validateMainUIType(config.MAIN_UI)) cache.MAIN_UI = config.MAIN_UI;

    if (cache.MAIN_UI === 'TELEGRAM' || cache.MAIN_UI === 'TELEGRAM_INLINE') {
      if (isEmptyStringOrNull(config.TELEGRAM_BOT_TOKEN)) {
        throw new ConfigValidationError('TELEGRAM_BOT_TOKEN is required');
      }

      cache.TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
    }

    if (isEmptyStringOrNull(config.NEO4J_URL)) throw new ConfigValidationError('NEO4J_URL is required');
    cache.NEO4J_URL = config.NEO4J_URL;

    if (isEmptyStringOrNull(config.NEO4J_LOGIN)) throw new ConfigValidationError('NEO4J_LOGIN is required');
    cache.NEO4J_LOGIN = config.NEO4J_LOGIN;

    if (isEmptyStringOrNull(config.NEO4J_PASSWORD)) throw new ConfigValidationError('NEO4J_PASSWORD is required');
    cache.NEO4J_PASSWORD = config.NEO4J_PASSWORD;

    cacheIsDirty = false;
  }

  return cache;
};
