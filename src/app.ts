import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';

import { argv } from './config';
import { doesFileExist } from './utils';

const app: express.Express = express();

app.use(
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('/', async (req, res, _next) => {
  const url = `${argv.origin}${req.originalUrl}`;
  const cacheDir = './cache';

  try {
    if (req.method === 'GET') {
      const fileName = `${req.originalUrl.replaceAll('/', '_')}.json`;
      const filePath = `${cacheDir}/${fileName}`;

      if (await doesFileExist(filePath)) {
        const raw = await fs.readFile(filePath, 'utf-8');
        const cached = JSON.parse(raw) as { status: number; data: unknown };
        return res.set('X-Cache', 'HIT').status(cached.status).json(cached.data);
      }

      const resp = await fetch(url);
      const data = (await resp.json()) as unknown;

      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify({ status: resp.status, data }));

      return res.set('X-Cache', 'MISS').status(resp.status).json(data);
    } else {
      const headers: Record<string, string> = {};
      if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
      if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];

      const resp = await fetch(url, {
        method: req.method,
        headers,
        ...(req.body !== undefined && { body: JSON.stringify(req.body) }),
      });

      const data = (await resp.json()) as unknown;
      return res.set('X-Cache', 'BYPASS').status(resp.status).json(data);
    }
  } catch (error) {
    console.error(`Proxy error for ${req.method} ${url}:`, error);
    return res.status(502).json({ error: 'Bad Gateway' });
  }
});

export default app;
