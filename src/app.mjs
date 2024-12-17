import "dotenv/config";
import { EmailBroadcaster } from "./broadcast/email.mjs";
import { RovicareScraper } from "./rovicare-scraper.mjs";
import { sleep } from "./utils/promise.mjs";

export class App {
  #INTERVAL_DURATION = 60 * 1000;

  #interval;

  #scraper;
  #emailBroadcaster;

  /**
   * @param {RovicareScraper} scraper
   * @param {EmailBroadcaster} emailBroadcaster
   */
  constructor(scraper, emailBroadcaster) {
    this.#scraper = scraper;
    this.#emailBroadcaster = emailBroadcaster;
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
    console.log("Getting the service requests...");
    // const serviceRequests = await this.#scraper.fetchServiceRequests();
    // console.log(serviceRequests);
  }

  async exit() {
    await this.#scraper.exit();
    this.#emailBroadcaster.exit();
    clearInterval(this.#interval);
  }
}
