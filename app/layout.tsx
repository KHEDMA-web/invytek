import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./invytek.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Invytek — Invitations numériques premium",
    template: "%s — Invytek",
  },
  description: "Créez des invitations numériques interactives premium pour vos mariages, anniversaires, événements business et médicaux. Partagez un lien, suivez les confirmations en temps réel.",
  keywords: ["invitation numérique", "invitation mariage", "invitation digitale", "RSVP en ligne", "Algérie", "Invytek"],
  authors: [{ name: "Invytek" }],
  creator: "Invytek",
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://invytek.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: "Invytek",
    title: "Invytek — Invitations numériques premium",
    description: "Invitations interactives pour mariages, événements business et médicaux. Créez, partagez, suivez.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Invytek — Invitations numériques premium" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invytek — Invitations numériques premium",
    description: "Invitations interactives pour tous vos événements.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B8923C",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Marcellus&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Pinyon+Script&display=optional" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
