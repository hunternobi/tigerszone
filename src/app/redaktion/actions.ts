"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { BlogPostModel } from "@/models/BlogPost";

export interface ActionResult {
  success: boolean;
  error?: string;
}

async function requireEditor() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "redakteur")) {
    throw new Error("Nicht autorisiert.");
  }
  return session;
}

export async function createBlogPost(
  title: string,
  publishedAt: string,
  content: string
): Promise<ActionResult> {
  let session;
  try {
    session = await requireEditor();
  } catch {
    return { success: false, error: "Nicht autorisiert." };
  }

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  if (trimmedTitle.length < 3) {
    return { success: false, error: "Titel muss mindestens 3 Zeichen lang sein." };
  }
  if (trimmedContent.length < 10) {
    return { success: false, error: "Inhalt ist zu kurz." };
  }
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return { success: false, error: "Ungültiges Datum." };
  }

  await dbConnect();
  await BlogPostModel.create({
    title: trimmedTitle,
    content: trimmedContent,
    publishedAt: date,
    authorName: session.user.name ?? "Redaktion",
  });

  revalidatePath("/spieltagsblog");
  revalidatePath("/redaktion");

  return { success: true };
}

export async function deleteBlogPost(postId: string): Promise<ActionResult> {
  try {
    await requireEditor();
  } catch {
    return { success: false, error: "Nicht autorisiert." };
  }

  await dbConnect();
  await BlogPostModel.deleteOne({ _id: postId });

  revalidatePath("/spieltagsblog");
  revalidatePath("/redaktion");

  return { success: true };
}
