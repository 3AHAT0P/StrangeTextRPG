export const safeGet = <T>(data: T | null | undefined, fallback: () => T | never): T => {
  if (data == null) return fallback();

  return data;
};
