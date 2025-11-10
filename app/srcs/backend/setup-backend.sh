#!/bin/bash
set -e

cd /app/srcs/backend

CERT_DIR="/certs"
CRT="$CERT_DIR/klbq-ssl.crt"
KEY="$CERT_DIR/klbq-ssl.key"
PASS="${PEM_PASS}"

if [ ! -f "$CRT" ]; then
	mkdir -p "$CERT_DIR"
	openssl req -x509 -newkey rsa:2048 -sha256 -days 365 \
	-keyout "$KEY" -out "$CRT" \
	-subj "/C=${C}/ST=${ST}/L=${L}/O=${O}/CN=${CN}" \
	-passout pass:$PASS
else
	echo "Existing cert found"
fi

npm install

npm install -g typescript
npm install -g concurrently

npm run dev
