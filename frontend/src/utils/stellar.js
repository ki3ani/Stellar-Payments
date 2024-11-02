// src/utils/stellar.js

import { Keypair, Server} from 'stellar-sdk';
import CryptoJS from 'crypto-js';

const server = new Server('https://horizon.stellar.org');

export function generateKeypair() {
  const pair = Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  };
}

// Derive a key from the password using PBKDF2 with a salt
function deriveKey(password, salt) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString();
}

// Implement encryption with salt
export function encryptSecretKey(secretKey, password) {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString(); // Generate random salt
  const key = deriveKey(password, salt);
  const encrypted = CryptoJS.AES.encrypt(secretKey, key).toString();
  return `${salt}:${encrypted}`; // Store salt and encrypted data together
}

// Implement decryption with salt
export function decryptSecretKey(encryptedSecretKey, password) {
  const [salt, ciphertext] = encryptedSecretKey.split(':');
  const key = deriveKey(password, salt);
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
