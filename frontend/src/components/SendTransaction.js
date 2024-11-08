import React, { useState, useContext } from 'react';
import axios from 'axios';
import { decryptSecretKey } from '../utils/stellar';
import { isValidStellarAddress, isValidAmount } from '../utils/validation';
import API_BASE_URL from '../config/apiConfig';
import { AuthContext } from '../context/AuthContext';

function SendTransaction() {
  const { auth } = useContext(AuthContext);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    setMessage('');
    try {
      // Validate input fields
      if (!recipient || !amount) {
        setMessage('Please fill in all required fields.');
        setIsSending(false);
        return;
      }

      if (!isValidStellarAddress(recipient)) {
        setMessage('Invalid Stellar address.');
        setIsSending(false);
        return;
      }

      if (!isValidAmount(amount)) {
        setMessage('Invalid amount.');
        setIsSending(false);
        return;
      }

      // Decrypt the secret key
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

      // Build and sign the transaction
      const response = await axios.post(`${API_BASE_URL}/transactions/send`, {
        recipientPublicKey: recipient,
        amount: amount,
        secretKey: secretKey,
      }, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
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
      <h2>Send USDC Transaction</h2>
      <input
        type="text"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="Recipient Stellar Public Key"
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