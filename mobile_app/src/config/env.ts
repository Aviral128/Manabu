import Constants from "expo-constants";
import { Platform } from "react-native";

type ExpoConstantsShape = {
  expoConfig?: {
    hostUri?: string;
    extra?: {
      apiUrl?: string;
    };
  };
  manifest2?: {
    extra?: {
      expoClient?: {
        hostUri?: string;
      };
    };
  };
  manifest?: {
    debuggerHost?: string;
  };
};

function unique(values: Array<string | undefined | null>) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const next = String(value ?? "").trim().replace(/\/+$/, "");
    if (!next || seen.has(next)) continue;
    seen.add(next);
    result.push(next);
  }
  return result;
}

function pickExpoHost(): string | null {
  const constants = Constants as unknown as ExpoConstantsShape;
  const rawHost =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoClient?.hostUri ??
    constants.manifest?.debuggerHost ??
    null;

  if (!rawHost) return null;
  const host = rawHost.split(":")[0]?.trim();
  return host || null;
}

function getDefaultCandidates() {
  const constants = Constants as unknown as ExpoConstantsShape;
  const expoHost = pickExpoHost();
  const appJsonUrl = constants.expoConfig?.extra?.apiUrl;
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

  if (Platform.OS === "android") {
    return unique([
      configuredUrl,
      appJsonUrl,
      expoHost ? `http://${expoHost}:7200` : null,
      "http://10.0.2.2:7200",
      "http://127.0.0.1:7200",
    ]);
  }

  return unique([configuredUrl, appJsonUrl, expoHost ? `http://${expoHost}:7200` : null, "http://127.0.0.1:7200"]);
}

const apiCandidates = getDefaultCandidates();

export const env = {
  apiUrl: apiCandidates[0] ?? "http://127.0.0.1:7200",
  apiCandidates,
};
