import nodemailer from "nodemailer";

import { config } from "../config.mjs";
import { Logger } from "../logger.mjs";

export class EmailBroadcaster {
  #auth = config.smtp.auth;
  #emails = config.broadcastEmails;

  #transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: this.#auth.email, pass: this.#auth.password },
  });

  #logger;

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    this.#logger = logger;
  }

  /**
   * @param {string} subject
   * @param {string} text
   * @param {string} html
   */
  async broadcast() {
    const info = [];

    for (const e of this.#emails) {
      this.#logger.debug(`Sending a new referral email to ${e}...`);
      const _info = await this.#transporter.sendMail({
        from: `"AZ Tender Hands" <${this.#auth.email}>`,
        to: e,
        subject: "New Referral",
        text: "New Referral found!",
        html: "<p>New Referral found!</p>",
      });
      info.push(_info);
      this.#logger.info(`Sent a new referral email to ${e}`);
    }

    return info.map(x => x.messageId);
  }

  /**
   * @returns {void}
   */
  exit() {
    this.#transporter.close();
    this.#transporter = undefined;
  }
}
