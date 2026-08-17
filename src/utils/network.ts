export const isBrowserOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine;
