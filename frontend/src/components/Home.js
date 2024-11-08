import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuth({ accessToken: '', publicKey: '' });
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to Stellar Payments</h1>
      <nav>
        <ul>
          {!auth.accessToken ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/balance">View Balances</Link></li>
              <li><Link to="/send-payment">Send Payment</Link></li>
              <li><Link to="/send-transaction">Send Transaction</Link></li>
              <li><Link to="/transactions">Transaction History</Link></li>
              <li><Link to="/receive-payment">Receive Payment</Link></li>
              <li><button onClick={handleLogout}>Logout</button></li>
            </>
          )}
        </ul>
      </nav>

      {auth.accessToken ? (
        <div>
          <h2>Your Public Key:</h2>
          <p>{auth.publicKey}</p>
        </div>
      ) : (
        <div>
          <h2>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to continue.</h2>
        </div>
      )}
    </div>
  );
}

export default Home;