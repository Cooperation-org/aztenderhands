import twilio from "twilio";
import { config } from "../config.mjs";
import { Logger } from "../logger.mjs";

export class SMSBroadcaster {
  #phoneNumbers = config.broadcastPhoneNumbers;
  #logger;
  #twilioClient;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this.#logger = logger;

    try {
      this.#twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
    } catch (error) {
      this.#logger.error("Failed to initialize Twilio client", error);
      throw error;
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async broadcast() {
    try {
      await Promise.all(
        this.#phoneNumbers.map(async pn => {
          try {
            await this.#twilioClient.messages.create({
              body: "New referral",
              from: config.twilio.fromNumber,
              to: pn,
            });
            this.#logger.info(`SMS sent successfully to ${pn}`);
          } catch (sendError) {
            this.#logger.error(`Failed to send SMS to ${pn} ${sendError}`);
          }
        }),
      );
    } catch (error) {
      this.#logger.error("SMS broadcast failed", error);
      throw error;
    }
  }

  /**
   * @returns {void}
   */
  exit() {}
}
