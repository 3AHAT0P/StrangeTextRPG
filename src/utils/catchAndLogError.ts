export const catchAndLogError = (place: string, promise: Promise<any>): void => {
  promise.catch((error) => console.error(error));
};
