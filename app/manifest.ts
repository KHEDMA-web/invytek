import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Invytek",
    short_name: "Invytek",
    description: "Invitations numériques premium — mariage, business, médical",
    start_url: "/",
    display: "standalone",
    background_color: "#14100a",
    theme_color: "#B8923C",
    orientation: "portrait",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
    categories: ["business", "utilities"],
    lang: "fr",
  };
}
