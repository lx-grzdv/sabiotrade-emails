# Current Workflow Runbook

Текущее состояние production-процесса для email-цепочек в этом репозитории.

## 1) Папки и роли

- `development/` - рабочие исходники (черновики, итерации, внутренние материалы).
- `preview/` - утвержденные версии для визуального предпросмотра.
- `sources/` - публичные исходники для менеджера/CRM (генерируются из `development/`).
- `assets/campaign-data.js` - реестр цепочек, писем, таймингов, subject/preheader, путей.

## 2) Что публикуется на Vercel

- Публикуются:
  - `preview/**`
  - `sources/**`
  - статические страницы/скрипты (`index.html`, `chain.html`, `assets/*` и т.д.)
- Не публикуется:
  - весь `development/**` (закрыт через `.vercelignore`)
  - `*.docx`

Идея: рабочая зона остается приватной, менеджер и CRM получают только безопасный public source.

## 3) Как формируются public source файлы

Скрипт:

```bash
npm run sync-sources
```

Выполняет:

- пересоздает `sources/` с нуля;
- копирует из `development/` только `*.html` и `*.md`;
- сохраняет структуру подпапок кампаний.

## 4) Как формируются preview файлы

Скрипт:

```bash
npm run sync-preview
```

Берет кампании из списка `READY` в `scripts/sync-preview.py` и копирует их из `development/<campaign>/` (+ `HTML/`, если есть) в `preview/<campaign>/`.

## 5) Единый deploy-пайплайн

Команда:

```bash
npm run deploy
```

Шаги:

1. архивирует текущую production-версию GTO;
2. синхронизирует `preview/`;
3. синхронизирует `sources/`;
4. деплоит на Vercel production.

## 6) Что отдавать менеджеру для правок текста/контента

Использовать ссылки из `sources/`, например:

- `sources/abandoned-cart/abandoned_cart.html`
- `sources/google-traffic-onboarding/HTML/GTO_01.html`

На chain-странице:

- `Source` в таблице писем ведет на конкретный публичный source-файл;
- `Download HTML` скачивает утвержденный рабочий HTML из `preview/` для конкретного письма;
- `Development folder` ведет на `sources/<campaign>/README.md` (а не на директорию, чтобы не было 404).

Если менеджеру нужен готовый файл письма:

1. Открыть production chain-страницу, например `https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart`.
2. Найти письмо по `ID` (`AC-01`, `AC-02`, `AC-03` и т.д.).
3. Нажать `Download HTML` в строке письма.
4. Передать скачанный `.html` файл в CRM/Pushwoosh или ответственному за загрузку.

Важно: `Download HTML` и `Preview` используют один и тот же `previewPath`, поэтому скачивается ровно та версия, которую менеджер видит в предпросмотре. Скачивание идет через `/api/download-html`, который принудительно отдает файл с расширением `.html`. `Source` нужен для чтения/правок исходника, а не как основной handoff-файл.

## 7) Что отдавать CRM для Pushwoosh

Минимальный handoff пакет:

- утвержденный HTML из `preview/`, скачанный через `Download HTML` на chain-странице;
- subject/preheader/timing из `assets/campaign-data.js` и chain-страницы;
- campaign notes/checklist из `docs/` по необходимости.

Подробный процесс и роли:

- `docs/email-ops-service-blueprint.md`
- `docs/multi-user-html-workflow.md`
- `docs/review-comments-workflow.md`

## 8) Быстрый smoke-check после деплоя

1. Открыть `chain?chain=<campaign-id>`.
2. Проверить:
   - `Preview` открывает нужный `previewPath`;
   - `Download HTML` есть у каждого письма и скачивает файл с тем же именем, что `previewPath`;
   - `Source` открывает `sources/...` без 404;
   - `Development folder` открывает `sources/<campaign>/README.md`.
3. Пройтись по 1-2 письмам кампании на предмет битых ссылок.
