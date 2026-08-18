"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { TIGERS_ROSTER } from "@/lib/tigersRoster";

export interface ActionResult {
  success: boolean;
  error?: string;
}

const NAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export interface MyAccountInfo {
  name: string;
  email: string;
  nextNameChangeAt: string | null;
}

export async function getMyAccountInfo(userId: string): Promise<MyAccountInfo | null> {
  await dbConnect();
  const user = await UserModel.findById(userId).select("name email nameChangedAt").lean<{
    name: string;
    email: string;
    nameChangedAt?: Date;
  } | null>();
  if (!user) return null;

  const nextChangeAt = user.nameChangedAt
    ? new Date(user.nameChangedAt.getTime() + NAME_CHANGE_COOLDOWN_MS)
    : null;

  return {
    name: user.name,
    email: user.email,
    nextNameChangeAt: nextChangeAt && nextChangeAt > new Date() ? nextChangeAt.toISOString() : null,
  };
}

export async function updateUsername(newName: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  const trimmed = newName.trim();
  if (trimmed.length < 2) {
    return { success: false, error: "Benutzername muss mindestens 2 Zeichen lang sein." };
  }

  await dbConnect();
  const user = await UserModel.findById(session.user.id).select("name nameChangedAt");
  if (!user) return { success: false, error: "Nutzer nicht gefunden." };

  if (user.nameChangedAt) {
    const nextChangeAt = new Date(user.nameChangedAt.getTime() + NAME_CHANGE_COOLDOWN_MS);
    if (nextChangeAt > new Date()) {
      const daysLeft = Math.ceil((nextChangeAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      return {
        success: false,
        error: `Der Benutzername kann erst in ${daysLeft} Tag${daysLeft === 1 ? "" : "en"} wieder geändert werden.`,
      };
    }
  }

  if (trimmed === user.name) return { success: true };

  user.name = trimmed;
  user.nameChangedAt = new Date();
  await user.save();

  revalidatePath("/profile");
  return { success: true };
}

export async function getFavoritePlayerId(userId: string): Promise<string | null> {
  await dbConnect();
  const user = await UserModel.findById(userId).select("favoritePlayerId").lean<{
    favoritePlayerId?: string;
  } | null>();
  return user?.favoritePlayerId ?? null;
}

export async function updateFavoritePlayer(playerId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Bitte melde dich an." };

  if (playerId !== "" && !TIGERS_ROSTER.some((player) => player.id === playerId)) {
    return { success: false, error: "Ungültiger Spieler." };
  }

  await dbConnect();
  if (playerId === "") {
    await UserModel.updateOne({ _id: session.user.id }, { $unset: { favoritePlayerId: "" } });
  } else {
    await UserModel.updateOne({ _id: session.user.id }, { favoritePlayerId: playerId });
  }

  revalidatePath("/profile");
  return { success: true };
}
