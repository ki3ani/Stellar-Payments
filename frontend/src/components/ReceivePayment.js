import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ReceivePayment() {
  const { auth } = useContext(AuthContext);

  return (
    <div>
      <h2>Receive Payments</h2>
      <p>Your Public Key:</p>
      <textarea readOnly value={auth.publicKey} rows="3" cols="60" />
      <p>Share this key with others to receive payments.</p>
    </div>
  );
}

export default ReceivePayment;