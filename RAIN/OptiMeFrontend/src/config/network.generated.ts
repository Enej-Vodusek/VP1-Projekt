// Auto-generated file.
// Ne urejaj ročno. Za posodobitev zaženi: npm run detect-ip

export const HOST_IP = "192.168.0.20";

export const API_BASE_URL = "http://192.168.0.20:3000";

export const MQTT_HOST = "192.168.0.20";
export const MQTT_PORT = 1883;
export const MQTT_URL = "mqtt://192.168.0.20:1883";

export const MQTT_WS_PORT = 9001;
export const MQTT_WS_URL = "ws://192.168.0.20:9001";

export const NETWORK_CONFIG = {
  hostIp: HOST_IP,
  apiBaseUrl: API_BASE_URL,
  mqttHost: MQTT_HOST,
  mqttPort: MQTT_PORT,
  mqttUrl: MQTT_URL,
  mqttWsPort: MQTT_WS_PORT,
  mqttWsUrl: MQTT_WS_URL,
} as const;
