// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

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

const fetchCoinMarketCalListings = async () => {
  try {
    const res = await axios.get('https://developers.coinmarketcal.com/v1/events', {
      headers: {
        'x-api-key': COINMARKETCAL_API_KEY,
      },
      params: {
        page: 1,
        max: 10,
        categories: 'listing', // Menggunakan string 'listing' yang benar
        sortBy: 'date_added',
        coins: '',
      },
    });

    const events = res.data.body;
    console.log('✅ Jumlah event listing:', events.length);
    return events;
  } catch (err) {
    console.error('❌ Gagal fetch dari CoinMarketCal:', err.response?.data || err.message);
    return [];
  }
};

const fetchIndodaxCoins = async () => {
  try {
    const res = await axios.get('https://indodax.com/api/pairs');
    return res.data.map((pair) => pair.base_id.toUpperCase());
  } catch (err) {
    console.error('❌ Gagal fetch data dari Indodax:', err.message);
    return [];
  }
};

const checkAndNotifyListings = async () => {
  const listingsFromCMC = await fetchCoinMarketCalListings();
  const indodaxCoins = await fetchIndodaxCoins();

  for (const listing of listingsFromCMC) {
    const token = listing.coins[0]?.symbol;
    if (!token || lastNotified.has(token)) continue;

    const alreadyOnIndodax = indodaxCoins.includes(token.toUpperCase());

    const message = `🚀 *Token Listing Baru!*\n\nToken: ${token}\nNama: ${listing.coins[0]?.name}\nExchange: ${listing.exchange}\nTanggal: ${listing.date_event}\n${alreadyOnIndodax ? '✅ Sudah listing di Indodax' : '❌ Belum ada di Indodax'}`;

    await sendTelegramMessage(message);
    lastNotified.add(token);

    listings.push({
      token,
      name: listing.coins[0]?.name,
      exchange: listing.exchange,
      date: listing.date_event,
      indodax: alreadyOnIndodax,
    });
  }
};

// Simulasi pengecekan setiap 2 jam
setInterval(checkAndNotifyListings, 2 * 60 * 60 * 1000);
checkAndNotifyListings();

app.get('/api/listings', (req, res) => {
  res.json(listings);
});

app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
