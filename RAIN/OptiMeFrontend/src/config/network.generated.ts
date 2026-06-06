// Auto-generated file.
// Ne urejaj ročno. Za posodobitev zaženi: npm run detect-ip

export const HOST_IP = "172.18.0.5";

export const API_BASE_URL = "http://172.18.0.5:3000";

export const MQTT_HOST = "172.18.0.5";
export const MQTT_PORT = 1883;
export const MQTT_URL = "mqtt://172.18.0.5:1883";

export const MQTT_WS_PORT = 9001;
export const MQTT_WS_URL = "ws://172.18.0.5:9001";

export const NETWORK_CONFIG = {
  hostIp: HOST_IP,
  apiBaseUrl: API_BASE_URL,
  mqttHost: MQTT_HOST,
  mqttPort: MQTT_PORT,
  mqttUrl: MQTT_URL,
  mqttWsPort: MQTT_WS_PORT,
  mqttWsUrl: MQTT_WS_URL,
} as const;
