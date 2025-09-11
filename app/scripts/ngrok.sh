#!/bin/bash
set -e

SCRIPTS_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

ENV="$SCRIPTS_DIR/../srcs/backend/.env"

if [ ! -f "$ENV" ]; then
	echo "(Ngrok Setup) Error: .env file not found"
	exit 1
fi

source "$ENV"

if [ -z "$NGROK_SECRET" ] || [ -z "$BACKEND_PORT" ]; then
	echo "(Ngrok Setup) Error: .env required credentials not found"
	exit 1
fi

BACKEND_BIN="$SCRIPTS_DIR/../srcs/backend/node_modules/.bin/ngrok"
# FRONTEND_BIN="$SCRIPTS_DIR/../srcs/frontend/node_modules/.bin/ngrok"

if [ -f "$BACKEND_BIN" ]; then
	echo "(Ngrok Setup) Backend Ngrok Installed"
else
	echo "(Ngrok Setup) Error: Backend Ngrok Not Installed. Run: cd ../srcs/backend && npm install ngrok"
	exit 1
fi

# if [ -f "$FRONTEND_BIN" ]; then
# 	echo "(Ngrok Setup) Frontend Ngrok Installed"
# else
# 	echo "(Ngrok Setup) Error: Frontend Ngrok Not Installed. Run: cd ../srcs/frontend && npm install ngrok"
# 	exit 1
# fi

if ! grep -q "authtoken:" ~/.config/ngrok/ngrok.yml 2>/dev/null; then
	echo "Setting up ngrok authtoken..."
	(cd "$SCRIPTS_DIR/../srcs/backend" && npx ngrok config add-authtoken "$NGROK_SECRET")
else
	echo "(Ngrok Setup) Ngrok Authtoken found"
fi

if pgrep -x "ngrok" >/dev/null; then
	echo "(Ngrok Setup) Ngrok is running"
else
	(cd "$SCRIPTS_DIR/../srcs/backend" && npx ngrok http https://localhost:$BACKEND_PORT > /dev/null &)
	NGROK_PID=$!
	sleep 2
	NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*' | head -n 1 | sed 's/"public_url":"//')
	echo "Ngrok running at $NGROK_URL (forwarding https://localhost:$BACKEND_PORT)"
fi

echo "Ngrok setup completed successfully"
