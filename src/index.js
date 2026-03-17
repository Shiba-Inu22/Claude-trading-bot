require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const https = require('https');

console.log('🚀 Starting Simple Trading Bot...');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '226166473';
const PORT = process.env.PORT || 3000;

// HTTP сервер
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot running');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server on port ${PORT}`);
});

// Бот
const bot = new TelegramBot(TOKEN, {
  polling: { interval: 500, autoStart: true, params: { timeout: 10 } }
});

// Простые данные
let btcPrice = 95000; // Начальная цена
let ethPrice = 3200;

// Получаем цену с Binance через HTTPS
function fetchPrice() {
  return new Promise((resolve) => {
    https.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          btcPrice = parseFloat(parsed.price);
          console.log(`✅ BTC Price: $${btcPrice}`);
          resolve(btcPrice);
        } catch(e) { resolve(btcPrice); }
      });
    }).on('error', () => resolve(btcPrice));
  });
}

// Обновляем цену при старте и каждые 30 сек
fetchPrice();
setInterval(fetchPrice, 30000);

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    await fetchPrice();
    bot.sendMessage(chatId, `✅ <b>Бот запущен!</b>\n\n💰 <b>BTC:</b> $${btcPrice.toLocaleString()}\n\nКнопки внизу 👇`, { parse_mode: 'HTML' });
    
    const keyboard = {
      reply_markup: {
        keyboard: [['💰 Баланс', '📊 Позиции'], ['🔍 Сканировать', '📈 Анализ BTC'], ['🟢 LONG', '🔴 SHORT'], ['❓ Помощь']],
        resize_keyboard: true
      }
    };
    setTimeout(() => bot.sendMessage(chatId, 'Выберите:', keyboard), 300);
    
  } else if (msg.text === '📈 Анализ BTC') {
    await fetchPrice();
    bot.sendMessage(chatId, `📈 <b>BTCUSDT LIVE</b>\n\n💰 Цена: $${btcPrice.toLocaleString()}\n\nТренд: ${btcPrice > 94000 ? '🟢 БЫЧИЙ' : '🔴 МЕДВЕЖИЙ'}\nРекомендация: ${btcPrice > 96000 ? 'SHORT' : btcPrice < 93000 ? 'LONG' : '⚪ ЖДАТЬ'}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '💰 Баланс') {
    bot.sendMessage(chatId, `💰 <b>Баланс</b>\n\nUSDT: $100\nBTC: ₿0.001 (~$${(0.001 * btcPrice).toFixed(0)})\nETH: Ξ0.05 (~$${(0.05 * ethPrice).toFixed(0)})\n\nВсего: ~$${(100 + 0.001*btcPrice + 0.05*ethPrice).toFixed(2)}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '📊 Позиции') {
    const pnl = ((btcPrice - 94000) / 94000) * 100 * 3;
    bot.sendMessage(chatId, `📊 <b>Позиция</b>\n\n🟢 BTC LONG\nВход: $94,000\nТекущая: $${btcPrice.toLocaleString()}\nPnL: ${pnl >= 0 ? '+' : ''}$${(100 * pnl / 100).toFixed(2)} (${pnl.toFixed(2)}%)`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🟢 LONG') {
    bot.sendMessage(chatId, `🟢 LONG открыт!\nВход: $${btcPrice}\nTP: $${(btcPrice * 1.03).toFixed(0)}\nSL: $${(btcPrice * 0.985).toFixed(0)}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔴 SHORT') {
    bot.sendMessage(chatId, `🔴 SHORT открыт!\nВход: $${btcPrice}\nTP: $${(btcPrice * 0.97).toFixed(0)}\nSL: $${(btcPrice * 1.015).toFixed(0)}`, { parse_mode: 'HTML' });
    
  } else if (msg.text === '❓ Помощь') {
    bot.sendMessage(chatId, `❓ Помощь\n\nКоманды:\n/start - Меню\n📈 Анализ BTC\n💰 Баланс\n📊 Позиции\n🟢 LONG / 🔴 SHORT\n\nЦены обновляются!`);
  }
});

console.log('✅ Bot started!');
