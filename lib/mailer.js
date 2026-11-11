// lib/mailer.js
// Gmail SMTP (app password) mailer used to send owner notifications.
import nodemailer from "nodemailer";
import { OWNER_EMAIL } from "./owner";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

let transporter = null;

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("Mailer is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: pass.replace(/\s+/g, "") }, // app passwords are shown with spaces
    });
  }
  return transporter;
}

// Sends a table of [label, value] rows to the owner inbox (OWNER_EMAIL).
export async function sendOwnerEmail({ subject, rows, replyTo }) {
  const user = process.env.GMAIL_USER;

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:6px 10px;border:1px solid #ddd;background:#f7f7f7;font-weight:bold">${escapeHtml(label)}</td><td style="padding:6px 10px;border:1px solid #ddd">${escapeHtml(value)}</td></tr>`,
          )
          .join("")}
      </table>
    </div>`;

  await getTransporter().sendMail({
    from: `"KIK QR Card" <${user}>`,
    to: OWNER_EMAIL,
    replyTo,
    subject,
    text,
    html,
  });
  return { sent: true };
}
