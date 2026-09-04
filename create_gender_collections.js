// Creates two smart collections: "Shop for Her" and "Shop for Him".
// Her = product type contains "Ladies"  OR  tag "Womens".
// Him = product type contains "Gents"   OR  tag "Mens".
// Disjunctive (ANY) so both the "Ladies/Gents ..." types AND future gender tags fill them.
// Safe to re-run. Run: node create_gender_collections.js
const https = require('https'), fs = require('fs'), path = require('path');
const SHOP = 'velonnajewellers', API = '2026-04';
const TOKEN = fs.readFileSync(path.join(__dirname, 'new_token.txt'), 'utf8').trim();

const COLS = [
  { title: 'Shop for Her', handle: 'shop-for-her',
    rules: [{ column: 'type', relation: 'contains', condition: 'Ladies' }, { column: 'tag', relation: 'equals', condition: 'Womens' }] },
  { title: 'Shop for Him', handle: 'shop-for-him',
    rules: [{ column: 'type', relation: 'contains', condition: 'Gents' }, { column: 'tag', relation: 'equals', condition: 'Mens' }] },
];

function req(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({ hostname: `${SHOP}.myshopify.com`, path: `/admin/api/${API}${apiPath}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } },
      (res) => { let o = ''; res.on('data', c => o += c); res.on('end', () => resolve({ status: res.statusCode, body: o, headers: res.headers })); });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  let existing = [], pageInfo = null;
  do {
    const q = pageInfo ? `/smart_collections.json?limit=250&page_info=${pageInfo}` : `/smart_collections.json?limit=250&fields=id,handle`;
    const res = await req('GET', q);
    existing = existing.concat(JSON.parse(res.body).smart_collections || []);
    const m = (res.headers['link'] || '').match(/page_info=([^>]+)>; rel="next"/);
    pageInfo = m ? m[1] : null; await sleep(300);
  } while (pageInfo);
  const have = new Map(existing.map(c => [c.handle, c.id]));

  for (const c of COLS) {
    const payload = { smart_collection: { title: c.title, handle: c.handle, disjunctive: true, rules: c.rules, sort_order: 'best-selling', published: true } };
    if (have.has(c.handle)) {
      await req('PUT', `/smart_collections/${have.get(c.handle)}.json`, { smart_collection: { id: have.get(c.handle), disjunctive: true, rules: c.rules, sort_order: 'best-selling' } });
      console.log(`• updated — ${c.title} (/collections/${c.handle})`);
    } else {
      const res = await req('POST', '/smart_collections.json', payload);
      console.log(res.status === 201 ? `✓ created — ${c.title} (/collections/${c.handle})` : `ERR ${res.status} ${c.title}: ${res.body.slice(0,140)}`);
    }
    await sleep(550);
  }
  console.log('\nDone. Her fills from "Ladies ..." types + tag "Womens"; Him from "Gents ..." types + tag "Mens".');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
