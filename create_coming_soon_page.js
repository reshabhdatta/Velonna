// Creates the "Coming Soon" page and assigns the coming-soon template.
// Run AFTER the theme with templates/page.coming-soon.liquid has synced.
// Safe to re-run.
// Run: node create_coming_soon_page.js
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
  const ex = await req('GET', '/pages.json?limit=250&fields=id,handle,title,template_suffix');
  const found = (JSON.parse(ex.body).pages || []).find(p => p.handle === 'coming-soon');
  const payload = {
    page: {
      title: 'Coming Soon',
      body_html: "We're crafting something special. Be the first to know when this collection launches — leave your details or message us on WhatsApp.",
      template_suffix: 'coming-soon',
      published: true,
    }
  };
  if (found) {
    const res = await req('PUT', `/pages/${found.id}.json`, { page: { id: found.id, template_suffix: 'coming-soon', published: true } });
    console.log(res.status === 200 ? '✓ Coming Soon page already existed — template ensured. /pages/coming-soon' : `ERR ${res.status}: ${res.body.slice(0,160)}`);
    return;
  }
  const res = await req('POST', '/pages.json', payload);
  console.log(res.status === 201 ? '✓ Created Coming Soon page → /pages/coming-soon' : `ERR ${res.status}: ${res.body.slice(0,200)}`);
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
