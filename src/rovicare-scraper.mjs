import { Builder, Browser, By, Key, until, default as webdriver } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import {
  APP_ENDPOINT,
  REFERRAL_INCOMING_ENDPOINT,
  REFERRALS_ENDPOINT,
  REFERRALS_REQUEST_BODY,
  SIGNIN_ENDPOINT,
} from "./consts.mjs";
import { Dao } from "./storage/dao.mjs";
import winston from "winston";
import { fetchWithRetry } from "./utils/fetch.mjs";

/**
 * @typedef {import("./types/tokens").Tokens} Tokens
 * @typedef {import("./types/service-request").ServiceRequestResponseBody} ServiceRequestResponseBody
 */

export class RovicareScraper {
  #BROWSER = Browser.FIREFOX;
  #TIMEOUT = 10000;

  #identifiers = {
    emailFieldId: "signInName",
    passwordFieldId: "password",
    submitButtonId: "next",
  };

  #dao;
  #logger;

  /**
   * @param {Dao} dao
   * @param {winston} logger
   */
  constructor(dao, logger) {
    this.#dao = dao;
    this.#logger = logger;
  }

  /**
   * @type {webdriver.ThenableWebDriver | undefined}
   */
  #driver;

  async init() {
    await this.#dao.init();
  }

  async #initDriver() {
    this.#logger.debug("Initlizing the driver");
    if (this.#driver) return;
    const opts = new firefox.Options();
    opts.addArguments("-headless");
    this.#driver = await new Builder().forBrowser(this.#BROWSER).setFirefoxOptions(opts).build();
  }

  /**
   * @returns {Promise<import("./types/service-request").ServiceRequest[]>}
   */
  async fetchServiceRequests() {
    const { access } = await this.#getTokens();
    const res = await fetchWithRetry(REFERRALS_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${access}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(REFERRALS_REQUEST_BODY),
    });

    if (res.status === 401) {
      await this.#dao.invalidateToken(access);
      return this.fetchServiceRequests();
    }

    /**
     * @type {ServiceRequestResponseBody}
     */
    const jsonRes = await res.json();

    if (jsonRes?.Data) {
      jsonRes.DataLength = jsonRes.Data.length;
    }

    await this.#dao.updateServiceRequestsCount(jsonRes.TotalRecords);
    const newServiceRequests = await this.#dao.createNonExistingServiceRequests(jsonRes.Data);

    return newServiceRequests;
  }

  /**
   * @returns {Promise<Tokens>}
   */
  async #getTokens() {
    const eTokens = await this.#dao.getAvailableTokens();
    if (eTokens) {
      this.#logger.debug(`Using already existing token with id: ${eTokens.id}`);
      return eTokens;
    }

    try {
      this.#logger.info("Fetching new tokens...");
      await this.#initDriver();

      const d = this.#driver;
      await d.get(APP_ENDPOINT);
      await d.wait(until.urlMatches(new RegExp(SIGNIN_ENDPOINT)), this.#TIMEOUT);

      await d.wait(until.elementLocated(By.id(this.#identifiers.emailFieldId)), this.#TIMEOUT);

      await d.findElement(By.id(this.#identifiers.emailFieldId)).sendKeys(process.env.SIGNIN_EMAIL);
      await d.findElement(By.id(this.#identifiers.passwordFieldId)).sendKeys(process.env.SIGNIN_PASSWORD);

      await d.findElement(By.id(this.#identifiers.submitButtonId)).sendKeys(Key.RETURN);

      await d.wait(until.urlMatches(new RegExp(REFERRAL_INCOMING_ENDPOINT)));

      const tokens = await this.#driver.executeScript(() => {
        const refresh = window.sessionStorage.getItem("refreshToken");
        const access = window.sessionStorage.getItem("accessToken");
        const now = new Date();
        return { access, refresh, accessExpiresAt: now.setHours(now.getHours() + 1) };
      });
      const newTokens = await this.#dao.createToken(tokens);
      this.#logger.debug(`Stored new token`);
      return newTokens;
    } finally {
      await this.#exitDriver();
    }
  }

  async #exitDriver() {
    this.#logger.debug("Exiting driver");
    if (!this.#driver) return;
    try {
      await this.#driver.quit();
    } catch (e) {
      this.#logger.error(`Error while exiting the driver: ${e}`);
    }
    this.#driver = undefined;
  }

  async exit() {
    if (this.#dao) {
      await this.#dao.disconnect();
      this.#dao = undefined;
    }

    await this.#exitDriver();
  }
}
