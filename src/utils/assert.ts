export const assert = (conditionResult: boolean, message: string | Error): void | never => {
  if (conditionResult) {
    if (message instanceof Error) throw message;
    throw new Error(message);
  }
};
