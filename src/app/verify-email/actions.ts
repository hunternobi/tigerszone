"use server";

import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export interface VerifyEmailResult {
  success: boolean;
  error?: string;
}

export async function verifyEmailToken(token: string): Promise<VerifyEmailResult> {
  if (!token) return { success: false, error: "Ungültiger Bestätigungslink." };

  await dbConnect();
  const user = await UserModel.findOne({ verificationToken: token });
  if (!user) return { success: false, error: "Ungültiger oder bereits verwendeter Bestätigungslink." };

  if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
    return { success: false, error: "Der Bestätigungslink ist abgelaufen. Bitte fordere einen neuen an." };
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  return { success: true };
}
