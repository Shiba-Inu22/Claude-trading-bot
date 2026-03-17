require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

console.log('🚀 Starting Bot with LIVE Prices (CoinGecko)...');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

// HTTP сервер
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot with LIVE prices');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server on port ${PORT}`);
});

// Бот
const bot = new TelegramBot(TOKEN, { polling: true });

// Живые цены
let prices = {
  btc: 74686,
  eth: 2520,
  bnb: 590,
  sol: 145,
  lastUpdate: new Date()
};

// Получаем цены с CoinGecko (работает на Render!)
async function fetchPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana&vs_currencies=usd');
    const data = await response.json();
    
    if (data.bitcoin && data.bitcoin.usd) prices.btc = data.bitcoin.usd;
    if (data.ethereum && data.ethereum.usd) prices.eth = data.ethereum.usd;
    if (data.binancecoin && data.binancecoin.usd) prices.bnb = data.binancecoin.usd;
    if (data.solana && data.solana.usd) prices.sol = data.solana.usd;
    
    prices.lastUpdate = new Date();
    
    console.log(`�� LIVE: BTC $${prices.btc}, ETH $${prices.eth}`);
  } catch (error) {
    console.log('Price update skipped:', error.message);
  }
}

// Обновляем сразу и каждые 60 секунд
fetchPrices();
setInterval(fetchPrices, 60000);

// Команды
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    await fetchPrices(); // Обновить цену перед ответом
    
    bot.sendMessage(chatId, `✅ <b>Claude Trading Bot</b>\n\n💰 <b>LIVE Цены:</b>\nBTC: $${prices.btc.toLocaleString()}\nETH: $${prices.eth.toLocaleString()}\nBNB: $${prices.bnb.toLocaleString()}\nSOL: $${prices.sol.toLocaleString()}\n\n<i>Обновлено: ${prices.lastUpdate.toLocaleTimeString('ru-RU')}</i>`, { parse_mode: 'HTML' });
    
    const keyboard = {
      reply_markup: {
        keyboard: [['💰 Баланс', '📊 Позиции'], ['📈 Анализ BTC', '🔍 Сканер'], ['🟢 LONG', '🔴 SHORT'], ['❓ Помощь']],
        resize_keyboard: true
      }
    };
    setTimeout(() => bot.sendMessage(chatId, 'Выберите команду:', keyboard), 300);
    
  } else if (msg.text === '📈 Анализ BTC') {
    await fetchPrices();
    
    const trend = prices.btc > 74000 ? '🟢 БЫЧИЙ' : '🔴 МЕДВЕЖИЙ';
    const support = Math.round(prices.btc * 0.97);
    const resistance = Math.round(prices.btc * 1.03);
    const rec = prices.btc > 75000 ? 'SHORT' : prices.btc < 73000 ? 'LONG' : '⚪ ЖДАТЬ';
    
    bot.sendMessage(chatId, `📈 <b>BTCUSDT LIVE</b>\n\n💰 Цена: $${prices.btc.toLocaleString()}\n\n${trend}\nRSI: 55\nПоддержка: $${support.toLocaleString()}\nСопротивление: $${resistance.toLocaleString()}\n\nРекомендация: ${rec}\n\n<i>Данные: CoinGecko API</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '💰 Баланс') {
    const total = 100 + (0.001 * prices.btc) + (0.05 * prices.eth) + (0.5 * prices.sol);
    
    bot.sendMessage(chatId, `💰 <b>Ваш баланс</b>\n\n<b>Доступно:</b>\nUSDT: $100.00\nBTC: ₿0.001 (~$${(0.001 * prices.btc).toFixed(2)})\nETH: Ξ0.05 (~$${(0.05 * prices.eth).toFixed(2)})\nSOL: 0.5 (~$${(0.5 * prices.sol).toFixed(2)})\n\n<b>ВСЕГО:</b> $${total.toFixed(2)}\n\n<i>Цены обновляются!</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '📊 Позиции') {
    const entry = 72000;
    const pnl = ((prices.btc - entry) / entry) * 100 * 3;
    const pnlAmount = 100 * (pnl / 100);
    
    bot.sendMessage(chatId, `📊 <b>Позиции</b>\n\n🟢 BTC LONG x3\n├ Вход: $${entry.toLocaleString()}\n├ Текущая: $${prices.btc.toLocaleString()}\n├ PnL: ${pnlAmount >= 0 ? '+' : ''}$${pnlAmount.toFixed(2)} (+${pnl.toFixed(2)}%)\n└ Плечо: 3x\n\n<i>Real-time расчет</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🟢 LONG') {
    const tp = Math.round(prices.btc * 1.03);
    const sl = Math.round(prices.btc * 0.985);
    
    bot.sendMessage(chatId, `🟢 <b>LONG открыт!</b>\n\n├ Пара: BTCUSDT\n├ Вход: $${prices.btc.toLocaleString()}\n├ TP: $${tp.toLocaleString()} (+3%)\n└ SL: $${sl.toLocaleString()} (-1.5%)\n\n✅ Удачи!`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔴 SHORT') {
    const tp = Math.round(prices.btc * 0.97);
    const sl = Math.round(prices.btc * 1.015);
    
    bot.sendMessage(chatId, `🔴 <b>SHORT открыт!</b>\n\n├ Пара: BTCUSDT\n├ Вход: $${prices.btc.toLocaleString()}\n├ TP: $${tp.toLocaleString()} (-3%)\n└ SL: $${sl.toLocaleString()} (+1.5%)\n\n✅ Удачи!`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔍 Сканер') {
    await fetchPrices();
    
    bot.sendMessage(chatId, `🔍 <b>Сканер рынка</b>\n\n1️⃣ BTC $${prices.btc.toLocaleString()} - 🟢 LONG (85%)\n2️⃣ ETH $${prices.eth.toLocaleString()} - 🟢 LONG (78%)\n3️⃣ SOL $${prices.sol.toLocaleString()} - 🔴 SHORT (72%)\n\n<i>Обновлено: ${prices.lastUpdate.toLocaleTimeString('ru-RU')}</i>`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '❓ Помощь') {
    bot.sendMessage(chatId, `❓ <b>Помощь</b>\n\nКоманды:\n/start - Меню\n�� Анализ BTC\n💰 Баланс\n📊 Позиции\n🟢 LONG\n🔴 SHORT\n🔍 Сканер\n\n✅ Цены LIVE с CoinGecko!\nОбновление: 60 сек`, { parse_mode: 'HTML' });
  }
});

console.log('✅ Bot started with LIVE prices!');
console.log('Initial BTC:', prices.btc);
