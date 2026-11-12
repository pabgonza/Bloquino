#!/bin/sh
# Instala en el backend de compilación las librerías de scripts/librerias-kit.txt.
#   sh instalar-librerias.sh [lista]     (sin argumento: la que está junto al script)
# La imagen de la sala lo corre al construirse. En un contenedor ya creado:
#   docker cp scripts/librerias-kit.txt velxio-spike:/tmp/
#   docker cp scripts/instalar-librerias.sh velxio-spike:/tmp/
#   docker exec velxio-spike sh /tmp/instalar-librerias.sh
set -e

lista="${1:-$(dirname "$0")/librerias-kit.txt}"
destino="$(arduino-cli config get directories.user)/libraries"
mkdir -p "$destino"

while IFS= read -r linea; do
  nombre="${linea%%@*}"
  version="${linea#*@}"
  case "$linea" in
    '' | '#'*) ;;
    *@https://github.com/*)
      # Fuera del índice de Arduino: el código de ese commit, sin necesitar git.
      rm -rf "$destino/$nombre"
      mkdir "$destino/$nombre"
      repositorio="${version%%#*}"
      curl -fsSL "${repositorio%.git}/archive/${version#*#}.tar.gz" | tar -xz -C "$destino/$nombre" --strip-components=1
      ;;
    *) arduino-cli lib install "$linea" ;;
  esac
done < "$lista"

arduino-cli lib list
