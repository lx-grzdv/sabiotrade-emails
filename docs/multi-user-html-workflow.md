# Multi-user HTML Workflow

Дата: 2026-05-21  
Контекст: работа нескольких людей над HTML-письмами SabioTrade в Codex, Cursor и preview hub.

## Short version

Несколько людей могут работать над email HTML параллельно, но не должны редактировать один и тот же файл в одной общей Google Drive-папке без Git.

Канонический GitHub repo:

```text
https://github.com/lx-grzdv/sabiotrade-emails
```

Рекомендуемая схема:

```text
lx-grzdv/sabiotrade-emails -> отдельная branch на задачу -> Codex/Cursor правит HTML -> PR preview -> review -> merge -> production preview -> Pushwoosh handoff
```

Codex и Cursor здесь не являются "общим редактором". Это рабочие инструменты поверх нормального version control процесса.

## Repository setup

Каждый участник должен работать не в случайной копии папки, а в своем локальном clone репозитория:

```bash
git clone https://github.com/lx-grzdv/sabiotrade-emails.git
cd sabiotrade-emails
```

Перед началом задачи:

```bash
git switch main
git pull
git switch -c feature/<short-task-name>
```

Если рабочая папка уже существует, нужно проверить, что это именно Git checkout:

```bash
git status
git remote -v
```

Ожидаемый remote:

```text
origin  https://github.com/lx-grzdv/sabiotrade-emails.git
```

Если `git status` пишет `not a git repository`, значит папка не подключена к Git. В такой папке можно читать файлы и делать черновую работу, но командный процесс, PR review и защита от перезаписи работать не будут.

## Why this matters

HTML-письма неудобны для одновременного редактирования:

- файлы большие;
- много inline styles;
- таблицы легко сломать случайной правкой;
- изменения плохо видны глазами;
- Google Drive sync может перезаписать или создать conflict copy;
- два человека могут поменять subject/preheader/CTA в разных местах;
- preview может устареть относительно `development/`;
- approved версия может потеряться перед Pushwoosh.

Поэтому для нескольких людей нужен процесс с ownership, ветками, review и version history.

## Folder ownership rules

### `development/`

Источник правды для работы над письмами.

Правила:

- HTML правится здесь.
- `.docx` и source brief хранятся здесь.
- Новые письма сначала появляются здесь.
- Один человек owns один HTML-файл на время задачи.
- Нельзя одновременно править один и тот же HTML-файл двум людям без явного согласования.

### `preview/`

Публичная preview-зона.

Правила:

- Руками не редактировать, если источник есть в `development/`.
- Обновлять через:

```bash
npm run sync-preview
```

- Preview используется для review и stakeholder viewing.
- Перед Pushwoosh надо убедиться, что preview соответствует approved source.

### `assets/campaign-data.js`

Каноническая карта кампаний и писем.

Правила:

- Менять осторожно.
- Здесь живут campaign ID, email ID, subject, preheader, paths, trigger, exit, re-entry.
- Если меняется subject/preheader в HTML, нужно обновить и metadata.
- Лучше, чтобы в один момент этот файл правил один человек.
- Изменения в metadata должны проходить review.

### `Templates & Examples/`

UI kit и примеры.

Правила:

- Не менять случайно в рамках обычной email-задачи.
- Любое изменение UI kit влияет на будущие письма.
- Изменения в kit должны быть отдельной задачей.

### `docs/`

Процессная документация.

Правила:

- Документировать новые решения сразу.
- Если workflow поменялся, обновлять docs вместе с кодом/HTML.

## Recommended Git workflow

### Branches

Одна задача = одна branch.

Примеры:

```text
feature/gto-01-copy-update
feature/breach-winback-html
feature/academy-subscription-qa
fix/fte-variables
docs/multi-user-html-workflow
```

Branch должна быть короткой и понятной.

### Pull request flow

```text
1. Create task
2. Create branch
3. Edit HTML in Codex or Cursor
4. Run sync-preview
5. Check preview locally or on Vercel preview
6. Open PR
7. Review comments
8. Apply changes
9. Re-check preview
10. Merge
11. Deploy production preview
12. Export/transfer to Pushwoosh
```

### Merge rule

Не merge, если:

- есть открытые blocking comments;
- HTML не проверен в preview;
- `preview/` устарел относительно `development/`;
- subject/preheader в metadata не совпадает с письмом;
- required variables не согласованы;
- Pushwoosh handoff fields неполные для письма, которое идет в запуск.

## Working in Codex

Codex хорош для задач, где нужно удерживать контекст проекта и делать механические или структурные изменения.

Использовать Codex для:

- собрать новое письмо из UI kit;
- внести список правок из review comments;
- найти все occurrences текста/CTA/variable;
- синхронизировать subject/preheader в metadata;
- проверить `{{variables}}`;
- подготовить QA report;
- подготовить Pushwoosh handoff package;
- обновить docs;
- сделать аккуратные массовые правки.

Типовой запрос в Codex:

```text
Внеси open review comments для GTO-01, правь только development/google-traffic-onboarding/HTML/GTO_01.html,
после этого обнови preview через sync-preview и проверь subject/preheader.
```

Правила для Codex:

- Всегда явно указывать campaign/email.
- Явно указывать файлы, которые можно менять.
- Не просить "поправь все письма" без ограничений.
- Перед большим изменением попросить Codex сначала показать план.
- После изменения просить verification: preview, variables, links, subject/preheader.

## Working in Cursor

Cursor хорош для ручной точечной работы в конкретном HTML-файле.

Использовать Cursor для:

- точечно поправить copy;
- поправить inline styles;
- двигать блоки;
- быстро проверить локальный diff;
- работать рядом с человеком, который понимает конкретное письмо.

Правила для Cursor:

- Открывать project/repo, не отдельный файл из случайной папки.
- Перед началом подтянуть latest branch.
- Работать в своей branch.
- Не редактировать `preview/` руками.
- Проверять diff перед commit.
- Не форматировать весь HTML-файл автоматически, если правка маленькая.

## File ownership model

На время работы у каждого файла должен быть владелец.

Пример:

| File | Owner | Task |
| --- | --- | --- |
| `development/google-traffic-onboarding/HTML/GTO_01.html` | Alex | CTA/copy update |
| `development/breach-winback/HTML/Breach_Winback_2A.html` | Maria | Review comments |
| `assets/campaign-data.js` | CRM owner | Subject/preheader metadata |

Правило:

> Один HTML-файл в один момент активно правит один человек.

Если нужно двум людям:

1. Первый делает copy changes.
2. Второй после merge делает layout/QA.
3. Либо один человек owns файл, второй оставляет review comments.

## Commit strategy

Коммиты должны быть маленькими и осмысленными.

Хорошо:

```text
Update GTO-01 CTA copy
Fix FTE variables in branch C emails
Add Pushwoosh handoff docs
Sync preview for breach winback
```

Плохо:

```text
changes
fix
final
new final
html
```

Рекомендуемая структура commit:

```text
<type>: <scope> <short action>
```

Примеры:

```text
copy: update GTO-01 primary CTA
html: rebuild breach winback email 2A
meta: sync subject for trading results
docs: add multi-user HTML workflow
qa: add Pushwoosh checklist for FTE
```

## Pull request checklist

Перед PR:

- Правки сделаны в `development/`.
- `preview/` обновлен через `npm run sync-preview`, если письмо готово к показу.
- Открыт preview link.
- Subject/preheader проверены.
- CTA links проверены.
- Variables `{{...}}` проверены.
- Нет случайных правок в чужих файлах.
- Нет auto-format всего HTML без причины.
- Review URL приложен к PR/task.

В PR description:

```markdown
## What changed

- Updated GTO-01 primary CTA copy.
- Adjusted intro paragraph after review comment #3.
- Synced preview.

## Preview

- Chain: ...
- Review: ...

## Checks

- [ ] Subject/preheader checked
- [ ] CTA links checked
- [ ] Variables checked
- [ ] Preview checked
- [ ] Ready for Pushwoosh handoff
```

## Review workflow

### Manager/reviewer

1. Открывает review link.
2. Вводит имя.
3. Оставляет comments по конкретным блокам.
4. Не пишет правки в HTML напрямую.
5. После `applied` проверяет preview.
6. Если все хорошо, ставит `resolved`.

### Developer/email producer

1. Открывает comments list.
2. Фильтрует `open`.
3. Вносит правки в source HTML.
4. Обновляет preview.
5. Помечает comment как `applied`.
6. Не закрывает comments за reviewer, кроме явно технических/дублирующих.

### CRM/Pushwoosh operator

1. Берет только approved/QA passed версию.
2. Не копирует HTML из незакрытого PR.
3. Проверяет Pushwoosh package/checklist.
4. После настройки сохраняет preset/journey references обратно в задачу или metadata.

## Conflict handling

### Если два человека поменяли один HTML

Правильный порядок:

1. Остановиться.
2. Понять, чья branch актуальнее.
3. Посмотреть diff обеих branches.
4. Вручную перенести нужные изменения.
5. Проверить preview.
6. Попросить review у второго человека.

Нельзя:

- blindly accept all incoming/current changes;
- копировать весь файл поверх чужого;
- править conflict markers в preview instead of development;
- переносить файл из Google Drive conflict copy без diff.

### Если Google Drive создал conflict copy

Действия:

1. Не использовать conflict copy как source.
2. Сравнить conflict copy с canonical file.
3. Забрать только нужные изменения.
4. Удалить/архивировать conflict copy после переноса.
5. Зафиксировать итог в Git.

## Temporary workflow without Git

Так как GitHub repo уже есть, этот раздел нужен только для аварийной ситуации: человек временно работает в папке, которая не является clone `lx-grzdv/sabiotrade-emails`, или GitHub недоступен.

Это компромисс, не целевая схема.

### Правила

- Завести таблицу ownership:

```text
Campaign | Email | File | Owner | Status | Started at | Notes
```

- Один owner на один HTML-файл.
- Перед началом работы owner пишет в таблице `locked`.
- После завершения owner пишет `ready for review`.
- Никто другой не правит locked файл.
- Перед большой правкой делать manual snapshot/copy.
- `preview/` руками не редактировать.
- Все финальные правки проходят через `npm run sync-preview`.

### Минусы

- Нет нормального diff.
- Сложнее понять, кто что поменял.
- Выше риск перезаписи.
- Сложнее откатить.
- Труднее делать review.

Поэтому этот вариант можно использовать только короткое время.

## Recommended team process

### Daily working rhythm

1. Утром команда смотрит active tasks.
2. Каждый берет конкретный campaign/email.
3. Ownership фиксируется в task/branch.
4. В течение дня правки идут в отдельных branches.
5. Preview links отправляются на review.
6. Blocking comments закрываются до merge.
7. В конце дня production preview обновляется только из approved/merged work.

### Definition of done for an email

Email считается готовым, если:

- HTML source updated.
- Preview synced.
- Review comments resolved.
- Subject/preheader match metadata.
- CTA links checked.
- Variables checked.
- QA passed.
- Pushwoosh handoff data complete.
- Approved version archived or hash recorded.

### Definition of done for a campaign

Campaign считается готовой к Pushwoosh, если:

- Все emails в campaign имеют status `pushwoosh_ready`.
- Campaign trigger/exit/re-entry approved.
- Branch logic documented.
- Required events exist or marked as dependency.
- Pushwoosh package generated.
- CRM operator получил package.
- Handoff version recorded.

## Codex/Cursor prompt patterns

### Codex: apply review comments

```text
Открой campaign google-traffic-onboarding, email GTO-01.
Внеси только open review comments, которые относятся к GTO-01.
Правь только development/google-traffic-onboarding/HTML/GTO_01.html и при необходимости assets/campaign-data.js.
После правок запусти sync-preview и перечисли, что изменилось.
```

### Codex: QA a campaign

```text
Проверь campaign free-trial-expired перед Pushwoosh handoff:
variables, CTA links, subject/preheader consistency, наличие footer/legal.
Не меняй файлы без отдельного подтверждения, сначала дай findings.
```

### Codex: generate handoff package

```text
Собери Pushwoosh handoff package для breach-winback:
HTML files, manifest, variables, trigger/exit/re-entry, QA checklist.
Используй approved preview files и не меняй source HTML.
```

### Cursor: scoped edit

```text
In this file only, update the intro paragraph and primary CTA copy.
Do not reformat the whole HTML file.
Keep table layout and inline styles intact.
```

## Recommended next implementation tasks

1. Убедиться, что все участники работают в clone `https://github.com/lx-grzdv/sabiotrade-emails`.
2. Создать branch/PR convention.
3. Добавить PR template с email checklist.
4. Добавить `docs/multi-user-html-workflow.md` в onboarding.
5. Добавить metadata statuses в `campaign-data.js`.
6. Добавить QA script.
7. Добавить Pushwoosh package export.
8. Ввести правило: `preview/` не редактируется руками.
9. Завести owner/status dashboard для campaign/email.

## Final recommendation

Для нескольких людей лучший процесс такой:

```text
Codex/Cursor for editing
Git for version control
Vercel preview for viewing
Review mode for comments
QA/export scripts for Pushwoosh handoff
Pushwoosh for delivery/runtime
```

Главное правило:

> Люди не должны конкурировать за один HTML-файл. Они должны конкурировать за качество процесса: маленькие ветки, понятные preview, закрытые comments и воспроизводимый Pushwoosh package.
