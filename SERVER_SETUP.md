# 🚀 Запуск бота на сервере 24/7

## Чтобы бот работал когда ноутбук выключен, нужен сервер!

### Вариант 1: VPS сервер (рекомендуется)

**Аренда сервера:**
- DigitalOcean Droplet ($6/мес)
- Heroku (бесплатно с перерывами)
- Railway.app (бесплатно)
- Render.com (бесплатно)

**После получения сервера:**

```bash
# 1. Подключение к серверу
ssh root@your-server-ip

# 2. Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# 3. Копирование проекта
scp -r /Users/alexgreek/Desktop/new-project root@your-server-ip:/root/bot

# 4. Настройка на сервере
cd /root/bot
npm install

# 5. Установка PM2
sudo npm install -g pm2

# 6. Запуск бота
pm2 start src/index.js --name trading-bot
pm2 save
pm2 startup

# 7. Готово! Бот работает 24/7
```

### Вариант 2: Облачные платформы (проще!)

**Railway.app:**
1. Зайти на https://railway.app
2. Нажать "New Project"
3. Выбрать "Deploy from GitHub repo"
4. Подключить репозиторий с ботом
5. Добавить переменные окружения (.env)
6. Deploy!

**Render.com:**
1. Зайти на https://render.com
2. Создать новый Web Service
3. Подключить GitHub
4. Build Command: `npm install`
5. Start Command: `node src/index.js`
6. Добавить переменные окружения

### Переменные окружения (обязательно!):

```
TELEGRAM_BOT_TOKEN=8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw
TELEGRAM_CHAT_ID=226166473
BINANCE_API_KEY=Rsn4sJcuThHwyAl0prGU9x0cgTQXZNBaTJWBjwV0rMTZvUwPfMdvgsAK8Zu8u6bi
BINANCE_SECRET_KEY=ctPBcjMqIGiEQOByKenR5y3SjBejdLJ5xNoEwY4G1fimNSsGg5u62DAhIG6Zh4XV
ANTHROPIC_API_KEY=ваш_api_key
```

---

## Пока бот работает локально:

Запустите команду ниже и бот будет работать пока ноутбук включен:

```bash
cd /Users/alexgreek/Desktop/new-project
node src/index.js
```

**Для работы 24/7 без ноутбука - используйте VPS или облако!** ☁️
