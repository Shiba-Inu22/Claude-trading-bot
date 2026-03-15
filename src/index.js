require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🔍 Starting bot...');
console.log('Token exists:', !!process.env.TELEGRAM_BOT_TOKEN);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '226166473';

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  if (msg.text === '/start') {
    bot.sendMessage(chatId, '✅ Бот работает! Render.com + Telegram');
    
    const keyboard = {
      reply_markup: {
        keyboard: [
          ['💰 Баланс', '📊 Позиции'],
          ['🔍 Сканировать', '📈 Анализ BTC'],
          ['🟢 LONG BTC', '🔴 SHORT BTC']
        ],
        resize_keyboard: true
      }
    };
    
    bot.sendMessage(chatId, 'Выберите команду:', keyboard);
  } else if (msg.text === '💰 Баланс') {
    bot.sendMessage(chatId, '💰 Баланс: $100.00 USDT');
  } else if (msg.text === '📊 Позиции') {
    bot.sendMessage(chatId, '📊 Нет открытых позиций');
  } else if (msg.text === '🔍 Сканировать') {
    bot.sendMessage(chatId, '🔍 Найдено 3 возможности');
  } else if (msg.text === '📈 Анализ BTC') {
    bot.sendMessage(chatId, '📈 BTC: $70,668 - Бычий тренд 🟢');
  } else if (msg.text === '🟢 LONG BTC') {
    bot.sendMessage(chatId, '🟢 LONG BTC открыт! $100 × 3x');
  } else if (msg.text === '🔴 SHORT BTC') {
    bot.sendMessage(chatId, '🔴 SHORT BTC открыт! $100 × 3x');
  }
});

console.log('✅ Bot started successfully!');
