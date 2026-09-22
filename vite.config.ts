import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-frames',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const decodedUrl = decodeURIComponent(req.url || '');
          if (decodedUrl.startsWith('/frames/')) {
            const relativePath = decodedUrl.slice('/frames/'.length).split('?')[0];
            const filePath = path.join(process.cwd(), 'frames', relativePath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              res.setHeader('Content-Type', 'image/jpeg');
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              return fs.createReadStream(filePath).pipe(res);
            }
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
