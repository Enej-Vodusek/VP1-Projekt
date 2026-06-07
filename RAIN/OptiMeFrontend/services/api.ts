import { Platform } from "react-native";
import { API_BASE_URL } from "@/src/config/network.generated";

const USE_ANDROID_EMULATOR = false;

export const API_URL =
  Platform.select({
    web: API_BASE_URL,

    android: USE_ANDROID_EMULATOR ? "http://10.0.2.2:3000" : API_BASE_URL,

    ios: API_BASE_URL,

    default: API_BASE_URL,
  }) || API_BASE_URL;
