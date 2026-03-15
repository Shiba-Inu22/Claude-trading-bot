require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const ComputerAgent = require('./agent');

class ClaudeBot {
  constructor() {
    this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
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
    
    // Настройка команд меню
    await this.telegramBot.setMyCommands([
      { command: '/start', description: '🚀 Запустить бота' },
      { command: '/balance', description: '💰 Проверить баланс' },
      { command: '/positions', description: '📊 Открытые позиции' },
      { command: '/scan', description: '🔍 Сканировать рынок' },
      { command: '/analyze', description: '📈 Анализ BTCUSDT' },
      { command: '/help', description: '❓ Помощь' }
    ]);

    // Главное меню с кнопками
    const mainKeyboard = {
      reply_markup: {
        keyboard: [
          [
            { text: '💰 Баланс' },
            { text: '📊 Позиции' }
          ],
          [
            { text: '🔍 Сканировать рынок' },
            { text: '📈 Анализ BTC' }
          ],
          [
            { text: '🟢 LONG BTC' },
            { text: '🔴 SHORT BTC' }
          ],
          [
            { text: '❓ Помощь' }
          ]
        ],
        resize_keyboard: true
      }
    };

    await this.telegramBot.sendMessage(this.chatId, 
      `🤖 <b>Claude Computer Agent запущен!</b>

💻 <b>Я умею:</b>

<b>⚡ Быстрые команды:</b>
Используйте кнопки внизу для быстрого доступа!

<b>�� Торговля:</b>
• Баланс и позиции
• Открыть LONG/SHORT
• Анализ рынка

Просто нажмите кнопку или напишите задачу!`,
      mainKeyboard
    , { parse_mode: 'HTML' });

    // Обработка сообщений
    this.telegramBot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (chatId.toString() !== this.chatId) return;

      try {
        // Обработка кнопок
        if (text === '💰 Баланс') {
          await this.handleBalance(chatId);
        } else if (text === '📊 Позиции') {
          await this.handlePositions(chatId);
        } else if (text === '🔍 Сканировать рынок') {
          await this.handleScanMarket(chatId);
        } else if (text === '📈 Анализ BTC') {
          await this.handleAnalyzeBTC(chatId);
        } else if (text === '�� LONG BTC') {
          await this.handleOpenLongBTC(chatId);
        } else if (text === '🔴 SHORT BTC') {
          await this.handleOpenShortBTC(chatId);
        } else if (text === '❓ Помощь') {
          await this.handleHelp(chatId);
        } else if (text === '/start') {
          await this.handleStart(chatId);
        } else if (text === '/balance') {
          await this.handleBalance(chatId);
        } else if (text === '/positions') {
          await this.handlePositions(chatId);
        } else if (text === '/scan') {
          await this.handleScanMarket(chatId);
        } else if (text === '/analyze') {
          await this.handleAnalyzeBTC(chatId);
        } else if (text === '/help') {
          await this.handleHelp(chatId);
        }

      } catch (error) {
        console.error('Error:', error);
        await this.telegramBot.sendMessage(chatId, 
          `❌ <b>Ошибка:</b>\n<code>${error.message}</code>`, 
          { parse_mode: 'HTML' }
        );
      }
    });

    console.log('✅ Бот запущен и ожидает команды...');
  }

  async handleStart(chatId) {
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

    await this.telegramBot.sendMessage(chatId, 
      `🤖 <b>Claude Computer Agent</b>

💻 <b>Ваш AI ассистент для трейдинга</b>

<b>📋 Команды:</b>
/scan - Сканировать рынок
/analyze - Анализ BTCUSDT
/balance - Проверить баланс
/positions - Открытые позиции

<b>💡 Используйте кнопки внизу!</b>`,
      mainKeyboard
    , { parse_mode: 'HTML' });
  }

  async handleBalance(chatId) {
    await this.telegramBot.sendChatAction(chatId, 'typing');
    try {
      const result = await this.agent.executeCommand('баланс');
      await this.sendResult(chatId, result);
    } catch (error) {
      await this.telegramBot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
    }
  }

  async handlePositions(chatId) {
    await this.telegramBot.sendChatAction(chatId, 'typing');
    try {
      const result = await this.agent.executeCommand('позиции');
      await this.sendResult(chatId, result);
    } catch (error) {
      await this.telegramBot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
    }
  }

  async handleScanMarket(chatId) {
    await this.telegramBot.sendChatAction(chatId, 'typing');
    try {
      const result = await this.agent.executeCommand('найди торговые возможности');
      await this.sendResult(chatId, result);
    } catch (error) {
      await this.telegramBot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
    }
  }

  async handleAnalyzeBTC(chatId) {
    await this.telegramBot.sendChatAction(chatId, 'typing');
    try {
      const result = await this.agent.executeCommand('проанализируй BTCUSDT');
      await this.sendResult(chatId, result);
    } catch (error) {
      await this.telegramBot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
    }
  }

  async handleOpenLongBTC(chatId) {
    const confirmKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Подтвердить LONG $100 3x', callback_data: 'confirm_long_btc' }],
          [{ text: '❌ Отмена', callback_data: 'cancel' }]
        ]
      }
    };

    await this.telegramBot.sendMessage(chatId, 
      `🟢 <b>Открыть LONG BTCUSDT</b>

<b>Параметры:</b>
• Пара: BTCUSDT
• Направление: LONG
• Сумма: $100
• Плечо: 3x
• Цена входа: Рыночная

Подтвердить?`,
      confirmKeyboard
    , { parse_mode: 'HTML' });
  }

  async handleOpenShortBTC(chatId) {
    const confirmKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Подтвердить SHORT $100 3x', callback_data: 'confirm_short_btc' }],
          [{ text: '❌ Отмена', callback_data: 'cancel' }]
        ]
      }
    };

    await this.telegramBot.sendMessage(chatId, 
      `🔴 <b>Открыть SHORT BTCUSDT</b>

<b>Параметры:</b>
• Пара: BTCUSDT
• Направление: SHORT
• Сумма: $100
• Плечо: 3x
• Цена входа: Рыночная

Подтвердить?`,
      confirmKeyboard
    , { parse_mode: 'HTML' });
  }

  async handleHelp(chatId) {
    await this.telegramBot.sendMessage(chatId, 
      `❓ <b>Помощь - Все команды</b>

<b>📋 Команды меню:</b>
/start - Запустить бота
/balance - Проверить баланс
/positions - Открытые позиции
/scan - Сканировать рынок
/analyze - Анализ BTCUSDT
/help - Эта справка

<b>💬 Текстовые команды:</b>
"Покажи баланс"
"Открыть LONG BTC на 100 USDT"
"Закрой позицию по BTC"
"Найди торговые возможности"

<b>⚠️ Риски:</b>
Торговля с плечом несет высокие риски!`,
      { parse_mode: 'HTML' }
    );
  }

  async sendResult(chatId, result) {
    let responseText = '';
    
    if (result.success) {
      if (result.type === 'market_analysis') {
        const data = result.data;
        const emoji = data.direction === 'LONG' ? '🟢' : data.direction === 'SHORT' ? '🔴' : '⚪';
        
        responseText = `${emoji} <b>Анализ ${data.symbol}</b>\n\n`;
        responseText += `<b>Направление:</b> ${data.direction}\n`;
        responseText += `<b>Уверенность:</b> ${data.confidence.toFixed(1)}%\n`;
        responseText += `<b>Цена:</b> $${data.price.toLocaleString()}\n\n`;
        
        if (data.tradeSetup) {
          responseText += `<b>📋 Торговый план:</b>\n`;
          responseText += `<b>Вход:</b> $${data.tradeSetup.entryPrice.toLocaleString()}\n`;
          responseText += `<b>TP:</b> $${data.tradeSetup.takeProfit.toFixed(2)} (+3%)\n`;
          responseText += `<b>SL:</b> $${data.tradeSetup.stopLoss.toFixed(2)} (-1.5%)\n`;
          responseText += `<b>R/R:</b> 1:${data.tradeSetup.riskReward}\n\n`;
        }
        
        responseText += `<b>Индикаторы:</b>\n`;
        responseText += `RSI (15m): ${data.rsi.rsi15m.toFixed(1)}\n`;
        responseText += `RSI (1h): ${data.rsi.rsi1h.toFixed(1)}\n`;
        responseText += `Тренд: ${data.trend}\n\n`;
        
        if (data.signals.length > 0) {
          responseText += `<b>Сигналы:</b>\n`;
          data.signals.forEach(s => responseText += `• ${s}\n`);
        }
        
      } else if (result.type === 'trade_opportunities') {
        const opportunities = result.data;
        
        if (opportunities.length === 0) {
          responseText = `ℹ️ Торговых возможностей не найдено`;
        } else {
          responseText = `🔍 <b>Найдено возможностей: ${opportunities.length}</b>\n\n`;
          
          opportunities.slice(0, 5).forEach((opp, i) => {
            const emoji = opp.direction === 'LONG' ? '🟢' : '🔴';
            responseText += `${i + 1}. ${emoji} <b>${opp.symbol}</b>\n`;
            responseText += `   Направление: ${opp.direction}\n`;
            responseText += `   Уверенность: ${opp.confidence.toFixed(1)}%\n`;
            responseText += `   Цена: $${opp.price.toLocaleString()}\n\n`;
          });
          
          if (opportunities.length > 5) {
            responseText += `... и ещё ${opportunities.length - 5}\n\n`;
          }
        }
        
      } else if (typeof result === 'number') {
        responseText = `💰 <b>Баланс счета:</b>\n\n<b>USDT:</b> $${result.toFixed(2)}`;
        
      } else if (Array.isArray(result)) {
        if (result.length === 0) {
          responseText = `ℹ️ Нет открытых позиций`;
        } else {
          responseText = `📊 <b>Открытые позиции (${result.length}):</b>\n\n`;
          result.forEach((pos, i) => {
            const emoji = pos.side === 'LONG' ? '🟢' : '🔴';
            const pnlEmoji = pos.unrealizedPnL >= 0 ? '📈' : '📉';
            responseText += `${emoji} <b>${pos.symbol}</b>\n`;
            responseText += `  Сторона: ${pos.side}\n`;
            responseText += `  Количество: ${pos.amount}\n`;
            responseText += `  PnL: ${pnlEmoji} $${pos.unrealizedPnL.toFixed(2)}\n\n`;
          });
        }
        
      } else {
        responseText = `✅ <b>Задача выполнена!</b>`;
      }
    } else {
      responseText = `❌ <b>Ошибка:</b>\n<code>${result.error || result.message}</code>`;
    }

    await this.telegramBot.sendMessage(chatId, responseText, { parse_mode: 'HTML' });
  }
}

const bot = new ClaudeBot();
bot.start().catch(console.error);
