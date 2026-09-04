// Assigns the "diamond" product template (the customiser) to lab-grown diamond products.
// Matches products tagged "Lab Grown Diamonds" OR whose handle starts with "er-" (diamond studs).
// Run AFTER the theme (product.diamond.json + velonna-diamond-customiser section) has synced.
// Safe to re-run.  Run: node apply_diamond_template.js
const https = require('https'), fs = require('fs'), path = require('path');
const SHOP = 'velonnajewellers', API = '2026-04';
const TOKEN = fs.readFileSync(path.join(__dirname, 'new_token.txt'), 'utf8').trim();

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
  let all = [], pageInfo = null;
  do {
    const q = pageInfo ? `/products.json?limit=250&page_info=${pageInfo}` : `/products.json?limit=250&fields=id,title,handle,tags,product_type,template_suffix`;
    const res = await req('GET', q);
    all = all.concat(JSON.parse(res.body).products || []);
    const m = (res.headers['link'] || '').match(/page_info=([^>]+)>; rel="next"/);
    pageInfo = m ? m[1] : null; await sleep(300);
  } while (pageInfo);

  const isDiamond = p => {
    const tags = (p.tags || '').toLowerCase();
    return tags.includes('lab grown diamond') || (p.handle || '').toLowerCase().startsWith('er-');
  };
  const isEarring = p => (p.handle || '').toLowerCase().startsWith('er-') || (p.product_type || '').toLowerCase().includes('earring');
  const targets = all.filter(isDiamond);
  console.log(`Matched ${targets.length} lab-grown diamond products.`);
  let n = 0;
  for (const p of targets) {
    const suffix = isEarring(p) ? 'diamond-earring' : 'diamond';
    if (p.template_suffix === suffix) { console.log(`• already ${suffix} — ${p.title}`); continue; }
    const res = await req('PUT', `/products/${p.id}.json`, { product: { id: p.id, template_suffix: suffix } });
    if (res.status === 200) { n++; console.log(`✓ ${suffix.padEnd(15)} ${p.title}`); } else console.log(`ERR ${res.status} — ${p.title}`);
    await sleep(500);
  }
  console.log(`\nDone. Applied diamond customiser templates to ${n} products.`);
  console.log('Set real rates in Shopify admin → Online Store → Customize → (a diamond product) → Diamond Customiser section.');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
