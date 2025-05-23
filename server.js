// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

let listings = [];
let lastNotified = new Set();
let indodaxSymbols = new Set(); // Token-token dari Indodax

const TELEGRAM_TOKEN = 'TOKEN_BOT_KAMU';
const CHAT_ID = 'CHAT_ID_KAMU';
const COINMARKETCAL_API_KEY = 'API_KEY_COINMARKETCAL_KAMU';

// Fungsi kirim pesan ke Telegram
const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('Gagal kirim pesan Telegram:', err.message);
  }
};

// Ambil token yang sudah listing di Indodax
const fetchIndodaxCoins = async () => {
  try {
    const res = await axios.get('https://indodax.com/api/pairs');
    const pairs = Object.keys(res.data.tickers || {});
    indodaxSymbols = new Set(pairs.map(pair => pair.split('_')[0].toUpperCase()));
    console.log(`Indodax: ${indodaxSymbols.size} token terdeteksi`);
  } catch (err) {
    console.error('Gagal ambil data Indodax:', err.message);
  }
};

// Ambil listing dari CoinMarketCal
const fetchListingsFromCoinMarketCal = async () => {
  try {
    const res = await axios.get('https://developers.coinmarketcal.com/v1/events', {
      headers: {
        'x-api-key': COINMARKETCAL_API_KEY,
      },
      params: {
        max: 10,
        sortBy: 'date',
        filterBy: 'hot_events',
      },
    });

    const events = res.data || [];

    for (const event of events) {
      const tokenSymbol = event.coins?.[0]?.symbol || `UNKNOWN`;
      const tokenName = event.coins?.[0]?.name || `Unknown Token`;
      const exchange = event.categories?.[0]?.name || `Unknown Exchange`;
      const listingTime = event.date_event;

      if (!lastNotified.has(tokenSymbol)) {
        lastNotified.add(tokenSymbol);

        const isListedOnIndodax = indodaxSymbols.has(tokenSymbol.toUpperCase());

        const message = `🚀 New Token Listing!

🪙 Token: ${tokenSymbol}
📛 Name: ${tokenName}
💱 Exchange: ${exchange}
📅 Time: ${listingTime}
🇮🇩 Indodax: ${isListedOnIndodax ? '✅ Sudah Listing' : '❌ Belum Listing'}
`;

        listings.push({
          tokenSymbol,
          tokenName,
          exchange,
          listingTime,
          isListedOnIndodax,
        });

        await sendTelegramMessage(message);
      }
    }
  } catch (err) {
    console.error('Gagal fetch dari CoinMarketCal:', err.message);
  }
};

// Jalankan awal & update berkala
fetchIndodaxCoins();
setInterval(fetchIndodaxCoins, 6 * 60 * 60 * 1000); // 4 jam
fetchListingsFromCoinMarketCal();
setInterval(fetchListingsFromCoinMarketCal, 2 * 60 * 60 * 1000); // 2 jam

// Endpoint API publik
app.get('/api/listings', (req, res) => {
  res.json(listings);
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
