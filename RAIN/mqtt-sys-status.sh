#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

is_private_ip() {
  local ip="$1"

  [[ "$ip" =~ ^192\.168\. ]] && return 0
  [[ "$ip" =~ ^10\. ]] && return 0
  [[ "$ip" =~ ^172\.(1[6-9]|2[0-9]|3[0-1])\. ]] && return 0

  return 1
}

detect_host_ip() {
  if [[ -n "${HOST_IP:-}" ]]; then
    echo "$HOST_IP"
    return 0
  fi

  if command -v ipconfig >/dev/null 2>&1; then
    for iface in en0 en1; do
      ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"

      if is_private_ip "$ip"; then
        echo "$ip"
        return 0
      fi
    done
  fi

  if command -v ip >/dev/null 2>&1; then
    ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7; exit}' || true)"

    if is_private_ip "$ip"; then
      echo "$ip"
      return 0
    fi
  fi

  ip="$(ifconfig 2>/dev/null | awk '/inet / && $2 != "127.0.0.1" {print $2; exit}' || true)"

  if is_private_ip "$ip"; then
    echo "$ip"
    return 0
  fi

  echo "127.0.0.1"
}

HOST_IP="$(detect_host_ip)"
MQTT_PORT="${MQTT_PORT:-1883}"

echo "MQTT SYS status"
echo "Host IP: $HOST_IP"
echo "MQTT port: $MQTT_PORT"
echo ""

get_sys_value() {
  local topic="$1"

  mosquitto_sub \
    -h "$HOST_IP" \
    -p "$MQTT_PORT" \
    -t "$topic" \
    -C 1 \
    -W 6 2>/dev/null || echo "N/A"
}

CONNECTED="$(get_sys_value '$SYS/broker/clients/connected')"
DISCONNECTED="$(get_sys_value '$SYS/broker/clients/disconnected')"
TOTAL="$(get_sys_value '$SYS/broker/clients/total')"
SUBSCRIPTIONS="$(get_sys_value '$SYS/broker/subscriptions/count')"
RETAINED="$(get_sys_value '$SYS/broker/retained messages/count')"

echo "Connected MQTT clients:      $CONNECTED"
echo "Disconnected MQTT clients:   $DISCONNECTED"
echo "Total MQTT clients:          $TOTAL"
echo "Subscriptions count:         $SUBSCRIPTIONS"
echo "Retained messages count:     $RETAINED"
echo ""