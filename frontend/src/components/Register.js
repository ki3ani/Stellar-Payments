// src/components/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { generateKeypair, encryptSecretKey } from '../utils/stellar'; // Ensure encryption utils are robust
import API_BASE_URL from '../config/apiConfig'; // Centralized API base URL

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const handleRegister = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      // Validate input fields
      if (!username || !password) {
        setMessage('Please fill in all fields.');
        setIsLoading(false);
        return;
      }

      // Generate Stellar keypair on client side
      const keypair = generateKeypair();
      const { publicKey: pubKey, secretKey: secKey } = keypair;
      setPublicKey(pubKey);

      // Encrypt the secret key before storing (optional)
      const encryptedSecret = encryptSecretKey(secKey, password); // Implement encryption logic

      // Send registration data to backend
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        password,
        publicKey: pubKey
      });

      if (response.status === 201) {
        setMessage('Registration successful. Please securely store your secret key.');
        // Store encrypted secret key securely on client side
        localStorage.setItem('encryptedSecretKey', encryptedSecret);
        // Optionally, prompt user to download the secret key
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>User Registration</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      /><br/>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      /><br/>
      <button onClick={handleRegister} disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      {message && <p>{message}</p>}
      {publicKey && (
        <div>
          <p>Your Stellar Public Key:</p>
          <code>{publicKey}</code>
          <p>Please store your secret key securely.</p>
        </div>
      )}
    </div>
  );
}

export default Register;