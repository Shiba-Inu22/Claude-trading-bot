const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const BinanceTrader = require('./binance');
const MarketAnalyzer = require('./marketAnalyzer');

const execPromise = util.promisify(exec);

class ComputerAgent {
  constructor(apiKey) {
    this.anthropic = new Anthropic({ apiKey });
    
    if (process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET_KEY) {
      this.trader = new BinanceTrader(
        process.env.BINANCE_API_KEY,
        process.env.BINANCE_SECRET_KEY
      );
      console.log('💰 Binance Trader подключен');
      
      this.analyzer = new MarketAnalyzer(
        process.env.BINANCE_API_KEY,
        process.env.BINANCE_SECRET_KEY
      );
      console.log('📊 Market Analyzer подключен');
    }
    
    console.log('🤖 Claude Computer Agent инициализирован');
  }

  async executeCommand(description) {
    const tradeCommands = {
      'баланс': () => this.trader?.getBalance(),
      'позиции': () => this.trader?.getOpenPositions(),
      'открыть long': (desc) => this.executeTrade('open', 'BUY', desc),
      'открыть short': (desc) => this.executeTrade('open', 'SELL', desc),
      'закрыть позицию': (desc) => this.executeTrade('close', null, desc),
      'купить': (desc) => this.executeTrade('open', 'BUY', desc),
      'продать': (desc) => this.executeTrade('open', 'SELL', desc),
      'анализ': () => this.quickAnalyze('BTCUSDT'),
      'btc': () => this.quickAnalyze('BTCUSDT'),
      'найди': () => this.findTradeOpportunities(),
      'сканируй': () => this.scanMarket(),
    };

    for (const [keyword, handler] of Object.entries(tradeCommands)) {
      if (description.toLowerCase().includes(keyword)) {
        return await handler(description);
      }
    }

    // Стандартные команды
    const systemPrompt = `Вы - ассистент автоматизации компьютера...`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: systemPrompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Неверный формат ответа');

      const action = JSON.parse(jsonMatch[0]);
      return await this.executeAction(action);

    } catch (error) {
      console.error('❌ Ошибка:', error.message);
      throw error;
    }
  }

  // БЫСТРЫЙ анализ без AI
  async quickAnalyze(symbol) {
    if (!this.analyzer) {
      return { success: false, error: 'Analyzer не настроен' };
    }

    try {
      console.log(`⚡ Быстрый анализ ${symbol}...`);
      
      // Получаем данные напрямую из Binance
      const [candles15m, candles1h, price] = await Promise.all([
        this.analyzer.getCandles(symbol, '15m', 50),
        this.analyzer.getCandles(symbol, '1h', 30),
        this.analyzer.getPrice(symbol)
      ]);

      if (!candles15m.length || !candles1h.length) {
        return { success: false, error: 'Нет данных' };
      }

      const closes15m = candles15m.map(c => c.close);
      const closes1h = candles1h.map(c => c.close);

      // Индикаторы
      const rsi15m = this.analyzer.calculateRSI(closes15m);
      const rsi1h = this.analyzer.calculateRSI(closes1h);
      const macd15m = this.analyzer.calculateMACD(closes15m);
      const macd1h = this.analyzer.calculateMACD(closes1h);
      const levels = this.analyzer.findSupportResistance(candles15m);
      const trend = this.analyzer.analyzeTrend(candles1h);

      // Оценка
      let score = 0;
      let signals = [];

      if (rsi15m < 30) { score += 2; signals.push('RSI перепроданность (15m)'); }
      if (rsi15m > 70) { score -= 2; signals.push('RSI перекупленность (15m)'); }
      if (rsi1h < 30) { score += 3; signals.push('RSI перепроданность (1h)'); }
      if (rsi1h > 70) { score -= 3; signals.push('RSI перекупленность (1h)'); }

      if (macd15m.histogram > 0) { score += 2; signals.push('MACD бычий (15m)'); }
      if (macd15m.histogram < 0) { score -= 2; signals.push('MACD медвежий (15m)'); }
      if (trend === 'BULLISH') { score += 2; signals.push('Бычий тренд'); }
      if (trend === 'BEARISH') { score -= 2; signals.push('Медвежий тренд'); }

      const distanceToSupport = ((price - levels.support) / price) * 100;
      if (distanceToSupport < 2) { score += 3; signals.push('Близко к поддержке'); }

      let direction = 'NEUTRAL';
      let confidence = Math.min(Math.abs(score) * 10, 95);

      if (score >= 5) direction = 'LONG';
      else if (score <= -5) direction = 'SHORT';

      const takeProfit = direction === 'LONG' ? price * 1.03 : price * 0.97;
      const stopLoss = direction === 'LONG' ? price * 0.985 : price * 1.015;

      return {
        success: true,
        type: 'market_analysis',
        data: {
          symbol,
          price,
          direction,
          confidence: direction === 'NEUTRAL' ? 0 : confidence,
          score,
          rsi: { rsi15m, rsi1h },
          macd: { macd15m: macd15m.histogram, macd1h: macd1h.histogram },
          trend,
          levels,
          signals,
          tradeSetup: direction !== 'NEUTRAL' ? {
            entryPrice: price,
            takeProfit,
            stopLoss,
            riskReward: ((takeProfit - price) / (price - stopLoss)).toFixed(2)
          } : null
        }
      };

    } catch (error) {
      console.error('❌ Ошибка анализа:', error.message);
      return { success: false, error: error.message };
    }
  }

  async findTradeOpportunities() {
    if (!this.analyzer) return { success: false, error: 'Analyzer не настроен' };
    try {
      console.log('🔍 Поиск возможностей...');
      const opportunities = await this.analyzer.scanMarket(10);
      return { success: true, type: 'trade_opportunities', data: opportunities };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async scanMarket() {
    return await this.findTradeOpportunities();
  }

  async analyzeMarket() {
    return await this.findTradeOpportunities();
  }

  async executeTrade(actionType, side, description) {
    if (!this.trader) return { success: false, error: 'Trader не настроен' };

    try {
      const symbolMatch = description.match(/([A-Z]+\/USDT|[A-Z]+USDT)/i);
      const amountMatch = description.match(/(\d+(?:\.\d+)?)\s*(usdt|доллар|USD)?/i);
      const leverageMatch = description.match(/(\d+)x|плечо\s*(\d+)/i);

      let symbol = symbolMatch ? symbolMatch[1].replace('/', '') : 'BTCUSDT';
      if (!symbol.endsWith('USDT')) symbol += 'USDT';
      symbol = symbol.toUpperCase();

      const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
      const leverage = leverageMatch ? parseInt(leverageMatch[1] || leverageMatch[2]) : 3;

      if (actionType === 'open') {
        const price = await this.trader.getPrice(symbol);
        const quantity = (amount * leverage) / price;
        const result = await this.trader.openPosition(symbol, side, quantity, leverage);
        return { ...result, type: 'trade_open', details: { symbol, side, amount, leverage, price, quantity } };
      } else if (actionType === 'close') {
        const positions = await this.trader.getOpenPositions();
        const position = positions.find(p => p.symbol === symbol);
        if (!position) return { success: false, error: `Нет позиции по ${symbol}` };
        const result = await this.trader.closePosition(symbol, position.side === 'LONG' ? position.amount : -position.amount);
        return { ...result, type: 'trade_close', details: position };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async executeAction(action) {
    switch (action.action) {
      case 'command': return await this.runCommand(action.parameters.cmd);
      case 'file_read': return await this.readFile(action.parameters.path);
      case 'file_write': return await this.writeFile(action.parameters.path, action.parameters.content);
      case 'file_delete': return await this.deleteFile(action.parameters.path);
      case 'search': return await this.searchFiles(action.parameters.query, action.parameters.location);
      default: throw new Error(`Неизвестное действие: ${action.action}`);
    }
  }

  async runCommand(cmd) {
    try {
      const { stdout, stderr } = await execPromise(cmd, { cwd: process.env.HOME, timeout: 60000 });
      return { success: true, output: stdout || stderr, type: 'command' };
    } catch (error) {
      return { success: false, error: error.message, type: 'command' };
    }
  }

  async readFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, content: content.substring(0, 2000), type: 'file_read' };
    } catch (error) {
      return { success: false, error: error.message, type: 'file_read' };
    }
  }

  async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, message: `Файл записан: ${filePath}`, type: 'file_write' };
    } catch (error) {
      return { success: false, error: error.message, type: 'file_write' };
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return { success: true, message: `Файл удален: ${filePath}`, type: 'file_delete' };
    } catch (error) {
      return { success: false, error: error.message, type: 'file_delete' };
    }
  }

  async searchFiles(query, location = process.env.HOME) {
    try {
      const cmd = 'find "' + location + '" -name "*' + query + '*" -type f 2>/dev/null | head -20';
      const { stdout } = await execPromise(cmd);
      return { success: true, files: stdout.trim().split('\n').filter(f => f), type: 'search' };
    } catch (error) {
      return { success: false, error: error.message, type: 'search' };
    }
  }
}

module.exports = ComputerAgent;
