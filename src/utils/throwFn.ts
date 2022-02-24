export const throwFn = (error: Error): never => { throw error; };
export const throwTextFn = (error: string): never => { throw new Error(error); };
export const throwFnCarried = (error: Error) => (): never => { throw error; };
export const throwTextFnCarried = (error: string) => (): never => { throw new Error(error); };
