#!/usr/bin/env node

/**
 * Simple HTTP server to serve the HTML example
 */

import { createServer } from 'http';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 3000;

const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    try {
      const htmlPath = join(__dirname, 'examples', 'test-app.html');
      const htmlContent = readFileSync(htmlPath, 'utf8');

      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(htmlContent);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('HTML example file not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log('🚀 HTML Example Server Started!');
  console.log(`📱 Open your browser to: http://localhost:${PORT}`);
  console.log('📝 This demonstrates the ComfyUI provider API usage pattern');
  console.log('⚠️  Note: Actual image generation requires bundling the AI SDK');
  console.log('🛑 Press Ctrl+C to stop the server');
});
