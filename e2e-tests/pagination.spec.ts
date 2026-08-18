import { test, expect } from '@playwright/test';

test.describe('Game Listing Pagination', () => {
  test('should display Previous and Next controls with a limited number of games per page', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
    });

    await test.step('Verify pagination controls are visible', async () => {
      await expect(page.getByTestId('pagination')).toBeVisible();
      await expect(page.getByTestId('pagination-status')).toHaveText('Page 1 of 4');
    });

    await test.step('Verify Previous control is disabled on the first page', async () => {
      await expect(page.getByTestId('pagination-previous-disabled')).toBeVisible();
      await expect(page.getByTestId('pagination-previous')).toHaveCount(0);
    });

    await test.step('Verify Next control is enabled and games are capped at the page size', async () => {
      await expect(page.getByTestId('pagination-next')).toBeVisible();
      await expect(page.getByTestId('game-card')).toHaveCount(6);
    });
  });

  test('should navigate to the next page when clicking Next', async ({ page }) => {
    await test.step('Navigate to homepage', async () => {
      await page.goto('/');
    });

    await test.step('Click the Next control', async () => {
      await page.getByTestId('pagination-next').click();
    });

    await test.step('Verify navigation to page 2', async () => {
      await expect(page).toHaveURL('/page/2');
      await expect(page.getByTestId('pagination-status')).toHaveText('Page 2 of 4');
      await expect(page.getByTestId('pagination-previous')).toBeVisible();
      await expect(page.getByTestId('pagination-next')).toBeVisible();
    });
  });

  test('should navigate back to the previous page when clicking Previous', async ({ page }) => {
    await test.step('Navigate to page 2', async () => {
      await page.goto('/page/2');
      await expect(page.getByTestId('pagination-status')).toHaveText('Page 2 of 4');
    });

    await test.step('Click the Previous control', async () => {
      await page.getByTestId('pagination-previous').click();
    });

    await test.step('Verify navigation back to the homepage', async () => {
      await expect(page).toHaveURL('/');
      await expect(page.getByTestId('pagination-status')).toHaveText('Page 1 of 4');
    });
  });

  test('should disable Next on the last page', async ({ page }) => {
    await test.step('Navigate to the last page', async () => {
      await page.goto('/page/4');
    });

    await test.step('Verify Next control is disabled', async () => {
      await expect(page.getByTestId('pagination-status')).toHaveText('Page 4 of 4');
      await expect(page.getByTestId('pagination-next-disabled')).toBeVisible();
      await expect(page.getByTestId('pagination-next')).toHaveCount(0);
    });

    await test.step('Verify the final page shows the remaining games', async () => {
      await expect(page.getByTestId('game-card')).toHaveCount(3);
    });
  });
});
