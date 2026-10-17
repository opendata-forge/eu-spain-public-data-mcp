#!/usr/bin/env node
import express from 'express';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

if (process.argv.includes('--stdio') || process.env.MCP_TRANSPORT === 'stdio') {
  await createServer().connect(new StdioServerTransport());
} else {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_q, r) => { r.json({ ok: true }); });
  app.post('/mcp', async (req, res) => { // stateless: new server+transport per request
    const server = createServer();
    const t = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { t.close(); server.close(); });
    await server.connect(t);
    await t.handleRequest(req, res, req.body);
  });
  const notAllowed = (_q: any, r: any) => r.status(405).json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
  app.get('/mcp', notAllowed); app.delete('/mcp', notAllowed);
  const i = process.argv.indexOf('--port');
  const port = Number(i > 0 ? process.argv[i + 1] : process.env.PORT || 8080);
  app.listen(port, () => console.error(`MCP HTTP on :${port}/mcp`));
}
