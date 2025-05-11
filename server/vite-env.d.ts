/// <reference types="vite/client" />

declare module 'vite' {
  export interface ViteDevServer {
    middlewares: any;
    close(): Promise<void>;
  }
  
  export function createServer(config?: any): Promise<ViteDevServer>;
  export function defineConfig(config: any): any;
} 