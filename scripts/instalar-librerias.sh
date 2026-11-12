#!/bin/sh
# Librerías de Arduino que usan los bloques de Bloquino, con su versión fija.
# Se corre dentro del backend de compilación:
#   docker cp scripts/instalar-librerias.sh velxio-spike:/tmp/
#   docker exec velxio-spike sh /tmp/instalar-librerias.sh
set -e

arduino-cli lib install "Servo@1.3.0" "DHT sensor library@1.4.7" "Adafruit Unified Sensor@1.1.15" \
  "LiquidCrystal@1.0.7" "IRremote@4.7.1"

# BuzzerMusic no está en el índice de Arduino: se trae de su repositorio, en el
# commit que declara frontend/src/blocks/paquetes/buzzermusic.json.
destino="$(arduino-cli config get directories.user)/libraries/BuzzerMusic"
[ -d "$destino" ] || git clone --quiet https://github.com/pabgonza/BuzzerMusic.git "$destino"
git -C "$destino" fetch --quiet origin
git -C "$destino" checkout --quiet 7742b6c5ae98efbe638d852e875cbe742ccb5dd0

arduino-cli lib list
