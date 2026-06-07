#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

CACHE_DIR=".run-cache"
BUILD_HASH_FILE="$CACHE_DIR/build.sha256" # hash za spremembo

mkdir -p "$CACHE_DIR"

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

hash_command() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256
  else
    sha256sum
  fi
}

calculate_build_hash() {
  {
    for file in \
      "docker-compose.yml" \
      "OptiMeBackend/Dockerfile" \
      "OptiMeBackend/package.json" \
      "OptiMeBackend/package-lock.json" \
      "OptiMeBackend/model-requirements.txt" \
      "../ORV/Model/Dockerfile" \
      "../ORV/Model/requirements.txt"
    do
      if [[ -f "$file" ]]; then
        echo "===== $file ====="
        cat "$file"
        echo ""
      fi
    done
  } | hash_command | awk '{print $1}'
}

image_exists() {
  local image="$1"
  docker image inspect "$image" >/dev/null 2>&1
}

remove_volume_by_suffix() {
  local suffix="$1"

  docker volume ls --format '{{.Name}}' | grep -E "(^|_)${suffix}$" | while read -r volume_name; do
    echo "Brišem Docker volume: $volume_name"
    docker volume rm "$volume_name" >/dev/null 2>&1 || true
  done
}

model_exists() {
  [[ -f "../ORV/Model/models/pencil_classifier.keras" ]] && return 0
  [[ -f "../ORV/Model/models/best_pencil_model.keras" ]] && return 0
  [[ -f "../ORV/Model/models/model.keras" ]] && return 0

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

CURRENT_BUILD_HASH="$(calculate_build_hash)"
PREVIOUS_BUILD_HASH=""

if [[ -f "$BUILD_HASH_FILE" ]]; then
  PREVIOUS_BUILD_HASH="$(cat "$BUILD_HASH_FILE")"
fi

NEEDS_BUILD=0

if [[ "${BUILD:-0}" == "1" ]]; then
  echo "BUILD=1 nastavljen. Prisiljen rebuild z Docker cache."
  NEEDS_BUILD=1
fi

if ! image_exists "optime-backend-dev"; then
  echo "Backend image še ne obstaja."
  NEEDS_BUILD=1
fi

if ! image_exists "rain-model"; then
  echo "Model image še ne obstaja."
  NEEDS_BUILD=1
fi

if [[ "$CURRENT_BUILD_HASH" != "$PREVIOUS_BUILD_HASH" ]]; then
  echo "Zaznana sprememba v relevantnih build datotekah."
  NEEDS_BUILD=1
fi

if [[ "${CLEAN:-0}" == "1" ]]; then
  echo ""
  echo "CLEAN=1 nastavljen. Brišem stare containerje, image in volume ..."
  docker compose down --volumes --remove-orphans --rmi local || true

  rm -f "$BUILD_HASH_FILE"

  echo ""
  echo "Gradim sveže image brez cache-a ..."
  docker compose build --no-cache \
    model \
    backend \
    mqtt-processor

  echo "$CURRENT_BUILD_HASH" > "$BUILD_HASH_FILE"
else
  echo ""
  echo "Ustavljam stare containerje ..."
  docker compose down --remove-orphans || true

  if [[ "$NEEDS_BUILD" == "1" ]]; then
    echo ""
    echo "Gradim image, ker je to prvi zagon ali so se spremenile relevantne datoteke ..."
    remove_volume_by_suffix "backend_node_modules"

    docker compose build \
      model \
      backend \
      mqtt-processor

    echo "$CURRENT_BUILD_HASH" > "$BUILD_HASH_FILE"
  else
    echo ""
    echo "Ni relevantnih sprememb. Preskočim Docker build."
  fi
fi

echo ""
echo "Zaganjam containerje ..."
docker compose up -d \
  mosquitto \
  model \
  backend \
  mqtt-processor

echo ""
echo "Čakam, da se containerji inicializirajo ..."
sleep 5

if [[ "${TRAIN:-0}" == "1" ]]; then
  echo ""
  echo "TRAIN=1 nastavljen. Začenjam ponovni trening modela ..."
  docker compose exec model python train_model.py
  echo ""
  echo "Trening modela zaključen."
else
  if ! model_exists; then
    echo ""
    echo "Model še ne obstaja."
    echo "Začenjam train_model.py ..."
    echo ""

    docker compose exec model python train_model.py

    echo ""
    echo "Trening modela zaključen."
  else
    echo ""
    echo "Model že obstaja. Trening preskočen."
  fi
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
echo "Dodatni ukazi:"
echo "BUILD=1 ./run.sh   # rebuild z Docker cache"
echo "CLEAN=1 ./run.sh   # popoln clean rebuild"
echo "TRAIN=1 ./run.sh   # ponovno treniranje modela"

echo ""
echo "Uspešno zaključena skripta."