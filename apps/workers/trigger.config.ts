import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "eventos-platform", // Nama proyek
  triggerDirectories: ["src/trigger"],
  maxDuration: 300, // Minimal 5 detik, diset ke 5 menit
});
