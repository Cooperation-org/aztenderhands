import webdriver, { Builder, Browser } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const BROWSER = Browser.FIREFOX;

let driver;

/**
 * @returns {Promise<webdriver.ThenableWebDriver>}
 */
export async function getDriver() {
  if (driver) return driver;
  const opts = new firefox.Options();
  opts.addArguments("-headless");

  driver = await new Builder().forBrowser(BROWSER).setFirefoxOptions(opts).build();
  return driver;
}

export async function quitDriver() {
  if (!driver) return;
  await driver.quit();
  driver = undefined;
}
