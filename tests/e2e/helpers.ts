import { expect, type Page } from '@playwright/test';

export async function enterTeacher(page: Page) {
  await page.goto('/');
  await page.getByLabel('Choose a mode').selectOption('teacher');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
}

export async function selectClass(page: Page, name: string) {
  await page.locator('#class-select').selectOption(name);
}

export function className(page: Page, name: string) {
  return page.locator('main strong', { hasText: new RegExp(`^${escapeRegExp(name)}$`) });
}

/** List row for a class on the Manage screen. */
export function classRow(page: Page, name: string) {
  return page
    .locator('main li')
    .filter({ has: page.locator('strong', { hasText: new RegExp(`^${escapeRegExp(name)}$`) }) });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
