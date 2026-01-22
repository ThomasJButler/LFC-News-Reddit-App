/**
 * @author Tom Butler
 * @date 2026-01-21
 * @description Theme helper utilities for Playwright E2E tests.
 *              WHY: The app supports 4 themes that need visual testing.
 *              These helpers enable consistent theme switching across tests.
 */

/**
 * Available themes in the application
 * WHY: Only 3 themes matching Liverpool FC kits - Home (red), Away (white/cream), Keeper (green)
 * @type {string[]}
 */
const THEMES = ['red', 'white', 'green'];

/**
 * Theme display names for test descriptions
 * @type {Object.<string, string>}
 */
const THEME_NAMES = {
  red: 'Red (Default)',
  white: 'White',
  green: 'Green',
};

/**
 * Sets the theme on the page by clicking the appropriate theme button
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} theme - Theme name to set ('red', 'white', 'green')
 */
async function setTheme(page, theme) {
  // Map theme IDs to button names
  const themeButtonNames = {
    red: 'Anfield Red theme',
    white: 'Away Day theme',
    green: 'Keeper Kit theme'
  };

  // Click the theme button directly (no dropdown to open)
  const themeButton = page.getByRole('button', { name: themeButtonNames[theme] });
  await themeButton.click();

  // Wait for theme to be applied
  if (theme === 'red') {
    // Red theme removes the data-theme attribute
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute('data-theme')
    );
  } else {
    await page.waitForFunction(
      (expectedTheme) => document.documentElement.getAttribute('data-theme') === expectedTheme,
      theme
    );
  }
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

/**
 * Returns an array of locators for dynamic content that should be masked in screenshots
 * WHY: Timestamps, scores, and usernames change between test runs causing flaky visual tests.
 *      Masking these elements ensures consistent screenshots while still testing layout and styling.
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {import('@playwright/test').Locator[]} Array of locators to mask
 */
function getDynamicContentMasks(page) {
  return [
    // Post list items
    page.locator('[class*="time"]'),           // Relative timestamps ("2h ago")
    page.locator('[class*="upvotes"]'),        // Upvote counts
    page.locator('[class*="score"]'),          // Score displays
    page.locator('[class*="comments"] span'),  // Comment counts in post cards
    page.locator('[class*="author"]'),         // Author usernames

    // Comment section
    page.locator('[class*="commentMeta"]'),    // Comment metadata (author, time)
    page.locator('[class*="commentScore"]'),   // Comment scores

    // Post detail
    page.locator('[class*="metaAuthor"]'),     // Post detail author
    page.locator('[class*="metaTime"]'),       // Post detail timestamp
  ];
}

module.exports = {
  THEMES,
  THEME_NAMES,
  setTheme,
  getTheme,
  setThemeDirect,
  screenshotName,
  forEachTheme,
  getDynamicContentMasks,
};
