#!/bin/bash

echo "🚀 Запуск Claude Trading Bot на сервере..."

# Проверка зависимостей
if ! command -v pm2 &> /dev/null; then
    echo "📦 Установка PM2 (process manager)..."
    npm install -g pm2
fi

# Остановка старых процессов
pm2 delete claude-bot 2>/dev/null || true

# Запуск бота
echo "✅ Запуск бота..."
pm2 start src/index.js --name claude-bot --watch

# Сохранение конфигурации
pm2 save

# Автозагрузка при старте системы
pm2 startup

echo ""
echo "✅ Бот запущен и работает 24/7!"
echo ""
echo "📊 Статус:"
pm2 status
echo ""
echo "💡 Команды управления:"
echo "   pm2 logs claude-bot     - Просмотр логов"
echo "   pm2 stop claude-bot     - Остановить"
echo "   pm2 restart claude-bot  - Перезапустить"
echo "   pm2 monit               - Мониторинг"
