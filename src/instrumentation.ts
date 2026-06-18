// Runs once when the Next.js server starts (Node runtime only).
// Schedules an hourly background sync of posts + stats from Divar.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const cron = (await import("node-cron")).default;
  const { runScheduledSync } = await import("@/lib/divar/sync");

  // Top of every hour.
  cron.schedule("0 * * * *", () => {
    void runScheduledSync();
  });
}
