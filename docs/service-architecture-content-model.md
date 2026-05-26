# Service Architecture and Content Model

Дата: 2026-05-26  
Контекст: архитектура внутреннего сервиса для создания, ревью, редактирования, QA и передачи email-цепочек SabioTrade в Pushwoosh.  
Связанные документы:

- `docs/email-ops-service-blueprint.md`
- `docs/multi-user-html-workflow.md`
- `docs/current-workflow-runbook.md`
- `docs/review-system-audit.md`

## 1. Цель документа

Этот документ фиксирует архитектурную модель сервиса вокруг email-цепочек:

- какие режимы просмотра и работы нужны;
- где хранить описание цепочки и исходную задачу;
- как разделить human-readable доку и machine-readable данные;
- как безопасно редактировать HTML из prompt;
- как связать preview, comments, AI edits, QA, versions и Pushwoosh handoff;
- как постепенно перейти от текущего статического хаба к полноценному workspace.

Главная мысль:

> Сервис должен быть не "HTML editor", а multi-mode workspace вокруг одного email artifact.

Один и тот же email artifact может открываться в разных режимах:

```text
List -> Chain -> Preview -> Review -> Prompt Edit -> QA -> Pushwoosh Handoff -> Versions
```

При этом источник правды должен быть структурирован так, чтобы человек мог понять задачу, а сервис мог безопасно читать данные и автоматизировать процесс.

## 2. Current baseline

Сейчас уже есть:

- `index.html` - CJM/list view.
- `chain.html` - chain detail view.
- `assets/campaign-data.js` - центральный реестр кампаний и писем.
- `assets/hub-app.js` - preview, review mode, comments UI.
- `api/review-comments.js` - backend для shared comments.
- `development/<campaign>/README.md` - короткие описания кампаний.
- `development/<campaign>/HTML/*.html` - рабочие HTML письма.
- `preview/<campaign>/*.html` - preview-версии.
- `sources/` - public source слой для менеджера/CRM, если включен sync.
- `docs/` - процессные документы.

Текущая модель уже доказала, что продуктовая логика правильная:

- цепочки видны в одном месте;
- письмо можно смотреть как preview;
- поверх preview можно оставлять comments;
- comments можно переводить по статусам;
- можно скачать HTML для Pushwoosh.

Следующий архитектурный шаг: добавить более строгую модель данных и режим prompt editing.

## 3. Core concepts

### 3.1 Campaign

Campaign - это цепочка коммуникаций, связанная с конкретным lifecycle moment.

Примеры:

- `google-traffic-onboarding`
- `abandoned-cart`
- `free-trial-expired`
- `academy-subscription-onboarding`

Campaign содержит:

- задачу;
- цель;
- audience;
- trigger;
- exit condition;
- re-entry;
- branch logic;
- список писем;
- Pushwoosh setup notes;
- approvals;
- live tracking.

### 3.2 Email

Email - отдельное письмо внутри campaign.

Email содержит:

- stable email ID;
- timing;
- subject;
- preheader;
- HTML source;
- preview path;
- variables;
- CTA inventory;
- status;
- QA status;
- Pushwoosh preset mapping.

### 3.3 Block

Block - смысловой фрагмент письма, к которому можно:

- привязать comment;
- применить prompt edit;
- подсветить QA issue;
- показать before/after diff;
- заблокировать редактирование;
- сопоставить preview element и source HTML fragment.

Примеры block roles:

- `preheader`
- `header`
- `hero`
- `intro`
- `proof`
- `offer`
- `primary_cta`
- `secondary_cta`
- `faq`
- `legal_footer`

### 3.4 Artifact

Artifact - конкретная версия конкретного email.

Artifact включает:

- source HTML;
- rendered preview;
- metadata;
- block map;
- hash;
- comments;
- edit proposals;
- QA report;
- approval state;
- handoff package.

### 3.5 Mode

Mode - способ работать с тем же artifact:

- list mode;
- chain mode;
- clean preview;
- review;
- prompt edit;
- QA;
- Pushwoosh handoff;
- version compare.

## 4. Modes of the workspace

### 4.1 List / CJM Mode

Назначение: увидеть всю карту email-коммуникаций.

Пользователь видит:

- stages lifecycle;
- campaigns;
- count emails;
- campaign status;
- open comments;
- QA status;
- Pushwoosh status;
- owner;
- priority.

Главные действия:

- открыть chain;
- фильтровать по stage/status/owner;
- увидеть "что блокирует запуск";
- перейти к campaign README/task.

Данные:

- campaign manifest;
- comments summary;
- QA summary;
- Pushwoosh status.

### 4.2 Chain Mode

Назначение: работать с одной цепочкой как с продуктовой сущностью.

Пользователь видит:

- описание задачи;
- trigger/exit/re-entry;
- branch logic;
- последовательность писем;
- timing;
- subject/preheader;
- status каждого письма;
- ссылки на preview, review, source, download;
- open questions;
- Pushwoosh setup notes.

Главные действия:

- открыть email preview;
- открыть review mode;
- открыть source/README;
- скачать approved HTML;
- запустить QA;
- export Pushwoosh package.

Данные:

- `development/<campaign>/README.md`
- `development/<campaign>/manifest.json`
- HTML files;
- comments;
- QA reports.

### 4.3 Source / Brief Mode

Назначение: читать не верстку, а смысловую задачу.

Это может быть отдельная вкладка в UI или ссылка на markdown/source.

Пользователь видит:

- why;
- audience;
- trigger;
- exit;
- emails sequence;
- branch logic;
- business goal;
- copy notes;
- offer restrictions;
- Pushwoosh setup;
- decision log.

Главные действия:

- открыть GitHub issue/task;
- обновить README;
- посмотреть decision log;
- проверить, почему письмо вообще существует.

Важно:

> Comments не заменяют brief. Comments - это замечания к конкретной версии. Brief/README - это утвержденное описание задачи и цепочки.

### 4.4 Clean Preview Mode

Назначение: увидеть письмо без рабочих слоев.

Пользователь видит:

- письмо как можно ближе к тому, что получатель увидит в email client;
- переключатель desktop/mobile;
- raw tokens / sample values;
- open separately;
- download HTML.

Главные действия:

- визуально проверить верстку;
- скачать HTML;
- открыть в отдельной вкладке.

В clean mode не должно быть:

- comment pins;
- outlines;
- AI edit controls;
- QA overlays;
- debug labels.

### 4.5 Review Mode

Назначение: обсуждать письмо через comments поверх preview.

Пользователь видит:

- preview;
- clickable blocks/elements;
- comment pins;
- comments list;
- statuses;
- author;
- sync status.

Главные действия:

- оставить comment на блоке;
- открыть comment;
- mark applied;
- resolve;
- reopen;
- export comments.

Текущая модель comments:

```text
open -> applied -> resolved
```

Архитектурное требование:

> Comment должен ссылаться на stable block ID, а не только на CSS selector.

CSS selector через `nth-of-type` может ломаться после правки HTML. Для будущего prompt-edit и надежного review нужен block model.

### 4.6 Prompt Edit Mode

Назначение: редактировать выбранный блок через AI prompt, но безопасно и контролируемо.

Этот режим не должен быть "AI, перепиши все письмо". Он должен быть:

```text
Select block -> Prompt -> AI proposal -> Diff -> Accept/Reject -> QA -> Save
```

Пользователь видит:

- preview;
- selectable blocks;
- selected block outline;
- prompt input;
- suggested edit;
- before/after diff;
- warning, если AI вышел за границы блока;
- apply/reject buttons.

Главные действия:

- выбрать блок;
- написать prompt;
- получить proposal;
- посмотреть diff;
- принять или отклонить;
- сохранить как edit proposal;
- обновить preview.

Примеры prompt:

```text
Сделай этот hero мягче и менее salesy.
```

```text
Сократи блок на 30%, не меняя CTA.
```

```text
Перепиши CTA под более спокойный тон, без давления.
```

```text
Сделай текст понятнее для новичка, но не меняй структуру таблиц.
```

Ограничения:

- AI меняет только выбранный block.
- AI не меняет legal footer, если block locked.
- AI не меняет ссылки без явного разрешения.
- AI не меняет variables без явного разрешения.
- AI не меняет layout/table structure, если задача copy-only.
- Любое изменение применяется только после accept.
- После accept запускается QA.

### 4.7 QA Mode

Назначение: подсвечивать проблемы поверх preview и в списке checks.

Пользователь видит:

- failed/warning/passed checks;
- подсветку проблемных блоков;
- unknown variables;
- missing CTA;
- placeholder text;
- subject/preheader mismatch;
- missing footer/legal;
- broken path;
- outdated preview.

Главные действия:

- открыть проблемный блок;
- перейти в source;
- создать comment;
- отправить в prompt edit;
- rerun QA.

QA может быть:

- automatic;
- manual;
- blocking;
- warning-only.

### 4.8 Pushwoosh Handoff Mode

Назначение: собрать и проверить все, что нужно CRM/Pushwoosh operator.

Пользователь видит:

- final HTML;
- subject;
- preheader;
- sender/from/reply-to;
- message type;
- subscription category;
- variables;
- trigger;
- timing;
- exit;
- re-entry;
- branch logic;
- QA status;
- approval status;
- Pushwoosh preset code;
- journey URL/status.

Главные действия:

- export package;
- download HTML;
- copy subject/preheader;
- mark transferred;
- save Pushwoosh preset code;
- mark live.

### 4.9 Version / Diff Mode

Назначение: видеть, что изменилось между версиями.

Пользователь видит:

- version history;
- before/after preview;
- HTML diff;
- metadata diff;
- comments carried over or orphaned;
- QA status per version;
- production-before-deploy snapshots.

Главные действия:

- сравнить approved vs current;
- восстановить previous version;
- понять, почему comment потерял target;
- посмотреть, какая версия ушла в Pushwoosh.

### 4.10 Analytics Mode

Не MVP, но логичное будущее.

Пользователь видит:

- delivery/open/click/conversion metrics;
- campaign performance;
- per-email performance;
- branch performance;
- notes for next iteration.

Главные действия:

- attach post-launch metrics;
- create follow-up task;
- archive or iterate campaign.

## 5. Source of truth strategy

Нужно разделить human-readable и machine-readable source of truth.

### 5.1 Human-readable source

Хранится в:

```text
development/<campaign>/README.md
```

Назначение:

- объяснить задачу;
- сохранить продуктовый контекст;
- описать логику цепочки;
- зафиксировать решения;
- дать CRM/manager понятное описание без чтения JSON.

README отвечает на вопрос:

> Что это за цепочка, зачем она нужна, как она должна работать и что важно не забыть?

### 5.2 Machine-readable source

Хранится в:

```text
development/<campaign>/manifest.json
```

Назначение:

- дать сервису структурированные данные;
- генерировать hub/chain UI;
- запускать QA;
- собирать Pushwoosh package;
- связывать HTML, variables, blocks, comments, versions.

Manifest отвечает на вопрос:

> Какие точные данные должен понимать сервис?

### 5.3 Current transitional source

Сейчас роль machine-readable source частично выполняет:

```text
assets/campaign-data.js
```

Целевая архитектура:

```text
development/<campaign>/manifest.json -> generated assets/campaign-data.js -> UI
```

На переходном этапе можно поддерживать оба источника:

- `campaign-data.js` остается для существующего UI;
- `manifest.json` появляется постепенно;
- позже скрипт собирает `campaign-data.js` из manifests.

### 5.4 GitHub Issue / task source

GitHub issue или external task tracker хранит живое обсуждение задачи:

- кто делает;
- что обсуждали;
- промежуточные решения;
- PR links;
- checklist;
- assignee;
- deadline.

В README и manifest нужно хранить ссылку:

```text
taskUrl: https://github.com/lx-grzdv/sabiotrade-emails/issues/123
```

GitHub issue не должен быть единственным местом описания цепочки, потому что:

- issue может закрыться;
- discussion шумный;
- сервису трудно читать структуру;
- новым людям сложно понять итоговую approved logic.

Лучший принцип:

```text
Issue = work conversation
README = approved human-readable spec
Manifest = service-readable spec
HTML = email source
Comments = version-specific feedback
QA report = readiness evidence
```

## 6. Recommended campaign folder structure

Целевая структура:

```text
development/
  google-traffic-onboarding/
    README.md
    manifest.json
    sample-data.json
    decisions.md
    changelog.md
    google_traffic_onboarding.docx
    HTML/
      GTO_01.html
      GTO_02.html
      GTO_03.html
```

### 6.1 `README.md`

Human-readable campaign brief.

Обязательные разделы:

- title;
- status;
- task link;
- owner;
- goal;
- audience;
- why now;
- trigger;
- exit condition;
- re-entry;
- sequence;
- variables;
- branch logic;
- Pushwoosh setup;
- QA notes;
- open questions;
- decision log.

### 6.2 `manifest.json`

Machine-readable campaign model.

Используется для:

- hub rendering;
- chain rendering;
- QA;
- prompt edit context;
- Pushwoosh export;
- versioning.

### 6.3 `sample-data.json`

Example values для preview.

Пример:

```json
{
  "default": {
    "first_name": "Alex",
    "plan_name": "Essential",
    "plan_balance": "$20,000",
    "checkout_url": "https://sabiotrade.com/checkout"
  },
  "edgeCases": {
    "long_first_name": {
      "first_name": "Christopher",
      "plan_name": "Supreme",
      "plan_balance": "$200,000",
      "checkout_url": "https://sabiotrade.com/checkout"
    }
  }
}
```

Используется для:

- raw tokens / sample values toggle;
- visual QA;
- subject/preheader length QA;
- variable coverage.

### 6.4 `decisions.md`

Decision log.

Пример:

```md
# Decisions

## 2026-05-26 - Do not mention discount in GTO-01

Reason: GTO-01 is education-first. Discount pressure starts only after failed assessment.

Owner: Growth
```

### 6.5 `changelog.md`

История campaign-level changes.

Пример:

```md
# Changelog

## 2026-05-26

- Updated GTO-02 CTA.
- Added `checkout_url` as required variable.
- Marked GTO-01 as approved.
```

## 7. README template

Рекомендуемый шаблон:

```md
# Campaign Name

## Status

`html_draft` / `in_review` / `approved` / `pushwoosh_ready` / `live`

## Task

- Task URL:
- Owner:
- Producer:
- Reviewer:
- Priority:
- Deadline:

## Goal

What this chain should achieve.

## Audience

Who enters the chain.

## Why Now

Why this lifecycle moment matters.

## Trigger

Entry event/condition.

## Exit Condition

What removes user from the chain.

## Re-entry

Whether user can enter again and under which conditions.

## Sequence

| Email ID | Timing | Goal | Status |
| --- | --- | --- | --- |
| GTO-01 | Day 3 | Explain next step | in_review |

## Branch Logic

Describe branches and priority.

## Variables

| Variable | Source | Required | Fallback |
| --- | --- | --- | --- |
| `first_name` | profile | yes | `there` |

## Pushwoosh Setup

- Journey name:
- Entry:
- Message type:
- Subscription category:
- Sender:
- Exit:
- Conversion goal:

## QA Notes

Known checks or risks.

## Open Questions

- [ ] Question 1

## Decision Log

Latest decisions or link to `decisions.md`.
```

## 8. Manifest schema

Initial schema can be simple and grow over time.

```json
{
  "schemaVersion": 1,
  "id": "google-traffic-onboarding",
  "name": "Google Traffic Onboarding",
  "stageId": "acquisition",
  "status": "in_review",
  "summary": "Onboarding для Google-трафика, перевод в assessment/challenge.",
  "task": {
    "url": "https://github.com/lx-grzdv/sabiotrade-emails/issues/123",
    "type": "new_campaign",
    "priority": "high",
    "owner": "Growth",
    "producer": "Email",
    "reviewer": "CRM"
  },
  "lifecycle": {
    "goal": "Convert Google traffic trial users into assessment purchase.",
    "audience": "Users from Google traffic who registered but have not purchased.",
    "trigger": "source_google=true",
    "exit": "Purchase",
    "reentry": "not_specified"
  },
  "paths": {
    "brief": "development/google-traffic-onboarding/README.md",
    "developmentFolder": "development/google-traffic-onboarding/HTML/",
    "previewFolder": "preview/google-traffic-onboarding/",
    "sourcesFolder": "sources/google-traffic-onboarding/"
  },
  "variables": [
    {
      "name": "first_name",
      "source": "profile",
      "required": true,
      "fallback": "there"
    }
  ],
  "emails": [
    {
      "id": "GTO-01",
      "status": "in_review",
      "sendAt": "Day 3",
      "goal": "Explain the next step from trial to assessment.",
      "subject": "You've been trading for 3 days - here's what the next step actually looks like",
      "preheader": "The practice account is free. The funded account is where real money comes in.",
      "paths": {
        "html": "development/google-traffic-onboarding/HTML/GTO_01.html",
        "preview": "preview/google-traffic-onboarding/GTO_01.html"
      },
      "variables": ["first_name"],
      "blocks": [
        {
          "id": "hero",
          "role": "hero",
          "editable": true
        },
        {
          "id": "primary_cta",
          "role": "cta",
          "editable": true,
          "allowUrlEdit": false
        },
        {
          "id": "legal_footer",
          "role": "footer",
          "editable": false
        }
      ],
      "pushwoosh": {
        "messageType": "marketing",
        "subscriptionCategory": "Product Updates",
        "senderMode": "from_preset",
        "presetCode": null
      }
    }
  ],
  "pushwoosh": {
    "journeyName": "ST | Acquisition | Google Traffic Onboarding | 2026-05-26",
    "journeyUrl": null,
    "status": "not_transferred"
  }
}
```

## 9. Block model

Prompt editing and reliable comments require stable block IDs.

### 9.1 HTML attributes

Preferred pattern:

```html
<table
  role="presentation"
  data-email-block-id="hero"
  data-email-block-role="hero"
  data-email-editable="true"
>
  ...
</table>
```

For CTA:

```html
<table
  role="presentation"
  data-email-block-id="primary_cta"
  data-email-block-role="cta"
  data-email-editable="true"
  data-email-lock-url="true"
>
  ...
</table>
```

For footer:

```html
<table
  role="presentation"
  data-email-block-id="legal_footer"
  data-email-block-role="footer"
  data-email-editable="false"
>
  ...
</table>
```

### 9.2 HTML comment fallback

If attributes are hard to place in some email clients, use comments:

```html
<!-- EMAIL_BLOCK id="hero" role="hero" editable="true" -->
...
<!-- /EMAIL_BLOCK id="hero" -->
```

Attributes are better for browser preview and click mapping. Comments are useful for parser/source mapping.

Recommended: use both for important blocks.

### 9.3 Block ID naming

Use stable snake_case:

```text
preheader
header
hero
intro
problem
solution
offer
primary_cta
secondary_cta
faq
support
legal_footer
```

For repeated blocks:

```text
benefit_1
benefit_2
benefit_3
step_1
step_2
step_3
```

Do not use:

- visual order only: `block_1`, `block_2`;
- temporary names: `new_block`, `test`;
- content-dependent IDs that will change with copy.

### 9.4 Block metadata

Each block can have:

```json
{
  "id": "primary_cta",
  "role": "cta",
  "editable": true,
  "allowCopyEdit": true,
  "allowStyleEdit": false,
  "allowUrlEdit": false,
  "lockedReason": null,
  "qa": {
    "requiresHref": true,
    "requiresTracking": true
  }
}
```

### 9.5 Why block IDs matter

They solve multiple problems:

- comments do not break after layout changes;
- AI prompt edit can target exact source fragment;
- QA can highlight exact problematic area;
- version diff can show block-level changes;
- approvals can be per block;
- locked/legal blocks can be protected.

## 10. Prompt Edit Mode architecture

### 10.1 Principle

Prompt editing must create proposals, not directly overwrite source.

```text
User prompt -> AI proposal -> diff -> human accept -> source update -> QA -> preview
```

### 10.2 Edit proposal object

```json
{
  "id": "editprop_20260526_001",
  "campaignId": "google-traffic-onboarding",
  "emailId": "GTO-01",
  "blockId": "hero",
  "prompt": "Сделай hero мягче и короче.",
  "mode": "copy_only",
  "baseHtmlHash": "sha256:...",
  "baseBlockHash": "sha256:...",
  "proposedHtml": "<table ...>...</table>",
  "diffSummary": "Shortened headline and softened urgency.",
  "status": "proposed",
  "createdBy": "Alex",
  "createdAt": "2026-05-26T12:00:00+03:00",
  "acceptedBy": null,
  "acceptedAt": null
}
```

Statuses:

```text
proposed -> accepted -> applied -> qa_passed
proposed -> rejected
proposed -> expired
```

### 10.3 Edit modes

| Mode | AI may change | AI must not change |
| --- | --- | --- |
| `copy_only` | Text content | HTML structure, styles, links, variables |
| `cta_copy` | CTA label | CTA URL, layout |
| `tone` | Wording/tone | Offer facts, URLs, variables |
| `shorten` | Text length | Meaning, CTA, legal |
| `translate` | Text content | Variables, URLs |
| `layout_safe` | Minor spacing/text wrapping | Table structure unless explicit |
| `full_block` | Whole selected block | Outside selected block |

Default should be `copy_only`.

### 10.4 Prompt context

AI should receive:

- campaign summary;
- email goal;
- selected block HTML;
- block role;
- allowed edit mode;
- forbidden changes;
- variables list;
- brand/tone guidance;
- current subject/preheader if relevant;
- surrounding text for context, but not editable;
- QA rules.

Example system context for block edit:

```text
You are editing one block in an HTML email.
Only modify the selected block.
Do not change URLs.
Do not remove or rename variables like {{first_name}}.
Keep table-based email-safe HTML.
Return only the replacement HTML for the selected block.
```

### 10.5 Diff and accept

Before applying:

- show rendered before/after;
- show text diff;
- show HTML diff for developers;
- show variables added/removed;
- show links added/removed;
- show QA warnings.

Accept button should be disabled if:

- block hash changed since proposal;
- AI changed outside selected block;
- required variable removed;
- locked block modified;
- QA has blocking errors.

### 10.6 Source patching

Safe patching requires:

1. Find block by `data-email-block-id` or comment marker.
2. Confirm current block hash equals `baseBlockHash`.
3. Replace only block fragment.
4. Save source HTML.
5. Re-run sync preview.
6. Re-run QA.
7. Record applied edit proposal.

If hash mismatch:

```text
Proposal expired: source block changed after proposal was generated.
```

### 10.7 Prompt edit storage

MVP options:

- store proposals as JSON files in repo;
- store proposals in Supabase;
- store only applied changes in Git history and comments.

Recommended:

- MVP: applied changes in Git + optional local proposal preview;
- production: Supabase table `email_edit_proposals`.

Potential table:

```sql
create table email_edit_proposals (
  id text primary key,
  campaign_id text not null,
  email_id text not null,
  block_id text not null,
  prompt text not null,
  mode text not null,
  base_html_hash text,
  base_block_hash text,
  proposed_html text not null,
  diff_summary text,
  status text not null,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_by text,
  accepted_at timestamptz
);
```

## 11. QA architecture

### 11.1 QA engine

QA should read:

- campaign manifest;
- email HTML;
- block map;
- sample data;
- comments status;
- Pushwoosh metadata.

QA should output:

- JSON report;
- Markdown report;
- UI overlay issues.

### 11.2 QA check categories

Metadata:

- missing subject;
- missing preheader;
- missing status;
- missing trigger;
- missing exit;
- missing Pushwoosh message type;
- missing subscription category for marketing.

HTML:

- missing file;
- missing preheader block;
- missing header;
- missing primary CTA;
- missing footer;
- placeholder text;
- TODO text;
- local file URLs;
- empty links;
- broken image links if checkable.

Variables:

- unknown variable in HTML;
- declared variable not used;
- required variable missing sample data;
- variable removed by edit proposal.

Blocks:

- missing block IDs;
- duplicate block IDs;
- locked block changed;
- comment target not found.

Review:

- open blocking comments;
- applied comments not resolved;
- missing reviewer approval.

Pushwoosh:

- missing sender;
- missing message type;
- missing category;
- missing preset code after transfer;
- missing journey URL after launch.

### 11.3 QA severity

```text
blocking
warning
info
passed
```

Blocking examples:

- missing HTML;
- missing subject;
- missing primary CTA;
- missing legal footer;
- unknown required variable;
- open blocking comments;
- marketing email without subscription category.

Warning examples:

- long subject;
- placeholder image;
- no sample data for optional variable;
- no block IDs yet.

## 12. Comments architecture

Comments should evolve from element selectors to block-aware comments.

Current model:

- selector;
- reviewId;
- textQuote;
- status;
- author.

Target model:

```json
{
  "id": "comment_001",
  "campaignId": "abandoned-cart",
  "emailId": "AC-01",
  "versionHash": "sha256:...",
  "blockId": "hero",
  "selector": "[data-email-block-id=\"hero\"]",
  "textQuote": "You left {{plan_name}} in your cart...",
  "comment": "Tone feels too aggressive.",
  "status": "open",
  "severity": "blocking",
  "authorName": "Maria",
  "createdAt": "2026-05-26T12:00:00+03:00",
  "statusHistory": [
    {
      "from": null,
      "to": "open",
      "by": "Maria",
      "at": "2026-05-26T12:00:00+03:00"
    }
  ]
}
```

Important:

- comments belong to version context;
- if block disappears, comment becomes orphaned but remains visible;
- comments should be linkable to prompt edit proposals.

Example:

```text
Comment -> Create prompt edit -> AI proposal -> Accept -> Mark applied
```

## 13. Versioning architecture

Versioning should cover:

- source HTML hash;
- preview HTML hash;
- manifest hash;
- QA report;
- comments state at approval;
- Pushwoosh handoff package.

### 13.1 Version object

```json
{
  "versionId": "2026-05-26_approved",
  "campaignId": "google-traffic-onboarding",
  "emailId": "GTO-01",
  "sourceHtmlHash": "sha256:...",
  "previewHtmlHash": "sha256:...",
  "manifestHash": "sha256:...",
  "status": "approved",
  "createdAt": "2026-05-26T12:00:00+03:00",
  "createdBy": "Alex",
  "qaReportPath": "reports/qa/google-traffic-onboarding/GTO-01/2026-05-26.json"
}
```

### 13.2 Approval rule

Approval should freeze:

- email HTML hash;
- subject;
- preheader;
- variables list;
- Pushwoosh handoff fields.

If any of those change after approval:

```text
Approval invalidated -> back to in_review or qa_required
```

## 14. Pushwoosh handoff architecture

Pushwoosh handoff should be generated from manifest + approved HTML + QA report.

### 14.1 Handoff package

```text
pushwoosh-package/
  google-traffic-onboarding/
    2026-05-26_approved/
      manifest.json
      README.md
      QA.md
      emails/
        GTO_01.html
        GTO_02.html
        GTO_03.html
```

### 14.2 Handoff manifest

```json
{
  "campaignId": "google-traffic-onboarding",
  "version": "2026-05-26_approved",
  "status": "pushwoosh_ready",
  "trigger": "source_google=true",
  "exit": "Purchase",
  "reentry": "not_specified",
  "emails": [
    {
      "id": "GTO-01",
      "htmlFile": "emails/GTO_01.html",
      "subject": "...",
      "preheader": "...",
      "sendAt": "Day 3",
      "messageType": "marketing",
      "subscriptionCategory": "Product Updates",
      "variables": ["first_name"],
      "primaryCta": "https://sabiotrade.com/checkout"
    }
  ]
}
```

### 14.3 Transfer tracking

After CRM/Pushwoosh operator configures Pushwoosh:

```json
{
  "pushwoosh": {
    "status": "transferred",
    "journeyName": "ST | Acquisition | Google Traffic Onboarding | 2026-05-26",
    "journeyUrl": "https://go.pushwoosh.com/...",
    "transferredAt": "2026-05-26T15:00:00+03:00",
    "transferredBy": "CRM",
    "emails": {
      "GTO-01": {
        "presetCode": "ABCDE-12345"
      }
    }
  }
}
```

## 15. Application architecture

### 15.1 MVP static-first architecture

Current project can stay static-first:

```text
Git repo
  development/
  preview/
  sources/
  assets/
  docs/

Build/sync scripts
  sync-preview
  sync-sources
  qa
  export-pushwoosh

Vercel static hosting
  index.html
  chain.html
  assets/*
  preview/*
  sources/*

Vercel API
  review-comments
  download-html
```

Data flow:

```text
manifest/README/HTML in Git
  -> sync scripts
  -> generated campaign-data.js
  -> Vercel UI
  -> comments in Supabase
  -> QA/export packages in repo or build artifacts
```

### 15.2 Target service architecture

Later:

```text
Frontend workspace
  List / Chain / Preview / Review / Prompt Edit / QA / Pushwoosh

Content API
  reads manifests, HTML, versions, comments

Parser/indexer
  extracts blocks, variables, CTAs, hashes

AI edit service
  creates scoped proposals

QA engine
  validates artifacts

Export service
  creates Pushwoosh package

Storage
  Git for source
  Supabase/Postgres for comments, proposals, statuses
  object storage for snapshots/packages if needed
```

### 15.3 Why keep Git as source

Git is good for:

- HTML version control;
- PR review;
- rollback;
- team collaboration;
- audit trail;
- branch-based experimentation.

Database is good for:

- comments;
- edit proposals;
- user/session state;
- status history;
- runtime UI state.

Do not move all source HTML into DB too early. That would make Cursor/Codex/Git workflows worse.

Recommended split:

```text
Git = durable source and approved changes
DB = collaboration metadata and workflow state
Vercel/static = preview/handoff UI
Pushwoosh = delivery runtime
```

## 16. API surface

Potential endpoints:

### Read

```text
GET /api/campaigns
GET /api/campaigns/:campaignId
GET /api/campaigns/:campaignId/emails/:emailId
GET /api/campaigns/:campaignId/emails/:emailId/blocks
GET /api/campaigns/:campaignId/emails/:emailId/qa
GET /api/campaigns/:campaignId/emails/:emailId/versions
```

### Comments

```text
GET /api/review-comments?campaignId=...
POST /api/review-comments
PATCH /api/review-comments
```

Already partially implemented.

### Prompt edit

```text
POST /api/edit-proposals
GET /api/edit-proposals?campaignId=...&emailId=...
PATCH /api/edit-proposals/:id
POST /api/edit-proposals/:id/apply
```

### QA

```text
POST /api/qa/run
GET /api/qa/report/:reportId
```

### Export

```text
POST /api/pushwoosh/export
GET /api/pushwoosh/package/:packageId
```

### Pushwoosh sync, later

```text
POST /api/pushwoosh/presets/dry-run
POST /api/pushwoosh/presets/sync
PATCH /api/pushwoosh/status
```

## 17. Permissions model

MVP may stay lightweight, but target roles:

| Role | Can view | Can comment | Can prompt edit | Can approve | Can export | Can mark live |
| --- | --- | --- | --- | --- | --- | --- |
| Viewer | yes | no | no | no | no | no |
| Reviewer | yes | yes | no | yes | no | no |
| Producer | yes | yes | yes | no | yes | no |
| CRM | yes | yes | no | no | yes | yes |
| Admin | yes | yes | yes | yes | yes | yes |

Important actions need stronger permission:

- clear comments;
- accept AI edit;
- mark approved;
- export Pushwoosh package;
- mark live;
- edit locked legal block.

## 18. Concurrency and safety

### 18.1 Source editing

For source HTML:

- use Git branches;
- one owner per file;
- PR review;
- no direct edits in `preview/`.

### 18.2 Prompt editing

For AI proposals:

- store base hash;
- reject apply if source changed;
- restrict to block;
- require accept;
- run QA after apply.

### 18.3 Comments

For comments:

- store blockId;
- keep textQuote;
- detect orphaned targets;
- keep status history.

## 19. Migration plan

### Phase 1 - Standardize campaign docs

For each campaign:

- expand `README.md` using template;
- add task link if known;
- add variables;
- add Pushwoosh setup notes;
- add open questions.

### Phase 2 - Add manifests

For each campaign:

- create `manifest.json`;
- copy current data from `assets/campaign-data.js`;
- add variables;
- add statuses;
- add pushwoosh fields;
- add block definitions where known.

### Phase 3 - Add block IDs

For each email:

- add `data-email-block-id` to major blocks;
- add comment markers for source parsing;
- update review UI to prefer blockId;
- keep selector fallback.

### Phase 4 - Generate `campaign-data.js`

Build script:

```text
development/*/manifest.json -> assets/campaign-data.js
```

This removes duplicate manual metadata.

### Phase 5 - QA and export

Add:

- QA script;
- QA reports;
- Pushwoosh package export.

### Phase 6 - Prompt edit MVP

Add:

- select block;
- prompt input;
- AI proposal;
- diff;
- accept/reject;
- source patch;
- QA rerun.

Start with copy-only edits on a small set of campaigns.

## 20. Non-goals

Not in near-term scope:

- full drag-and-drop email builder;
- replacing Pushwoosh Journey Builder;
- storing all HTML only in database;
- automatic live launch without human review;
- AI rewriting entire campaign without block-level control;
- visual editing arbitrary table layout like Figma;
- multi-tenant SaaS product.

## 21. Design decisions

### Decision 1 - Keep preview as the center

Reason:

- reviewers think visually;
- comments need visual anchors;
- prompt edit should start from visible block;
- QA overlays are easiest on rendered preview.

### Decision 2 - Use block-scoped AI edits

Reason:

- email HTML is fragile;
- Outlook-safe table layout can break easily;
- small diffs are reviewable;
- permissions can lock sensitive blocks.

### Decision 3 - Keep campaign README and manifest separate

Reason:

- humans need narrative;
- service needs structured data;
- mixing everything into JSON makes context unreadable;
- keeping everything only in markdown makes automation brittle.

### Decision 4 - Git remains source of approved changes

Reason:

- team already uses Codex/Cursor/GitHub;
- HTML diffs and rollback matter;
- PRs create natural review gates;
- service can be built around Git instead of replacing it.

## 22. Practical next tasks

Recommended order:

1. Create this architecture doc.
2. Define campaign README template.
3. Create first `manifest.json` for one campaign, ideally `google-traffic-onboarding` or `abandoned-cart`.
4. Add block IDs to one email.
5. Update review logic to prefer `data-email-block-id`.
6. Add QA check for missing/duplicate block IDs.
7. Add raw tokens / sample values mode using `sample-data.json`.
8. Add edit proposal data model.
9. Prototype prompt edit on one block with copy-only mode.
10. Add Pushwoosh package export from manifest.

## 23. Minimal first experiment

Pick one email:

```text
development/google-traffic-onboarding/HTML/GTO_01.html
```

Add:

```text
development/google-traffic-onboarding/manifest.json
development/google-traffic-onboarding/sample-data.json
```

Mark 5 blocks:

```text
preheader
header
hero
primary_cta
legal_footer
```

Then implement:

- review comments use blockId;
- QA finds variables and links;
- prompt edit can rewrite `hero` copy only;
- proposal shows diff;
- accept applies only if block hash unchanged.

This proves the architecture without touching all 59 emails.

## 24. Final recommendation

The service should evolve into this shape:

```text
Git repo as source
  README.md for humans
  manifest.json for service
  HTML with stable block IDs
  sample-data.json for realistic preview

Workspace UI
  List
  Chain
  Clean Preview
  Review
  Prompt Edit
  QA
  Pushwoosh Handoff
  Versions

Collaboration backend
  comments
  edit proposals
  status history

Automation
  QA
  package export
  later Pushwoosh preset sync
```

The key design constraint:

> AI should never be allowed to silently rewrite the email artifact. It should propose a scoped patch to a known block, show a diff, pass QA, and wait for human accept.

This keeps the tool powerful enough to speed up production, but disciplined enough for real CRM/email operations.
