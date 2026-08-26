#!/bin/sh
# Generates a local self-signed TLS certificate on first start (kept in a
# volume so it survives restarts) and hands off to nginx. Self-signed is the
# standard, accepted approach here — there is no real domain to get a
# CA-signed certificate for; the browser will ask you to accept it once.
set -eu

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/fullchain.pem"
KEY_FILE="$CERT_DIR/privkey.pem"

mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
  echo "[https-proxy] No certificate found — generating a self-signed one for localhost..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=FR/O=ft_transcendence/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
  echo "[https-proxy] Certificate generated."
fi

exec nginx -g "daemon off;"
