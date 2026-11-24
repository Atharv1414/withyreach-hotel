import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  use: { channel: process.env.PW_CHANNEL, baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run build && npx vite preview --port 4173 --strictPort', port: 4173, reuseExistingServer: false },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
})
