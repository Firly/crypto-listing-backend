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
const COINMARKETCAL_API_KEY = 'vHY89IrinPaYLTk7TfYuq6cdrv7XEYPTaIKFmiyb';

const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('❌ Gagal kirim pesan Telegram:', err.message);
  }
};

const checkIndodax = async (symbol) => {
  try {
    const res = await axios.get('https://indodax.com/api/pairs');
    return res.data.includes(symbol.toLowerCase());
  } catch (err) {
    console.error('❌ Gagal cek di Indodax:', err.message);
    return false;
  }
};

const fetchListingData = async () => {
  try {
    const res = await axios.get('https://developers.coinmarketcal.com/v1/events', {
      headers: {
        'x-api-key': COINMARKETCAL_API_KEY,
      },
      params: {
        page: 1,
        max: 10,
        categories: 'listing',
      },
    });

    const events = res.data.body || [];

    for (const event of events) {
      const tokenName = event.coins?.[0]?.name || 'Unknown';
      const tokenSymbol = event.coins?.[0]?.symbol || '';
      const tokenSlug = event.coins?.[0]?.slug || '';
      const exchange = event.exchange || 'Unknown';
      const time = event.date_event;

      if (!lastNotified.has(event.id)) {
        const isInIndodax = await checkIndodax(tokenSymbol);
        const msg = `🚀 *Token Listing Baru!*\n\n` +
          `Token: ${tokenSymbol}\n` +
          `Name: ${tokenName}\n` +
          `Exchange: ${exchange}\n` +
          `Time: ${time}\n` +
          `${isInIndodax ? '✅ Tersedia di Indodax' : '❌ Tidak tersedia di Indodax'}`;

        await sendTelegramMessage(msg);
        lastNotified.add(event.id);

        listings.push({
          token: tokenSymbol,
          name: tokenName,
          exchange,
          time,
          indodax: isInIndodax,
        });
      }
    }
  } catch (err) {
    console.error('❌ Gagal fetch dari CoinMarketCal:', err.response?.data || err.message);
  }
};

// Jalankan setiap 2 jam
setInterval(fetchListingData, 2 * 60 * 60 * 1000);
fetchListingData();

app.get('/api/listings', (req, res) => {
  res.json(listings);
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
