import { defineConfig } from "vite";

// Sito dello Human Longevity Program (IRCCS San Raffaele)
export default defineConfig({
  server: { port: 5176, host: true, allowedHosts: true },
  preview: { port: 5176, host: true, allowedHosts: true },
});
