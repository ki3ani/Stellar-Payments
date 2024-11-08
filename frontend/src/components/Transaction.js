import React, { useState, useEffect, useContext } from 'react';
import { fetchTransactions } from '../utils/stellar';
import { AuthContext } from '../context/AuthContext';

function Transactions() {
  const { auth } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getTransactions = async () => {
      if (!auth.publicKey) return;
      const result = await fetchTransactions(auth.publicKey);
      setTransactions(result.records || []);
    };
    getTransactions();
  }, [auth.publicKey]);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((txn, index) => (
          <li key={index}>
            <strong>Type:</strong> {txn.type} | <strong>Amount:</strong> {txn.amount} {txn.asset_code || 'XLM'} | <strong>Date:</strong> {new Date(txn.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;