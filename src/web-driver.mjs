import webdriver, { Browser, Builder } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

export class WebDriver {
  #BROWSER = Browser.FIREFOX;

  /**
   * @type {Promise<webdriver.ThenableWebDriver> | undefined}
   */
  #driver;

  async init() {
    if (this.#driver) return;
    const opts = new firefox.Options();
    opts.addArguments("-headless");
    this.#driver = await new Builder().forBrowser(this.#BROWSER).setFirefoxOptions(opts).build();
  }

  /**
   * @returns {webdriver.ThenableWebDriver}
   */
  getDriver() {
    return this.#driver;
  }

  /**
   * @returns {Promise<void>}
   */
  async exit() {
    if (!this.#driver) return;
    await this.#driver.quit();
    this.#driver = undefined;
  }
}
