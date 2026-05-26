# Docs

Документация по email production process и preview/review workflow.

Канонический GitHub repo для командной работы:

```text
https://github.com/lx-grzdv/sabiotrade-emails
```

## Service blueprint

- [`email-ops-service-blueprint.md`](./email-ops-service-blueprint.md) - подробная концепция внутреннего сервиса для процесса от задачи до Pushwoosh handoff: inventory, workflow, роли, статусы, QA, data model, roadmap и Pushwoosh integration notes.
- [`service-architecture-content-model.md`](./service-architecture-content-model.md) - архитектура multi-mode workspace: режимы List/Chain/Preview/Review/Prompt Edit/QA/Pushwoosh, source of truth, campaign README/manifest, block model и безопасное AI-редактирование по выбранному блоку.
- [`multi-user-html-workflow.md`](./multi-user-html-workflow.md) - процесс командной работы над HTML в Codex/Cursor: Git branches, ownership файлов, PR/review flow, conflict handling и временная схема без Git.
- [`current-workflow-runbook.md`](./current-workflow-runbook.md) - текущее операционное состояние: `development/` vs `preview/` vs `sources/`, deploy pipeline, manager handoff и smoke-check после релиза.

## Review comments

- [`review-comments-workflow.md`](./review-comments-workflow.md) - day-to-day процесс review comments для менеджера и разработчика.
- [`review-comments-setup.md`](./review-comments-setup.md) - настройка Supabase/Vercel backend для shared comments.
- [`review-system-audit.md`](./review-system-audit.md) - аудит chain/review страницы: текущий статус, UX-проблемы, риски и backlog улучшений.
