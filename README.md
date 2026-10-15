# Forte Quest — Тренажёр консультанта по банковским гарантиям

Интерактивный RPG-симулятор переговоров с клиентами по банковским гарантиям ForteBank.

## 🚀 Быстрый запуск в Docker (Traefik)

Проект полностью настроен для запуска в Docker за обратным прокси Traefik (домен: `forte.piupiu.kz`):

```bash
docker compose up -d --build
```

Проверка логов и статуса:
```bash
docker compose ps
docker compose logs -f app
```

## 💻 Локальный запуск (без Docker)

```bash
python -m http.server 8000
```
И откройте в браузере: `http://localhost:8000`

## 📁 Структура проекта

- `all-cases.json` — 6 реальных кейсов клиентов со всеми этапами, реакциями и начислением баллов
- `app.js` — игровой движок (анимированный клиент, печать текста, звуковые эффекты Web Audio API, подсчёт доверия и опыта)
- `style.css` — дизайн-система в стилистике ForteBank (тёмная тема, RPG-меню, анимации)
- `index.html` — главная страница приложения
- `Dockerfile` & `nginx.conf` — легковесный Nginx Alpine контейнер
- `docker-compose.yml` — конфигурация для Traefik (сеть `platform-net`)
