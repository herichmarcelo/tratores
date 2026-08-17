import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

bcrypt.setRandomFallback((len) => {
  const buf = new Uint8Array(len);
  globalThis.crypto.getRandomValues(buf);
  return Array.from(buf);
});

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compareSync(password, hash);
};
