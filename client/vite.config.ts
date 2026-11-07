import react from '@vitejs/plugin-react';
import { buildInfo } from "@mgcrea/vite-plugin-build-info";

import { defineConfig } from 'vite';
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
        alias: {
            "~": path.resolve(import.meta.dirname, "src")
        }
    },
    plugins: [
        react(),
        buildInfo(),
    ],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        }
    }
})
