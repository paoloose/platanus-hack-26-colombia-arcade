import { defineConfig } from 'vite';
import { arcadeDevUI } from '@platanus/arcade-dev-ui-26';

export default defineConfig({
  root: '.',
  server: {
    port: 3001,
    open: false,
    allowedHosts: [
      'bore.pub',
      'arcademx.paoloose.site',
    ]
  },
  plugins: [arcadeDevUI()],
  optimizeDeps: {
    exclude: ['phaser'],
  },
});
