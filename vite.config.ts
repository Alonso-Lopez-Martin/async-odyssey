import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Le decimos a Vite que intercepte cualquier petición que empiece por /api/nasa
      '/api/nasa': {
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/nasa/, '')
      }
    }
  }
});