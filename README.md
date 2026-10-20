<p align="center"><img src="assets/logo-512.png" alt="OpenData Forge" width="96"></p>

# Spain & EU Public Data MCP (by OpenData Forge)

[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.opendata--forge%2Feu--spain--public--data-blue)](https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.opendata-forge/eu-spain-public-data)
[![Spain & EU Public Data MCP](https://glama.ai/mcp/servers/opendata-forge/eu-spain-public-data-mcp/badges/score.svg)](https://glama.ai/mcp/servers/opendata-forge/eu-spain-public-data-mcp)
[![Smithery](https://img.shields.io/badge/Smithery-listed-orange)](https://smithery.ai/servers/opendata-forge/eu-spain-public-data)
[![MCPize](https://img.shields.io/badge/MCPize-hosted-6f42c1)](https://mcpize.com/mcp/eu-spain-public-data)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Give Claude, Cursor or any MCP client live access to:

| Tool | What it searches |
|---|---|
| `search_boe_borme` | Spain's Official State Gazette (BOE) and Companies Register Gazette (BORME) daily summaries – keyword, section, date range (≤31 days) |
| `search_eu_funding` | Open / forthcoming EU grant calls (Horizon Europe, Digital Europe, LIFE, CEF…) sorted by deadline |
| `search_ted_tenders` | EU public procurement notices on TED – keyword, buyer country (ISO-3), CPV, date |

All tools are read-only, need no API keys, and return JSON with source links.

## Example prompts
- "Any new subsidies for SMEs published in the BOE this week?"
- "List open EU calls about artificial intelligence closing in the next 60 days."
- "Find Spanish software tenders published since 2026-10-01."

## Run
```bash
npm ci && npm run build
node dist/index.js            # Streamable HTTP on :8080/mcp
node dist/index.js --stdio    # stdio
```
Claude Desktop / Cursor (stdio):
```json
{ "mcpServers": { "spain-eu-data": { "command": "node", "args": ["/path/dist/index.js", "--stdio"] } } }
```
Docker: `docker build -t spain-eu-mcp . && docker run -p 8080:8080 spain-eu-mcp`

## Limits
BOE range ≤31 days/call, ≤200 results; EU funding ≤100; TED ≤100 per call. Data is fetched live from official sources; availability depends on them.

## Data sources & attribution
- Basado en datos de la Agencia Estatal Boletín Oficial del Estado – https://www.boe.es (reuse conditions: https://www.boe.es/informacion/aviso_legal/)
- © European Union – EU Funding & Tenders Portal and TED (https://ted.europa.eu), reuse under Commission Decision 2011/833/EU.
Not affiliated with or endorsed by these bodies.

## Hosted versions
No install needed: use the hosted server on [MCPize](https://mcpize.com/mcp/eu-spain-public-data) (free tier, sign-in required).

## Follow
Built and maintained by **OpenData Forge**.
- Website: https://opendata-forge.pages.dev
- X: [@opendataforge](https://x.com/opendataforge)
- LinkedIn: [OpenData Forge](https://www.linkedin.com/company/opendataforge)
- Tutorials: https://opendata-forge.hashnode.dev

Issues and feature requests: https://github.com/opendata-forge/eu-spain-public-data-mcp/issues
