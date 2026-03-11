import { clearOfflineQueue, getOfflineQueue } from "../../core/storage/offlineQueue";
import { apiClient } from "../../core/api/client";

export async function syncOfflineProgress(userId: string): Promise<{ synced: number }> {
  const queue = await getOfflineQueue();
  if (queue.length === 0) {
    return { synced: 0 };
  }

  await apiClient.post("/v1/sync/offline-batch", {
    userId,
    events: queue,
  });

  await clearOfflineQueue();
  return { synced: queue.length };
}
