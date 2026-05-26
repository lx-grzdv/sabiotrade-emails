# Review System Audit

Дата аудита: 2026-05-25.

Объект проверки:

```text
https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart&review=1&email=AC-01
```

Цель: оценить, насколько chain/review страница удобна для совместной работы менеджера, копирайтера и разработчика: просмотр писем, комментарии, статусы, handoff HTML и переход к source-файлам.

## Текущее состояние

Работает:

- production URL отвечает `200 OK`;
- страницы закрыты от индексации через `X-Robots-Tag: noindex, nofollow, noarchive`;
- review mode открывает выбранное письмо в правой preview-панели;
- shared comments backend работает: `/api/review-comments?campaignId=abandoned-cart` возвращает комментарии из общей базы;
- comments list поддерживает фильтры `Open`, `Applied`, `Resolved`, `All`;
- комментарии можно привязать к элементу письма, открыть по пину, перевести в `applied`, `resolved` или `open`;
- `Download HTML` отдает preview HTML как attachment через `/api/download-html`;
- chain-страница показывает timing, subject, preheader, preview, review, download и source-ссылки.

Зафиксированное состояние по `abandoned-cart` на момент проверки:

- в shared comments было 2 комментария;
- оба комментария были в статусе `applied`;
- оба относились к `AC-01`.

## Главные проблемы

### 1. Первый шаг в review mode недостаточно очевиден

Пользователь видит toolbar и preview, но не получает явного сценария: куда нажать, что произойдет после клика, как понять, что комментарий сохранен и синхронизирован.

Рекомендации:

- добавить empty-state в preview-панель: `Кликните по блоку письма, чтобы оставить комментарий`;
- показывать счетчик комментариев по текущему письму и по всей цепочке;
- добавить `last synced` или короткий индикатор успешной синхронизации после `Sync now`;
- в help-поповере вынести 3 шага: `1. Click block`, `2. Add comment`, `3. Track status`.

Приоритет: высокий.

### 2. `Clear comments` слишком опасен для name-only доступа

Кнопка удаляет комментарии всей цепочки. При текущей модели доступа по имени это слишком сильное действие для обычного review-пользователя.

Рекомендации:

- спрятать действие в secondary/advanced menu;
- требовать typed confirmation, например ввести `DELETE abandoned-cart`;
- либо оставить clear только для admin/developer режима;
- дополнительно показывать, сколько комментариев будет удалено.

Приоритет: высокий.

### 3. Таблица писем плохо масштабируется по ширине

На desktop видно горизонтальный скролл. Action-колонка перегружена: `Preview`, `Review`, `Download HTML`, `Source` стоят рядом и частично уходят за экран.

Рекомендации:

- сделать компактные action-кнопки или action-menu;
- рассмотреть sticky правую колонку действий;
- на широких экранах зафиксировать минимальную ширину таблицы и сделать скролл визуально явным;
- на средних экранах перейти к карточному layout для строк писем.

Приоритет: средний.

### 4. Привязка комментариев к HTML может ломаться после правок

Если у элемента нет `data-review-id`, комментарий сохраняет длинный CSS selector через `nth-of-type`. После изменения таблиц/строк письма такой selector легко перестает находить исходный блок.

Рекомендации:

- проставлять стабильные `data-review-id` на крупные смысловые блоки письма:
  - `header`;
  - `hero`;
  - `plan_snapshot`;
  - `how_it_works`;
  - `price_reminder`;
  - `primary_cta`;
  - `footer`;
- использовать эти ID при генерации preview HTML;
- в comments list оставлять warning `Target not found`, но также показывать исходную цитату и source path.

Приоритет: высокий.

### 5. Не хватает истории статусов

Сейчас видно текущий статус комментария, но не видно, кто и когда перевел его в `applied` или `resolved`.

Рекомендации:

- добавить поля `statusUpdatedAt`, `statusUpdatedBy`;
- показывать в popover: `Applied by ... at ...`;
- опционально добавить короткий change note при переводе в `applied`;
- в export JSON сохранять всю историю статусов.

Приоритет: средний.

### 6. UI смешивает русский и английский

Chain-страница в основном на русском, а review actions на английском: `Review mode`, `Comments list`, `Sync now`, `Clear comments`.

Рекомендации:

- выбрать единый язык review-интерфейса;
- если основная аудитория менеджеры RU, локализовать toolbar:
  - `Режим ревью`;
  - `Список комментариев`;
  - `Синхронизировать`;
  - `Экспорт`;
  - `Очистить`;
- если нужен EN для команды, перевести и описательные тексты chain-страницы.

Приоритет: низкий/средний.

### 7. Нужен режим чистого просмотра письма

Пины, outlines и review overlays полезны для обсуждения, но мешают финальной визуальной оценке письма.

Рекомендации:

- разделить `Hide comments` на режимы:
  - `Clean`;
  - `Pins`;
  - `Full markup`;
- в clean-режиме preview должен максимально совпадать с тем, что увидит пользователь в email-клиенте.

Приоритет: средний.

### 8. Не хватает sample-data preview

Raw-переменные `{{plan_name}}`, `{{plan_balance}}`, `{{first_name}}` полезны для проверки токенов, но мешают оценить реальный текст и верстку.

Рекомендации:

- добавить переключатель `Raw tokens / Example values`;
- держать sample data на уровне кампании или письма;
- явно подсвечивать переменные, которые не получили sample value;
- проверять длину subject/preheader и hero-текста с sample values.

Приоритет: средний.

### 9. AC-01 содержит placeholder visual

В письме `AC-01` используется изображение `Placeholder — Assessment flow visual`. Для финального handoff это выглядит как незавершенный блок.

Рекомендации:

- заменить placeholder на реальный assessment flow visual;
- либо временно убрать визуал из финального preview;
- добавить QA-чек на строки `Placeholder`, `TODO`, `lorem`, `example.com` перед деплоем.

Приоритет: высокий для production-ready писем.

### 10. Source-ссылки должны вести максимально близко к конкретному письму

Для review-комментария разработчику полезнее сразу попадать в конкретный source HTML письма, а не в общий экспортированный документ, если такой файл доступен.

Рекомендации:

- для кампаний с `development/<campaign>/HTML/<email>.html` использовать source path конкретного письма;
- для монолитных документов оставлять общий source, но добавлять email ID и text quote в comment popover;
- в comments list показывать email ID крупнее, чем путь.

Приоритет: средний.

## Рекомендуемый backlog

### P0 / перед активным командным использованием

- Защитить `Clear comments` от случайного удаления.
- Добавить `data-review-id` в Abandoned Cart preview blocks.
- Убрать или заменить placeholder visual в `AC-01`.
- Добавить явный empty-state/instruction в review preview.

### P1 / улучшить ежедневную работу

- Улучшить action-колонку таблицы писем.
- Добавить счетчики комментариев и `last synced`.
- Добавить историю статусов.
- Сделать режим `Raw tokens / Example values`.

### P2 / polish

- Привести язык интерфейса к единому стандарту.
- Добавить режимы `Clean / Pins / Full markup`.
- Улучшить export comments: имя файла с campaign ID и датой.

## QA-чек для следующих релизов

Перед деплоем review/handoff страницы проверить:

1. `chain?chain=<campaign-id>` открывается без 404.
2. `Preview` открывает тот же HTML, который скачивает `Download HTML`.
3. `Download HTML` отдает attachment с расширением `.html`.
4. `Source` открывает публичный source-файл без 404.
5. `review=1&email=<email-id>` открывает нужное письмо в preview-панели.
6. Shared comments показывает `Shared comments`, а не `Local comments`.
7. Новый комментарий появляется в comments list после refresh или `Sync now`.
8. `Open -> Applied -> Resolved -> Open` работает без потери комментария.
9. В письме нет `Placeholder`, `TODO`, `lorem` и тестовых URL.
10. Если письмо правилось после комментариев, старые comments либо попадают в нужный блок, либо явно показывают `Target not found`.

## Связанные документы

- [`current-workflow-runbook.md`](./current-workflow-runbook.md)
- [`review-comments-workflow.md`](./review-comments-workflow.md)
- [`review-comments-setup.md`](./review-comments-setup.md)
- [`email-ops-service-blueprint.md`](./email-ops-service-blueprint.md)
