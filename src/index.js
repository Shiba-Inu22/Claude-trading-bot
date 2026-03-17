require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

console.log('🚀 CLEAN BUILD - Professional Trading Bot');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN missing!');
  process.exit(1);
}

// Express для webhook
const app = express();
app.use(express.json());

// Бот БЕЗ polling (webhook режим)
const bot = new TelegramBot(TOKEN, { polling: false });

// Начальные цены (обновятся при старте)
let prices = { btc: 74715, eth: 2334, bnb: 590, sol: 145 };

// Обновление цен с CoinGecko
async function updatePrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd');
    const data = await res.json();
    if (data.bitcoin?.usd) prices.btc = data.bitcoin.usd;
    if (data.ethereum?.usd) prices.eth = data.ethereum.usd;
    if (data.binancecoin?.usd) prices.bnb = data.binancecoin.usd;
    if (data.solana?.usd) prices.sol = data.solana.usd;
    console.log(`💰 Updated: BTC=$${prices.btc}`);
  } catch(e) {}
}

updatePrices();
setInterval(updatePrices, 60000);

// Команды
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    await updatePrices();
    bot.sendMessage(chatId, `✅ <b>Claude Trading Bot</b>\n\n💰 <b>LIVE Цены:</b>\nBTC: $${prices.btc.toLocaleString()}\nETH: $${prices.eth.toLocaleString()}\nSOL: $${prices.sol.toLocaleString()}`, { parse_mode: 'HTML' });
    
    const kb = { reply_markup: { keyboard: [['💰 Баланс', '📊 Позиции'], ['📈 Анализ BTC', '🔍 Сканер'], ['🟢 LONG', '🔴 SHORT'], ['❓ Помощь']], resize_keyboard: true }};
    setTimeout(() => bot.sendMessage(chatId, 'Выберите команду:', kb), 300);
    
  } else if (msg.text === '📈 Анализ BTC') {
    await updatePrices();
    bot.sendMessage(chatId, `📈 <b>BTCUSDT</b>\n\n💰 $${prices.btc.toLocaleString()}\n\n${prices.btc > 74000 ? '🟢' : '🔴'} Тренд: ${prices.btc > 74000 ? 'БЫЧИЙ' : 'МЕДВЕЖИЙ'}\nРекомендация: ${prices.btc > 75000 ? 'SHORT' : prices.btc < 73000 ? 'LONG' : '⚪ ЖДАТЬ'}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '💰 Баланс') {
    const total = 100 + (0.001 * prices.btc) + (0.05 * prices.eth);
    bot.sendMessage(chatId, `💰 <b>Баланс</b>\n\nUSDT: $100\nBTC: ~$${(0.001*prices.btc).toFixed(0)}\nETH: ~$${(0.05*prices.eth).toFixed(0)}\n\n<b>ВСЕГО: $${total.toFixed(2)}</b>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '📊 Позиции') {
    const pnl = ((prices.btc - 72000) / 72000) * 100 * 3;
    bot.sendMessage(chatId, `📊 <b>Позиции</b>\n\n🟢 BTC LONG x3\nВход: $72,000\nТекущая: $${prices.btc.toLocaleString()}\nPnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (+${pnl.toFixed(2)}%)`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🟢 LONG') {
    bot.sendMessage(chatId, `🟢 <b>LONG открыт!</b>\n\nВход: $${prices.btc.toLocaleString()}\nTP: $${Math.round(prices.btc * 1.03)}\nSL: $${Math.round(prices.btc * 0.985)}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔴 SHORT') {
    bot.sendMessage(chatId, `🔴 <b>SHORT открыт!</b>\n\nВход: $${prices.btc.toLocaleString()}\nTP: $${Math.round(prices.btc * 0.97)}\nSL: $${Math.round(prices.btc * 1.015)}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '❓ Помощь') {
    bot.sendMessage(chatId, `❓ <b>Помощь</b>\n\n/start - Меню\n📈 Анализ\n💰 Баланс\n📊 Позиции\n🟢 LONG\n🔴 SHORT\n\n✅ Webhook | LIVE цены`);
  }
});

// Webhook endpoint
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Trading Bot OK ✅'));

// Запуск
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ Server: port ${PORT}`);
  
  try {
    const domain = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const url = `${domain}/bot${TOKEN}`;
    await bot.setWebHook(url);
    console.log(`✅ Webhook: ${url}`);
    console.log('✅ READY!');
  } catch(err) {
    console.error('❌ Webhook:', err.message);
  }
});
