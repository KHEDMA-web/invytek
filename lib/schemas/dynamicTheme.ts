import { z } from "zod";

const hex = z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, "Couleur hex invalide");

export const DynamicPaletteSchema = z.object({
  bg:           hex,
  bgCard:       hex,
  primary:      hex,
  primaryBright:hex,
  text:         hex,
  textSoft:     hex,
});

export const DynamicThemeSpecSchema = z.object({
  themeLabel: z.string().min(1).max(100),

  shape: z.enum(["arch", "oval", "rectangle", "hexagon", "diamond"]),

  palette: DynamicPaletteSchema,

  typography: z.object({
    headline: z.enum(["pinyon-script", "marcellus", "cormorant", "amiri"]),
    body:     z.enum(["cormorant", "marcellus", "amiri"]),
    rtl:      z.boolean(),
  }),

  ornements: z.object({
    style:  z.enum(["floral", "geometric", "arabesque", "minimal", "confetti", "medical"]),
    accent: hex,
  }),

  animation: z.enum(["envelope", "doors", "fade", "rise", "confetti"]),

  sections: z.object({
    bismillah:   z.boolean(),
    arabicText:  z.boolean(),
    countdown:   z.boolean(),
    rsvp:        z.boolean(),
  }),

  mood: z.string().max(120),

  content: z.object({
    names:          z.tuple([z.string().min(1), z.string().min(1)]),
    hosts:          z.string().min(1),
    invitationLine: z.string().min(1),
    date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time:           z.string().regex(/^\d{2}:\d{2}$/),
    dayLabel:       z.string().min(1),
    venue:          z.string().min(1),
    venueSub:       z.string().optional(),
    closing:        z.string().min(1),
    note:           z.string().optional(),
    initials:       z.tuple([z.string().max(2), z.string().max(2)]),
    bismillah:      z.boolean(),
    namesSeparator: z.string(),
  }),
});

export type DynamicThemeSpec = z.infer<typeof DynamicThemeSpecSchema>;
