import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

dotenv.config();

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PEM_PASS = process.env.PEM_PASS;
const NGROK_HOST = process.env.NGROK_URL ? process.env.NGROK_URL.replace(/^https?:\/\//, '') : undefined;

export default defineConfig({
  plugins: [
    tailwindcss(), react(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/backend-ssl.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/backend-ssl.crt')),
      passphrase: PEM_PASS
    },
    host: '0.0.0.0',
    port: 5173,
  },
})
