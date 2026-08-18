import { dbConnect } from "@/lib/mongodb";
import { NotificationModel } from "@/models/Notification";

export async function createWelcomeNotification(userId: string, name: string): Promise<void> {
  await dbConnect();
  await NotificationModel.create({
    userId,
    type: "welcome",
    title: `Hallo ${name}, herzlich Willkommen in der TigersZone!`,
    body: "Auf dich warten spannende Duelle, Spieltagsblogs und viele weitere Features.",
    linkHref: "/community#faq",
    linkLabel: "Bei Fragen geht's hier zum FAQ-Bereich",
  });
}
