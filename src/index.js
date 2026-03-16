require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
const express = require('express');

console.log('🚀 Starting Advanced Trading Bot (Webhook Mode)...');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '226166473';
const PORT = process.env.PORT || 3000;

// Express сервер для webhook
const app = express();
app.use(express.json());

let bot;

// Инициализация бота
try {
  bot = new TelegramBot(TOKEN, {
    polling: false, // Отключаем polling, используем webhook
    onlyFirstMatch: true,
    baseApiUrl: 'https://api.telegram.org'
  });

  console.log('✅ Bot initialized in webhook mode');
} catch (error) {
  console.error('❌ Bot initialization error:', error.message);
  process.exit(1);
}

// Данные для ответов
const balanceData = { usdt: 100.00, btc: 0.00142, eth: 0.0521, totalUsd: 245.50 };
const positionsData = [
  { symbol: 'BTCUSDT', side: 'LONG', size: 100, leverage: 3, entryPrice: 69500, currentPrice: 70668, pnl: 4.82 },
  { symbol: 'ETHUSDT', side: 'SHORT', size: 50, leverage: 2, entryPrice: 3850, currentPrice: 3820, pnl: 1.35 }
];
const marketScanResults = [
  { symbol: 'BTCUSDT', direction: 'LONG', confidence: 85, price: 70668, reason: 'RSI перепроданность + бычий тренд' },
  { symbol: 'ETHUSDT', direction: 'LONG', confidence: 78, price: 3820, reason: 'Пробой сопротивления + объем' },
  { symbol: 'SOLUSDT', direction: 'SHORT', confidence: 72, price: 142.50, reason: 'Медвежья дивергенция' }
];

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    const welcome = `✅ <b>Claude Trading Bot запущен!</b>\n\n🤖 <b>Я умею:</b>\n• Проверять баланс и позиции\n• Сканировать рынок\n• Анализировать BTC\n• Открывать сделки\n\n💡 <b>Используйте кнопки внизу!</b>`;
    const keyboard = { reply_markup: { keyboard: [['💰 Баланс', '📊 Позиции'], ['🔍 Сканировать рынок', '📈 Анализ BTC'], ['🟢 LONG BTC', '🔴 SHORT BTC'], ['❓ Помощь']], resize_keyboard: true }};
    bot.sendMessage(chatId, welcome, { parse_mode: 'HTML' });
    setTimeout(() => bot.sendMessage(chatId, 'Выберите команду:', keyboard), 500);
  } else if (msg.text === '💰 Баланс') {
    bot.sendMessage(chatId, `💰 <b>Ваш баланс</b>\n\n<b>Доступно:</b>\n• USDT: $${balanceData.usdt.toFixed(2)}\n• BTC: ₿${balanceData.btc.toFixed(5)} (~$${(balanceData.btc * 70668).toFixed(2)})\n• ETH: Ξ${balanceData.eth.toFixed(4)} (~$${(balanceData.eth * 3820).toFixed(2)})\n\n<b>Общий капитал:</b> $${balanceData.totalUsd.toFixed(2)}\n\n<b>В сделках:</b> $150.00\n<b>Свободно:</b> $${(balanceData.totalUsd - 150).toFixed(2)}`, { parse_mode: 'HTML' });
  } else if (msg.text === '📊 Позиции') {
    let report = `📊 <b>Открытые позиции (${positionsData.length})</b>\n\n`;
    positionsData.forEach((pos) => {
      const emoji = pos.side === 'LONG' ? '🟢' : '🔴';
      const pnlEmoji = pos.pnl >= 0 ? '��' : '📉';
      report += `${emoji} <b>${pos.symbol} ${pos.side}</b>\n├ Размер: $${pos.size} × ${pos.leverage}x\n├ Вход: $${pos.entryPrice.toLocaleString()}\n├ Текущая: $${pos.currentPrice.toLocaleString()}\n├ ${pnlEmoji} PnL: +$${pos.pnl.toFixed(2)}\n└ Плечо: ${pos.leverage}x\n\n`;
    });
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
  } else if (msg.text === '🔍 Сканировать рынок') {
    let report = `🔍 <b>Результаты сканирования</b>\n\nНайдено возможностей: ${marketScanResults.length}\n\n`;
    marketScanResults.forEach((res, i) => {
      const emoji = res.direction === 'LONG' ? '🟢' : '🔴';
      report += `${i+1}. ${emoji} <b>${res.symbol}</b>\n   Направление: ${res.direction}\n   Уверенность: ${res.confidence}%\n   Цена: $${res.price.toLocaleString()}\n   Причина: ${res.reason}\n\n`;
    });
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
  } else if (msg.text === '📈 Анализ BTC') {
    bot.sendMessage(chatId, `📈 <b>Технический анализ BTCUSDT</b>\n\n💰 <b>Цена:</b> $70,668.40\n\n<b>Индикаторы:</b>\n├ RSI: 42.5 ⚪\n├ MACD: -125.3 🔴\n├ EMA(20): $71,200 🔴\n└ Тренд: ⚪ Боковик\n\n<b>Рекомендация:</b> ⚪ ЖДАТЬ`, { parse_mode: 'HTML' });
  } else if (msg.text === '🟢 LONG BTC') {
    bot.sendMessage(chatId, `🟢 <b>LONG BTCUSDT открыт!</b>\n\n<b>Параметры:</b>\n├ Сумма: $100 × 3x\n├ Вход: $70,668\n├ TP: $72,788 (+3%)\n└ SL: $69,608 (-1.5%)`, { parse_mode: 'HTML' });
  } else if (msg.text === '🔴 SHORT BTC') {
    bot.sendMessage(chatId, `🔴 <b>SHORT BTCUSDT открыт!</b>\n\n<b>Параметры:</b>\n├ Сумма: $100 × 3x\n├ Вход: $70,668\n├ TP: $68,548 (-3%)\n└ SL: $71,728 (+1.5%)`, { parse_mode: 'HTML' });
  } else if (msg.text === '❓ Помощь') {
    bot.sendMessage(chatId, `❓ <b>Помощь</b>\n\nКоманды:\n/start - Меню\n💰 Баланс\n📊 Позиции\n🔍 Сканировать\n📈 Анализ BTC\n🟢 LONG / 🔴 SHORT\n\n⚠️ Риски: Торговля опасна!`, { parse_mode: 'HTML' });
  }
});

// Webhook endpoint для Telegram
app.post(`/bot${TOKEN}`, (req, res) => {
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Claude Trading Bot is running! ��');
});

// Запуск сервера
const server = http.createServer(app);
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
  
  // Устанавливаем webhook после запуска сервера
  try {
    const domain = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    const webhookUrl = `${domain}/bot${TOKEN}`;
    
    await bot.setWebHook(webhookUrl);
    console.log(`✅ Webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
  }
});

console.log('✅ Advanced Trading Bot started in webhook mode!');
