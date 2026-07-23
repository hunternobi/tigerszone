"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { signIn } from "@/auth";

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen lang sein."),
  email: z.string().trim().toLowerCase().email("Bitte eine gültige E-Mail-Adresse angeben."),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein.")
    .regex(/[a-zA-Z]/, "Passwort muss mindestens einen Buchstaben enthalten.")
    .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten."),
});

export interface RegisterState {
  error?: string;
}

export async function registerAction(
  _prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const { name, email, password } = parsed.data;

  await dbConnect();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return { error: "Diese E-Mail-Adresse ist bereits registriert." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  const role = adminEmails.includes(email) ? "admin" : "user";

  await UserModel.create({ name, email, passwordHash, role });

  await signIn("credentials", { email, password, redirectTo: "/" });

  return {};
}
