# Spain & EU Public Data MCP (by OpenData Forge)

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
