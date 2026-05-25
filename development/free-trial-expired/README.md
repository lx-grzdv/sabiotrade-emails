# free-trial-expired

Источник: `free_trial_expired_winback.docx`

## Аудитория и вход

- Вход в воронку: `Account_deactivated` с `reason_code = 3` (Free Trial Expired).
- Исключение: сегмент `[EXC] Clients with aff_id 791107`.
- Entry frequency: `Once per user`, re-entry `Not allowed`.
- Цель/exit: событие `Purchase` (немедленный выход на любом шаге).
- База по доке: 11 038 пользователей без `aff_id` (из 17 952 входов).

## Сегментация (каскад, last 14 days)

Проверки идут строго по порядку:

1. `trading_account_profit_target_80_percent_reached` -> сегмент **C** (Почти прошел).
2. `trading_account_assessment_capital_growth_1` -> сегмент **B** (Торговал, рос), если не попал в C.
3. `trading_account_daily_loss_over_3pct` -> сегмент **A** (Торговал, терял), если не попал в C/B.
4. Иначе сегмент **D** (Зашел, не торговал; нет `Activity_FirstPositionOpened`).

## Письма по сегментам

- **C**: `FTE_C1` (Day 0), `FTE_C2` (Day 4 без `Purchase`)
- **B**: `FTE_B1` (Day 0), `FTE_B2` (Day 4 без `Purchase`)
- **A**: `FTE_A1` (Day 0), `FTE_A2` (Day 4 без `Purchase`)
- **D**: `FTE_D1` (Day 0), `FTE_D2` (Day 4 без `Purchase`)

HTML:
- `HTML/FTE_C1.html`
- `HTML/FTE_C2.html`
- `HTML/FTE_B1.html`
- `HTML/FTE_B2.html`
- `HTML/FTE_A1.html`
- `HTML/FTE_A2.html`
- `HTML/FTE_D1.html`
- `HTML/FTE_D2.html`

## Важное из доки

- Промокод: `RETRY20` (-20%), только `Essential` и `Plus`.
- Расчет в тексте: Essential `€119 -> ~€95`, Plus `€289 -> ~€231`.
- Для `PRO` скидку не упоминать.
- Ключевой месседж для A/B/C: риск на сделку `0.5%–1%` (в A2 акцент на `0.5%`).
- Ветка D: снять барьер первого клика, минимальный размер позиции, stop-loss до входа.

## Операционный чеклист (коротко)

- Проверить доступность событий для Condition -> Performed event (last 14 days).
- Держать каскад C -> B -> A -> D без перестановки.
- На каждой ветке: Day 0 письмо -> Delay 4d -> если нет `Purchase` -> Day 4 письмо -> Exit.
- Перед production сделать smoke test на 2-3 аккаунтах каждого сегмента.

Готовые файлы публикуются через `preview/free-trial-expired/`.
