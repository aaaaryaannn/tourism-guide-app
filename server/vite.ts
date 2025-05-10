import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { nanoid } from "nanoid";
import type { ViteDevServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

let vite: ViteDevServer | undefined;

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function createViteServer() {
  const vite = await import('vite');
  const server = await vite.createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  return server;
}

export async function closeViteServer() {
  if (vite) {
    await vite.close();
    vite = undefined;
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, '../dist')
    : path.join(__dirname, 'public')
  );

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
