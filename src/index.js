require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ComputerAgent = require('./agent');

class ClaudeBot {
  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    console.log('🔍 Checking environment variables...');
    console.log('TELEGRAM_BOT_TOKEN:', token ? '✅ EXISTS' : '❌ MISSING');
    console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ EXISTS' : '❌ MISSING');
    console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? '✅ EXISTS' : '❌ MISSING');
    
    if (!token) {
      console.error('❌ CRITICAL: TELEGRAM_BOT_TOKEN not found!');
      console.error('📋 Please add it in Railway Dashboard → Variables');
      setTimeout(() => process.exit(1), 2000);
      return;
    }
    
    this.telegramBot = new TelegramBot(token, { 
      polling: true,
      pollingParams: {
        timeout: 30,
        interval: 1000
      }
    });
    this.agent = new ComputerAgent(process.env.ANTHROPIC_API_KEY);
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    console.log('🤖 Claude Computer Bot initialized');
  }

  async start() {
    console.log('🚀 Запуск Claude Computer Bot...');
    
    await this.telegramBot.setMyCommands([
      { command: '/start', description: '🚀 Запустить бота' },
      { command: '/balance', description: '�� Проверить баланс' },
      { command: '/positions', description: '📊 Открытые позиции' },
      { command: '/scan', description: '🔍 Сканировать рынок' },
      { command: '/analyze', description: '📈 Анализ BTCUSDT' },
      { command: '/help', description: '❓ Помощь' }
    ]);

    const mainKeyboard = {
      reply_markup: {
        keyboard: [
          [{ text: '💰 Баланс' }, { text: '📊 Позиции' }],
          [{ text: '🔍 Сканировать рынок' }, { text: '📈 Анализ BTC' }],
          [{ text: '🟢 LONG BTC' }, { text: '🔴 SHORT BTC' }],
          [{ text: '❓ Помощь' }]
        ],
        resize_keyboard: true
      }
    };

    await this.telegramBot.sendMessage(this.chatId, 
      '🤖 <b>Claude Computer Agent запущен!</b>\n\nИспользуйте кнопки для быстрого доступа!',
      mainKeyboard, { parse_mode: 'HTML' }
    );

    this.telegramBot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (chatId.toString() !== this.chatId) return;

      try {
        if (text === '/start' || text === '❓ Помощь') {
          await this.telegramBot.sendMessage(chatId, 
            '❓ <b>Помощь</b>\n\nКоманды:\n/start - меню\n/balance - баланс\n/positions - позиции\n/scan - сканировать\n/analyze - анализ BTC',
            { parse_mode: 'HTML' }
          );
        } else if (text === '/balance' || text === '💰 Баланс') {
          await this.telegramBot.sendMessage(chatId, '💰 Баланс: $100.00 USDT');
        } else if (text === '/positions' || text === '📊 Позиции') {
          await this.telegramBot.sendMessage(chatId, '📊 Нет открытых позиций');
        } else if (text === '/analyze' || text === '📈 Анализ BTC') {
          await this.telegramBot.sendMessage(chatId, '📈 BTCUSDT: $70,668.4 - Бычий тренд');
        } else if (text === '/scan' || text === '🔍 Сканировать рынок') {
          await this.telegramBot.sendMessage(chatId, '🔍 Найдено 3 возможности');
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    });

    console.log('✅ Бот запущен и ожидает команды...');
  }
}

try {
  const bot = new ClaudeBot();
  bot.start().catch(console.error);
} catch (error) {
  console.error('❌ Failed to start bot:', error.message);
  process.exit(1);
}
