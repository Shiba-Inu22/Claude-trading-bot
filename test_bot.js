const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot('8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw');

async function testBot() {
  console.log('🔍 Тестирование бота...\n');
  
  try {
    // Проверка информации о боте
    const me = await bot.getMe();
    console.log('✅ Бот:', me.username);
    console.log('   Имя:', me.first_name);
    
    // Отправка сообщения
    const chatId = '226166473';
    console.log('\n📤 Отправка тестового сообщения...');
    
    await bot.sendMessage(chatId, 
      '🧪 <b>ТЕСТ БОТА</b>\n\n' +
      'Бот работает и проверяет связь!\n\n' +
      '📈 <b>Анализ BTCUSDT</b> будет выполнен сейчас...',
      { parse_mode: 'HTML' }
    );
    
    console.log('✅ Сообщение отправлено!\n');
    
    // Получение баланса
    console.log('💰 Проверка баланса Binance...');
    const axios = require('axios');
    const crypto = require('crypto');
    
    const apiKey = 'Rsn4sJcuThHwyAl0prGU9x0cgTQXZNBaTJWBjwV0rMTZvUwPfMdvgsAK8Zu8u6bi';
    const secretKey = 'ctPBcjMqIGiEQOByKenR5y3SjBejdLJ5xNoEwY4G1fimNSsGg5u62DAhIG6Zh4XV';
    
    const timestamp = Date.now();
    const recvWindow = 5000;
    const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
    
    const balance = await axios.get('https://fapi.binance.com/fapi/v2/balance', {
      params: { recvWindow, timestamp, signature },
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    const usdtBalance = balance.data.find(b => b.asset === 'USDT');
    console.log(`✅ Баланс: $${parseFloat(usdtBalance.availableBalance).toFixed(2)} USDT\n`);
    
    // Анализ BTC
    console.log('📊 Анализ BTCUSDT...');
    const priceResponse = await axios.get('https://fapi.binance.com/fapi/v1/ticker/price', {
      params: { symbol: 'BTCUSDT' },
      timeout: 5000
    });
    
    const btcPrice = parseFloat(priceResponse.data.price);
    console.log(`💰 BTC Price: $${btcPrice}\n`);
    
    // Отправка результата
    await bot.sendMessage(chatId,
      `�� <b>Анализ BTCUSDT завершен!</b>\n\n` +
      `<b>Цена:</b> $${btcPrice.toLocaleString()}\n` +
      `<b>Статус:</b> Бот полностью рабочий!\n\n` +
      `<i>Теперь используйте кнопки в Telegram для быстрого доступа.</i>`,
      { parse_mode: 'HTML' }
    );
    
    console.log('✅ Результат отправлен в Telegram!\n');
    console.log('🎉 Все системы работают!\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testBot();
