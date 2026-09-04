// Creates metal-scoped "Shop by Type" collections: Silver X and Diamond X for each type.
// Each = product type contains WORD  AND  tag equals the metal. Safe to re-run.
// Run: node create_metal_type_collections.js
const https = require('https'), fs = require('fs'), path = require('path');
const SHOP = 'velonnajewellers', API = '2026-04';
const TOKEN = fs.readFileSync(path.join(__dirname, 'new_token.txt'), 'utf8').trim();

// [typeWord, labelSuffix]
const TYPES = [['Ring','Rings'],['Earring','Earrings'],['Bracelet','Bracelets'],['Pendant','Necklaces & Pendants'],['Bangle','Bangles']];
const METALS = [
  { tag: 'Silver', prefix: 'silver', title: 'Silver' },
  { tag: 'Lab Grown Diamonds', prefix: 'diamond', title: 'Diamond' },
];
const HANDLE = { 'Ring':'rings','Earring':'earrings','Bracelet':'bracelets','Pendant':'necklaces','Bangle':'bangles' };

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

  let made = 0;
  for (const metal of METALS) {
    for (const [word, label] of TYPES) {
      const handle = `${metal.prefix}-${HANDLE[word]}`;
      const title = `${metal.title} ${label}`;
      const rules = [{ column: 'type', relation: 'contains', condition: word }, { column: 'tag', relation: 'equals', condition: metal.tag }];
      if (have.has(handle)) {
        await req('PUT', `/smart_collections/${have.get(handle)}.json`, { smart_collection: { id: have.get(handle), rules, disjunctive: false, sort_order: 'best-selling' } });
        console.log(`• updated — ${title} (/collections/${handle})`);
      } else {
        const res = await req('POST', '/smart_collections.json', { smart_collection: { title, handle, disjunctive: false, rules, sort_order: 'best-selling', published: true } });
        console.log(res.status === 201 ? `✓ created — ${title} (/collections/${handle})` : `ERR ${res.status} ${title}: ${res.body.slice(0,120)}`);
        if (res.status === 201) made++;
      }
      await sleep(550);
    }
  }
  console.log(`\nDone. Created ${made} new metal-scoped collections (silver-* and diamond-*).`);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
