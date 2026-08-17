const getRandomValues = (size: number): Uint8Array => {
  const buf = new Uint8Array(size);
  globalThis.crypto.getRandomValues(buf);
  return buf;
};

export const randomBytes = (size: number) => getRandomValues(size);

export const webcrypto = globalThis.crypto;

const cryptoShim = {
  randomBytes,
  webcrypto,
  getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto),
};

export default cryptoShim;
