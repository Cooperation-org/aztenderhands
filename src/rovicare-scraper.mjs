import fs from "node:fs/promises";
import path from "node:path";
import { By, Key, until, default as webdriver } from "selenium-webdriver";
import {
  ACCESS_DURATION_IN_MS,
  APP_ENDPOINT,
  CACHE_DIR,
  REFERRAL_INCOMING_ENDPOINT,
  REFERRALS_ENDPOINT,
  REFERRALS_REQUEST_BODY,
  SIGNIN_ENDPOINT,
} from "./consts.mjs";
import { WebDriver } from "./web-driver.mjs";
import { getTimestamp } from "./utils/time.mjs";

/**
 * @typedef {{refreshToken: string, accessToken: string}} Tokens
 *
 * @typedef {{
 *   Data: import("./types/service-request").ServiceRequestDto[],
 *   DataLength: number,
 *   Status: number,
 *   Message: string | null,
 *   Warning: string | null,
 *   Error: string | null,
 *   TotalRecords: number,
 *   FhirResponse: unknown | null,
 * }} ServiceRequestResponseBody
 */

export class RovicareScraper {
  #TIMEOUT = 10000;
  #TOKENS_CACHE_FILE = path.join(CACHE_DIR, "tokens.cache");

  #emailFieldId = "signInName";
  #passwordFieldId = "password";
  #submitButtonId = "next";

  #driver;

  /**
   * @param {WebDriver} driver
   */
  constructor(driver) {
    this.#driver = driver;
  }

  async init() {
    await this.#driver.init();
  }

  /**
   * @returns {Promise<ServiceRequestResponseBody>}
   */
  async fetchServiceRequests() {
    const { accessToken } = await this.#getTokens();
    const res = await fetch(REFERRALS_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(REFERRALS_REQUEST_BODY),
    });

    if (res.status === 401) {
      await this.#invalidateCache();
      return this.fetchServiceRequests();
    }

    /**
     * @type {ServiceRequestResponseBody}
     */
    const jsonRes = await res.json();

    if (jsonRes?.Data) {
      jsonRes.DataLength = jsonRes.Data.length;
    }

    await this.#cacheServiceRequests(jsonRes);

    return jsonRes.Data;
  }

  /**
   * @returns {Promise<Tokens>}
   */
  async #getTokens() {
    const cacheIsValid = await this.#validateAccessTokenExpiry();
    if (cacheIsValid) {
      const tokens = await this.#getTokensFromCache();
      if (tokens) return tokens;
    }

    const d = this.#driver.getDriver();
    await d.get(APP_ENDPOINT);
    await d.wait(until.urlMatches(new RegExp(SIGNIN_ENDPOINT)), this.#TIMEOUT);

    await d.wait(until.elementLocated(By.id(this.#emailFieldId)), this.#TIMEOUT);

    await d.findElement(By.id(this.#emailFieldId)).sendKeys(process.env.SIGNIN_EMAIL);
    await d.findElement(By.id(this.#passwordFieldId)).sendKeys(process.env.SIGNIN_PASSWORD);

    await d.findElement(By.id(this.#submitButtonId)).sendKeys(Key.RETURN);

    await d.wait(until.urlMatches(new RegExp(REFERRAL_INCOMING_ENDPOINT)));

    const tokens = await this.#getTokensFromSessionStorage(d);
    await this.#cacheTokens(tokens);
    return tokens;
  }

  async #invalidateCache() {
    await fs.unlink(this.#TOKENS_CACHE_FILE);
  }

  /**
   * @param {webdriver.ThenableWebDriver} driver
   * @returns {Promise<Tokens>}
   */
  async #getTokensFromSessionStorage() {
    const d = this.#driver.getDriver();
    return d.executeScript(() => {
      const refreshToken = window.sessionStorage.getItem("refreshToken");
      const accessToken = window.sessionStorage.getItem("accessToken");
      return { refreshToken, accessToken };
    });
  }

  /**
   * @param {Promise<Tokens>} tokens
   */
  async #cacheTokens(tokens) {
    await fs.writeFile(this.#TOKENS_CACHE_FILE, JSON.stringify(tokens), { encoding: "utf-8" });
  }

  /**
   * @param {Promise<Tokens>} tokens
   * @returns {?Promise<Tokens>}
   */
  async #getTokensFromCache() {
    try {
      const content = await fs.readFile(this.#TOKENS_CACHE_FILE, { encoding: "utf-8" });
      return JSON.parse(content);
    } catch (e) {
      return null;
    }
  }

  /**
   * @returns {Promise<boolean>}
   */
  async #validateAccessTokenExpiry() {
    try {
      const s = await fs.stat(this.#TOKENS_CACHE_FILE);
      const age = new Date() - s.mtime;
      return age < ACCESS_DURATION_IN_MS;
    } catch (_) {
      return false;
    }
  }

  /**
   * @param {ServiceRequestResponseBody} body
   */
  async #cacheServiceRequests(body) {
    await fs.writeFile(this.#getReferralsCache(), JSON.stringify(body, null, 2), { encoding: "utf-8" });
  }

  #getReferralsCache() {
    return path.join(CACHE_DIR, getTimestamp() + "_referrals.cache");
  }

  async exit() {
    await this.#driver.exit();
  }
}
