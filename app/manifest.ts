import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
  name: "ផ្ទះបាយម៉ាក់",
  short_name: "ផ្ទះបាយ",
  description: "Visual Khmer recipe app with video guidance",
  start_url: "/",
  display: "standalone",
  background_color: "#f7f9ff",
  theme_color: "#9e3d00",
  icons: [
    {
      src: "/icon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "maskable"
    }
  ]
});

export default manifest;
