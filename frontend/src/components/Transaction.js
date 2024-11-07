import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Transactions({ publicKey }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const getTransactions = async () => {
      const result = await axios.get(`http://localhost:3000/transactions/${publicKey}`);
      setTransactions(result.data._embedded.records);
    };
    getTransactions();
  }, [publicKey]);

  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.id}>
            Amount: {tx.amount}, Asset: {tx.asset_code || 'XLM'}, Date: {tx.created_at}, Fee: {tx.fee_charged}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Transactions;