import { Resend } from "resend";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isEmailConfigured(): boolean {
  return resend !== null;
}

const EMAIL_FROM = process.env.EMAIL_FROM ?? `${SITE_NAME} <onboarding@resend.dev>`;

function wrapper(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:0;background-color:#f2f4f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background-color:#0a0f3d;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;text-align:center;">
                <img
                  src="${SITE_URL}/images/TigersZone_Logo.png"
                  alt="${SITE_NAME}"
                  width="56"
                  height="56"
                  style="display:inline-block;border-radius:50%;margin-bottom:10px;"
                />
                <br />
                <span style="color:#5b7fc7;font-size:22px;font-weight:700;letter-spacing:0.02em;">${SITE_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;color:#ffffff;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#ffffff;">${title}</h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#8a93b8;">${SITE_NAME} &middot; Fan-Plattform für die Straubing Tigers</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:999px;background-color:#5b7fc7;">
        <a href="${href}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${label}</a>
      </td>
    </tr>
  </table>`;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) return { success: false, error: "E-Mail-Versand ist nicht konfiguriert." };

  const verifyUrl = `${SITE_URL}/verify-email?token=${token}`;
  const html = wrapper(
    `Willkommen in der ${SITE_NAME}, ${name}!`,
    `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#ffffff;">
      Schön, dass du dabei bist. Bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und mitzutippen.
    </p>
    ${button(verifyUrl, "E-Mail-Adresse bestätigen")}
    <p style="margin:0;font-size:12px;line-height:1.6;color:#a7b1d1;">
      Der Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.
    </p>`
  );

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `Willkommen in der ${SITE_NAME} – bitte bestätige deine E-Mail-Adresse`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch {
    return { success: false, error: "E-Mail konnte nicht gesendet werden." };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) return { success: false, error: "E-Mail-Versand ist nicht konfiguriert." };

  const resetUrl = `${SITE_URL}/reset-password?token=${token}`;
  const html = wrapper(
    "Passwort zurücksetzen",
    `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#ffffff;">
      Hallo ${name}, du hast angefragt, dein Passwort zurückzusetzen. Klicke auf den Button, um ein neues Passwort zu vergeben.
    </p>
    ${button(resetUrl, "Neues Passwort vergeben")}
    <p style="margin:0;font-size:12px;line-height:1.6;color:#a7b1d1;">
      Der Link ist 1 Stunde gültig. Falls du das nicht angefragt hast, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert.
    </p>`
  );

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `${SITE_NAME} – Passwort zurücksetzen`,
      html,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true };
  } catch {
    return { success: false, error: "E-Mail konnte nicht gesendet werden." };
  }
}
