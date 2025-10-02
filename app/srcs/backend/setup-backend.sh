#!/bin/bash

cd /app/srcs/backend

npm install

npm install -g typescript
npm install -g concurrently

npm run dev
