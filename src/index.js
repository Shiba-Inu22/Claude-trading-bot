require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('🤖 Starting bot...');
console.log('TOKEN exists:', !!TOKEN);
console.log('CHAT_ID exists:', !!CHAT_ID);

if (!TOKEN) {
  console.error('❌ ERROR: TELEGRAM_BOT_TOKEN is missing!');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(`📨 Message from ${chatId}: ${msg.text}`);
  
  if (msg.text === '/start') {
    bot.sendMessage(chatId, '✅ Bot is working! Variables loaded successfully.');
  }
});

console.log('✅ Bot started and waiting for messages...');
