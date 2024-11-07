import React from 'react';
import QRCode from 'qrcode.react';

function ReceivePayment({ publicKey }) {
  return (
    <div>
      <h2>Receive Payment</h2>
      <QRCode value={publicKey} />
      <p>Your Public Key: {publicKey}</p>
    </div>
  );
}

export default ReceivePayment;