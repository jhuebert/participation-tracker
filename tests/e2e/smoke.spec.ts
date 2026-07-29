import { expect, test } from '@playwright/test';

test('welcome → teacher → create class → pick flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Participation Tracker' })).toBeVisible();

  await page.getByLabel('Choose a mode').selectOption('teacher');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();

  // Manage tab — create a class
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByPlaceholder('e.g. Period 1').fill('Period 1');
  await page.getByPlaceholder('Alice\nBob\nCara').fill('Alice\nBob\nCara');
  await page.getByRole('button', { name: 'Create class' }).click();
  await expect(page.getByText('Period 1')).toBeVisible();

  // Picker — select class and pick
  await page.getByRole('button', { name: 'Picker' }).click();
  await page.locator('#class-select').selectOption('Period 1');
  await expect(page.getByText('Ready to pick!')).toBeVisible();
  await page.getByRole('button', { name: '🎲 Pick Random' }).click();
  await expect(page.getByRole('button', { name: '✓ Correct' })).toBeEnabled();
  await page.getByRole('button', { name: '✓ Correct' }).click();
  await expect(page.getByText('Ready to pick!')).toBeVisible();
});
