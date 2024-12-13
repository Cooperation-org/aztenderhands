import nodemailer from "nodemailer";

import { config } from "../config/index.mjs";

/**
 * @type {nodemailer.Transporter<nodemailer.SMTPTransport.SentMessageInfo, nodemailer.SMTPTransport.Options> | undefined}
 */
let transporter;

/**
 * @returns {Promise<nodemailer.Transporter<nodemailer.SMTPTransport.SentMessageInfo, nodemailer.SMTPTransport.Options>>}
 */
async function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: config.smtp.auth.email,
      pass: config.smtp.auth.password,
    },
  });

  await transporter.verify();

  return transporter;
}

/**
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 */
export async function broadcast() {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: `"AZ Tender Hands" <${config.smtp.auth.email}>`,
    to: config.broadcastEmails.join(", "),
    subject: "New Referral",
    text: "New Referral found!",
    html: "<p>New Referral found!</p>",
  });

  return info.messageId;
}

export function quitTransporter() {
  if (!transporter) return;
  transporter.close();
  transporter = undefined;
}
