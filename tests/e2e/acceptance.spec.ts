import { expect, test, type Page } from '@playwright/test';
import { className, classRow, enterTeacher, selectClass } from './helpers';

/**
 * Automated slice of docs/ACCEPTANCE_CHECKLIST.md.
 * PPTX visual quality + Edge remain manual.
 */

const LEGACY_EXPORT = {
  app: 'Participation Tracker',
  date: '1/1/2024',
  data: {
    'Period 1': {
      students: {
        Alice: { picks: 4, correct: 2, incorrect: 1, volunteers: 1, skips: 0 },
        Bob: { picks: 2, correct: 1, incorrect: 0, volunteers: 0, skips: 1 },
        Cara: { picks: 0, correct: 0, incorrect: 0, volunteers: 0, skips: 0 },
      },
    },
  },
};

const LEGACY_SCORING = {
  correctPoints: 2,
  correctEffect: 'add',
  incorrectPoints: 1,
  incorrectEffect: 'subtract',
  volunteerPoints: 1,
  volunteerEffect: 'add',
  skipPoints: 1,
  skipEffect: 'subtract',
};

const LEGACY_WEIGHTS = {
  enabled: true,
  volunteerAmt: 30,
  volunteerDir: 'decrease',
  correctAmt: 15,
  correctDir: 'decrease',
  incorrectAmt: 10,
  incorrectDir: 'increase',
  skipAmt: 20,
  skipDir: 'increase',
};

async function seedLegacyStorage(page: Page) {
  await page.addInitScript(
    ({ data, scoring, weights }) => {
      localStorage.setItem('participationData', JSON.stringify(data));
      localStorage.setItem('participationScoringSettings', JSON.stringify(scoring));
      localStorage.setItem('participationWeightSettings', JSON.stringify(weights));
    },
    {
      data: LEGACY_EXPORT.data,
      scoring: LEGACY_SCORING,
      weights: LEGACY_WEIGHTS,
    },
  );
}

test.describe('Data compatibility', () => {
  test('loads legacy localStorage classes and settings', async ({ page }) => {
    await seedLegacyStorage(page);
    await enterTeacher(page);

    await expect(page.locator('#class-select option', { hasText: 'Period 1' })).toHaveCount(1);
    await selectClass(page, 'Period 1');
    await expect(page.getByText('Ready to pick!')).toBeVisible();
    await expect(page.locator('label.chip, label').filter({ hasText: 'Alice' }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('dialog', { name: 'Settings' })).toContainText('Correct');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toContainText('+2');
  });

  test('import legacy JSON export replaces data', async ({ page }) => {
    await enterTeacher(page);
    await page.getByRole('button', { name: 'Manage' }).click();

    await page.getByPlaceholder('e.g. Period 1').fill('Temp Class');
    await page.getByPlaceholder('Alice\nBob\nCara').fill('Zed');
    await page.getByRole('button', { name: 'Create class' }).click();
    await expect(className(page, 'Temp Class')).toBeVisible();

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '📥 Import data' }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'ParticipationTracker_Backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(LEGACY_EXPORT, null, 2)),
    });

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Replace' }).click();
    await expect(page.getByText('Data imported!')).toBeVisible();
    await expect(className(page, 'Period 1')).toBeVisible();
    await expect(className(page, 'Temp Class')).toHaveCount(0);
  });

  test('export → import round-trip', async ({ page }) => {
    await seedLegacyStorage(page);
    await enterTeacher(page);
    await page.getByRole('button', { name: 'Manage' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '📤 Export data' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/ParticipationTracker_Backup\.json/);
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile((await download.path())!, 'utf8');
    const parsed = JSON.parse(raw);
    expect(parsed.app).toBe('Participation Tracker');
    expect(parsed.data['Period 1'].students.Alice.picks).toBe(4);

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: '📥 Import data' }).click(),
    ]);
    await fileChooser.setFiles({
      name: 'roundtrip.json',
      mimeType: 'application/json',
      buffer: Buffer.from(raw),
    });
    await page.getByRole('alertdialog').getByRole('button', { name: 'Replace' }).click();
    await expect(page.getByText('Data imported!')).toBeVisible();
    await expect(className(page, 'Period 1')).toBeVisible();
  });
});

test.describe('Teacher — Picker', () => {
  test.beforeEach(async ({ page }) => {
    await seedLegacyStorage(page);
    await enterTeacher(page);
    await selectClass(page, 'Period 1');
  });

  test('attendance select all / deselect all', async ({ page }) => {
    await page.getByRole('button', { name: 'Deselect all', exact: true }).click();
    await expect(page.getByText(/Present today · 0\//)).toBeVisible();
    await page.getByRole('button', { name: 'Select all', exact: true }).click();
    await expect(page.getByText(/Present today · 3\//)).toBeVisible();
  });

  test('pick random avoids back-to-back with 2+ present', async ({ page }) => {
    const seen: string[] = [];
    for (let i = 0; i < 6; i++) {
      await page.getByRole('button', { name: '🎲 Pick Random' }).click();
      await expect(page.getByRole('button', { name: '✓ Correct' })).toBeEnabled();
      const headline = (await page.getByTestId('selected-name').innerText()).trim();
      expect(['Alice', 'Bob', 'Cara']).toContain(headline);
      if (seen.length) {
        expect(headline).not.toBe(seen[seen.length - 1]);
      }
      seen.push(headline);
      await page.getByRole('button', { name: '✓ Correct' }).click();
      await expect(page.getByText('Ready to pick!')).toBeVisible();
    }
  });

  test('no students present shows toast', async ({ page }) => {
    await page.getByRole('button', { name: 'Deselect all', exact: true }).click();
    await page.getByRole('button', { name: '🎲 Pick Random' }).click();
    await expect(page.getByText('No students present!')).toBeVisible();
  });

  test('single present student still picks', async ({ page }) => {
    await page.getByRole('button', { name: 'Deselect all', exact: true }).click();
    await page.locator('label').filter({ hasText: /^Alice$/ }).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: '🎲 Pick Random' }).click();
    await expect(page.getByRole('button', { name: '✓ Correct' })).toBeEnabled();
    await expect(page.getByTestId('selected-name')).toHaveText('Alice');
  });

  test('teacher pick search and volunteer', async ({ page }) => {
    await page.getByRole('button', { name: '🍎 Teacher Pick' }).click();
    const modal = page.getByRole('dialog', { name: 'Teacher Pick' });
    await expect(modal).toBeVisible();
    await modal.getByPlaceholder('Search students…').fill('bo');
    await expect(modal.getByRole('button', { name: /Bob/ })).toBeVisible();
    await expect(modal.getByRole('button', { name: /Alice/ })).toHaveCount(0);
    await modal.getByRole('button', { name: /Bob/ }).click();
    await expect(page.getByRole('button', { name: '✓ Correct' })).toBeEnabled();
    await page.getByRole('button', { name: '✗ Incorrect' }).click();
    await expect(page.getByText('Ready to pick!')).toBeVisible();

    await page.getByRole('button', { name: '🙋 Volunteer' }).click();
    const vModal = page.getByRole('dialog', { name: 'Select Volunteer' });
    await vModal.getByRole('button', { name: 'Cara' }).click();
    await expect(page.locator('[class*="volunteer"]', { hasText: 'Volunteer' }).first()).toBeVisible();
    await expect(page.getByTestId('selected-name')).toHaveText('Cara');
    await page.getByRole('button', { name: '✓ Correct' }).click();
  });

  test('skip limit blocks then reset works', async ({ page }) => {
    const skipInput = page.locator('label', { hasText: 'Skip limit' }).locator('input');
    await skipInput.fill('1');

    await page.getByRole('button', { name: '🍎 Teacher Pick' }).click();
    await page
      .getByRole('dialog', { name: 'Teacher Pick' })
      .getByRole('button', { name: /Alice/ })
      .click();
    await page.getByRole('button', { name: '⏭ Skip' }).click();
    await expect(page.getByText('Ready to pick!')).toBeVisible();

    await page.getByRole('button', { name: '🍎 Teacher Pick' }).click();
    await page
      .getByRole('dialog', { name: 'Teacher Pick' })
      .getByRole('button', { name: /Alice/ })
      .click();
    await page.getByRole('button', { name: '⏭ Skip' }).click();
    await expect(page.getByText(/used all skips/i)).toBeVisible();

    await page.getByRole('button', { name: 'Reset session skips' }).click();
    await page.getByRole('button', { name: '⏭ Skip' }).click();
    await expect(page.getByText('Ready to pick!')).toBeVisible();
  });

  test('session persists across refresh', async ({ page }) => {
    await page.getByRole('button', { name: 'Deselect all', exact: true }).click();
    await page.locator('label').filter({ hasText: /^Alice$/ }).locator('input[type="checkbox"]').check();
    await page.locator('label').filter({ hasText: /^Bob$/ }).locator('input[type="checkbox"]').check();

    await page.reload();
    if (await page.getByLabel('Choose a mode').count()) {
      await page.getByLabel('Choose a mode').selectOption('teacher');
    }
    await selectClass(page, 'Period 1');
    await expect(page.getByText(/Present today · 2\//)).toBeVisible();
  });
});

test.describe('Leaderboard & Manage', () => {
  test.beforeEach(async ({ page }) => {
    await seedLegacyStorage(page);
    await enterTeacher(page);
  });

  test('leaderboard scores and CSV export', async ({ page }) => {
    await selectClass(page, 'Period 1');
    await page.getByRole('button', { name: 'Leaderboard' }).click();
    await expect(page.getByRole('table')).toContainText('Alice');
    await expect(page.getByRole('table')).toContainText('1.00');
    await expect(page.getByRole('table')).toContainText('0.50');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '📊 Export CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Period 1_statistics.csv');
    const fs = await import('node:fs/promises');
    const csv = await fs.readFile((await download.path())!, 'utf8');
    expect(csv).toContain('Rank,Name,Picks');
    expect(csv).toContain('Alice');
  });

  test('reset stats confirm cancel and confirm', async ({ page }) => {
    await page.getByRole('button', { name: 'Leaderboard' }).click();
    await page.locator('main select, [class*="view"] select').last().selectOption('Period 1');

    await page.getByRole('button', { name: 'Reset stats' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('table')).toContainText('Alice');
    await expect(page.getByRole('table')).toContainText('4');

    await page.getByRole('button', { name: 'Reset stats' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText('Leaderboard reset!')).toBeVisible();
  });

  test('manage create rename delete and duplicate reject', async ({ page }) => {
    await page.getByRole('button', { name: 'Manage' }).click();

    await page.getByPlaceholder('e.g. Period 1').fill('Period 2');
    await page.getByPlaceholder('Alice\nBob\nCara').fill('Dee\nEli');
    await page.getByRole('button', { name: 'Create class' }).click();
    await expect(page.getByText('Class created!')).toBeVisible();
    await expect(className(page, 'Period 2')).toBeVisible();

    await page.getByPlaceholder('e.g. Period 1').fill('Period 2');
    await page.getByPlaceholder('Alice\nBob\nCara').fill('X');
    await page.getByRole('button', { name: 'Create class' }).click();
    await expect(page.getByText(/exists/i)).toBeVisible();

    await classRow(page, 'Period 2').getByRole('button', { name: 'Edit' }).click();
    const edit = page.getByRole('dialog', { name: /Edit Period 2/ });
    await expect(edit).toBeVisible();
    await edit.locator('label').filter({ hasText: 'Class name' }).locator('input').fill('Period Two');
    await edit.getByRole('button', { name: 'Rename' }).click();
    await expect(page.getByText('Class updated')).toBeVisible();

    // Title updates after rename
    const edit2 = page.getByRole('dialog', { name: /Edit Period Two/ });
    await edit2.getByLabel('New student name').fill('Fay');
    await edit2.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(page.getByText('Student added')).toBeVisible();
    await edit2.getByRole('button', { name: 'Close' }).click();

    await classRow(page, 'Period Two').getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Class deleted')).toBeVisible();
  });
});

test.describe('Modes & broadcast', () => {
  test('teacher pick updates student tab', async ({ browser }) => {
    const context = await browser.newContext();
    const teacher = await context.newPage();
    const student = await context.newPage();

    await teacher.addInitScript(
      ({ data }) => {
        localStorage.setItem('participationData', JSON.stringify(data));
      },
      { data: LEGACY_EXPORT.data },
    );
    await student.addInitScript(
      ({ data }) => {
        localStorage.setItem('participationData', JSON.stringify(data));
      },
      { data: LEGACY_EXPORT.data },
    );

    await teacher.goto('/#/teacher');
    if (await teacher.getByLabel('Choose a mode').count()) {
      await teacher.getByLabel('Choose a mode').selectOption('teacher');
    }
    await selectClass(teacher, 'Period 1');

    await student.goto('/#/student');
    await expect(student.getByText('Waiting for next student')).toBeVisible();

    await teacher.getByRole('button', { name: '🍎 Teacher Pick' }).click();
    await teacher
      .getByRole('dialog', { name: 'Teacher Pick' })
      .getByRole('button', { name: /Alice/ })
      .click();
    await expect(student.getByText('Alice')).toBeVisible();

    await teacher.getByRole('button', { name: '✓ Correct' }).click();
    await expect(student.getByText('Waiting for next student')).toBeVisible();

    await teacher.getByRole('button', { name: '🙋 Volunteer' }).click();
    await teacher
      .getByRole('dialog', { name: 'Select Volunteer' })
      .getByRole('button', { name: 'Bob' })
      .click();
    await expect(student.getByText('Bob')).toBeVisible();
    await expect(student.getByText(/Volunteer/i)).toBeVisible();

    await context.close();
  });
});

test.describe('Split mode', () => {
  test('layout shows slides panel and compact actions', async ({ page }) => {
    await seedLegacyStorage(page);
    await page.goto('/');
    await page.getByLabel('Choose a mode').selectOption('split');
    await expect(page.getByTestId('slides-panel')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: '📂 Load PPTX' })).toBeVisible();
    await selectClass(page, 'Period 1');
    await expect(page.getByRole('button', { name: '🎲 Pick Random' })).toBeVisible();
    await expect(page.getByRole('button', { name: '✓ Correct' })).toBeVisible();
    await expect(page.getByRole('button', { name: '⏭ Skip' })).toBeVisible();
    await expect(page.getByRole('separator', { name: 'Resize slides panel' })).toBeVisible();
  });
});

test.describe('Visual tokens', () => {
  test('primary brand color is school blue', async ({ page }) => {
    await page.goto('/');
    const color = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    );
    expect(color.toLowerCase()).toBe('#106cad');
  });
});
