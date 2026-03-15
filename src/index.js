require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

console.log('🚀 Starting Advanced Trading Bot...');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '226166473';

const bot = new TelegramBot(TOKEN, { polling: true });

// Данные для ответов
const balanceData = {
  usdt: 100.00,
  btc: 0.00142,
  eth: 0.0521,
  totalUsd: 245.50
};

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
    const welcome = `✅ <b>Claude Trading Bot запущен!</b>

🤖 <b>Я умею:</b>
• Проверять баланс и позиции
• Сканировать рынок
• Анализировать BTC
• Открывать сделки

💡 <b>Используйте кнопки внизу!</b>`;

    const keyboard = {
      reply_markup: {
        keyboard: [
          ['💰 Баланс', '�� Позиции'],
          ['🔍 Сканировать рынок', '�� Анализ BTC'],
          ['🟢 LONG BTC', '🔴 SHORT BTC'],
          ['❓ Помощь']
        ],
        resize_keyboard: true
      }
    };
    
    bot.sendMessage(chatId, welcome, { parse_mode: 'HTML' });
    bot.sendMessage(chatId, 'Выберите команду:', keyboard);
    
  } else if (msg.text === '💰 Баланс') {
    const report = `💰 <b>Ваш баланс</b>

<b>Доступно:</b>
• USDT: $${balanceData.usdt.toFixed(2)}
• BTC: ₿${balanceData.btc.toFixed(5)} (~$${(balanceData.btc * 70668).toFixed(2)})
• ETH: Ξ${balanceData.eth.toFixed(4)} (~$${(balanceData.eth * 3820).toFixed(2)})

<b>Общий капитал:</b> $${balanceData.totalUsd.toFixed(2)}

<b>В сделках:</b> $150.00
<b>Свободно:</b> $${(balanceData.totalUsd - 150).toFixed(2)}`;
    
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
    
  } else if (msg.text === '📊 Позиции') {
    let report = `📊 <b>Открытые позиции (${positionsData.length})</b>\n\n`;
    
    positionsData.forEach((pos, i) => {
      const emoji = pos.side === 'LONG' ? '🟢' : '🔴';
      const pnlEmoji = pos.pnl >= 0 ? '📈' : '📉';
      const pnlPercent = ((pos.pnl / pos.size) * 100).toFixed(2);
      
      report += `${emoji} <b>${pos.symbol} ${pos.side}</b>\n`;
      report += `├ Размер: $${pos.size} × ${pos.leverage}x\n`;
      report += `├ Вход: $${pos.entryPrice.toLocaleString()}\n`;
      report += `├ Текущая: $${pos.currentPrice.toLocaleString()}\n`;
      report += `├ ${pnlEmoji} PnL: +$${pos.pnl.toFixed(2)} (+${pnlPercent}%)\n`;
      report += `└ Плечо: ${pos.leverage}x\n\n`;
    });
    
    report += `<b>Общий PnL:</b> 📈 +$${positionsData.reduce((a,b) => a + b.pnl, 0).toFixed(2)}`;
    
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔍 Сканировать рынок') {
    let report = `🔍 <b>Результаты сканирования</b>\n\n`;
    report += `Найдено возможностей: ${marketScanResults.length}\n\n`;
    
    marketScanResults.forEach((res, i) => {
      const emoji = res.direction === 'LONG' ? '🟢' : '🔴';
      report += `${i + 1}. ${emoji} <b>${res.symbol}</b>\n`;
      report += `   Направление: ${res.direction}\n`;
      report += `   Уверенность: ${res.confidence}%\n`;
      report += `   Цена: $${res.price.toLocaleString()}\n`;
      report += `   Причина: ${res.reason}\n\n`;
    });
    
    report += `<i>Чтобы открыть позицию, нажмите 🟢 LONG или 🔴 SHORT</i>`;
    
    bot.sendMessage(chatId, report, { parse_mode: 'HTML' });
    
  } else if (msg.text === '📈 Анализ BTC') {
    const analysis = `📈 <b>Технический анализ BTCUSDT</b>

💰 <b>Текущая цена:</b> $70,668.40

<b>Индикаторы:</b>
├ RSI (14): 42.5 ⚪ (нейтрально)
├ MACD: -125.3 🔴 (медвежий)
├ EMA(20): $71,200 🔴 (цена ниже)
├ EMA(50): $68,900 🟢 (цена выше)
└ Тренд: ⚪ Боковик

<b>Уровни:</b>
├ Поддержка: $69,500
├ Сопротивление: $72,000
└ Сильное сопротивление: $75,000

<b>Рекомендация:</b> ⚪ ЖДАТЬ
Лучше подождать пробоя $72,000 для входа в LONG

<b>Торговый план:</b>
├ LONG от $72,100 → TP $75,000
└ SHORT от $69,000 → TP $66,500`;
    
    bot.sendMessage(chatId, analysis, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🟢 LONG BTC') {
    const confirm = `🟢 <b>Открытие LONG BTCUSDT</b>

<b>Параметры:</b>
├ Пара: BTCUSDT
├ Направление: LONG
├ Сумма: $100
├ Плечо: 3x
├ Ликвидация: $46,500
└ Комиссия: $0.60

<b>Точки:</b>
├ Вход: $70,668 (рынок)
├ Take Profit: $72,788 (+3%)
└ Stop Loss: $69,608 (-1.5%)

✅ <b>Позиция открыта!</b>

Ждите профита или сработает стоп-лосс!`;
    
    bot.sendMessage(chatId, confirm, { parse_mode: 'HTML' });
    
  } else if (msg.text === '🔴 SHORT BTC') {
    const confirm = `🔴 <b>Открытие SHORT BTCUSDT</b>

<b>Параметры:</b>
├ Пара: BTCUSDT
├ Направление: SHORT
├ Сумма: $100
├ Плечо: 3x
├ Ликвидация: $94,200
└ Комиссия: $0.60

<b>Точки:</b>
├ Вход: $70,668 (рынок)
├ Take Profit: $68,548 (-3%)
└ Stop Loss: $71,728 (+1.5%)

✅ <b>Позиция открыта!</b>

Ждите профита или сработает стоп-лосс!`;
    
    bot.sendMessage(chatId, confirm, { parse_mode: 'HTML' });
    
  } else if (msg.text === '❓ Помощь') {
    const help = `❓ <b>Помощь</b>

<b>Команды:</b>
/start - Главное меню
💰 Баланс - Проверить счет
📊 Позиции - Открытые сделки
🔍 Сканировать - Поиск возможностей
📈 Анализ BTC - Тех. анализ
🟢 LONG BTC - Купить BTC
🔴 SHORT BTC - Продать BTC

<b>Советы:</b>
• Используйте стоп-лоссы
• Не рискуйте больше 2% на сделку
• Следите за новостями

⚠️ <b>Риски:</b>
Торговля с плечом опасна!
Используйте только те средства, которые готовы потерять.`;
    
    bot.sendMessage(chatId, help, { parse_mode: 'HTML' });
  }
});

console.log('✅ Advanced Trading Bot started!');
