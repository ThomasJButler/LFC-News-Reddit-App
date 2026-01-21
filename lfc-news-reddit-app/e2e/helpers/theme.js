/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Theme helper utilities for Playwright E2E tests.
 *              WHY: The app supports 4 themes that need visual testing.
 *              These helpers enable consistent theme switching across tests.
 */

/**
 * Available themes in the application
 * @type {string[]}
 */
const THEMES = ['red', 'white', 'green', 'night'];

/**
 * Theme display names for test descriptions
 * @type {Object.<string, string>}
 */
const THEME_NAMES = {
  red: 'Red (Default)',
  white: 'White',
  green: 'Green',
  night: 'Night',
};

/**
 * Sets the theme on the page by clicking the theme switcher
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} theme - Theme name to set ('red', 'white', 'green', 'night')
 */
async function setTheme(page, theme) {
  // Open theme switcher if not already open
  const themeSwitcher = page.getByRole('button', { name: /Theme/i });
  await themeSwitcher.click();

  // Select the theme option
  const themeOption = page.getByRole('button', { name: new RegExp(theme, 'i') });
  await themeOption.click();

  // Wait for theme to be applied
  await page.waitForFunction(
    (expectedTheme) => document.documentElement.getAttribute('data-theme') === expectedTheme,
    theme
  );
}

/**
 * Gets the current theme from the page
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<string>} Current theme name
 */
async function getTheme(page) {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'red');
}

/**
 * Sets theme directly via JavaScript (faster, for visual tests)
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} theme - Theme name to set
 */
async function setThemeDirect(page, theme) {
  await page.evaluate((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lfc-theme', theme);
  }, theme);

  // Wait for any CSS transitions to complete
  await page.waitForTimeout(350); // Match --transition-normal
}

/**
 * Generates screenshot name with theme and viewport suffix
 * @param {string} baseName - Base name for the screenshot
 * @param {string} theme - Theme name
 * @param {string} viewport - Viewport name ('mobile', 'tablet', 'desktop')
 * @returns {string} Full screenshot name
 */
function screenshotName(baseName, theme, viewport) {
  return `${baseName}-${theme}-${viewport}.png`;
}

/**
 * Helper to run a test across all themes
 * @param {import('@playwright/test').TestInfo} testInfo - Playwright test info
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Function} testFn - Test function to run for each theme
 */
async function forEachTheme(page, testFn) {
  for (const theme of THEMES) {
    await setThemeDirect(page, theme);
    await testFn(theme);
  }
}

module.exports = {
  THEMES,
  THEME_NAMES,
  setTheme,
  getTheme,
  setThemeDirect,
  screenshotName,
  forEachTheme,
};
