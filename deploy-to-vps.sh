#!/bin/bash

echo "🚀 Деплой Claude Trading Bot на VPS сервер"
echo ""

# Проверка аргументов
if [ -z "$1" ]; then
    echo "❌ Укажите IP адрес сервера:"
    echo "   ./deploy-to-vps.sh root@your-server-ip"
    exit 1
fi

SERVER=$1
PROJECT_NAME="claude-trading-bot"

echo "✅ Сервер: $SERVER"
echo ""

# 1. Копирование проекта на сервер
echo "📦 Копирование файлов на сервер..."
scp -r . $SERVER:/root/$PROJECT_NAME

if [ $? -ne 0 ]; then
    echo "❌ Ошибка копирования!"
    exit 1
fi

echo "✅ Файлы скопированы"
echo ""

# 2. Инструкция для выполнения на сервере
echo "📋 Теперь подключитесь к серверу и выполните:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ssh $SERVER"
echo ""
echo "# Установка Node.js и зависимостей"
echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
echo "sudo apt-get update"
echo "sudo apt-get install -y nodejs npm"
echo ""
echo "# Переход в директорию проекта"
echo "cd /root/$PROJECT_NAME"
echo ""
echo "# Установка зависимостей"
echo "npm install"
echo ""
echo "# Установка PM2 (process manager)"
echo "sudo npm install -g pm2"
echo ""
echo "# Запуск бота"
echo "pm2 start src/index.js --name trading-bot"
echo ""
echo "# Сохранение конфигурации"
echo "pm2 save"
echo ""
echo "# Автозагрузка при старте системы"
echo "pm2 startup"
echo ""
echo "# Мониторинг"
echo "pm2 monit"
echo "pm2 logs trading-bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Готово! Бот будет работать 24/7!"
