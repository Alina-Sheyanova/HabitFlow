import { test, expect } from '@playwright/test'

test('добавление новой привычки отображает её в списке', async ({ page }) => {

  // Мокаем только начальную загрузку — чтобы тест стартовал с чистого листа,
  // независимо от того, что уже есть в базе данных.
  // Без этого мока мы бы увидели все существующие привычки и не знали бы,
  // какая из них только что добавлена.
  await page.route('**/habits/', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ json: [] })
    } else {
      // POST /habits/ — пропускаем на реальный бэкенд,
      // чтобы он сам создал привычку и вернул настоящий ответ
      await route.fallback()
    }
  })

  await page.goto('/')

  await page.getByTestId('add-habit-btn').click()
  await page.getByTestId('habit-name-input').fill('Читать книги')
  await page.getByTestId('habit-submit-btn').click()

  await expect(page.getByTestId('habit-name')).toHaveText('Читать книги')
})
