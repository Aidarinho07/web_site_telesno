# Деплой сайта «Отношения: тяни, толкай»

Статический лендинг: `index.html`, `styles.css`, `script.js`, `config.js`, страницы `offer.html` и `privacy.html`, папка `asstes/`.

## GitHub Pages (рекомендуется)

### 1. Репозиторий на GitHub

```powershell
cd c:\cursor_project\MyWebsite
git init
git add index.html styles.css script.js config.js offer.html privacy.html asstes .nojekyll .github
git commit -m "Лендинг тренинга: первая публикация"
git branch -M main
git remote add origin https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПОЗИТОРИЙ.git
git push -u origin main
```

Если Git пишет про `dubious ownership`, один раз выполните (от своего пользователя):

```powershell
git config --global --add safe.directory C:/cursor_project/MyWebsite
```

### 2. Включить Pages

1. GitHub → репозиторий → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. После push в `main` запустится workflow **Deploy to GitHub Pages**
4. Сайт будет по адресу: `https://ВАШ_АККАУНТ.github.io/ИМЯ_РЕПОЗИТОРИЯ/`

Повторный деплой: любой `git push` в `main` или вручную **Actions** → **Deploy to GitHub Pages** → **Run workflow**.

### 3. Форма заявок

Отправка идёт через `mailto:` и настройки в `config.js`. Проверьте контакты Аиды перед публикацией.

---

## Быстрый просмотр локально

```powershell
cd c:\cursor_project\MyWebsite
npx --yes serve -l 3000
```

Откройте http://localhost:3000

---

## Netlify (альтернатива)

1. [netlify.com](https://www.netlify.com) → **Add new site** → **Deploy manually**
2. Перетащите папку проекта (без лишних `.pptx`/`.docx`, если не нужны)
3. Или подключите репозиторий GitHub — **Publish directory:** `.` (корень)

---

## Чеклист перед публикацией

- [ ] Телефон, email и VK в `config.js`
- [ ] Даты и цены в `index.html`
- [ ] Проверка на телефоне (ширина 375px и 414px)
- [ ] Ссылки «Оферта» и «Согласие» открываются
