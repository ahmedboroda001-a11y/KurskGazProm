# КурскГазПром — корпоративный сайт (BLUE)

18 HTML-страниц, реальные фотоматериалы, 6 PDF-документов, калькулятор параметров работ.

Публичный сайт после настройки GitHub Pages: https://ahmedboroda001-a11y.github.io/KurskGazProm/
Целевой домен: kurskgazprom.ru (до подключения DNS ссылка недоступна).

## Публикация

1. Создать отдельный **публичный** репозиторий `KurskGazProm`.
2. Загрузить все файлы **из распакованной папки** в корень репозитория, сохранив папки `assets/`, `docs/` и `.nojekyll`. Не загружать ZIP как единственный файл.
3. Настроить Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
4. Проверить сайт сначала по `https://ahmedboroda001-a11y.github.io/KurskGazProm/`.
5. Проверить владение `kurskgazprom.ru`, затем Settings → Pages → Custom domain → `kurskgazprom.ru` и настроить DNS у регистратора.
6. После проверки DNS включить Enforce HTTPS.

Для привязки корневого домена (если регистратор позволяет обычные A-записи) адреса GitHub Pages:

- A @ 185.199.108.153
- A @ 185.199.109.153
- A @ 185.199.110.153
- A @ 185.199.111.153
- CNAME www ahmedboroda001-a11y.github.io

GitHub docs: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Важно

- Публичная версия пока не отправляет заявки на email и Telegram без отдельного HTTPS-сервера и его конфигурации в `assets/config.js`.
- Нельзя загружать в этот репозиторий токен Telegram, OpenAI API-ключ и SMTP-пароль.
- Политику персональных данных и сведения о компании следует проверить перед публикацией.
- Разрешение на публичное размещение сертификатов с ФИО, печатями и подписями необходимо подтвердить.
