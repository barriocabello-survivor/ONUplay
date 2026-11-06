import { defineConfig } from 'vite';

// El host de vista previa cambia entre sesiones: se lee del entorno y se
// permite solo ese hostname exacto (nunca un comodín).
const allowedHosts = [process.env.PREVIEW_HOST, 'localhost', '127.0.0.1'].filter(Boolean);

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts,
  },
  build: {
    target: 'es2020',
  },
});
