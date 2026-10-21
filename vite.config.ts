import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import type { TLSSocket } from 'node:tls';

function uploadthingDevPlugin(): Plugin {
  return {
    name: 'uploadthing-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/uploadthing')) {
          return next();
        }

        try {
          const rawToken = process.env.UPLOADTHING_TOKEN;
          const cleanToken = rawToken
            ? rawToken
                .trim()
                .replace(/^UPLOADTHING_TOKEN\s*=\s*/i, '')
                .replace(/^['"]|['"]$/g, '')
                .trim()
            : undefined;

          const { createRouteHandler } = await import('uploadthing/server');
          const { ourFileRouter } = await import('./src/server/uploadthing');
          const handler = createRouteHandler({
            router: ourFileRouter,
            config: {
              token: cleanToken,
            },
          });

          const protoHeader = req.headers['x-forwarded-proto'];
          const protocol =
            (Array.isArray(protoHeader) ? protoHeader[0] : protoHeader) ||
            ((req.socket as TLSSocket)?.encrypted ? 'https' : 'http');
          const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || 'localhost:3000';
          const fullUrl = new URL(req.url, `${protocol}://${host}`);

          let body: Buffer | undefined = undefined;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
            }
            if (chunks.length > 0) {
              body = Buffer.concat(chunks);
            }
          }

          const reqHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (Array.isArray(value)) {
              for (const v of value) reqHeaders.append(key, v);
            } else if (typeof value === 'string') {
              reqHeaders.set(key, value);
            }
          }

          const webReq = new Request(fullUrl.toString(), {
            method: req.method,
            headers: reqHeaders,
            body: body && body.length > 0 ? body : undefined,
            // @ts-expect-error Node fetch duplex option
            duplex: 'half',
          });

          const webRes = await handler(webReq);

          res.statusCode = webRes.status;
          webRes.headers.forEach((value: string, key: string) => {
            res.setHeader(key, value);
          });

          const resBody = await webRes.arrayBuffer();
          res.end(Buffer.from(resBody));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'UploadThing error';
          console.warn('UploadThing handler notice:', message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    uploadthingDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        id: '/',
        name: 'SOACA Choir Portal',
        short_name: 'SOACA',
        description: 'Official choir member & dues management portal for SOACA.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#1e293b',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

