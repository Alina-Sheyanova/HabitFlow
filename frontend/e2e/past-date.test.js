import { test, expect } from '@playwright/test'

test('клик на прошлый день - счетчик показывает правильное кол-во', async ({ page }) => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  // Мокаем привычки: 2 выполнены вчера, 1 нет
  await page.route('**/habits/', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        json: [
          { id: 'h1', name: 'Медитация', completedDates: [yesterdayStr] },
          { id: 'h2', name: 'Спорт', completedDates: [yesterdayStr] },
          { id: 'h3', name: 'Чтение', completedDates: [] },
        ],
      })
    } else {
      await route.fallback()
    }
  })

  await page.goto('/')

  // Убеждаемся что загружены 3 привычки
  await expect(page.getByTestId('habit-name')).toHaveCount(3)

  // Кликаем на вчерашний день
  await page.locator(`[data-qa-date="${yesterdayStr}"]`).first().click()

  // Проверяем счетчик: 2/3 выполнено вчера
  await expect(page.getByTestId('completion-count')).toHaveText('2/3')

  // Проверяем лабель изменилась
  await expect(page.locator('[data-qa="completion-summary"]')).toContainText('done that day')

  // Возвращаемся на сегодня
  await page.getByTestId('back-to-today-btn').click()

  // Баннер исчезает
  await expect(page.getByTestId('past-date-banner')).not.toBeVisible()

  // Лабель вернулась на "done today"
  await expect(page.locator('[data-qa="completion-summary"]')).toContainText('done today')
})
