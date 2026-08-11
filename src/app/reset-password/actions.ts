"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const PasswordSchema = z
  .string()
  .min(8, "Passwort muss mindestens 8 Zeichen lang sein.")
  .regex(/[a-zA-Z]/, "Passwort muss mindestens einen Buchstaben enthalten.")
  .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten.");

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export async function resetPasswordAction(
  token: string,
  password: string
): Promise<ResetPasswordResult> {
  if (!token) return { success: false, error: "Ungültiger Link." };

  const parsed = PasswordSchema.safeParse(password);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Ungültiges Passwort." };
  }

  await dbConnect();
  const user = await UserModel.findOne({ resetToken: token });
  if (!user) return { success: false, error: "Ungültiger oder bereits verwendeter Link." };

  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
    return { success: false, error: "Der Link ist abgelaufen. Bitte fordere einen neuen an." };
  }

  user.passwordHash = await bcrypt.hash(parsed.data, 10);
  user.resetToken = undefined;
  user.resetTokenExpiresAt = undefined;
  await user.save();

  return { success: true };
}
