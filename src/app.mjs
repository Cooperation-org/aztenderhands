import "dotenv/config";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { sleep } from "./utils/promise.mjs";
import winston from "winston";
import { Dao } from "./storage/dao.mjs";

export class App {
  #INTERVAL_DURATION = 60 * 1000;

  #interval;

  #scraper;
  #emailBroadcaster;
  #logger;
  #dao;

  /**
   * @param {RovicareScraper} scraper
   * @param {EmailBroadcaster} emailBroadcaster
   * @param {Dao} dao
   * @param {winston} logger
   */
  constructor(scraper, emailBroadcaster, dao, logger) {
    this.#scraper = scraper;
    this.#emailBroadcaster = emailBroadcaster;
    this.#logger = logger;
    this.#dao = dao;
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
    this.#logger.debug("Getting the service requests...");
    const serviceRequests = await this.#scraper.fetchServiceRequests();
    this.#logger.info(`Fetched service requests. ${serviceRequests.length} new service requests.`);

    if (!serviceRequests.length) {
      return;
    }

    this.#logger.info(`======= NEW REFERRALS =======`);

    this.#logger.debug(`The new service requests: ${JSON.stringify(serviceRequests, null, 2)}`);

    await this.#emailBroadcaster.broadcast();

    this.#logger.debug(`Marking the referral as notified`);
    await this.#dao.markServiceRequestAsNotified(serviceRequests.map(x => x.id));
  }

  async exit() {
    await this.#scraper.exit();
    this.#emailBroadcaster.exit();
    clearInterval(this.#interval);
  }
}
