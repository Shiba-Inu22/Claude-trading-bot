const axios = require('axios');
const crypto = require('crypto');

class BinanceTrader {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://fapi.binance.com';
    
    console.log('💼 Binance Trader initialized (LIVE TRADING)');
  }

  // Генерация подписи для запросов
  generateSignature(params) {
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    return crypto.createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  // Получить баланс
  async getBalance(asset = 'USDT') {
    try {
      const timestamp = Date.now();
      const recvWindow = 5000;
      
      const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.secretKey)
        .update(queryString)
        .digest('hex');
      
      const response = await axios.get(`${this.baseURL}/fapi/v2/balance`, {
        params: { recvWindow, timestamp, signature },
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      const usdtBalance = response.data.find(b => b.asset === asset);
      if (usdtBalance && usdtBalance.availableBalance !== undefined) {
        return parseFloat(usdtBalance.availableBalance);
      }
      
      return 0;
    } catch (error) {
      console.error('❌ Ошибка получения баланса:', error.response?.data || error.message);
      throw error;
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
      throw error;
    }
  }

  // Открыть позицию
  async openPosition(symbol, side, quantity, leverage = 3) {
    try {
      console.log(`📈 Открытие позиции: ${side} ${symbol} ${quantity}`);
      
      const timestamp = Date.now();
      const recvWindow = 5000;
      
      const queryString = `recvWindow=${recvWindow}&symbol=${symbol}&side=${side}&timestamp=${timestamp}&type=MARKET&quantity=${quantity.toFixed(4)}`;
      const signature = crypto.createHmac('sha256', this.secretKey)
        .update(queryString)
        .digest('hex');
      
      // Установить плечо
      await this.setLeverage(symbol, leverage);
      
      // Разместить ордер
      const response = await axios.post(`${this.baseURL}/fapi/v1/order`, 
        null,
        {
          params: { 
            symbol,
            side,
            type: 'MARKET',
            quantity: quantity.toFixed(4),
            timestamp,
            recvWindow,
            signature 
          },
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      const executedQty = parseFloat(response.data.executedQty);
      const avgPrice = parseFloat(response.data.avgPrice) || parseFloat(response.data.price);
      
      return {
        success: true,
        orderId: response.data.orderId,
        symbol,
        side,
        quantity: executedQty,
        price: avgPrice,
        leverage,
        message: `Позиция открыта: ${side} ${executedQty} ${symbol} по $${avgPrice}`
      };
      
    } catch (error) {
      console.error('❌ Ошибка открытия позиции:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Закрыть позицию
  async closePosition(symbol, positionAmt) {
    try {
      const side = positionAmt > 0 ? 'SELL' : 'BUY';
      const quantity = Math.abs(positionAmt);
      
      console.log(`📉 Закрытие позиции: ${side} ${symbol} ${quantity}`);
      
      const timestamp = Date.now();
      const recvWindow = 5000;
      
      const queryString = `recvWindow=${recvWindow}&symbol=${symbol}&side=${side}&timestamp=${timestamp}&type=MARKET&quantity=${quantity.toFixed(4)}&reduceOnly=true`;
      const signature = crypto.createHmac('sha256', this.secretKey)
        .update(queryString)
        .digest('hex');
      
      const response = await axios.post(`${this.baseURL}/fapi/v1/order`, 
        null,
        {
          params: { 
            symbol,
            side,
            type: 'MARKET',
            quantity: quantity.toFixed(4),
            reduceOnly: true,
            timestamp,
            recvWindow,
            signature 
          },
          headers: {
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      const executedQty = parseFloat(response.data.executedQty);
      const avgPrice = parseFloat(response.data.avgPrice) || parseFloat(response.data.price);
      
      return {
        success: true,
        orderId: response.data.orderId,
        symbol,
        side,
        quantity: executedQty,
        price: avgPrice,
        message: `Позиция закрыта: ${side} ${executedQty} ${symbol} по $${avgPrice}`
      };
      
    } catch (error) {
      console.error('❌ Ошибка закрытия позиции:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Установить плечо
  async setLeverage(symbol, leverage = 3) {
    try {
      const timestamp = Date.now();
      const recvWindow = 5000;
      
      const queryString = `leverage=${leverage}&recvWindow=${recvWindow}&symbol=${symbol}&timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.secretKey)
        .update(queryString)
        .digest('hex');
      
      await axios.post(`${this.baseURL}/fapi/v1/leverage`,
        null,
        {
          params: { 
            symbol, 
            leverage, 
            timestamp, 
            recvWindow,
            signature 
          },
          headers: {
            'X-MBX-APIKEY': this.apiKey
          },
          timeout: 5000
        }
      );
      
      console.log(`✅ Плечо ${leverage}x установлено для ${symbol}`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка установки плеча:', error.response?.data || error.message);
      return false;
    }
  }

  // Получить открытые позиции
  async getOpenPositions() {
    try {
      const timestamp = Date.now();
      const recvWindow = 5000;
      
      const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
      const signature = crypto.createHmac('sha256', this.secretKey)
        .update(queryString)
        .digest('hex');
      
      const response = await axios.get(`${this.baseURL}/fapi/v2/positionRisk`, {
        params: { timestamp, recvWindow, signature },
        headers: {
          'X-MBX-APIKEY': this.apiKey
        },
        timeout: 5000
      });
      
      const positions = response.data.filter(p => parseFloat(p.positionAmt) !== 0);
      
      return positions.map(p => ({
        symbol: p.symbol,
        side: parseFloat(p.positionAmt) > 0 ? 'LONG' : 'SHORT',
        amount: Math.abs(parseFloat(p.positionAmt)),
        entryPrice: parseFloat(p.entryPrice),
        markPrice: parseFloat(p.markPrice),
        unrealizedPnL: parseFloat(p.unRealizedProfit),
        leverage: parseInt(p.leverage)
      }));
      
    } catch (error) {
      console.error('❌ Ошибка получения позиций:', error.message);
      return [];
    }
  }
}

module.exports = BinanceTrader;
