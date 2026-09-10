import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { renderInvestorBriefHtml } = require('../src/lib/investors/investor-brief-html.cjs');

const here = dirname(fileURLToPath(import.meta.url));
const QR_TARGET = 'https://syntha-fashion-os.onrender.com/investors';
const qrAsset = readFileSync(resolve(here, '../public/investors-qr.svg'), 'utf8');

function safeHttpUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString().replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}

function safeContactUrl(value) {
  if (!value) return '';
  if (value.startsWith('mailto:')) return value;
  return safeHttpUrl(value);
}

const canonicalUrl =
  safeHttpUrl(process.env.PUBLIC_INVESTORS_URL || process.env.NEXT_PUBLIC_INVESTORS_URL) || QR_TARGET;
const platformUrl = safeHttpUrl(process.env.PUBLIC_PLATFORM_URL);
const contactUrl = safeContactUrl(
  process.env.PUBLIC_INVESTOR_CONTACT_URL || process.env.NEXT_PUBLIC_INVESTOR_CONTACT_URL
);
const qrSvg = canonicalUrl === QR_TARGET ? qrAsset : '';
const platformHref = platformUrl || '#platform';
const platformLabel = platformUrl ? 'Открыть платформу' : 'Устройство платформы';

const html = renderInvestorBriefHtml({
  canonicalUrl,
  platformHref,
  platformLabel,
  contactUrl,
  qrSvg,
});

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function send(res, statusCode, body, contentType, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': statusCode === 200 ? 'public, max-age=300, stale-while-revalidate=3600' : 'no-store',
    ...securityHeaders,
    ...extraHeaders,
  });
  res.end(body);
}

const server = createServer((req, res) => {
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);

  if (url.pathname === '/health') {
    return send(
      res,
      200,
      JSON.stringify({ ok: true, surface: 'investors', canonicalUrl, qrReady: Boolean(qrSvg) }),
      'application/json; charset=utf-8',
      { 'Cache-Control': 'no-store' }
    );
  }

  if (url.pathname === '/robots.txt') {
    return send(
      res,
      200,
      `User-agent: *\nAllow: /investors\nSitemap: ${canonicalUrl.replace(/\/investors\/?$/, '')}/sitemap.xml\n`,
      'text/plain; charset=utf-8'
    );
  }

  if (url.pathname === '/sitemap.xml') {
    return send(
      res,
      200,
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${canonicalUrl}</loc></url></urlset>`,
      'application/xml; charset=utf-8'
    );
  }

  if (url.pathname === '/' || url.pathname === '/investors' || url.pathname === '/investors/') {
    return send(res, 200, html, 'text/html; charset=utf-8');
  }

  return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
});

const port = Number(process.env.PORT || 10000);
server.listen(port, '0.0.0.0', () => {
  console.log(`[investors-public] listening on :${port}`);
  console.log(`[investors-public] canonical=${canonicalUrl}`);
  console.log(`[investors-public] qr=${qrSvg ? 'ready' : 'disabled (canonical differs from QR asset)'}`);
});
