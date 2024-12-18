import { config } from "../config.mjs";
import { Logger } from "../logger.mjs";

export class SMSBroadcaster {
  #auth = config.smtp.auth;
  #phoneNumbers = config.broadcastPhoneNumbers;

  #logger;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this.#logger = logger;
  }

  /**
   * @returns {Promise<void>}
   */
  async broadcast() {}

  /**
   * @returns {void}
   */
  exit() {}
}
