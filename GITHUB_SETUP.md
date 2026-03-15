# 📦 ЗАГРУЗКА НА GITHUB за 2 минуты

## ⚡ БЫСТРАЯ ИНСТРУКЦИЯ

### ШАГ 1: Создать репозиторий на GitHub (1 минута)

1. Откройте https://github.com/new
2. Введите имя: `claude-trading-bot`
3. Выберите **Public** или **Private**
4. Нажмите **"Create repository"**

### ШАГ 2: Загрузить проект (1 минута)

Выполните команды в терминале:

```bash
# Перейдите в папку проекта
cd /Users/alexgreek/Desktop/new-project

# Инициализируйте Git
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "🤖 Claude Trading Bot - Initial commit"

# Создайте main ветку
git branch -M main

# Подключите удаленный репозиторий
# ЗАМЕНИТЕ ВАШ_USERNAME и ВАШ_REPO на свои!
git remote add origin https://github.com/ВАШ_USERNAME/claude-trading-bot.git

# Отправьте на GitHub
git push -u origin main
```

### Пример (если ваш username alexgreek):
```bash
git remote add origin https://github.com/alexgreek/claude-trading-bot.git
git push -u origin main
```

---

## ✅ ГОТОВО!

Теперь проект на GitHub и готов к деплою на Railway!

---

## 🔧 ЕСЛИ ОШИБКИ

### Ошибка: "remote: Repository not found"
Проверьте что:
- Репозиторий создан на GitHub
- Правильно указали username в команде git remote add

### Ошибка: "src refspec main does not match any files"
Сначала сделайте коммит:
```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Ошибка аутентификации:
Используйте токен вместо пароля:
1. https://github.com/settings/tokens
2. Create new token (Classic)
3. Выберите repo, workflow
4. Скопируйте токен
5. Используйте его вместо пароля при git push

---

## 📊 ПРОВЕРКА

Откройте https://github.com/ВАШ_USERNAME/claude-trading-bot

Должны увидеть файлы проекта! ✅

---

## 🎯 СЛЕДУЮЩИЙ ШАГ

Теперь идите на https://railway.app и следуйте RAILWAY_DEPLOY.md !

🚀 Через 5 минут бот будет работать 24/7 бесплатно!
