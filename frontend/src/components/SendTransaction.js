// SendTransaction.js

import React, { useState } from 'react';
import axios from 'axios';
import { decryptSecretKey } from '../utils/stellar';
import API_BASE_URL from '../config/apiConfig';
import { Server, TransactionBuilder, Network, Asset, Keypair, Operation } from 'stellar-sdk';

function SendTransaction() {
  const [recipientPublicKey, setRecipientPublicKey] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    setMessage('');
    try {
      if (!recipientPublicKey || !amount) {
        setMessage('Please fill in all fields.');
        setIsSending(false);
        return;
      }

      const encryptedSecretKey = localStorage.getItem('encryptedSecretKey');
      const password = prompt('Enter your password to decrypt the secret key:');
      if (!password) {
        setMessage('Password is required to decrypt the secret key.');
        setIsSending(false);
        return;
      }
      const secretKey = decryptSecretKey(encryptedSecretKey, password);
      if (!secretKey) {
        setMessage('Failed to decrypt the secret key. Check your password.');
        setIsSending(false);
        return;
      }

      const server = new Server('https://horizon.stellar.org'); // Public network
      const senderKeypair = Keypair.fromSecret(secretKey);
      const senderPublicKey = senderKeypair.publicKey();

      const senderAccount = await server.loadAccount(senderPublicKey);

      const USDC = new Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'); // Official issuer's public key

      const transaction = new TransactionBuilder(senderAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: Network.PUBLIC_NETWORK_PASSPHRASE
      })
        .addOperation(
          Operation.payment({
            destination: recipientPublicKey,
            asset: USDC,
            amount: amount
          })
        )
        .setTimeout(30)
        .build();

      transaction.sign(senderKeypair);

      const signedXDR = transaction.toEnvelope().toXDR();

      const response = await axios.post(`${API_BASE_URL}/transactions/send`, {
        signedXDR: signedXDR
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.status === 200) {
        setMessage(`Transaction successful. Hash: ${response.data.transaction_hash}`);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage(`Error: ${error.message}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <h2>Send USDC</h2>
      <input
        type="text"
        value={recipientPublicKey}
        onChange={(e) => setRecipientPublicKey(e.target.value)}
        placeholder="Recipient Public Key"
      /><br/>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount of USDC"
      /><br/>
      <button onClick={handleSend} disabled={isSending}>
        {isSending ? 'Sending...' : 'Send USDC'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SendTransaction;