import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "movent", // Nama proyek (Moventios)
  triggerDirectories: ["src/trigger"],
  maxDuration: 300, // Minimal 5 detik, diset ke 5 menit
});
