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

  echo "ERROR"
  return 1
}

echo "-----=====[!]=====-----"
echo " OptiMe System Startup"
echo "-----=====[!]=====-----"

if ! docker info >/dev/null 2>&1; then
  echo "Docker ni zagnan."

  echo ""
  echo "Zaženi Docker Desktop in poskusi ponovno."
  exit 1
fi

HOST_IP="$(detect_host_ip)"

if [[ "$HOST_IP" == "ERROR" || -z "$HOST_IP" ]]; then
  echo "Ni bilo mogoče zaznati lokalnega IP naslova."
  echo ""
  echo "Zaženi:"
  echo "HOST_IP=192.168.x.x ./run.sh"
  exit 1
fi

export HOST_IP

echo ""
echo "HOST_IP = $HOST_IP"
echo ""

echo "Gradim in zaganjam containerje ..."
docker compose up --build -d \
  mosquitto \
  model \
  backend \
  mqtt-processor

echo ""
echo "Čakam da se model container inicializira ..."
sleep 10

MODEL_FILE="../ORV/Model/models/model.keras"

if [ ! -f "$MODEL_FILE" ]; then
  echo ""
  echo "Model še ne obstaja."
  echo "Začenjam train_model.py ..."
  echo ""

  docker compose exec model python train_model.py

  echo ""
  echo "Trening modela zaključen."
else
  echo ""
  echo "Model že obstaja."
fi

echo ""
echo "-----=====[!]=====-----"
echo "VSI SERVISI SO ZAGNANI"
echo "-----=====[!]=====-----"
echo ""

docker compose ps

echo ""
echo "Backend API:"
echo "http://$HOST_IP:3000"

echo ""
echo "MQTT:"
echo "mqtt://$HOST_IP:1883"

echo ""
echo "MQTT WebSocket:"
echo "ws://$HOST_IP:9001"

echo ""
echo "Frontend zaženi lokalno:"
echo ""
echo "cd OptiMeFrontend"
echo "npm install"
echo "npm start"
echo ""

echo "Logi:"
echo "docker compose logs -f"

echo ""
echo "Ustavitev:"
echo "docker compose down"

echo ""
echo "Uspešno zaključena skripta."
