#!/bin/bash
# Arranca el backend de compilación y nginx. Si uno de los dos cae, el
# contenedor termina y Docker lo vuelve a levantar.
trap 'exit 0' TERM INT
uvicorn app.main:app --host 127.0.0.1 --port 8001 &
nginx -g 'daemon off;' &
wait -n
exit 1
