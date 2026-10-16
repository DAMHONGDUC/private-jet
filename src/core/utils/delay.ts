/** Waits `ms` milliseconds; mock data sources use it to feel like a network. */
export function delay(ms: number): Promise<void> {
  return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}
