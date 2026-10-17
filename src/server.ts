import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { searchBoe, searchEuFunding, searchTed } from './sources.js';

const ok = (items: any[], source: string) => ({ content: [{ type: 'text' as const, text: JSON.stringify({ count: items.length, source, items }, null, 2) }] });
const fail = (e: any) => ({ isError: true, content: [{ type: 'text' as const, text: `Error: ${e?.message ?? e}` }] });
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function createServer() {
  const s = new McpServer({ name: 'spain-eu-public-data', version: '1.0.0' });
  s.registerTool('search_boe_borme', {
    title: 'Search Spain BOE / BORME daily bulletins',
    description: "Search the daily summaries of Spain's Official State Gazette (BOE) and Companies Register Gazette (BORME) by keyword, section and date range (max 31 days). Returns titles, departments and PDF/HTML links. Source: Agencia Estatal BOE (https://www.boe.es).",
    inputSchema: { keywords: z.array(z.string()).optional().describe('Case-insensitive keywords (Spanish), any match'), bulletins: z.array(z.enum(['BOE', 'BORME'])).optional().describe('Default ["BOE"]'), sections: z.array(z.string()).optional().describe('Section codes e.g. "1","3","5A"'), dateFrom: date.optional(), dateTo: date.optional().describe('Default today; range defaults to last 7 days'), maxResults: z.number().int().min(1).max(200).optional() },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (a) => { try { return ok(await searchBoe(a), 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado, https://www.boe.es'); } catch (e) { return fail(e); } });
  s.registerTool('search_eu_funding', {
    title: 'Search EU funding & grant calls',
    description: 'Search open/forthcoming calls on the EU Funding & Tenders Portal (Horizon Europe, Digital Europe, LIFE, CEF, ...). Sorted by deadline. Source: European Commission.',
    inputSchema: { keywords: z.string().optional().describe('Free-text, e.g. "artificial intelligence"'), statuses: z.array(z.enum(['open', 'forthcoming', 'closed'])).optional(), maxResults: z.number().int().min(1).max(100).optional() },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (a) => { try { return ok(await searchEuFunding(a), '© European Union, EU Funding & Tenders Portal'); } catch (e) { return fail(e); } });
  s.registerTool('search_ted_tenders', {
    title: 'Search EU public tenders (TED)',
    description: 'Search public procurement notices on TED (Tenders Electronic Daily) by keyword, buyer country (ISO-3, e.g. ESP, DEU), CPV code and publication date. Newest first.',
    inputSchema: { keywords: z.string().optional(), countries: z.array(z.string()).optional().describe('ISO 3166-1 alpha-3'), cpvCodes: z.array(z.string()).optional(), publishedAfter: date.optional(), maxResults: z.number().int().min(1).max(100).optional() },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async (a) => { try { return ok(await searchTed(a), '© European Union, TED, https://ted.europa.eu'); } catch (e) { return fail(e); } });
  return s;
}
