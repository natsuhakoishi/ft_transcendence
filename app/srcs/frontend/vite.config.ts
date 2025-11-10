import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'

const __filename = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.join(__filename, '..', '..', '..');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const PEM_PASS = process.env.PEM_PASS;

export default defineConfig({
  plugins: [
    tailwindcss(), react(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'certs/klbq-ssl.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'certs/klbq-ssl.crt')),
      passphrase: PEM_PASS
    },
    host: '0.0.0.0',
    port: 5173,
  },
})
