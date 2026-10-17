# Publishing notes (nothing done yet; each step needs Bartosz's OK)

## MCPize (paid) — checked 16 Oct 2026
- Requirements: working MCP server, free MCPize account (email verification), CLI `npm i -g mcpize`, Stripe account only for paid tiers. https://mcpize.com/developers/publish-mcp-server
- Config: `mcpize.yaml` (version, runtime, entry, build, startCommand). https://mcpize.com/case/mcpize-yaml — included. MCPize hosts it (`mcpize deploy`), so no own hosting cost.
- Pricing models: monthly subscriptions (free/pro/enterprise tiers, set in dashboard, billed via Stripe) and/or x402 pay-per-call in USDC on Base (needs a crypto wallet — NOT recommended). https://mcpize.com/docs/monetization
- Fee/payout: 20% platform fee for servers monetized on/after 10 Jun 2026 (dev keeps 80%); monthly payouts via Stripe Connect after ID + tax verification, minimum threshold applies. https://mcpize.com/terms
- Quality rule: real functional tools, accurate description (we comply).

## Smithery (free discovery) — `smithery.yaml` (container + Dockerfile) included. Pays nothing; listing needs a Smithery login (GitHub) and repo/deploy.

## Suggested MCPize pricing
- Free: 50 tool calls/month
- Pro: $9/month (or $86/yr), 3,000 calls
- Business: $29/month, 20,000 calls
Net per Pro sub ≈ $7.20 after MCPize's 20%.

## Status 17 Oct 2026 (deployed)
- MCPize CLI 1.2.2, `mcpize deploy --yes --skip-wizard`: remote build (no local Docker needed), deployment fc857f20 success.
- Server id 70d6ffb5-3692-4629-ab51-9fcb20753bb9, slug eu-spain-public-data, publisher "OpenData Forge" (profile also shows @thehomer87).
- Listing: https://mcpize.com/mcp/eu-spain-public-data  Gateway: https://eu-spain-public-data.mcpize.run (auth required: OAuth / subscriber key)
- Pricing: one plan, Free, 50 requests/month (server flagged is_free). No Stripe connected.
- yaml changes: name eu-spain-public-data, longer description, dropped `--port 8080` args (Cloud Run sets PORT). index.ts: enableJsonResponse.

## Adding paid tiers later (after Bartosz connects Stripe Connect himself)
1. Dashboard: https://mcpize.com/developer/servers/70d6ffb5-3692-4629-ab51-9fcb20753bb9/manage -> confirm Stripe payouts show as connected/verified.
2. `npx mcpize publish --pricing "Free: \$0, 50 calls/month. Pro: \$9/month or \$86/year, 3,000 calls/month. Business: \$29/month, 20,000 calls/month."` (AI turns this into plans and saves them, replacing the Free-only plan).
3. `npx mcpize publish --show` and the dashboard Pricing tab: check 3 plans, prices, annual price, quotas; fix by hand if wrong. Turn off the "free" flag if the dashboard still marks the server as free.
