import { pipeFn } from './@types/pipe';
import { pipeAsyncFn } from './@types/pipeAsync';

export const pipe: pipeFn = (...fns: any[]): any => (arg: any): any => {
  let result = arg;
  for (const f of fns) result = f(result);
  return result;
};

export const pipeAsync: pipeAsyncFn = (...fns: any[]): any => async (arg: any): Promise<any> => {
  let result = arg;
  // eslint-disable-next-line no-await-in-loop
  for (const f of fns) result = await f(result);
  return result;
};
