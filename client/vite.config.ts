import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
        alias: {
            "~": path.resolve(import.meta.dirname, "src")
        }
    },
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        }
    }
})
