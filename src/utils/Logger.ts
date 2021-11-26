/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export enum LogLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2,
  QUIET = 3,
}

export class Logger {
  private _context: Console;

  private _mode: LogLevel = LogLevel.ERROR;

  public get mode(): LogLevel {
    return this._mode;
  }

  public set mode(value: LogLevel) {
    this._mode = value;
  }

  constructor(mode?: LogLevel) {
    this._context = console;

    if (mode != null) this._mode = mode;
  }

  public info(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.INFO) this._context.info('INFO => ', place, ...optionalParams);
  }

  public warn(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.WARN) this._context.warn('WARN => ', place, ...optionalParams);
  }

  public error(place: string, ...optionalParams: any[]): void {
    if (this._mode <= LogLevel.ERROR) this._context.error('ERROR => ', place, ...optionalParams);
  }

  public catchAndLogError(place: string, promise: Promise<any>): void {
    promise.catch((error) => this.error(place, error));
  }
}

const logger = new Logger();

export default logger;
