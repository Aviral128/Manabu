import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_QUEUE_KEY = "manabu_offline_queue";

export type OfflineEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export async function enqueueOfflineEvent(event: OfflineEvent): Promise<void> {
  const current = await getOfflineQueue();
  const next = [...current, event];
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(next));
}

export async function getOfflineQueue(): Promise<OfflineEvent[]> {
  const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as OfflineEvent[]) : [];
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
}
