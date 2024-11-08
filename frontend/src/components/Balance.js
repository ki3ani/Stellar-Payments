import React, { useState, useEffect, useContext } from 'react';
import { fetchBalances } from '../utils/stellar';
import { AuthContext } from '../context/AuthContext';

function Balance() {
  const { auth } = useContext(AuthContext);
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    const getBalances = async () => {
      if (!auth.publicKey) return;
      const result = await fetchBalances(auth.publicKey);
      setBalances(result);
    };
    getBalances();
  }, [auth.publicKey]);

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