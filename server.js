// File: server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

let listings = [];
let lastNotified = new Set();

const TELEGRAM_TOKEN = '7658060064:AAFqy7wQHXHjH2dNDGSN3HgCTNt2tve1T8I';
const CHAT_ID = '7259098951';

const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
};

const simulateListingData = () => {
  const now = new Date();
  const token = `TKN${Math.floor(Math.random() * 1000)}`;
  const newListing = {
    token,
    name: `Token ${token}`,
    exchange: ['Binance', 'Coinbase', 'KuCoin', 'OKX', 'Bybit'][Math.floor(Math.random() * 5)],
    status: 'Upcoming',
    time: now.toISOString(),
  };

  // Simulate uniqueness
  if (!lastNotified.has(token)) {
    listings.push(newListing);
    lastNotified.add(token);
    sendTelegramMessage(`🚀 New Token Listing!

Token: ${token}
Name: ${newListing.name}
Exchange: ${newListing.exchange}
Status: ${newListing.status}
Time: ${newListing.time}`);
  }
};

// Simulate data update every 2 hours
setInterval(simulateListingData, 2 * 60 * 1000);
simulateListingData();

app.get('/api/listings', (req, res) => {
  res.json(listings);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
