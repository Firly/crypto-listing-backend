// File: server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

let listings = [];
let lastNotified = new Set();

// Ganti dengan bot Telegram milikmu
const TELEGRAM_TOKEN = '7658060064:AAFqy7wQHXHjH2dNDGSN3HgCTNt2tve1T8I';
const CHAT_ID = '7259098951';
const COINMARKETCAL_API_KEY = 'vHY89IrinPaYLTk7TfYuq6cdrv7XEYPTaIKFmiyb';

const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('❌ Failed to send Telegram message:', err.message);
  }
};

const fetchListingsFromCMC = async () => {
  try {
    const response = await axios.get('https://developers.coinmarketcal.com/v1/events', {
      headers: {
        'x-api-key': COINMARKETCAL_API_KEY,
        Accept: 'application/json',
        'Accept-Encoding': 'deflate, gzip',
      },
      params: {
        max: 10,
        sortBy: 'created_desc',
        showOnly: 'firmed_date',
        translations: 'en',
      },
    });

    const events = response.data.body;

    for (const event of events) {
      const coin = event.coins[0];
      if (!coin) continue;

      const token = coin.symbol;
      const name = coin.name;
      const exchange = event.proof || 'Unknown Exchange';
      const status = event.categories[0]?.name || 'Upcoming';
      const time = event.date_event;

      if (!lastNotified.has(token)) {
        const listing = { token, name, exchange, status, time };
        listings.push(listing);
        lastNotified.add(token);

        const message = `🚀 *New Token Listing!*\n\n🪙 Token: *${token}*\n📛 Name: ${name}\n💱 Exchange: ${exchange}\n📅 Time: ${time}`;
        sendTelegramMessage(message);
      }
    }
  } catch (err) {
    console.error('❌ Error fetching from CoinMarketCal:', err.message);
  }
};

// Ambil data setiap 2 jam
setInterval(fetchListingsFromCMC, 2 * 60 * 60 * 1000);
fetchListingsFromCMC();

app.get('/api/listings', (req, res) => {
  res.json(listings);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
