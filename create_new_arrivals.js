// Creates a smart "New Arrivals" collection: all products, newest first.
// Then the homepage "New Arrivals" (pointed at handle 'new-arrivals') shows the latest uploads.
// Safe to re-run.
// Run: node create_new_arrivals.js
const https = require('https'), fs = require('fs'), path = require('path');
const SHOP = 'velonnajewellers', API = '2026-04';
const TOKEN = fs.readFileSync(path.join(__dirname, 'new_token.txt'), 'utf8').trim();

function req(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = https.request({ hostname: `${SHOP}.myshopify.com`, path: `/admin/api/${API}${apiPath}`, method,
      headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) } },
      (res) => { let o = ''; res.on('data', c => o += c); res.on('end', () => resolve({ status: res.statusCode, body: o })); });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}

(async () => {
  // Already exists?
  const ex = await req('GET', '/smart_collections.json?limit=250&fields=id,handle,title');
  const found = (JSON.parse(ex.body).smart_collections || []).find(c => c.handle === 'new-arrivals');
  if (found) {
    // Make sure it sorts newest-first.
    await req('PUT', `/smart_collections/${found.id}.json`, { smart_collection: { id: found.id, sort_order: 'created-desc' } });
    console.log('New Arrivals already exists — ensured newest-first sort. /collections/new-arrivals');
    return;
  }
  const res = await req('POST', '/smart_collections.json', {
    smart_collection: {
      title: 'New Arrivals', handle: 'new-arrivals',
      disjunctive: false,
      rules: [{ column: 'variant_price', relation: 'greater_than', condition: '0' }], // matches all priced products
      sort_order: 'created-desc',  // newest first
      published: true,
    }
  });
  if (res.status === 201) console.log('✓ Created "New Arrivals" (all products, newest first) — /collections/new-arrivals');
  else console.log(`ERR ${res.status}: ${res.body.slice(0, 200)}`);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
