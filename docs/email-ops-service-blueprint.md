# Email Ops Service Blueprint

Дата: 2026-05-21  
Контекст: SabioTrade email experiments  
Цель документа: зафиксировать потенциал текущего проекта как внутреннего сервиса для создания email-цепочек и ведения процесса от задачи до передачи в Pushwoosh.

## Executive summary

Текущий репозиторий уже является не просто папкой с HTML-письмами. В нем есть основа внутреннего Email Ops сервиса:

- CJM-карта по стадиям жизненного цикла клиента.
- Каталог кампаний, писем, триггеров, exit/re-entry правил, subject и preheader.
- Preview-хаб для просмотра цепочек и отдельных писем.
- Review mode с комментариями по конкретным блокам письма.
- Shared comments backend через Vercel API и Supabase.
- Email UI kit с повторяемыми блоками.
- Скрипты синхронизации development -> preview.
- Скрипты версионирования production HTML перед деплоем.
- Vercel preview/prod публикация.

Главная возможность: превратить это в слой управления email production process:

```text
Task -> Brief -> Draft -> HTML -> Preview -> Review -> QA -> Approved -> Pushwoosh package -> Transfer -> Live
```

Правильная продуктовая формулировка:

> Email Ops Cockpit: внутренний сервис для производства, ревью, контроля качества, версионирования и передачи email-цепочек в Pushwoosh.

Это не должно становиться заменой Pushwoosh. Pushwoosh остается delivery и journey runtime. Новый сервис должен закрывать все, что происходит до Pushwoosh: постановка задачи, сборка писем, ревью, QA, статусы, пакет передачи и контроль соответствия.

## Current inventory

### Количественная база

По состоянию на 2026-05-21:

- 5 CJM stages.
- 10 кампаний в `assets/campaign-data.js`.
- 59 писем в канонической CJM-карте.
- 73 HTML-файла в `development/`.
- 138 HTML-файлов в `preview/`, включая версии и вспомогательные страницы.
- 10 `.docx` brief/source документов в `development/`.

Распределение писем по стадиям:

| Stage | Emails |
| --- | ---: |
| acquisition | 6 |
| assessment | 11 |
| recovery | 12 |
| funded | 8 |
| academy | 22 |

Распределение по кампаниям:

| Campaign | Emails |
| --- | ---: |
| `google-traffic-onboarding` | 3 |
| `abandoned-cart` | 3 |
| `assessment-progress-engagement` | 3 |
| `assessment-30-day-warning` | 2 |
| `trading-results` | 6 |
| `free-trial-expired` | 8 |
| `breach-winback` | 4 |
| `funded-account-activation` | 5 |
| `post-payout-upsell-referral` | 3 |
| `academy-subscription-onboarding` | 22 |

### Ключевые файлы

| File | Role |
| --- | --- |
| `assets/campaign-data.js` | Каноническое описание CJM, кампаний, писем, subject/preheader, paths, task notes. |
| `assets/hub-app.js` | Frontend логика хаба, chain view, global preview, review mode, comments, export. |
| `assets/hub.css` | UI хаба и review-интерфейса. |
| `api/review-comments.js` | Vercel API для shared review comments через Supabase REST. |
| `docs/review-comments-workflow.md` | Текущий day-to-day процесс ревью комментариев. |
| `docs/review-comments-setup.md` | Настройка Supabase/Vercel для shared comments. |
| `scripts/sync-preview.py` | Копирует ready HTML/MD из `development/` в `preview/`. |
| `scripts/snapshot-email-versions.py` | Архивирует HTML-версии, включая production-before-deploy snapshots. |
| `scripts/fix-email-typography.py` | Массовая нормализация типографики email HTML. |
| `Templates & Examples/Email_UI_Kit_Blocks.html` | Библиотека email-блоков. |
| `Templates & Examples/Email_UI_Kit_Readme.md` | Инструкция по сборке письма из блоков. |
| `vercel.json` | Static hosting, noindex headers, rewrites. |
| `package.json` | Скрипты sync/deploy/archive. |

### Что уже работает как сервис

1. **CJM hub**  
   Центральная карта цепочек с группировкой по lifecycle stage. Видны trigger, exit, re-entry, количество писем, subject/preheader и ссылки.

2. **Chain view**  
   Для каждой кампании есть отдельная страница цепочки с логикой, письмами, notes, development/preview paths и review-ссылками.

3. **Preview layer**  
   Письма можно открывать в чистом виде или в глобальном iframe preview.

4. **Review mode**  
   Можно открыть письмо с параметрами `?chain=...&review=1&email=...`, оставлять комментарии по элементам письма, видеть pins/list, менять статусы.

5. **Review status flow**  
   Уже есть базовые статусы комментариев:

   ```text
   open -> applied -> resolved
   ```

6. **Shared comments architecture**  
   API готов к работе с Supabase table `review_comments`. Есть local fallback через `localStorage`.

7. **Versioning**  
   Для `google-traffic-onboarding` уже есть production-before-deploy snapshots и versions index.

8. **Deployment discipline**  
   `npm run deploy` архивирует production-версию, синхронизирует preview и деплоит на Vercel.

## Product thesis

### Основная проблема

Email production сейчас включает много ручных переходов:

- из задачи в docx/brief;
- из brief в HTML;
- из HTML в preview;
- из preview в ревью;
- из комментариев в правки;
- из правок в approval;
- из approval в Pushwoosh;
- из Pushwoosh в live journey;
- из live journey в аналитику и последующие итерации.

Каждый переход создает риск:

- потерять актуальную версию;
- забыть обновить subject/preheader;
- неправильно скопировать HTML;
- пропустить переменную;
- не согласовать CTA или offer;
- отправить в Pushwoosh неapproved версию;
- не зафиксировать, кто и что принял;
- не передать trigger/exit/re-entry правила;
- не проверить legal/compliance footer;
- не сохранить связь между email ID и Pushwoosh preset/campaign.

### Целевая ценность сервиса

Сервис должен быть source of truth для всего, что нужно до запуска в Pushwoosh:

- что это за цепочка;
- зачем она нужна;
- кому она отправляется;
- когда и по какому событию;
- какие письма входят;
- какой HTML approved;
- какие переменные используются;
- какие comments еще открыты;
- какой пакет нужно передать в Pushwoosh;
- какая версия была передана;
- какой Pushwoosh preset/journey соответствует письму.

### Необходимая граница ответственности

Сервис отвечает за:

- planning;
- copy and HTML production;
- preview;
- review;
- QA;
- approval;
- export/handoff;
- version log;
- operational documentation.

Pushwoosh отвечает за:

- actual delivery;
- customer journey execution;
- subscription preferences;
- frequency capping;
- campaign launch;
- runtime personalization;
- delivery analytics.

## Users and roles

### Marketing manager

Задачи:

- создать задачу на цепочку или письмо;
- задать цель, audience, timing, offer, segment;
- проверить copy и визуальную структуру;
- оставить comments;
- принять или вернуть правки;
- получить готовый package для Pushwoosh.

Потребности:

- видеть весь funnel context;
- быстро понимать статус;
- не читать HTML;
- комментировать прямо в preview;
- быть уверенным, что в Pushwoosh передается approved версия.

### CRM / Pushwoosh operator

Задачи:

- создать/обновить email presets;
- настроить Customer Journey;
- выставить trigger, delays, exits, conversion goals;
- проверить personalization;
- запустить тест;
- перевести в live.

Потребности:

- получить один пакет без догадок;
- видеть subject, preheader, sender, message type, category;
- знать required variables;
- знать trigger and exit rules;
- иметь checklist и test cases;
- знать latest approved HTML version.

### Developer / email producer

Задачи:

- собрать HTML из UI kit;
- внести правки;
- проверить mobile/email-safe layout;
- синхронизировать preview;
- закрыть comments;
- подготовить export.

Потребности:

- видеть source paths;
- видеть comments по конкретным блокам;
- не искать руками текущую версию;
- запускать QA автоматически;
- не копировать данные между разными документами.

### Product / growth owner

Задачи:

- видеть coverage lifecycle;
- управлять приоритетами;
- понимать, какие цепочки live/draft/blocked;
- связать кампании с бизнес-метриками.

Потребности:

- dashboard по стадиям CJM;
- статусы;
- владельцы;
- impact/goal;
- launch history.

## Target workflow

### 1. Task intake

Создается задача на новую цепочку, новое письмо или изменение существующей цепочки.

Минимальные поля:

| Field | Description |
| --- | --- |
| `taskId` | Внутренний ID задачи. |
| `campaignId` | Slug цепочки. |
| `requestType` | `new_campaign`, `new_email`, `copy_update`, `html_update`, `pushwoosh_update`, `experiment`. |
| `owner` | Кто отвечает за постановку. |
| `producer` | Кто собирает HTML. |
| `stageId` | CJM stage. |
| `goal` | Бизнес-цель. |
| `audience` | Сегмент пользователей. |
| `trigger` | Событие или условие входа. |
| `exit` | Условие выхода. |
| `reentry` | Правило повторного входа. |
| `offer` | Promo/price/discount, если есть. |
| `deadline` | Целевая дата готовности. |
| `priority` | Приоритет. |

Output этапа:

```text
Task created -> Brief needed
```

### 2. Brief and logic

Brief фиксирует:

- why this communication exists;
- target audience;
- lifecycle moment;
- trigger;
- delay;
- exit;
- re-entry;
- branch logic;
- suppression rules;
- required variables;
- fallback text;
- offer restrictions;
- legal notes;
- success metric;
- Pushwoosh setup notes.

Output этапа:

```text
Brief approved -> Copy/HTML ready to start
```

### 3. Email assembly

Письмо собирается из утвержденных UI kit blocks.

Правила:

- `BLOCK 00` preheader обязателен.
- `BLOCK 01` header обязателен.
- Legal/footer block обязателен.
- CTA должен иметь валидный `href`.
- Все variables должны быть объявлены в campaign metadata.
- Subject/preheader должны совпадать между HTML и `campaign-data.js`.
- HTML source должен жить в `development/<campaign>/` или `development/<campaign>/HTML/`.

Output этапа:

```text
HTML draft -> Preview ready
```

### 4. Preview sync

HTML попадает из `development/` в `preview/`.

Текущий механизм:

```bash
npm run sync-preview
```

Будущее поведение сервиса:

- показывать, какие files synced;
- показывать diff source vs preview;
- запрещать export, если preview outdated;
- фиксировать version hash после sync.

Output этапа:

```text
Preview ready -> Review ready
```

### 5. Review

Review открывается через chain page.

Текущий URL pattern:

```text
chain.html?chain=<campaignId>&review=1&email=<emailId>
```

Review должен покрывать:

- comments по конкретному блоку;
- author;
- status;
- source path;
- email ID;
- quote;
- timestamp;
- status transition;
- comments export;
- shared sync.

Целевой status flow для comments:

```text
open -> applied -> resolved
```

Целевой status flow для email:

```text
draft -> in_review -> changes_requested -> approved -> qa_passed -> pushwoosh_ready
```

Output этапа:

```text
All blocking comments resolved -> Approved
```

### 6. QA

QA должен быть отдельным gate перед Pushwoosh.

Автоматические проверки:

| Check | Why |
| --- | --- |
| HTML file exists | Нельзя передать несуществующую версию. |
| Preview path exists | Reviewer и Pushwoosh operator должны видеть именно approved version. |
| Subject present | Pushwoosh step требует subject/custom или preset subject. |
| Preheader present | Нужен для inbox preview и consistency. |
| Sender metadata present | Нужно для Pushwoosh setup. |
| CTA href present | Главный conversion path. |
| No empty `href="#"` | Частая ошибка handoff. |
| Required variables declared | Pushwoosh personalization не должна падать или показывать raw tokens. |
| No unknown variables | Нельзя отправлять `{{unknown_field}}`. |
| Legal footer present | Pushwoosh требует company address details для email footer. |
| Unsubscribe/category decision present | Marketing emails должны уважать preferences. |
| Mobile viewport check | Предотвращает очевидные layout issues. |
| Source/preview hash match | Защита от outdated preview. |

Ручные проверки:

- copy approved;
- offer approved;
- price/discount approved;
- legal wording approved;
- trigger approved;
- exit condition approved;
- Pushwoosh test recipient approved;
- final send test opened in inbox.

Output этапа:

```text
QA passed -> Pushwoosh ready
```

### 7. Pushwoosh handoff

Минимальный handoff должен быть one-click export:

```text
Export for Pushwoosh
```

Пакет должен включать:

- HTML-файлы;
- metadata JSON;
- subject/preheader;
- sender/from/reply-to;
- message type;
- subscription category;
- variables list;
- trigger/timing/exit/re-entry;
- branch logic;
- CTA inventory;
- comments summary;
- QA report;
- approved version hash;
- setup checklist.

Output:

```text
pushwoosh-package/<campaignId>/<version>/
```

Пример структуры:

```text
pushwoosh-package/
  google-traffic-onboarding/
    2026-05-21_approved/
      manifest.json
      QA.md
      README.md
      emails/
        GTO_01.html
        GTO_02.html
        GTO_03.html
```

### 8. Transfer and launch tracking

После передачи в Pushwoosh нужно фиксировать:

| Field | Description |
| --- | --- |
| `pushwooshPresetCode` | Код preset для каждого письма, если применимо. |
| `pushwooshJourneyName` | Название journey/campaign. |
| `pushwooshJourneyUrl` | Ссылка в control panel, если доступна. |
| `transferredAt` | Когда передано. |
| `transferredBy` | Кто передал. |
| `launchedAt` | Когда запущено. |
| `launchedBy` | Кто запустил. |
| `testStatus` | `not_tested`, `test_sent`, `test_passed`, `test_failed`. |
| `liveStatus` | `not_live`, `scheduled`, `live`, `paused`, `archived`. |

## Proposed data model

### Campaign

```json
{
  "id": "google-traffic-onboarding",
  "name": "Google Traffic Onboarding",
  "stageId": "acquisition",
  "status": "in_review",
  "summary": "Onboarding для Google-трафика, перевод в assessment/challenge.",
  "goal": "Convert Google trial users into assessment purchase.",
  "trigger": "source_google=true",
  "exit": "Purchase",
  "reentry": "not_allowed",
  "owner": "marketing",
  "producer": "email",
  "briefPath": "development/google-traffic-onboarding/google_traffic_onboarding.html",
  "previewFolder": "preview/google-traffic-onboarding/",
  "developmentFolder": "development/google-traffic-onboarding/HTML/",
  "pushwoosh": {
    "journeyName": null,
    "journeyUrl": null,
    "status": "not_transferred"
  }
}
```

### Email

```json
{
  "id": "GTO-01",
  "status": "approved",
  "sendAt": "Day 3",
  "subject": "You've been trading for 3 days - here's what the next step actually looks like",
  "preheader": "The practice account is free. The funded account is where real money comes in.",
  "previewPath": "preview/google-traffic-onboarding/GTO_01.html",
  "developmentPath": "development/google-traffic-onboarding/HTML/GTO_01.html",
  "variables": ["first_name"],
  "ctas": [
    {
      "label": "Start Assessment GAME - EUR 20",
      "url": "https://sabiotrade.com/checkout",
      "purpose": "primary_conversion"
    }
  ],
  "pushwoosh": {
    "presetCode": null,
    "messageType": "marketing",
    "subscriptionCategory": "Product Updates",
    "senderMode": "from_preset",
    "subjectMode": "from_preset"
  }
}
```

### QA report

```json
{
  "campaignId": "google-traffic-onboarding",
  "emailId": "GTO-01",
  "version": "2026-05-21_approved",
  "status": "passed",
  "checks": [
    {
      "id": "subject_present",
      "status": "passed"
    },
    {
      "id": "unknown_variables",
      "status": "passed",
      "details": []
    }
  ],
  "createdAt": "2026-05-21T18:00:00+03:00"
}
```

### Pushwoosh handoff manifest

```json
{
  "campaignId": "google-traffic-onboarding",
  "campaignName": "Google Traffic Onboarding",
  "handoffVersion": "2026-05-21_approved",
  "handoffStatus": "pushwoosh_ready",
  "trigger": "Регистрация/попадание в сегмент source_google=true",
  "exit": "Purchase",
  "reentry": "Не указан",
  "emails": [
    {
      "emailId": "GTO-01",
      "htmlFile": "emails/GTO_01.html",
      "subject": "You've been trading for 3 days - here's what the next step actually looks like",
      "preheader": "The practice account is free. The funded account is where real money comes in.",
      "sendAt": "Day 3",
      "messageType": "marketing",
      "subscriptionCategory": "Product Updates",
      "requiredVariables": ["first_name"],
      "primaryCta": "https://sabiotrade.com/checkout"
    }
  ],
  "qa": {
    "status": "passed",
    "reportPath": "QA.md"
  }
}
```

## Status model

### Campaign statuses

| Status | Meaning | Who changes |
| --- | --- | --- |
| `idea` | Идея есть, brief еще не готов. | Product/Marketing |
| `briefing` | Собирается логика и входные данные. | Marketing |
| `copy_draft` | Copy пишется или правится. | Marketing/Copy |
| `html_draft` | HTML собирается в development. | Developer |
| `preview_ready` | Есть preview для ревью. | Developer |
| `in_review` | Идет review. | Marketing/Manager |
| `changes_requested` | Есть blocking comments. | Reviewer |
| `approved` | Copy/visual approved. | Marketing/Manager |
| `qa_passed` | Авто и ручная QA пройдены. | Developer/CRM |
| `pushwoosh_ready` | Можно передавать в Pushwoosh. | Developer/CRM |
| `transferred` | Пакет передан/создан в Pushwoosh. | CRM |
| `live` | Journey запущен. | CRM |
| `paused` | Journey остановлен. | CRM |
| `archived` | Кампания больше не используется. | Owner |

### Email statuses

| Status | Meaning |
| --- | --- |
| `draft` | Письмо еще меняется. |
| `preview_ready` | Можно смотреть в preview. |
| `in_review` | Открыто ревью. |
| `changes_requested` | Есть незакрытые замечания. |
| `approved` | Письмо принято. |
| `qa_failed` | Проверки не прошли. |
| `qa_passed` | Проверки прошли. |
| `pushwoosh_ready` | Готово к handoff. |
| `transferred` | Передано в Pushwoosh. |
| `live` | Запущено. |

### Comment statuses

Текущая модель уже хорошая:

| Status | Meaning |
| --- | --- |
| `open` | Нужно исправить или обсудить. |
| `applied` | Разработчик внес правку, нужен review. |
| `resolved` | Reviewer принял правку. |

Дополнительно можно добавить позже:

| Status | Meaning |
| --- | --- |
| `wont_fix` | Осознанно не исправляем. |
| `question` | Нужен ответ, не обязательно правка. |
| `blocked` | Нужна внешняя информация. |

## Pushwoosh integration notes

Проверено по официальной документации Pushwoosh 2026-05-21.

### Что важно для нашего сервиса

1. **Customer Journey email step использует Email preset**  
   В Journey email element можно выбрать существующий preset или создать/отредактировать контент из step settings.

2. **Subject может быть custom или from preset**  
   Если subject задан custom в journey step, он сохраняется в step и не синхронизируется с изменениями preset. Если выбран from preset, step использует текущий subject preset на момент отправки.

3. **Sender может быть from preset или manual**  
   Manual sender должен быть на verified domain. Это поле нельзя оставлять неявным в handoff.

4. **Marketing vs Transactional имеет разные delivery semantics**  
   Marketing respects subscription preferences, opt-outs и frequency capping. Transactional отправляется независимо от subscription status. Поэтому message type должен быть явным полем QA/handoff.

5. **Для Marketing нужен subscription category**  
   Category выбирается в Customer Journey email step и должна соответствовать preference center.

6. **Personalization может брать event/API attributes**  
   Для наших `{{variables}}` нужно фиксировать source: profile attribute, event attribute, API-based entry payload или voucher pool.

7. **Pushwoosh requires company address details in email footer**  
   Footer/compliance должен быть QA gate.

8. **`/createEmailMessage` deprecated**  
   Для новых прямых API integrations Pushwoosh рекомендует Messaging API v2 `Notify` с `platforms: ["EMAIL"]` и `email_payload`.

9. **Presets API существует, но требует осторожной проверки email-specific payload**  
   Документация Presets API описывает generic preset creation/list/get/delete. Для полноценной автоматизации email presets нужно отдельно проверить, какие email-specific fields реально поддерживаются для account/project.

### Практический вывод

MVP не должен обещать "одной кнопкой создать всю journey в Pushwoosh". Более надежный путь:

1. Сначала делать export package для ручной настройки Pushwoosh.
2. Затем добавить полуавтоматическое создание/обновление presets, если API payload стабильно подтвержден.
3. Затем добавить сохранение `presetCode` и `journeyUrl` обратно в сервис.
4. Только после этого рассматривать автоматизацию Journey setup.

### Useful Pushwoosh references

- Email in Customer Journey: https://docs.pushwoosh.com/product/messaging-channels/emails/sending-emails/send-emails-via-customer-journey/
- How to send emails: https://docs.pushwoosh.com/product/messaging-channels/emails/send-email/
- Email API: https://docs.pushwoosh.com/developer/api-reference/email-api/
- Presets API: https://docs.pushwoosh.com/developer/api-reference/presets-api/
- Email channel element: https://docs.pushwoosh.com/product/customer-journey/journey-elements/channels/email/

## MVP proposal

### MVP goal

Сделать текущий хаб рабочим операционным инструментом, который закрывает путь:

```text
Campaign metadata -> Preview -> Review -> QA -> Pushwoosh handoff package
```

### MVP scope

1. **Campaign/email statuses in metadata**
   - Добавить `status` на campaign и email.
   - Показывать status badges в hub/chain view.
   - Фильтровать по status.

2. **QA script**
   - Проверять HTML existence.
   - Проверять subject/preheader.
   - Извлекать variables из HTML.
   - Сравнивать variables с declared variables.
   - Проверять CTA links.
   - Проверять legal/footer markers.
   - Генерировать report.

3. **Pushwoosh package export**
   - Генерировать `manifest.json`.
   - Копировать approved HTML.
   - Генерировать `README.md` для CRM operator.
   - Генерировать `QA.md`.

4. **Review comments summary**
   - В chain view показывать counts: open/applied/resolved.
   - Блокировать `pushwoosh_ready`, если есть open comments.

5. **Version hash**
   - Для каждого exported email хранить hash HTML.
   - Показывать outdated warning, если source/preview изменился после approval.

### MVP non-goals

- Не строить полноценный drag-and-drop email editor.
- Не заменять Pushwoosh Journey Builder.
- Не строить user authentication beyond current lightweight review name, пока проект внутренний.
- Не автоматизировать production launch.
- Не пытаться сделать универсальную ESP-платформу.

## Suggested roadmap

### Phase 0 - Documentation and alignment

Цель: договориться о процессе.

Deliverables:

- Этот blueprint.
- Согласованный status model.
- Согласованный Pushwoosh handoff manifest.
- Список required fields для campaign/email.
- Решение, кто owns each status transition.

### Phase 1 - Operational metadata

Цель: превратить `campaign-data.js` из статичного справочника в operational source of truth.

Tasks:

- Добавить `status`, `owner`, `producer`, `priority`.
- Добавить `variables` на уровне campaign/email.
- Добавить `pushwoosh` metadata.
- Добавить `qa` metadata.
- Показать badges в UI.
- Добавить counts по comments.

### Phase 2 - QA automation

Цель: убрать ручные ошибки перед Pushwoosh.

Tasks:

- Создать `scripts/qa-email-package.js` или аналогичный скрипт.
- Извлекать variables regex pattern `{{variable_name}}`.
- Извлекать links из HTML.
- Проверять missing/empty links.
- Проверять subject/preheader consistency.
- Проверять required footer markers.
- Генерировать machine-readable JSON и human-readable Markdown.

### Phase 3 - Pushwoosh package export

Цель: один стабильный handoff для CRM operator.

Tasks:

- Создать `scripts/export-pushwoosh-package.js`.
- Экспортировать approved campaign.
- Копировать HTML в package.
- Генерировать `manifest.json`.
- Генерировать setup checklist.
- Генерировать per-email instructions.
- Показывать ссылку на package в chain view.

### Phase 4 - Review backend hardening

Цель: сделать comments production-safe.

Tasks:

- Завершить Supabase setup.
- Создать таблицу `review_comments`.
- Добавить Vercel env `SUPABASE_SERVICE_ROLE_KEY`.
- Добавить optional access token или Vercel Deployment Protection.
- Добавить audit fields для status updates.

### Phase 5 - Pushwoosh preset sync

Цель: уменьшить ручной перенос HTML.

Tasks:

- Проверить Pushwoosh API на sandbox/project.
- Создать adapter для list/get/create/update preset.
- Сохранять `presetCode` обратно в metadata.
- Добавить dry-run mode.
- Добавить diff local vs Pushwoosh preset.
- Требовать manual confirmation перед update.

### Phase 6 - Live tracking and analytics

Цель: закрыть цикл от production до результата.

Tasks:

- Сохранять journey URL/status.
- Добавить launch checklist.
- Добавить conversion goals metadata.
- Добавить post-launch notes.
- Добавить metrics import/manual fields.
- Показывать lifecycle coverage и performance.

## QA checklist for Pushwoosh-ready email

### Metadata

- Campaign ID задан.
- Email ID задан.
- Stage задан.
- Trigger задан.
- Send timing задан.
- Exit condition задан.
- Re-entry rule задан.
- Subject задан.
- Preheader задан.
- Message type задан: marketing или transactional.
- Subscription category задан для marketing.
- Sender mode задан: from preset или manual.
- Reply-to decision задан.

### HTML

- HTML файл существует в `development/`.
- HTML файл существует в `preview/`.
- Approved preview совпадает с source или имеет зафиксированный hash.
- Preheader hidden block есть.
- Header/logo есть.
- Main CTA есть.
- Все CTA имеют валидный `href`.
- Нет `href="#"`.
- Нет локальных file paths.
- Нет broken image URLs.
- Footer/legal block есть.
- Company address details есть.
- Mobile layout проверен.

### Personalization

- Все `{{variables}}` объявлены.
- Для каждой variable указан source.
- Для каждой variable есть fallback или решение "no fallback".
- Event attributes согласованы с backend/Pushwoosh.
- Voucher/promo logic согласована.
- Нет raw test values.

### Copy and offer

- Subject approved.
- Preheader approved.
- Body copy approved.
- CTA copy approved.
- Price/discount approved.
- Promo code approved.
- Deadline/urgency approved.
- Legal-sensitive statements approved.

### Pushwoosh

- Preset naming convention задан.
- Journey naming convention задан.
- Entry type задан: audience-based, trigger-based или API-based.
- Trigger event exists или явно marked as needs creation.
- Delay/wait rules заданы.
- Exit element задан.
- Conversion goal задан.
- Frequency capping decision задан.
- Send rate decision задан.
- Test recipient/list задан.
- Test send completed.
- Final approval recorded.

## Naming conventions

### Campaign slug

Use kebab-case:

```text
google-traffic-onboarding
assessment-progress-engagement
academy-subscription-onboarding
```

### Email ID

Use short stable business IDs:

```text
GTO-01
TR-06
FTE-C2
ASO-EV-07
```

### HTML filename

Use readable campaign-specific names:

```text
GTO_01.html
TR_06_Assessment_Passed.html
ASO_EV_07_Homework_Submitted.html
```

### Pushwoosh preset name

Recommended:

```text
ST_<CAMPAIGN_ID>_<EMAIL_ID>_<VERSION>
```

Example:

```text
ST_google-traffic-onboarding_GTO-01_20260521
```

### Journey name

Recommended:

```text
ST | <Lifecycle Stage> | <Campaign Name> | <Version>
```

Example:

```text
ST | Acquisition | Google Traffic Onboarding | 2026-05-21
```

## Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Pushwoosh API does not fully support email preset update as expected | Automation blocked | Start with export package; add API sync only after sandbox validation. |
| Metadata gets out of sync with HTML | Wrong subject/preheader/variables | Add QA comparing metadata vs HTML comments/preheader. |
| Review comments stay local only | Team loses feedback | Complete Supabase setup and deployment protection. |
| Approved version overwritten | Wrong HTML transferred | Use version hashes and immutable handoff packages. |
| Manual Pushwoosh setup errors | Wrong trigger/exit/category | Generate operator checklist from manifest. |
| Too much custom editor scope | Project becomes too large | Do not build WYSIWYG editor in MVP; use UI kit and HTML pipeline. |
| Legal/compliance footer missing | Delivery/compliance risk | Make footer check blocking for pushwoosh_ready. |
| Variables render raw in production | Bad user experience | Required variables registry and test payload preview. |

## Recommended implementation order

The fastest valuable path:

1. Add campaign/email status fields.
2. Render statuses in hub and chain view.
3. Add variables metadata.
4. Build QA script.
5. Build Pushwoosh package exporter.
6. Add package links to chain view.
7. Complete shared comments backend.
8. Add Pushwoosh preset code tracking.
9. Validate Pushwoosh API sync separately.

This gives operational value before any risky API automation.

## First technical tasks

### Task 1 - Extend campaign metadata

Add optional fields:

```js
status: "in_review",
owner: "Marketing",
producer: "Email",
priority: "high",
pushwoosh: {
  status: "not_transferred",
  journeyName: null,
  journeyUrl: null
}
```

For each email:

```js
status: "preview_ready",
variables: ["first_name"],
pushwoosh: {
  presetCode: null,
  messageType: "marketing",
  subscriptionCategory: "Product Updates"
}
```

### Task 2 - Add QA script

Command:

```bash
npm run qa:emails
```

Expected output:

```text
QA passed: 56
QA warning: 3
QA failed: 0
Report: reports/email-qa/2026-05-21.json
```

### Task 3 - Add package export

Command:

```bash
npm run export:pushwoosh -- google-traffic-onboarding
```

Expected output:

```text
pushwoosh-package/google-traffic-onboarding/2026-05-21_approved/
```

### Task 4 - Add UI gate

In chain view:

- Show `Open comments: N`.
- Show `QA status`.
- Show `Pushwoosh status`.
- Disable or mark export as blocked when:
  - open comments > 0;
  - QA failed;
  - email status not approved;
  - required metadata missing.

## Decision record

### Decision 1 - Build pre-Pushwoosh layer, not Pushwoosh replacement

Reason:

- Pushwoosh already handles delivery, journeys, subscription preferences and runtime sending.
- The current pain is operational production and handoff.
- Replacing Pushwoosh would create unnecessary scope and risk.

### Decision 2 - Use static-first architecture for MVP

Reason:

- Current Vercel static hosting works.
- `campaign-data.js` is simple and transparent.
- Review comments are the only dynamic feature, already isolated behind API.
- QA/export can run as scripts before deploy.

### Decision 3 - Make Pushwoosh handoff manifest the contract

Reason:

- It works whether setup is manual or API-driven.
- It creates one canonical payload for CRM operator.
- It allows future automation without redesigning the process.

## Open questions

1. Кто является final approver перед Pushwoosh: Marketing, CRM, Product или Growth?
2. Нужен ли реальный login/access control или достаточно Vercel Deployment Protection?
3. Какие Pushwoosh subscription categories существуют в текущем аккаунте?
4. Какие sender/from/reply-to правила утверждены?
5. Нужно ли хранить offer policy отдельно от campaign notes?
6. Нужно ли поддерживать локализации или только EN emails?
7. Где будет жить source of truth после MVP: `campaign-data.js`, JSON files, Supabase или CMS?
8. Нужно ли подтягивать live analytics из Pushwoosh или достаточно ручного status tracking?
9. Какие email clients являются обязательными для visual QA?
10. Кто отвечает за создание backend events, если campaign требует новых trigger events?

## Final recommendation

Проект имеет высокий потенциал как внутренний сервис, потому что уже содержит 70-80% скелета:

- контентная база;
- CJM metadata;
- preview;
- review;
- comments;
- versioning;
- deployment.

Следующий шаг не в том, чтобы переписать все с нуля. Следующий шаг - добавить операционные сущности:

- statuses;
- QA gates;
- variables registry;
- approved version hashes;
- Pushwoosh handoff manifest;
- package export.

После этого сервис начнет экономить время не только на создании HTML, но и на самом дорогом участке: предотвращении ошибок между задачей, ревью и production настройкой в Pushwoosh.
