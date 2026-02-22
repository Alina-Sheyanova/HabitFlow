import { test, expect } from '@playwright/test'

test('toggle привычек - счетчик меняется', async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10)

  // Отслеживаем состояние
  const states = { h1: false, h2: false, h3: false }

  // Мокаем API
  await page.route('**/habits/**', async (route) => {
    const url = route.request().url()

    if (route.request().method() === 'GET' && url.endsWith('/habits/')) {
      await route.fulfill({
        json: [
          { id: 'h1', name: 'Медитация', completedDates: states.h1 ? [today] : [] },
          { id: 'h2', name: 'Спорт', completedDates: states.h2 ? [today] : [] },
          { id: 'h3', name: 'Чтение', completedDates: states.h3 ? [today] : [] },
        ],
      })
    } else if (route.request().method() === 'POST' && url.includes('/toggle')) {
      const id = url.match(/h[123]/)?.[0]
      if (id) states[id] = !states[id]
      await route.fulfill({ json: {} })
    } else {
      await route.fallback()
    }
  })

  await page.goto('/')

  const count = page.getByTestId('completion-count')

  // Изначально 0/3
  await expect(count).toHaveText('0/3')

  // Кликаем первую привычку → 1/3
  await page.getByTestId('habit-toggle-btn').first().click()
  await expect(count).toHaveText('1/3')

  // Кликаем вторую привычку → 2/3
  await page.getByTestId('habit-toggle-btn').nth(1).click()
  await expect(count).toHaveText('2/3')

  // Убираем галочку со второй → 1/3
  await page.getByTestId('habit-toggle-btn').nth(1).click()
  await expect(count).toHaveText('1/3')
})
