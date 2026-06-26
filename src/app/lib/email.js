import "server-only";
import nodemailer from "nodemailer";
import { getAppPublicUrl, getLoginUrl } from "./app-url.js";

let transporter = null;

function getEmailConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from:
      process.env.EMAIL_FROM ||
      process.env.SMTP_USER ||
      "no-reply@manitobachiefs.com",
    fromName: process.env.EMAIL_FROM_NAME || "AMC FNFAO",
  };
}

export function isEmailConfigured() {
  const config = getEmailConfig();
  return !!(config.host && config.user && config.pass);
}

export function listMissingEmailEnvKeys() {
  const config = getEmailConfig();
  const missing = [];
  if (!config.host.trim()) missing.push("SMTP_HOST");
  if (!config.user.trim()) missing.push("SMTP_USER");
  if (!config.pass.trim()) missing.push("SMTP_PASS");
  return missing;
}

function getTransporter() {
  if (transporter !== null) return transporter;

  const config = getEmailConfig();
  if (!config.host || !config.user || !config.pass) return null;

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendAdvocateWelcomeEmail({
  firstName,
  lastName,
  email,
  temporaryPassword,
  isResend = false,
}) {
  const trans = getTransporter();
  if (!trans) {
    const missing = listMissingEmailEnvKeys();
    return {
      sent: false,
      error: `Email is not configured. Set ${missing.join(", ")} on the server.`,
    };
  }

  const appUrl = getAppPublicUrl();
  const loginUrl = getLoginUrl();

  if (!appUrl) {
    return {
      sent: false,
      error: "NEXT_PUBLIC_APP_URL is not configured.",
    };
  }

  const config = getEmailConfig();
  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const greet = displayName ? `Hello ${escapeHtml(displayName)},` : "Hello,";
  const subject = isResend
    ? "AMC FNFAO — your sign-in reminder"
    : "Welcome to AMC FNFAO — your account is ready";

  const passwordBlock = temporaryPassword
    ? `
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Sign in with your email address and this temporary password:
            </p>
            <p style="font-family: monospace; font-size: 18px; font-weight: 700; color: #1a1a1a; background: #f3f4f6; padding: 12px 16px; border-radius: 6px; display: inline-block;">
              ${escapeHtml(temporaryPassword)}
            </p>
            <p style="color: #888888; font-size: 13px; line-height: 1.6; margin-top: 16px;">
              Please change your password after your first sign-in when that option is available.
            </p>`
    : `
            <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Sign in with <strong>Sign in with AMC email</strong> on the login page using your
              <strong>@manitobachiefs.com</strong> Microsoft 365 account. No password is required.
            </p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 32px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;">${isResend ? "Sign-in reminder" : "Welcome"}</h1>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${greet}</p>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          An account has been created for you on the AMC FNFAO database application.
        </p>
        ${passwordBlock}
        <p style="margin-top: 32px; margin-bottom: 24px;">
          <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background-color: #7504ff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600;">
            Sign in
          </a>
        </p>
        <p style="color: #aaaaaa; font-size: 13px; margin-top: 20px;">
          If you did not expect this email, you can safely ignore it.
        </p>
        <p style="color: #aaaaaa; font-size: 13px;">— ${escapeHtml(config.fromName)}</p>
      </div>
    </div>
  `;

  const textPassword = temporaryPassword
    ? `Temporary password: ${temporaryPassword}\n\n`
    : "Sign in with your @manitobachiefs.com Microsoft 365 account (Sign in with AMC email). No password is required.\n\n";

  const text = [
    greet.replace(/<[^>]+>/g, ""),
    "",
    isResend
      ? "Reminder: your AMC FNFAO account is ready."
      : "Your AMC FNFAO account has been created.",
    "",
    `Sign in at: ${loginUrl}`,
    `Email: ${email}`,
    "",
    textPassword,
    `— ${config.fromName}`,
  ].join("\n");

  try {
    await trans.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: email,
      subject,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Failed to send welcome email to", email, message);
    return { sent: false, error: message };
  }
}

export async function sendClientAssignmentEmail({
  advocateEmail,
  advocateFirstName,
  advocateLastName,
  clientFirstName,
  clientLastName,
}) {
  const trans = getTransporter();
  if (!trans) {
    return { sent: false, skipped: true };
  }

  const config = getEmailConfig();
  const appUrl = getAppPublicUrl();
  const loginUrl = getLoginUrl();
  const advocateName = [advocateFirstName, advocateLastName].filter(Boolean).join(" ").trim();
  const clientName = [clientFirstName, clientLastName].filter(Boolean).join(" ").trim() || "a client";
  const greet = advocateName ? `Hello ${escapeHtml(advocateName)},` : "Hello,";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 32px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;">New client assignment</h1>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">${greet}</p>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          You have been assigned to <strong>${escapeHtml(clientName)}</strong> in the AMC FNFAO system.
        </p>
        <p style="margin-top: 32px; margin-bottom: 24px;">
          <a href="${escapeHtml(loginUrl)}" style="display: inline-block; background-color: #7504ff; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600;">
            Open dashboard
          </a>
        </p>
        <p style="color: #aaaaaa; font-size: 13px;">— ${escapeHtml(config.fromName)}</p>
      </div>
    </div>
  `;

  const text = [
    greet.replace(/<[^>]+>/g, ""),
    "",
    `You have been assigned to ${clientName} in AMC FNFAO.`,
    "",
    `Sign in at: ${loginUrl || appUrl}`,
    "",
    `— ${config.fromName}`,
  ].join("\n");

  try {
    await trans.sendMail({
      from: `"${config.fromName}" <${config.from}>`,
      to: advocateEmail,
      subject: `AMC FNFAO — assigned to ${clientName}`,
      html,
      text,
    });
    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Failed to send assignment email to", advocateEmail, message);
    return { sent: false, error: message };
  }
}
