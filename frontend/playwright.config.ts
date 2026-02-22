import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config.
 *
 * Стратегия: тесты запускаются против реально работающего Vite dev-сервера,
 * но все HTTP-запросы к бэкенду перехватываются через page.route() в каждом тесте,
 * поэтому работающий бэкенд (Docker) не нужен.
 */
export default defineConfig({
  testDir: './e2e',

  // Запускать файлы тестов параллельно, но тесты внутри файла — последовательно
  fullyParallel: false,
  workers: 1,

  // Повторить упавший тест один раз перед тем как считать его failed
  retries: 1,

  reporter: 'list',

  use: {
    baseURL: 'http://localhost:5173',

    // Использовать data-qa вместо data-testid для page.getByTestId()
    testIdAttribute: 'data-qa',

    // Снимать скриншот при падении теста
    screenshot: 'only-on-failure',

    // Сохранять трассировку при первом retry (удобно для отладки)
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Автоматически запускать Vite перед тестами и останавливать после
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true, // не перезапускать если уже запущен
    timeout: 15_000,
  },
})
