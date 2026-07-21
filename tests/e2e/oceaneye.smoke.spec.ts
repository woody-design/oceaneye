import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

function monitorRuntimeErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

test('redirects the root route and renders both locales', async ({ context }) => {
  const englishPage = await context.newPage()
  await englishPage.goto('/')
  await expect(englishPage).toHaveURL(/\/en\/$/)
  await expect(englishPage.locator('html')).toHaveAttribute('lang', 'en')
  await expect(englishPage.getByRole('heading', { name: 'Yellow boxfish', exact: true })).toBeVisible()
  await englishPage.close()

  const chinesePage = await context.newPage()
  await chinesePage.goto('/zh/')
  await expect(chinesePage.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(chinesePage.getByRole('heading', { name: '黄箱鲀', exact: true })).toBeVisible()
  await chinesePage.close()
})

test('navigates between creatures, zones, and the editorial view', async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page)
  const initialModel = page.waitForResponse((response) => response.url().endsWith('/models/yellow-boxfish.glb'))

  await page.goto('/en/')
  expect((await initialModel).ok()).toBe(true)

  const oarfishModel = page.waitForResponse((response) => response.url().endsWith('/models/giant-oarfish.glb'))
  await page.getByRole('button', { name: 'Giant oarfish', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Giant oarfish', exact: true })).toBeVisible()
  expect((await oarfishModel).ok()).toBe(true)

  const vampireSquidModel = page.waitForResponse((response) => response.url().endsWith('/models/vampire-squid.glb'))
  await page.getByRole('button', { name: 'Vampire squid', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Vampire squid', exact: true })).toBeVisible()
  expect((await vampireSquidModel).ok()).toBe(true)

  const twilightButton = page.getByRole('button', { name: 'Twilight Zone 200 m - 1,000 m', exact: true })
  await twilightButton.click()
  await expect(twilightButton).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('region', { name: 'Twilight Zone zone overview', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'About OceanEye', exact: true }).click()
  await expect(page.getByRole('region', { name: 'OceanEye', exact: true })).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('removes collapsed insight content from layout and accessibility queries', async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page)
  await page.goto('/en/')

  const overviewBody = page.locator('[id="insight-card-summary"]')
  const boxBody = page.locator('[id="insight-card-knowledge:box-body"]')

  await expect(boxBody).toHaveAttribute('hidden', '')
  await expect(boxBody).toHaveCSS('display', 'none')
  await expect(page.getByRole('link', { name: 'Oceanogràfic', exact: true })).toHaveCount(0)

  await page.getByRole('button', { name: 'Box body', exact: true }).click()

  await expect(overviewBody).toHaveAttribute('hidden', '')
  await expect(overviewBody).toHaveCSS('display', 'none')
  await expect(boxBody).not.toHaveAttribute('hidden', '')
  await expect(boxBody).toHaveCSS('display', 'grid')
  await expect(page.getByRole('link', { name: 'Oceanogràfic', exact: true })).toBeVisible()
  expect(runtimeErrors).toEqual([])
})

test('keeps mobile drawers mutually exclusive and closes them with Escape', async ({ page }) => {
  const runtimeErrors = monitorRuntimeErrors(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/')

  await page.getByRole('button', { name: 'Open navigation', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Depth navigator', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Open right panel', exact: true }).click()
  await expect(page.getByRole('complementary', { name: 'Observation notes', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Depth navigator', exact: true })).toBeHidden()

  await page.getByRole('button', { name: 'Close right panel', exact: true }).press('Escape')
  await expect(page.getByRole('button', { name: 'Open right panel', exact: true })).toBeVisible()
  await expect(page.getByRole('complementary', { name: 'Observation notes', exact: true })).toBeHidden()
  expect(runtimeErrors).toEqual([])
})

test('shows a useful fallback when the initial model request fails', async ({ page }) => {
  await page.route('**/models/yellow-boxfish.glb', (route) => route.abort('failed'))
  await page.goto('/en/')

  await expect(page.getByRole('status')).toContainText('This 3D model could not be loaded')
  await expect(page.getByRole('link', { name: 'See reference images', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Yellow boxfish', exact: true })).toBeVisible()
})
