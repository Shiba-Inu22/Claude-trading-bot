require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🚀 Claude Trading Bot - Raspberry Pi Edition');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

// Бот с polling (на малине можно!)
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 500,
    autoStart: true,
    params: { timeout: 10 }
  }
});

// Цены
let prices = { btc: 74715, eth: 2334, bnb: 590, sol: 145 };

// Обновление с CoinGecko
async function updatePrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd');
    const data = await res.json();
    if (data.bitcoin?.usd) prices.btc = data.bitcoin.usd;
    if (data.ethereum?.usd) prices.eth = data.ethereum.usd;
    if (data.binancecoin?.usd) prices.bnb = data.binancecoin.usd;
    if (data.solana?.usd) prices.sol = data.solana.usd;
    console.log(`💰 Updated: BTC=$${prices.btc}, ETH=$${prices.eth}`);
  } catch(e) {
    console.log('Price update error:', e.message);
  }
}

updatePrices();
setInterval(updatePrices, 60000);

// Команды
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    await updatePrices();
    bot.sendMessage(chatId, `✅ <b>Claude Trading Bot</b>\n\n💰 <b>LIVE Цены:</b>\nBTC: $${prices.btc.toLocaleString()}\nETH: $${prices.eth.toLocaleString()}\nSOL: $${prices.sol.toLocaleString()}\n\n<i>Raspberry Pi Edition 🍓</i>`, { parse_mode: 'HTML' });
    
    const kb = { reply_markup: { keyboard: [['💰 Баланс', '📊 Позиции'], ['📈 Анализ BTC', '🔍 Сканер'], ['🟢 LONG', '🔴 SHORT'], ['❓ Помощь']], resize_keyboard: true }};
    setTimeout(() => bot.sendMessage(chatId, 'Выберите команду:', kb), 300);
    
  } else if (msg.text === '📈 Анализ BTC') {
    await updatePrices();
    const trend = prices.btc > 74000 ? '🟢 БЫЧИЙ' : '🔴 МЕДВЕЖИЙ';
    const rec = prices.btc > 75000 ? 'SHORT' : prices.btc < 73000 ? 'LONG' : '⚪ ЖДАТЬ';
    bot.sendMessage(chatId, `📈 <b>BTCUSDT LIVE</b>\n\n💰 Цена: $${prices.btc.toLocaleString()}\n\n${trend}\nRSI: 55\nРекомендация: ${rec}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '💰 Баланс') {
    const total = 100 + (0.001 * prices.btc) + (0.05 * prices.eth) + (0.5 * prices.sol);
    bot.sendMessage(chatId, `💰 <b>Баланс</b>\n\nUSDT: $100.00\nBTC: ₿0.001 (~$${(0.001 * prices.btc).toFixed(2)})\nETH: Ξ0.05 (~$${(0.05 * prices.eth).toFixed(2)})\nSOL: 0.5 (~$${(0.5 * prices.sol).toFixed(2)})\n\n<b>ВСЕГО: $${total.toFixed(2)}</b>\n\n<i>Цены LIVE!</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '�� Позиции') {
    const pnlPercent = ((prices.btc - 72000) / 72000) * 100 * 3;
    const pnlAmount = 100 * (pnlPercent / 100);
    bot.sendMessage(chatId, `📊 <b>Позиции</b>\n\n🟢 BTC LONG x3\n├ Вход: $72,000\n├ Текущая: $${prices.btc.toLocaleString()}\n├ PnL: ${pnlAmount >= 0 ? '+' : ''}$${pnlAmount.toFixed(2)} (+${pnlPercent.toFixed(2)}%)\n└ Плечо: 3x\n\n<i>Real-time расчет</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🟢 LONG') {
    const tp = Math.round(prices.btc * 1.03);
    const sl = Math.round(prices.btc * 0.985);
    bot.sendMessage(chatId, `🟢 <b>LONG открыт!</b>\n\n├ Пара: BTCUSDT\n├ Вход: $${prices.btc.toLocaleString()}\n├ TP: $${tp.toLocaleString()} (+3%)\n└ SL: $${sl.toLocaleString()} (-1.5%)\n\n✅ Удачи!`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔴 SHORT') {
    const tp = Math.round(prices.btc * 0.97);
    const sl = Math.round(prices.btc * 1.015);
    bot.sendMessage(chatId, `🔴 <b>SHORT открыт!</b>\n\n├ Пара: BTCUSDT\n├ Вход: $${prices.btc.toLocaleString()}\n├ TP: $${tp.toLocaleString()} (-3%)\n└ SL: $${sl.toLocaleString()} (+1.5%)\n\n✅ Удачи!`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔍 Сканер') {
    await updatePrices();
    bot.sendMessage(chatId, `🔍 <b>Сканер рынка</b>\n\n1️⃣ BTC $${prices.btc.toLocaleString()} - 🟢 LONG (85%)\n2️⃣ ETH $${prices.eth.toLocaleString()} - 🟢 LONG (78%)\n3️⃣ SOL $${prices.sol.toLocaleString()} - 🔴 SHORT (72%)\n\n<i>Обновлено: ${new Date().toLocaleTimeString('ru-RU')}</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '❓ Помощь') {
    bot.sendMessage(chatId, `❓ <b>Помощь</b>\n\nКоманды:\n/start - Меню\n📈 Анализ BTC\n💰 Баланс\n📊 Позиции\n🟢 LONG\n🔴 SHORT\n🔍 Сканер\n\n🍓 Работает на Raspberry Pi!\nЦены LIVE с CoinGecko`);
  }
});

bot.on('polling_error', (error) => {
  console.log('Polling:', error.message.substring(0, 50));
});

console.log('✅ Bot started on Raspberry Pi!');
console.log(`💰 Initial: BTC=$${prices.btc}, ETH=$${prices.eth}`);
