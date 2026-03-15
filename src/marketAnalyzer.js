const axios = require('axios');
const crypto = require('crypto');

class MarketAnalyzer {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://fapi.binance.com';
    
    console.log('📊 Market Analyzer initialized');
  }

  // Генерация подписи
  generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  // Получить список всех пар
  async getTradingPairs() {
    try {
      const response = await axios.get(`${this.baseURL}/fapi/v1/exchangeInfo`, {
        timeout: 10000
      });
      
      // Фильтруем только USDT пары с хорошим объемом
      return response.data.symbols
        .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .map(s => s.symbol)
        .sort();
    } catch (error) {
      console.error('❌ Ошибка получения списка пар:', error.message);
      return [];
    }
  }

  // Получить свечи
  async getCandles(symbol, interval = '15m', limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/fapi/v1/klines`, {
        params: { symbol, interval, limit },
        timeout: 10000
      });
      
      return response.data.map(candle => ({
        time: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));
    } catch (error) {
      console.error('❌ Ошибка получения свечей:', error.message);
      return [];
    }
  }

  // Рассчитать RSI
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
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

  // Рассчитать MACD
  calculateMACD(prices, fast = 12, slow = 26, signal = 9) {
    if (prices.length < slow + signal) return { macd: 0, signal: 0, histogram: 0 };
    
    const ema = (data, period) => {
      const multiplier = 2 / (period + 1);
      let emaValue = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < data.length; i++) {
        emaValue = (data[i] - emaValue) * multiplier + emaValue;
      }
      return emaValue;
    };
    
    const fastEMA = ema(prices, fast);
    const slowEMA = ema(prices, slow);
    const macdLine = fastEMA - slowEMA;
    
    // Для signal line нужны предыдущие значения MACD
    const macdValues = [];
    for (let i = slow; i < prices.length; i++) {
      const fastE = ema(prices.slice(0, i + 1), fast);
      const slowE = ema(prices.slice(0, i + 1), slow);
      macdValues.push(fastE - slowE);
    }
    
    const signalLine = ema(macdValues, signal);
    const histogram = macdLine - signalLine;
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  // Найти уровни поддержки и сопротивления
  findSupportResistance(candles) {
    if (candles.length < 50) return { support: 0, resistance: 0 };
    
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    // Простая эвристика - максимумы и минимумы за последние 50 свечей
    const recentHighs = highs.slice(-50);
    const recentLows = lows.slice(-50);
    
    const resistance = Math.max(...recentHighs);
    const support = Math.min(...recentLows);
    
    return { support, resistance };
  }

  // Анализ тренда
  analyzeTrend(candles) {
    if (candles.length < 20) return 'NEUTRAL';
    
    const recentCloses = candles.slice(-20).map(c => c.close);
    const olderCloses = candles.slice(-40, -20).map(c => c.close);
    
    const recentAvg = recentCloses.reduce((a, b) => a + b, 0) / recentCloses.length;
    const olderAvg = olderCloses.reduce((a, b) => a + b, 0) / olderCloses.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 2) return 'BULLISH';
    if (change < -2) return 'BEARISH';
    return 'NEUTRAL';
  }

  // Полная аналитика по паре
  async analyzePair(symbol) {
    try {
      const [candles15m, candles1h, currentPrice] = await Promise.all([
        this.getCandles(symbol, '15m', 100),
        this.getCandles(symbol, '1h', 50),
        this.getPrice(symbol)
      ]);
      
      if (candles15m.length === 0 || candles1h.length === 0) {
        return null;
      }
      
      const closes15m = candles15m.map(c => c.close);
      const closes1h = candles1h.map(c => c.close);
      
      // Индикаторы
      const rsi15m = this.calculateRSI(closes15m);
      const rsi1h = this.calculateRSI(closes1h);
      
      const macd15m = this.calculateMACD(closes15m);
      const macd1h = this.calculateMACD(closes1h);
      
      const levels = this.findSupportResistance(candles15m);
      const trend = this.analyzeTrend(candles1h);
      
      // Оценка сигнала
      let score = 0;
      let signals = [];
      
      // RSI сигналы
      if (rsi15m < 30) { score += 2; signals.push('RSI перепроданность (15m)'); }
      if (rsi15m > 70) { score -= 2; signals.push('RSI перекупленность (15m)'); }
      if (rsi1h < 30) { score += 3; signals.push('RSI перепроданность (1h)'); }
      if (rsi1h > 70) { score -= 3; signals.push('RSI перекупленность (1h)'); }
      
      // MACD сигналы
      if (macd15m.histogram > 0 && macd15m.macd > 0) { score += 2; signals.push('MACD бычий (15m)'); }
      if (macd15m.histogram < 0 && macd15m.macd < 0) { score -= 2; signals.push('MACD медвежий (15m)'); }
      if (macd1h.histogram > 0 && macd1h.macd > 0) { score += 3; signals.push('MACD бычий (1h)'); }
      if (macd1h.histogram < 0 && macd1h.macd < 0) { score -= 3; signals.push('MACD медвежий (1h)'); }
      
      // Тренд
      if (trend === 'BULLISH') { score += 2; signals.push('Бычий тренд'); }
      if (trend === 'BEARISH') { score -= 2; signals.push('Медвежий тренд'); }
      
      // Близость к уровням
      const distanceToSupport = ((currentPrice - levels.support) / currentPrice) * 100;
      const distanceToResistance = ((levels.resistance - currentPrice) / currentPrice) * 100;
      
      if (distanceToSupport < 2) { score += 3; signals.push('Близко к поддержке'); }
      if (distanceToResistance < 2) { score -= 3; signals.push('Близко к сопротивлению'); }
      
      // Определение направления
      let direction = 'NEUTRAL';
      let confidence = Math.min(Math.abs(score) * 10, 95);
      
      if (score >= 5) direction = 'LONG';
      else if (score <= -5) direction = 'SHORT';
      
      // Расчет точки входа, TP и SL
      let entryPrice = currentPrice;
      let takeProfit, stopLoss;
      
      if (direction === 'LONG') {
        takeProfit = currentPrice * 1.03; // +3%
        stopLoss = currentPrice * 0.985;  // -1.5%
      } else if (direction === 'SHORT') {
        takeProfit = currentPrice * 0.97; // -3%
        stopLoss = currentPrice * 1.015;  // +1.5%
      }
      
      return {
        symbol,
        price: currentPrice,
        direction,
        confidence: direction === 'NEUTRAL' ? 0 : confidence,
        score,
        rsi: { rsi15m, rsi1h },
        macd: { macd15m: macd15m.histogram, macd1h: macd1h.histogram },
        trend,
        levels,
        signals,
        tradeSetup: direction !== 'NEUTRAL' ? {
          entryPrice,
          takeProfit,
          stopLoss,
          riskReward: ((takeProfit - entryPrice) / (entryPrice - stopLoss)).toFixed(2)
        } : null
      };
      
    } catch (error) {
      console.error(`❌ Ошибка анализа ${symbol}:`, error.message);
      return null;
    }
  }

  // Получить цену
  async getPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/fapi/v1/ticker/price`, {
        params: { symbol },
        timeout: 5000
      });
      return parseFloat(response.data.price);
    } catch (error) {
      console.error('❌ Ошибка получения цены:', error.message);
      return 0;
    }
  }

  // Сканировать рынок и найти лучшие возможности
  async scanMarket(topN = 10) {
    console.log('🔍 Сканирование рынка...');
    
    const pairs = await this.getTradingPairs();
    console.log(`📊 Найдено пар: ${pairs.length}`);
    
    // Берем топ популярных пар + случайные
    const popularPairs = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 
                          'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'];
    const randomPairs = pairs.filter(p => !popularPairs.includes(p)).sort(() => 0.5 - Math.random()).slice(0, 10);
    const pairsToAnalyze = [...popularPairs, ...randomPairs];
    
    const results = [];
    
    for (const symbol of pairsToAnalyze) {
      console.log(`📈 Анализ ${symbol}...`);
      const analysis = await this.analyzePair(symbol);
      if (analysis && analysis.direction !== 'NEUTRAL') {
        results.push(analysis);
      }
      
      // Небольшая задержка чтобы не превысить лимиты
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Сортировка по уверенности
    results.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`✅ Найдено возможностей: ${results.length}`);
    
    return results.slice(0, topN);
  }
}

module.exports = MarketAnalyzer;
