// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Balance from './components/Balance';
import SendPayment from './components/SendPayment';
import SendTransaction from './components/SendTransaction';
import Transactions from './components/Transaction';
import ReceivePayment from './components/ReceivePayment';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/balance"
              element={
                <ProtectedRoute>
                  <Balance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/send-payment"
              element={
                <ProtectedRoute>
                  <SendPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/send-transaction"
              element={
                <ProtectedRoute>
                  <SendTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receive-payment"
              element={
                <ProtectedRoute>
                  <ReceivePayment />
                </ProtectedRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<h2>404: Page Not Found</h2>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;