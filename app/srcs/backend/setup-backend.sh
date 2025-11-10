#!/bin/bash
set -e

cd /app/srcs/backend

if [ -f "/app/srcs/backend/../../.env" ]; then
	export $(grep -v '^#' /app/srcs/backend/../../../.env | xargs)
fi

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
	# chmod 777 $CERT_DIR
else
	echo "Existing cert found"
fi

npm install

npm install -g typescript
npm install -g concurrently

npm run dev
