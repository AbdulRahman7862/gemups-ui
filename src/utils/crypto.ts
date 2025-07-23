import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || "";

if (!SECRET_KEY && typeof window === "undefined") {
  throw new Error("Missing SECRET_KEY for encryption/decryption.");
}

export const encryptData = (data: string): string => {
  if (!SECRET_KEY) return "";
  const ciphertext = CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  return ciphertext;
};

export const decryptData = (ciphertext: string): string => {
  if (!SECRET_KEY) return "";
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

// For password hashing (one-way, cannot be decrypted)
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};
