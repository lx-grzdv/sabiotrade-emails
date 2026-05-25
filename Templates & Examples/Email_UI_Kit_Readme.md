# SabioTrade Email UI Kit

UI kit file: `Email_UI_Kit_Blocks.html`

Этот kit собран на базе всех писем из `TEST/HTML`:
- `AcademyOnboarding_Em1.html`
- `TEST/HTML/Emails__Welcome_2.0 __Beginners/*`
- `TEST/HTML/Emails__WelcomeExp/*`
- `TEST/HTML/Email_WelcomeSomeExp/*`

## Как собирать новое письмо

1. Скопируйте `Email_UI_Kit_Blocks.html` в новый файл письма.
2. Обязательно оставьте `BLOCK 00`, `BLOCK 01` и `BLOCK 10`.
3. Соберите middle-секции из `BLOCK 02` ... `BLOCK 30` в нужном порядке.
4. Замените все `{{TOKENS}}` на реальные значения.
5. Проверьте:
   - ссылки (`href`)
   - alt-тексты у картинок
   - корректность preheader и CTA

## Рекомендуемый минимальный набор

- `BLOCK 00` Preheader
- `BLOCK 01` Header
- `BLOCK 02` Hero
- `BLOCK 06` Main CTA
- `BLOCK 09` Support
- `BLOCK 10` Legal footer

## Дополнительные блоки из всех серий писем

- `BLOCK 11` Promo code card (gradient capsule)
- `BLOCK 12` Split bullets + image (MSO-safe columns)
- `BLOCK 13` Numbered reasons + divider + example
- `BLOCK 14` Tutorial step card
- `BLOCK 15` Tutorial media spotlight
- `BLOCK 16` Metallic plan row
- `BLOCK 17` White checklist card
- `BLOCK 18` Dark expert course promo
- `BLOCK 19` Gradient feature tile with side image
- `BLOCK 20` Tip bar (icon + text)
- `BLOCK 21` Process step card with STEP badge
- `BLOCK 22` Weekly timeline split card
- `BLOCK 23` Testimonial quote panel
- `BLOCK 24` Tutorial preview row (text + thumbnail)
- `BLOCK 25` Dark outcome summary panel
- `BLOCK 26` Hero single-panel with background image
- `BLOCK 27` Dark bullet instruction card
- `BLOCK 28` Image-first white card
- `BLOCK 29` Arrow-list section on light background
- `BLOCK 30` Guide link strip

## Совместимость

- Табличная вёрстка для email-клиентов.
- Inline-стили для ключевых элементов.
- Адаптация под mobile через media queries.
