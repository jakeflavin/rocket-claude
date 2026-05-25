import { createReadStream, statSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

function serveDataDir(): Plugin {
  const handle = (req: { url?: string }, res: { setHeader: Function; pipe?: never }, next: () => void) => {
    const filePath = resolve('data', (req.url ?? '').replace(/^\//, ''));
    try {
      if (statSync(filePath).isFile()) {
        (res as any).setHeader('Content-Type', 'text/plain');
        createReadStream(filePath).pipe(res as any);
        return;
      }
    } catch {
      // file not found — fall through
    }
    next();
  };

  return {
    name: 'serve-data-dir',
    configureServer(server) {
      server.middlewares.use('/data', handle as any);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data', handle as any);
    },
  };
}

function writeCsvPlugin(): Plugin {
  return {
    name: 'write-csv',
    configureServer(server) {
      server.middlewares.use('/api/csv', (req, res, next) => {
        if (req.method !== 'POST') return next();
        const table = (req.url ?? '').replace(/^\//, '').split('?')[0];
        if (!table || !/^[a-z_]+$/.test(table)) {
          (res as any).statusCode = 400;
          (res as any).end('invalid table');
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          writeFileSync(resolve('data', `${table}.csv`), Buffer.concat(chunks).toString('utf8'));
          (res as any).statusCode = 200;
          (res as any).end('ok');
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveDataDir(), writeCsvPlugin()],
  server: {
    watch: { ignored: ['**/data/**'] },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@duckdb/duckdb-wasm'],
  },
});
