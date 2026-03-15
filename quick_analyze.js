const axios = require('axios');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');

const apiKey = 'Rsn4sJcuThHwyAl0prGU9x0cgTQXZNBaTJWBjwV0rMTZvUwPfMdvgsAK8Zu8u6bi';
const secretKey = 'ctPBcjMqIGiEQOByKenR5y3SjBejdLJ5xNoEwY4G1fimNSsGg5u62DAhIG6Zh4XV';
const tgToken = '8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw';
const chatId = '226166473';

async function quickAnalyze() {
  const bot = new TelegramBot(tgToken);
  
  try {
    await bot.sendMessage(chatId, '⚡ <b>Быстрый анализ BTCUSDT</b>...', { parse_mode: 'HTML' });
    
    // Получаем цену и свечи
    const [priceRes, candles15m, candles1h] = await Promise.all([
      axios.get('https://fapi.binance.com/fapi/v1/ticker/price', { params: { symbol: 'BTCUSDT' } }),
      axios.get('https://fapi.binance.com/fapi/v1/klines', { params: { symbol: 'BTCUSDT', interval: '15m', limit: 50 } }),
      axios.get('https://fapi.binance.com/fapi/v1/klines', { params: { symbol: 'BTCUSDT', interval: '1h', limit: 30 } })
    ]);
    
    const price = parseFloat(priceRes.data.price);
    const closes15m = candles15m.data.map(c => parseFloat(c[4]));
    const closes1h = candles1h.data.map(c => parseFloat(c[4]));
    
    // RSI
    const rsi15m = calculateRSI(closes15m);
    const rsi1h = calculateRSI(closes1h);
    
    // Тренд
    const trend = analyzeTrend(closes1h);
    
    // Сигналы
    let score = 0;
    let signals = [];
    
    if (rsi15m < 30) { score += 2; signals.push('RSI перепроданность'); }
    if (rsi15m > 70) { score -= 2; signals.push('RSI перекупленность'); }
    if (trend === 'BULLISH') { score += 2; signals.push('Бычий тренд'); }
    if (trend === 'BEARISH') { score -= 2; signals.push('Медвежий тренд'); }
    
    const direction = score >= 3 ? 'LONG' : score <= -3 ? 'SHORT' : 'NEUTRAL';
    const confidence = Math.min(Math.abs(score) * 15, 95);
    
    const tp = direction === 'LONG' ? price * 1.03 : price * 0.97;
    const sl = direction === 'LONG' ? price * 0.985 : price * 1.015;
    
    const emoji = direction === 'LONG' ? '🟢' : direction === 'SHORT' ? '🔴' : '⚪';
    
    await bot.sendMessage(chatId, 
      `${emoji} <b>BTCUSDT - Анализ готов!</b>\n\n` +
      `<b>💰 Цена:</b> $${price.toLocaleString()}\n` +
      `<b>🎯 Направление:</b> ${direction}\n` +
      `<b>📊 Уверенность:</b> ${confidence.toFixed(1)}%\n\n` +
      (direction !== 'NEUTRAL' ? 
        `<b>📋 Торговый план:</b>\n` +
        `<b>Вход:</b> $${price.toLocaleString()}\n` +
        `<b>TP:</b> $${tp.toFixed(2)} (+3%)\n` +
        `<b>SL:</b> $${sl.toFixed(2)} (-1.5%)\n\n` : '') +
      `<b>Индикаторы:</b>\n` +
      `RSI (15m): ${rsi15m.toFixed(1)}\n` +
      `RSI (1h): ${rsi1h.toFixed(1)}\n` +
      `Тренд: ${trend}\n\n` +
      (signals.length > 0 ? `<b>Сигналы:</b>\n${signals.map(s => '• ' + s).join('\n')}` : ''),
      { parse_mode: 'HTML' }
    );
    
    console.log('✅ Анализ отправлен!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function analyzeTrend(prices) {
  if (prices.length < 20) return 'NEUTRAL';
  const recentAvg = prices.slice(-20).reduce((a,b) => a+b, 0) / 20;
  const olderAvg = prices.slice(-40, -20).reduce((a,b) => a+b, 0) / 20;
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  if (change > 2) return 'BULLISH';
  if (change < -2) return 'BEARISH';
  return 'NEUTRAL';
}

quickAnalyze();
