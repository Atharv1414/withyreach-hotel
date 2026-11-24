import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = ['/', '/rooms', '/rooms/abbots-reach', '/eat', '/around', '/book', '/nowhere']
const HOURS = { day: '2027-04-06T11:00:00Z', dusk: '2027-01-12T16:28:00Z', night: '2027-01-12T22:00:00Z' }

for (const [name, iso] of Object.entries(HOURS)) {
  test(`every page is accessible and never scrolls sideways: ${name}`, async ({ page }) => {
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.clock.setFixedTime(new Date(iso))
    for (const path of PAGES) {
      await page.goto(path)
      await expect(page.locator('h1')).toBeVisible()
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      expect(wide, path).toBeLessThanOrEqual(0)
      // the canvas behind the hero hides its background from axe; that contrast has a unit test
      const axe = await new AxeBuilder({ page }).exclude('.hero h1').exclude('.header--over').analyze()
      expect(axe.violations.map((v) => `${path} ${v.id}: ${v.nodes[0].html}`)).toEqual([])
    }
    expect(errors).toEqual([])
  })
}

test('the dial moves the sun and the theme', async ({ page }) => {
  await page.clock.setFixedTime(new Date(HOURS.day))
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('slider').fill('1380')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Back to the real time' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('a night visitor gets the night page at once, with no fade', async ({ page }) => {
  await page.clock.setFixedTime(new Date(HOURS.night))
  await page.goto('/rooms')
  await expect(page.locator('h1')).toBeVisible()
  const now = await page.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.body).transitionDuration])
  expect(now).toEqual(['rgb(13, 26, 33)', '0s'])
})

test('a booking can be made with the keyboard alone', async ({ page }) => {
  await page.clock.setFixedTime(new Date(HOURS.day))
  await page.goto('/book?room=withy-boiler')
  await page.getByRole('grid').locator('button[tabindex="0"]').focus()
  for (let i = 0; i < 40; i++) {
    const free = await page.evaluate(() => document.activeElement.getAttribute('aria-disabled') === 'false')
    if (free) {
      await page.keyboard.press('Enter')
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(60)
      await page.keyboard.press('Enter')
      break
    }
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(60)
  }
  await expect(page.getByLabel('Price').getByText('Total')).toBeVisible()
  await page.getByRole('button', { name: 'Choose extras' }).press('Enter')
  await expect(page.getByRole('heading', { name: 'Anything else?' })).toBeFocused()
})

test('deep links work after a reload', async ({ page }) => {
  await page.goto('/rooms')
  await page.getByRole('link', { name: 'Flood Mark' }).click()
  await page.reload()
  await expect(page.locator('h1')).toHaveText('Flood Mark')
})
