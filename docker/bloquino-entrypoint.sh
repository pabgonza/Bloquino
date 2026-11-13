#!/bin/bash
# Prepara el certificado de HTTPS y arranca el backend de compilación y nginx.
# Si uno de los dos cae, el contenedor termina y Docker lo vuelve a levantar.
trap 'exit 0' TERM INT

# HTTPS (lo exige el navegador para cargar a la placa): una autoridad propia,
# que se crea una vez y vive en el volumen /certs, firma el certificado del
# servidor para localhost y para BLOQUINO_NOMBRES (IP o nombres del notebook,
# separados por coma). El certificado se rehace si esos nombres cambian o si le
# queda menos de un mes.
C=/certs
mkdir -p $C
if [ ! -f $C/ca.key ]; then
  openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -subj "/CN=Bloquino (sala)" \
    -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -keyout $C/ca.key -out $C/ca.crt 2>/dev/null
fi
nombres="DNS:localhost,IP:127.0.0.1"
for n in $(echo "$BLOQUINO_NOMBRES" | tr ',' ' '); do
  case $n in
    *[!0-9.]*) nombres="$nombres,DNS:$n" ;;
    *) nombres="$nombres,IP:$n" ;;
  esac
done
if [ "$(cat $C/nombres 2>/dev/null)" != "$nombres" ] \
  || ! openssl x509 -checkend 2592000 -noout -in $C/servidor.crt >/dev/null 2>&1; then
  printf 'subjectAltName=%s\nbasicConstraints=CA:FALSE\nkeyUsage=digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n' \
    "$nombres" > /tmp/servidor.ext
  openssl req -newkey rsa:2048 -nodes -subj "/CN=Bloquino" \
    -keyout $C/servidor.key -out /tmp/servidor.csr 2>/dev/null \
  && openssl x509 -req -in /tmp/servidor.csr -CA $C/ca.crt -CAkey $C/ca.key -CAcreateserial \
    -days 397 -extfile /tmp/servidor.ext -out $C/servidor.crt 2>/dev/null \
  && echo "$nombres" > $C/nombres
  echo "Certificado de HTTPS para: $nombres"
fi
chmod 600 $C/*.key

uvicorn app.main:app --host 127.0.0.1 --port 8001 &
nginx -g 'daemon off;' &
wait -n
exit 1
