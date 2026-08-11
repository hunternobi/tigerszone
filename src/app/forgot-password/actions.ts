"use server";

import { z } from "zod";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { isEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import { generateToken } from "@/lib/tokens";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const EmailSchema = z.string().trim().toLowerCase().email();

export interface ForgotPasswordResult {
  success: boolean;
  error?: string;
}

export async function forgotPasswordAction(email: string): Promise<ForgotPasswordResult> {
  const parsed = EmailSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, error: "Bitte eine gültige E-Mail-Adresse angeben." };
  }

  if (!isEmailConfigured()) {
    return { success: false, error: "Passwort-Zurücksetzen ist aktuell nicht verfügbar." };
  }

  await dbConnect();
  const user = await UserModel.findOne({ email: parsed.data });

  // Always report success, whether or not the account exists, so this can't be
  // used to enumerate registered email addresses.
  if (!user) return { success: true };

  const resetToken = generateToken();
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, resetToken);

  return { success: true };
}
