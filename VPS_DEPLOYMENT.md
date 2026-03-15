# 🚀 ПОШАГОВАЯ ИНСТРУКЦИЯ - Деплой на VPS сервер

## 📋 Шаг 1: Аренда сервера

### Рекомендуемые VPS провайдеры:

**1. DigitalOcean (рекомендуется)**
- Сайт: https://digitalocean.com
- Тариф: $6/мес (Droplet 512MB)
- Плюсы: Надежно, быстро, поддержка 24/7

**2. Vultr**
- Сайт: https://vultr.com
- Тариф: $5/мес
- Плюсы: Дешево, много локаций

**3. Linode**
- Сайт: https://linode.com
- Тариф: $5/мес
- Плюсы: Хорошая производительность

**4. Aeza (Россия)**
- Сайт: https://aeza.net
- Тариф: от 200₽/мес
- Плюсы: РФ хостинг, низкий пинг

### Требования к серверу:
- ОС: Ubuntu 20.04 или 22.04
- RAM: 512 MB минимум
- CPU: 1 ядро
- Disk: 10 GB

---

## 📋 Шаг 2: Получение данных сервера

После покупки сервера вы получите:
- **IP адрес**: например `192.168.1.100`
- **Логин**: обычно `root`
- **Пароль**: будет в письме от хостинга

---

## 📋 Шаг 3: Подготовка проекта

### В терминале на Mac:

```bash
# Перейдите в папку проекта
cd /Users/alexgreek/Desktop/new-project

# Создайте .env файл с вашими ключами
cp .env.example .env

# Проверьте что .env содержит правильные ключи
cat .env
```

### Содержание .env:
```bash
TELEGRAM_BOT_TOKEN=8166473987:AAFE3DrNIcd_n39koz-Y70Mq-n96p2N8Vsw
TELEGRAM_CHAT_ID=226166473
BINANCE_API_KEY=Rsn4sJcuThHwyAl0prGU9x0cgTQXZNBaTJWBjwV0rMTZvUwPfMdvgsAK8Zu8u6bi
BINANCE_SECRET_KEY=ctPBcjMqIGiEQOByKenR5y3SjBejdLJ5xNoEwY4G1fimNSsGg5u62DAhIG6Zh4XV
ANTHROPIC_API_KEY=your_key_here
```

---

## 📋 Шаг 4: Копирование проекта на сервер

### Вариант A: Через SCP (быстро)

```bash
# Из папки проекта
scp -r . root@ВАШ_IP:/root/claude-trading-bot
```

Пример:
```bash
scp -r . root@192.168.1.100:/root/claude-trading-bot
```

Введите пароль от сервера когда попросят.

### Вариант B: Через Git

```bash
# На сервере:
git clone https://github.com/ваш-repo/trading-bot.git
```

---

## 📋 Шаг 5: Подключение к серверу

```bash
ssh root@ВАШ_IP
```

Пример:
```bash
ssh root@192.168.1.100
```

Введите пароль. Вы увидите приветствие сервера.

---

## 📋 Шаг 6: Установка Node.js на сервере

```bash
# Обновление пакетов
apt-get update

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Проверка версии
node --version
npm --version
```

Должно показать:
```
v18.x.x
9.x.x
```

---

## 📋 Шаг 7: Установка зависимостей проекта

```bash
# Переход в папку проекта
cd /root/claude-trading-bot

# Установка всех зависимостей
npm install
```

Дождитесь окончания установки (может занять 2-5 минут).

---

## 📋 Шаг 8: Установка PM2 (менеджер процессов)

```bash
# Установка PM2 глобально
npm install -g pm2

# Проверка
pm2 --version
```

---

## 📋 Шаг 9: Запуск бота через PM2

```bash
# Запуск бота
pm2 start src/index.js --name trading-bot

# Сохранение конфигурации
pm2 save

# Настройка автозагрузки
pm2 startup
```

Последняя команда покажет команду для копирования - выполните её!

Пример:
```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

---

## 📋 Шаг 10: Проверка работы

```bash
# Статус бота
pm2 status

# Логи в реальном времени
pm2 logs trading-bot

# Мониторинг ресурсов
pm2 monit
```

Вы должны увидеть:
```
┌────┬───────────┬─────────────┬─────────┬─────────┬──────────┐
│ id │ name      │ namespace   │ status  │ cpu     │ memory   │
├────┼───────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0  │ trading-b │ default     │ online  │ 0%      │ 50mb     │
└────┴───────────┴─────────────┴─────────┴─────────┴──────────┘
```

---

## 📋 Шаг 11: Проверка в Telegram

1. Откройте Telegram
2. Найдите своего бота
3. Нажмите `/start`

Бот должен ответить мгновенно! ✅

---

## 🔧 Управление ботом

### Команды PM2:

```bash
# Перезапуск
pm2 restart trading-bot

# Остановка
pm2 stop trading-bot

# Старт
pm2 start trading-bot

# Просмотр логов
pm2 logs trading-bot

# Удаление
pm2 delete trading-bot
```

---

## ⚠️ Решение проблем

### Бот не запускается:

```bash
# Проверить логи
pm2 logs trading-bot --lines 50

# Попробовать запустить вручную
cd /root/claude-trading-bot
node src/index.js
```

### Ошибка "Cannot find module":

```bash
# Переустановить зависимости
npm install
```

### Бот отвечает медленно:

Проверьте нагрузку на сервер:
```bash
pm2 monit
```

Если память > 200MB - возможно нужен сервер мощнее.

---

## 💰 Стоимость содержания

| Провайдер | Тариф | В месяц |
|-----------|-------|---------|
| DigitalOcean | 512MB | $6 |
| Vultr | 512MB | $5 |
| Aeza | 512MB | ~200₽ |

**Итого:** ~$5-6/мес или ~200₽/мес

---

## ✅ Чеклист готовности

- [ ] Сервер арендован
- [ ] IP и пароль получены
- [ ] Проект скопирован на сервер
- [ ] Node.js установлен
- [ ] Зависимости установлены (`npm install`)
- [ ] PM2 установлен
- [ ] Бот запущен (`pm2 start`)
- [ ] Автозагрузка настроена (`pm2 startup`)
- [ ] В Telegram бот отвечает

**Готово! Бот работает 24/7!** 🎉

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи: `pm2 logs trading-bot`
2. Проверьте статус: `pm2 status`
3. Перезапустите: `pm2 restart trading-bot`

Бот работает независимо от вашего ноутбука! ☁️✨
