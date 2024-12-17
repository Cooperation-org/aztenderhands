import nodemailer from "nodemailer";

import { config } from "../config.mjs";

export class EmailBroadcaster {
  #auth = config.smtp.auth;
  #emails = config.broadcastEmails;

  #transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: this.#auth.email, pass: this.#auth.password },
  });

  /**
   * @param {string} subject
   * @param {string} text
   * @param {string} html
   */
  async broadcast() {
    const info = [];

    for (const e of this.#emails) {
      const _info = await this.#transporter.sendMail({
        from: `"AZ Tender Hands" <${this.#auth.email}>`,
        to: e,
        subject: "New Referral",
        text: "New Referral found!",
        html: "<p>New Referral found!</p>",
      });
      info.push(_info);
    }

    return info.map((x) => x.messageId);
  }

  /**
   * @returns {void}
   */
  quit() {
    this.#transporter.close();
    this.#transporter = undefined;
  }
}
