# 🚀 Crypto Listing Notifier

Aplikasi backend Node.js untuk memantau token yang akan **listing di CEX** (Centralized Exchanges) berdasarkan data dari [CoinMarketCal](https://coinmarketcal.com/), dan mengirimkan notifikasi ke Telegram secara otomatis setiap 2 jam.

---

## ✨ Fitur

- 🔄 Mengambil data listing token terbaru dari CoinMarketCal API
- 🕒 Memperbarui data setiap 2 jam secara otomatis
- 📩 Mengirimkan notifikasi ke Telegram (bisa diperluas ke WhatsApp)
- 🌐 Menyediakan API endpoint `/api/listings` untuk frontend/web client

---

## 🚀 Cara Deploy (di Render)

1. **Fork atau Clone** repo ini.

2. **Buat Web Service di [Render](https://render.com/)**  
   - `Build Command`: `npm install`  
   - `Start Command`: `node server.js`  
   - `Environment`: Node.js  
   - `Root Directory`: *(biarkan kosong jika `server.js` berada di root repo)*

3. **Tambahkan Environment Variables di Render:**
   - `COINMARKETCAL_API_KEY` = `vHY89IrinPaYLTk7TfYuq6cdrv7XEYPTaIKFmiyb`
   - `TELEGRAM_TOKEN` = `xxx` (token bot Telegram kamu)
   - `CHAT_ID` = `xxxxxx` (ID Telegram kamu)

---

## 📦 Install di Lokal

```bash
git clone https://github.com/yourusername/crypto-listing-notifier.git
cd crypto-listing-notifier
npm install
node server.js
