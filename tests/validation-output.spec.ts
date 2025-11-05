import { test, expect } from '@playwright/test';

test('validation-output shows validation message', async ({ browserName, page }) => {
  await page.goto('/tests/basic.html');
  const input = page.locator('#number');
  await input.press('2');
  await input.press('Enter');

  const messages = {
      'chromium': 'Value must be greater than or equal to 5.',
      'firefox': 'Please select a value that is no less than 5.',
      'webkit': 'Please select a value that is no less than 5.', // TODO not sure
  }

  await expect(page.getByTestId('validation-output'))
      .toHaveText(messages[browserName.toLowerCase() as keyof typeof messages])
});
