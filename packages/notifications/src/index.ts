/**
 * @mysimcha/notifications — SMS / WhatsApp / Push abstraction (Twilio + future push).
 */

export type NotificationChannel = "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";

export type SendNotificationInput = {
  channel: NotificationChannel;
  to: string;
  body: string;
  idempotencyKey: string;
  organizationId?: string;
  eventId?: string;
  metadata?: Record<string, unknown>;
};

export type SendNotificationResult = {
  providerId: string;
  channel: NotificationChannel;
  status: "QUEUED" | "SENT";
};
