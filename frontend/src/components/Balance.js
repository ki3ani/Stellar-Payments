// src/components/Balance.js

import React, { useState, useEffect } from 'react';
import { fetchBalances } from '../utils/stellar';

function Balance({ publicKey }) {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const getBalances = async () => {
      const result = await fetchBalances(publicKey);
      setBalances(result);
    };
    getBalances();
  }, [publicKey]);

  return (
    <div>
      <h2>Your Balances</h2>
      <ul>
        {balances.map((balance, index) => (
          <li key={index}>
            {balance.balance} {balance.asset_code || 'XLM'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Balance;