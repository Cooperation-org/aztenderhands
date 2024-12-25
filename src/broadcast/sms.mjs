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

    // Initialize Twilio client
    try {
      this.#twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
    } catch (error) {
      this.#logger.error("Failed to initialize Twilio client", error);
      throw error;
    }
  }

  /**
   * Broadcasts an SMS message to all configured phone numbers
   * @returns {Promise<void>}
   */
  async broadcast() {
    try {
      // Send SMS to each phone number
      await Promise.all(
        this.#phoneNumbers.map(async pn => {
          try {
            await this.#twilioClient.messages.create({
              body: "New referral",
              from: config.twilio.fromNumber, // Your Twilio phone number
              to: pn,
            });
            this.#logger.info(`SMS sent successfully to ${pn}`);
          } catch (sendError) {
            this.#logger.error(`Failed to send SMS to ${pn}`, sendError);
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
