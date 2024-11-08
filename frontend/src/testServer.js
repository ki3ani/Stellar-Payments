// testServer.js

const StellarSdk = require('@stellar/stellar-sdk');

// Initialize the Stellar Server
const server = new StellarSdk.Horizon.Server('https://horizon.stellar.org');
console.log('Stellar Server Instance:', server);

// Function to test server connection by fetching the base fee
async function testServerConnection() {
  try {
    const baseFee = await server.fetchBaseFee();
    console.log('Successfully connected to Stellar Horizon.');
    console.log('Current Base Fee:', baseFee, 'stroops');
  } catch (error) {
    console.error('Failed to connect to Stellar Horizon:', error);
  }
}

testServerConnection();