"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

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

  await UserModel.create({
    name: parsedValues.name,
    email: parsedValues.email,
    passwordHash,
    role,
  });

  return { success: true };
}
