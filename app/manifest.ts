import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SynergyCon 2.0 - The Framework For Brainwork",
    short_name: "SynergyCon 2.0",
    description: "Nigeria's premier creative economy conference",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0A0A0A",
    icons: [
      {
        src: "/icon-light-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  }
}