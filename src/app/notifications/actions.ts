"use server";

import { Types } from "mongoose";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import { NotificationModel } from "@/models/Notification";

export interface MyNotification {
  id: string;
  title: string;
  body: string;
  linkHref?: string;
  linkLabel?: string;
}

export async function getMyNotifications(userId?: string): Promise<MyNotification[]> {
  if (!userId) {
    const session = await auth();
    if (!session?.user) return [];
    userId = session.user.id;
  }

  await dbConnect();
  const notifications = await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean<
      {
        _id: Types.ObjectId;
        title: string;
        body: string;
        linkHref?: string;
        linkLabel?: string;
      }[]
    >();

  return notifications.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    body: n.body,
    linkHref: n.linkHref,
    linkLabel: n.linkLabel,
  }));
}

export async function dismissNotification(notificationId: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user) return { success: false };

  await dbConnect();
  await NotificationModel.deleteOne({ _id: notificationId, userId: session.user.id });

  return { success: true };
}
