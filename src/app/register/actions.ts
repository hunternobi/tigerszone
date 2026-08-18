"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { isEmailConfigured, sendVerificationEmail } from "@/lib/email";
import { generateToken } from "@/lib/tokens";
import { createWelcomeNotification } from "@/lib/notifications";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben."),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein.")
    .regex(/[a-zA-Z]/, "Passwort muss mindestens einen Buchstaben enthalten.")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten."),
});

export interface RegisterResult {
  success: boolean;
  error?: string;
  requiresVerification?: boolean;
}

export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<RegisterResult> {
  const parsed = RegisterSchema.safeParse({ name, email, password });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const parsedValues = parsed.data;

  await dbConnect();
  const existing = await UserModel.findOne({ email: parsedValues.email });
  if (existing) {
    return { success: false, error: "Diese E-Mail-Adresse ist bereits registriert." };
  }

  const passwordHash = await bcrypt.hash(parsedValues.password, 10);
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const role = adminEmails.includes(parsedValues.email) ? "admin" : "user";

  const emailConfigured = isEmailConfigured();
  const verificationToken = emailConfigured ? generateToken() : undefined;

  const user = await UserModel.create({
    name: parsedValues.name,
    email: parsedValues.email,
    passwordHash,
    role,
    emailVerified: !emailConfigured,
    verificationToken,
    verificationTokenExpiresAt: emailConfigured
      ? new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS)
      : undefined,
  });

  if (!emailConfigured) {
    await createWelcomeNotification(user._id.toString(), user.name);
  }

  if (emailConfigured && verificationToken) {
    const emailResult = await sendVerificationEmail(
      parsedValues.email,
      parsedValues.name,
      verificationToken
    );
    if (!emailResult.success) {
      return {
        success: false,
        error: "Konto wurde erstellt, aber die Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte kontaktiere uns.",
      };
    }
    return { success: true, requiresVerification: true };
  }

  return { success: true, requiresVerification: false };
}

export async function resendVerificationEmail(email: string): Promise<RegisterResult> {
  const parsedEmail = z.string().trim().toLowerCase().email().safeParse(email);
  if (!parsedEmail.success) return { success: false, error: "Ungültige E-Mail-Adresse." };
  if (!isEmailConfigured()) {
    return { success: false, error: "E-Mail-Versand ist aktuell nicht verfügbar." };
  }

  await dbConnect();
  const user = await UserModel.findOne({ email: parsedEmail.data });
  if (!user || user.emailVerified) return { success: true };

  const verificationToken = generateToken();
  user.verificationToken = verificationToken;
  user.verificationTokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save();

  const emailResult = await sendVerificationEmail(user.email, user.name, verificationToken);
  if (!emailResult.success) {
    return { success: false, error: "Bestätigungs-E-Mail konnte nicht gesendet werden." };
  }
  return { success: true };
}
