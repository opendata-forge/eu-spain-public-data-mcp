// Data sources: BOE/BORME (boe.es open data), EU Funding & Tenders portal (SEDIA search API), TED v3.
const UA = 'opendata-forge-mcp/1.0';
const arr = (v: any): any[] => (v == null ? [] : Array.isArray(v) ? v : [v]);
const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function searchBoe(o: { bulletins?: string[]; keywords?: string[]; sections?: string[]; dateFrom?: string; dateTo?: string; maxResults?: number }) {
  const bulletins = o.bulletins?.length ? o.bulletins : ['BOE'];
  const kw = (o.keywords ?? []).map((k) => k.toLowerCase()).filter(Boolean);
  const secs = (o.sections ?? []).map((s) => s.toUpperCase());
  const max = Math.min(o.maxResults ?? 50, 200);
  const dateTo = o.dateTo || iso(new Date());
  const dateFrom = o.dateFrom || iso(new Date(new Date(dateTo).getTime() - 6 * 864e5));
  const days: string[] = [];
  for (let d = new Date(dateTo); iso(d) >= dateFrom; d = new Date(d.getTime() - 864e5)) days.push(iso(d));
  if (days.length > 31) throw new Error('Date range limited to 31 days per call.');
  const out: any[] = [];
  for (const day of days) for (const b of bulletins) {
    if (out.length >= max) return out;
    const res = await fetch(`https://www.boe.es/datosabiertos/api/${b.toLowerCase()}/sumario/${day.replace(/-/g, '')}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (!res.ok) continue; // 404 = no issue that day
    const data: any = await res.json();
    for (const diario of arr(data?.data?.sumario?.diario)) for (const sec of arr(diario.seccion)) {
      const add = (it: any, dept: string | null, heading: string | null) => {
        const i = { bulletin: b, date: day, id: it.identificador, title: it.titulo, section: `${sec.codigo} ${sec.nombre}`.trim(), sectionCode: String(sec.codigo).toUpperCase(), department: dept, heading, pdfUrl: it.url_pdf?.texto ?? it.url_pdf ?? null, htmlUrl: it.url_html ?? null };
        if ((!secs.length || secs.includes(i.sectionCode)) && (!kw.length || kw.some((k) => `${i.title} ${dept} ${heading} ${i.section}`.toLowerCase().includes(k))) && out.length < max) out.push(i);
      };
      for (const it of arr(sec.item)) add(it, null, null);
      for (const dep of arr(sec.departamento)) {
        for (const it of arr(dep.item)) add(it, dep.nombre, null);
        for (const ep of arr(dep.epigrafe)) for (const it of arr(ep.item)) add(it, dep.nombre, ep.nombre);
      }
    }
  }
  return out;
}

const CODES: Record<string, string> = { forthcoming: '31094501', open: '31094502', closed: '31094503' };
const NAMES = Object.fromEntries(Object.entries(CODES).map(([k, v]) => [v, k]));
const first = (v: any) => (Array.isArray(v) ? v[0] : v) ?? null;

export async function searchEuFunding(o: { keywords?: string; statuses?: string[]; maxResults?: number }) {
  const statuses = o.statuses?.length ? o.statuses : ['open', 'forthcoming'];
  const max = Math.min(o.maxResults ?? 25, 100);
  const after = statuses.includes('closed') ? null : iso(new Date());
  const query = { bool: { must: [{ terms: { type: ['1', '2', '8'] } }, { terms: { status: statuses.map((s) => CODES[s]).filter(Boolean) } }] } };
  const out: any[] = []; const seen = new Set<string>();
  for (let page = 1; out.length < max && page <= 10; page++) {
    const fd = new FormData();
    fd.append('query', new Blob([JSON.stringify(query)], { type: 'application/json' }));
    fd.append('languages', new Blob([JSON.stringify(['en'])], { type: 'application/json' }));
    const p = new URLSearchParams({ apiKey: 'SEDIA', text: o.keywords || '***', pageSize: '50', pageNumber: String(page), sortBy: 'deadlineDate', sortOrder: 'ASC' });
    const res = await fetch(`https://api.tech.ec.europa.eu/search-api/prod/rest/search?${p}`, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`EU search API ${res.status}`);
    const results: any[] = ((await res.json()) as any).results ?? [];
    for (const r of results) {
      const m = r.metadata ?? {}; const id = first(m.identifier);
      if (!id || seen.has(id)) continue; seen.add(id);
      const deadline = first(m.deadlineDate)?.slice(0, 10) ?? null;
      if (after && deadline && deadline < after) continue;
      if (out.length < max) out.push({ identifier: id, title: first(m.title) ?? r.summary, status: NAMES[first(m.status)] ?? first(m.status), programme: id.split('-')[0], callIdentifier: first(m.callIdentifier), openingDate: first(m.startDate)?.slice(0, 10) ?? null, deadline, url: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${id.toLowerCase()}` });
    }
    if (results.length < 50) break;
  }
  return out;
}

export async function searchTed(o: { keywords?: string; countries?: string[]; cpvCodes?: string[]; publishedAfter?: string; maxResults?: number }) {
  const parts: string[] = [];
  if (o.keywords) parts.push(`FT~"${o.keywords.replace(/"/g, '')}"`);
  if (o.countries?.length) parts.push(`buyer-country IN (${o.countries.map((c) => c.toUpperCase()).join(' ')})`);
  if (o.cpvCodes?.length) parts.push(`classification-cpv IN (${o.cpvCodes.join(' ')})`);
  if (o.publishedAfter) parts.push(`publication-date>=${o.publishedAfter.replace(/-/g, '')}`);
  const query = (parts.join(' AND ') || 'publication-date>=20240101') + ' SORT BY publication-date DESC';
  const fields = ['publication-number', 'notice-title', 'buyer-name', 'buyer-country', 'publication-date', 'deadline-receipt-tender-date-lot', 'classification-cpv', 'notice-type', 'estimated-value-cur-lot'];
  const pick = (v: any) => (v && typeof v === 'object' && !Array.isArray(v) ? v.eng ?? v.spa ?? Object.values(v)[0] : v);
  const limit = Math.min(o.maxResults ?? 25, 100);
  const res = await fetch('https://api.ted.europa.eu/v3/notices/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, fields, limit, page: 1, paginationMode: 'PAGE_NUMBER' }) });
  if (!res.ok) throw new Error(`TED API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return (((await res.json()) as any).notices ?? []).map((n: any) => ({
    publicationNumber: n['publication-number'], title: pick(n['notice-title']), buyer: [].concat(pick(n['buyer-name']) ?? [])[0] ?? null,
    country: [].concat(n['buyer-country'] ?? [])[0] ?? null, publicationDate: n['publication-date'], deadline: [].concat(n['deadline-receipt-tender-date-lot'] ?? [])[0] ?? null,
    cpv: [...new Set([].concat(n['classification-cpv'] ?? []))], noticeType: n['notice-type'], estimatedValue: [].concat(n['estimated-value-cur-lot'] ?? [])[0] ?? null,
    url: `https://ted.europa.eu/en/notice/-/detail/${n['publication-number']}`,
  }));
}
