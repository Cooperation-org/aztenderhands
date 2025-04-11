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
import { config } from "./config.mjs";

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
    this.#logger.debug("Initializing the driver");
    if (this.#driver) {
      this.#logger.debug("Driver already initialized");
      return;
    }

    try {
      const opts = new firefox.Options();
      if (config.firefoxBinaryPath) {
        this.#logger.debug(`Setting Firefox binary path to: ${config.firefoxBinaryPath}`);
        opts.setBinary(config.firefoxBinaryPath);
      }
      opts.addArguments("-headless");

      this.#logger.debug("Building WebDriver instance");
      this.#driver = await new Builder().forBrowser(this.#BROWSER).setFirefoxOptions(opts).build();

      this.#logger.debug("WebDriver initialized successfully");
    } catch (error) {
      this.#logger.error("Failed to initialize WebDriver:", error);
      throw error;
    }
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
    try {
      const eTokens = await this.#dao.getAvailableTokens();
      if (eTokens) {
        this.#logger.debug(`Using already existing token with id: ${eTokens.id}`);
        return eTokens;
      }

      this.#logger.info("Fetching new tokens...");
      await this.#initDriver();

      const d = this.#driver;
      this.#logger.debug("Navigating to Rovicare app endpoint");
      await d.get(APP_ENDPOINT);

      this.#logger.debug("Waiting for sign-in page");
      try {
        await d.wait(until.urlMatches(new RegExp(SIGNIN_ENDPOINT)), this.#TIMEOUT);
      } catch (error) {
        this.#logger.error("Failed to reach sign-in page:", error);
        throw error;
      }

      // Add a small delay to ensure page is fully loaded
      await d.sleep(2000);

      this.#logger.debug("Filling login form");
      try {
        await d.wait(until.elementLocated(By.id(this.#identifiers.emailFieldId)), this.#TIMEOUT);
        await d.findElement(By.id(this.#identifiers.emailFieldId)).clear();
        await d.findElement(By.id(this.#identifiers.emailFieldId)).sendKeys(process.env.SIGNIN_EMAIL);

        await d.wait(until.elementLocated(By.id(this.#identifiers.passwordFieldId)), this.#TIMEOUT);
        await d.findElement(By.id(this.#identifiers.passwordFieldId)).clear();
        await d.findElement(By.id(this.#identifiers.passwordFieldId)).sendKeys(process.env.SIGNIN_PASSWORD);
      } catch (error) {
        this.#logger.error("Failed to fill login form:", error);
        throw error;
      }

      // Add a small delay before submitting
      await d.sleep(1000);

      this.#logger.debug("Submitting login form");
      try {
        await d.findElement(By.id(this.#identifiers.submitButtonId)).click();
      } catch (error) {
        this.#logger.error("Failed to submit login form:", error);
        throw error;
      }

      // Wait for any redirects or security checks
      await d.sleep(5000);

      this.#logger.debug("Waiting for referral page");
      let tokens = null;
      let maxAttempts = 3;
      let attempt = 0;

      while (attempt < maxAttempts && !tokens) {
        try {
          // Try multiple URL patterns
          const urlPatterns = [
            new RegExp(REFERRAL_INCOMING_ENDPOINT),
            new RegExp("app.rovicare.com"),
            new RegExp("rovicare.com"),
          ];

          for (const pattern of urlPatterns) {
            try {
              await d.wait(until.urlMatches(pattern), this.#TIMEOUT);
              this.#logger.debug(`Found matching URL pattern: ${pattern}`);

              // Extract tokens
              tokens = await d.executeScript(() => {
                const refresh = window.sessionStorage.getItem("refreshToken");
                const access = window.sessionStorage.getItem("accessToken");
                const now = new Date();
                return { access, refresh, accessExpiresAt: now.setHours(now.getHours() + 1) };
              });

              if (tokens && tokens.access) {
                this.#logger.debug("Successfully extracted tokens");
                break;
              }
            } catch (e) {
              this.#logger.debug(`URL pattern ${pattern} not matched, trying next...`);
            }
          }

          if (tokens && tokens.access) {
            break;
          }

          attempt++;
          this.#logger.debug(`Token extraction attempt ${attempt} failed, retrying...`);
          await d.sleep(2000); // Wait before retrying
        } catch (error) {
          this.#logger.error(`Error during token extraction attempt ${attempt}:`, error);
          attempt++;
          await d.sleep(2000);
        }
      }

      if (!tokens || !tokens.access) {
        throw new Error("Failed to extract tokens after multiple attempts");
      }

      this.#logger.debug("Storing new tokens");
      const newTokens = await this.#dao.createToken(tokens);
      this.#logger.debug(`Stored new token with id: ${newTokens.id}`);
      return newTokens;
    } catch (error) {
      this.#logger.error("Error during token fetch:", error);
      throw error;
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
