import "dotenv/config";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { sleep } from "./utils/promise.mjs";
import winston from "winston";

export class App {
  #INTERVAL_DURATION = 60 * 1000;

  #interval;

  #scraper;
  #emailBroadcaster;
  #logger;

  /**
   * @param {RovicareScraper} scraper
   * @param {EmailBroadcaster} emailBroadcaster
   * @param {winston} logger
   */
  constructor(scraper, emailBroadcaster, logger) {
    this.#scraper = scraper;
    this.#emailBroadcaster = emailBroadcaster;
    this.#logger = logger;
  }

  async init() {
    await this.#scraper.init();
  }

  async start() {
    this.#intervalCB();

    await sleep(this.#INTERVAL_DURATION);
    await this.start();
  }

  async #intervalCB() {
    this.#logger.info("Getting the service requests...");
    const serviceRequests = await this.#scraper.fetchServiceRequests();
    this.#logger.info(`Fetched service requests. ${serviceRequests.length} new service requests.`);
  }

  async exit() {
    await this.#scraper.exit();
    this.#emailBroadcaster.exit();
    clearInterval(this.#interval);
  }
}
