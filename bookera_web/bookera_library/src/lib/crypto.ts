import CryptoJS from "crypto-js";

// This is a simple encryption utility for the chat
// In a real production app, you would use a more robust key exchange mechanism
const SECRET_KEY_PREFIX = "bookera_secret_";

export const encryptMessage = (message: string, userId1: number, userId2: number) => {
  const key = deriveKey(userId1, userId2);
  return CryptoJS.AES.encrypt(message, key).toString();
};

export const decryptMessage = (encryptedMessage: string, userId1: number, userId2: number) => {
  try {
    const key = deriveKey(userId1, userId2);
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || encryptedMessage; // Fallback to original if decryption fails (e.g. not encrypted)
  } catch (error) {
    return encryptedMessage;
  }
};

const deriveKey = (id1: number, id2: number) => {
  // Sort IDs to ensure the same key is derived for both participants
  const sortedIds = [id1, id2].sort((a, b) => a - b);
  return `${SECRET_KEY_PREFIX}${sortedIds[0]}_${sortedIds[1]}`;
};
