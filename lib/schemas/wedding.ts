import { z } from "zod";

export const WeddingContentSchema = z.object({
  hosts: z.string().min(1),
  invitationLine: z.string().min(1),
  names: z.tuple([z.string(), z.string()]),
  namesSeparator: z.string().default("avec"),
  bismillah: z.boolean().default(true),
  verse: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  dayLabel: z.string().min(1),
  venue: z.string().min(1),
  venueSub: z.string().optional(),
  mapsUrl: z.string().url().optional(),
  note: z.string().optional(),
  closing: z.string().default("Soyez les Bienvenus"),
  initials: z.tuple([z.string().max(2), z.string().max(2)]),
});

export type WeddingContent = z.infer<typeof WeddingContentSchema>;

export const WeddingOptionsSchema = z.object({
  showCountdown: z.boolean().default(true),
  showRsvp: z.boolean().default(true),
  showArabic: z.boolean().default(true),
  showNote: z.boolean().default(true),
  showQrCode: z.boolean().default(false),
  webhookUrl: z.string().url().optional(),
});

export type WeddingOptions = z.infer<typeof WeddingOptionsSchema>;
