import { z } from "zod";

export const markNotificationsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAllAsRead: z.boolean().optional(),
});
