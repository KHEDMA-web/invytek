import { z } from "zod";

export const SpeakerSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional(),
  company: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

export const AgendaItemSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  title: z.string().min(1),
  speaker: z.string().optional(),
  duration: z.string().optional(),
});

export const BusinessContentSchema = z.object({
  companyName: z.string().min(1),
  companyLogoUrl: z.string().url().optional(),
  eventType: z.enum(["conference", "seminar", "congress", "gala", "summit", "workshop"]).default("conference"),
  tagline: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  invitationLine: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timeEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  dayLabel: z.string().min(1),
  venue: z.string().min(1),
  venueSub: z.string().optional(),
  venueAddress: z.string().optional(),
  mapsUrl: z.string().url().optional(),
  onlineUrl: z.string().url().optional(),
  speakers: z.array(SpeakerSchema).max(8).default([]),
  agenda: z.array(AgendaItemSchema).max(12).default([]),
  dressCode: z.string().optional(),
  language: z.enum(["fr", "en", "ar", "fr-en"]).default("fr"),
  note: z.string().optional(),
  closing: z.string().default("Nous vous attendons"),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export type BusinessContent = z.infer<typeof BusinessContentSchema>;
export type Speaker = z.infer<typeof SpeakerSchema>;
export type AgendaItem = z.infer<typeof AgendaItemSchema>;

export const BusinessOptionsSchema = z.object({
  showCountdown: z.boolean().default(true),
  showRsvp: z.boolean().default(true),
  showAgenda: z.boolean().default(true),
  showSpeakers: z.boolean().default(true),
  showNote: z.boolean().default(false),
  showOnlineOption: z.boolean().default(false),
});

export type BusinessOptions = z.infer<typeof BusinessOptionsSchema>;
