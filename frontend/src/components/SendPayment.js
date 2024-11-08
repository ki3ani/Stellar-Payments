import React, { useState } from 'react';
import { sendPayment, decryptSecretKey } from '../utils/stellar';
import { isValidStellarAddress, isValidAmount } from '../utils/validation';

function SendPayment() {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [assetCode, setAssetCode] = useState('XLM');
  const [assetIssuer, setAssetIssuer] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      // Validate input fields
      if (!destination || !amount || !password) {
        setMessage('Please fill in all required fields.');
        setIsLoading(false);
        return;
      }

      if (!isValidStellarAddress(destination)) {
        setMessage('Invalid Stellar address.');
        setIsLoading(false);
        return;
      }

      if (!isValidAmount(amount) || parseFloat(amount) <= 0) {
        setMessage('Please enter a valid amount.');
        setIsLoading(false);
        return;
      }

      if (assetCode !== 'XLM' && !assetIssuer) {
        setMessage('Please provide the asset issuer for non-XLM assets.');
        setIsLoading(false);
        return;
      }

      const encryptedSecretKey = localStorage.getItem('encryptedSecretKey');
      if (!encryptedSecretKey) {
        setMessage('No secret key found. Please register or log in.');
        setIsLoading(false);
        return;
      }

      const secretKey = decryptSecretKey(encryptedSecretKey, password);
      if (!secretKey) {
        setMessage('Incorrect password.');
        setIsLoading(false);
        return;
      }

      const response = await sendPayment(secretKey, destination, amount, assetCode, assetIssuer);

      if (response && response.success) {
        setMessage('Payment sent successfully!');
        setDestination('');
        setAmount('');
        setAssetCode('XLM');
        setAssetIssuer('');
      } else {
        setMessage('Payment failed. Please try again.');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(`Payment failed: ${error.response.data.detail || error.response.data.message}`);
      } else {
        setMessage(`Payment failed: ${error.message}`);
      }
      console.error('Send Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Send Payment</h2>
      {message && <p>{message}</p>}
      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destination"
        disabled={isLoading}
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        type="number"
        step="0.0000001"
        disabled={isLoading}
      />
      <select
        value={assetCode}
        onChange={(e) => setAssetCode(e.target.value)}
        disabled={isLoading}
      >
        <option value="XLM">XLM</option>
        <option value="USDC">USDC</option>
        {/* Add more assets as needed */}
      </select>
      {assetCode !== 'XLM' && (
        <input
          value={assetIssuer}
          onChange={(e) => setAssetIssuer(e.target.value)}
          placeholder="Asset Issuer (Public Key)"
          disabled={isLoading}
        />
      )}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password to decrypt secret key"
        disabled={isLoading}
      />
      <button onClick={handleSend} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

export default SendPayment;