import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const mode = process.argv[2] || 'stdio';
const t = mode === 'http' ? new StreamableHTTPClientTransport(new URL(process.env.MCP_URL || 'http://localhost:8080/mcp')) : new StdioClientTransport({ command: 'node', args: ['dist/index.js', '--stdio'] });
const c = new Client({ name: 'smoke', version: '1' }); await c.connect(t);
console.log(mode, 'tools:', (await c.listTools()).tools.map((x) => x.name).join(', '));
const calls = [['search_boe_borme', { keywords: ['subvenci'], maxResults: 5 }], ['search_boe_borme', { bulletins: ['BORME'], maxResults: 3 }], ['search_eu_funding', { keywords: 'artificial intelligence', maxResults: 5 }], ['search_ted_tenders', { keywords: 'software', countries: ['ESP'], maxResults: 5 }]];
for (const [name, args] of calls) { const t0 = Date.now(); const r = await c.callTool({ name, arguments: args }); const txt = r.content[0].text; let j; try { j = JSON.parse(txt); } catch { console.log(name, 'ERR', txt); continue; } console.log(`${name} ${JSON.stringify(args)} -> ${j.count} items in ${Date.now() - t0}ms | first: ${JSON.stringify(j.items[0]?.title ?? null).slice(0, 110)}`); }
await c.close();
