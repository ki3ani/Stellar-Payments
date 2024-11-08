// src/utils/stellar.js

import * as StellarSdk from '@stellar/stellar-sdk';
import CryptoJS from 'crypto-js';
import { isValidStellarAddress, isValidAmount } from './validation';

// Initialize the Stellar Server
const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
console.log('Stellar Server Instance:', server);

// Destructure necessary classes from StellarSdk
const { Keypair, TransactionBuilder, Networks, Asset, Operation } = StellarSdk;

// Generate a new Stellar keypair
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

// Encrypt the secret key with the password
export function encryptSecretKey(secretKey, password) {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const key = deriveKey(password, salt);
  const encrypted = CryptoJS.AES.encrypt(secretKey, key).toString();
  return `${salt}:${encrypted}`;
}

// Decrypt the secret key with the password
export function decryptSecretKey(encryptedSecretKey, password) {
  const [salt, ciphertext] = encryptedSecretKey.split(':');
  const key = deriveKey(password, salt);
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Fetch user balances from the Stellar network
export async function fetchBalances(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error fetching balances:', error);
    return [];
  }
}

// Fetch user transactions from the Stellar network
export async function fetchTransactions(publicKey) {
  try {
    const transactions = await server
      .transactions()
      .forAccount(publicKey)
      .call();
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { records: [] };
  }
}

// Send a payment
export async function sendPayment(
  senderSecretKey,
  recipientPublicKey,
  amount,
  assetCode = 'XLM',
  assetIssuer = ''
) {
  try {
    if (!isValidStellarAddress(recipientPublicKey)) {
      throw new Error('Invalid Stellar address.');
    }

    if (!isValidAmount(amount)) {
      throw new Error('Invalid amount.');
    }

    const pair = Keypair.fromSecret(senderSecretKey);
    const sourceAccount = await server.loadAccount(pair.publicKey());
    const fee = await server.fetchBaseFee();

    const asset =
      assetCode === 'XLM'
        ? Asset.native()
        : new Asset(assetCode, assetIssuer);

    const transaction = new TransactionBuilder(sourceAccount, {
      fee,
      networkPassphrase: Networks.PUBLIC,
    })
      .addOperation(
        Operation.payment({
          destination: recipientPublicKey,
          asset: asset,
          amount: amount,
        })
      )
      .setTimeout(30)
      .build();

    transaction.sign(pair);
    const transactionResult = await server.submitTransaction(transaction);
    return transactionResult.hash;
  } catch (error) {
    console.error('Error sending payment:', error);
    throw error;
  }
}