# Raw Tokens / Sample Values Spec

Дата: 2026-05-27.

Цель: добавить режим предпросмотра переменных, в котором можно быстро проверить, какие токены используются в письмах, какие sample values применены, и где данных не хватает для реалистичного QA.

## Scope

- Только спецификация данных и поведения.
- Без реализации UI и без изменений backend на этом этапе.
- Применимо к chain-странице, в первую очередь к `academy-subscription-onboarding`.

## Где хранить sample data

- Источник: отдельный frontend data-файл рядом с campaign-данными.
- Предложение: `assets/sample-profiles.js`.
- Формат: объект `SAMPLE_PROFILES`, где ключ — `profileId`, а значение — набор переменных.
- Хранить в git вместе с `assets/campaign-data.js`, чтобы изменения были прозрачны в PR.

Минимальная структура:

```js
window.SAMPLE_PROFILES = {
  default: {
    label: "Default profile",
    values: {
      first_name: "Alex",
      account_type: "Trial",
      // ...
    },
  },
};
```

## Как выбирать sample profile

- Режим выбора профиля должен быть привязан к URL query для шаринга и воспроизводимости:
  - `?sample=default`
  - `?sample=academy-power-user`
- Если `sample` отсутствует:
  - использовать `default`, если есть;
  - иначе использовать первый доступный профиль.
- Если `sample` неизвестен:
  - fallback на `default` и показать мягкое предупреждение в UI (в будущем).
- Допустимо дополнительно кешировать последний профиль в `localStorage`, но query-параметр имеет приоритет.

## Переменные для Academy (MVP-набор)

Обязательный базовый набор для реалистичной проверки контента:

- `first_name`
- `email`
- `country`
- `language`
- `timezone`
- `plan_name` (1W / 4W / 12W)
- `plan_price`
- `currency`
- `trial_end_date`
- `payment_status`
- `next_billing_date`
- `account_manager_name`
- `webinar_date`
- `webinar_link`
- `support_email`
- `unsubscribe_link`

Рекомендуемые доп. переменные:

- `broker_name`
- `platform_name`
- `promo_code`
- `promo_expiry_date`
- `risk_level`
- `goal_name`
- `event_name`
- `event_date`

## Подсветка missing sample values

Правила проверки:

- Извлекать токены из HTML письма (например, `{{token_name}}`).
- Для каждого токена проверять наличие ключа в выбранном sample profile.
- Статусы:
  - `resolved` — ключ найден и значение непустое;
  - `missing` — ключ не найден;
  - `empty` — ключ есть, но пустая строка/`null`.

Правила отображения (к реализации позже):

- `missing` и `empty` должны быть явно выделены в raw tokens view.
- Нельзя подставлять фиктивные значения автоматически.
- Для `missing` показывать имя токена и список писем, где он встретился.

## Что должно проверять QA

Функциональные проверки:

- Выбор `sample` через URL стабильно меняет вычисленные значения токенов.
- Возврат к `sample=default` дает ожидаемые значения во всех письмах.
- Для неизвестного профиля корректно срабатывает fallback.

Контентные проверки:

- В `academy-subscription-onboarding` нет токенов со статусом `missing` в финальных QA-профилях.
- Критичные токены (`first_name`, `plan_name`, `unsubscribe_link`) не пустые.
- Даты и цены выглядят консистентно по всей цепочке.

Регрессионные проверки:

- Режим sample values не ломает существующие ссылки `Preview / Review / Download HTML / Source`.
- Review mode и comments продолжают работать.
- Производительность на длинной цепочке (Academy) остается приемлемой.

## Out of scope

- Реализация UI-панели и интерактивного raw tokens viewer.
- Backend-хранилище sample profiles.
- Автоматическая генерация sample data из CRM/ESP.
