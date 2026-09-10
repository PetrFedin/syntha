import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QRCodeSVG } from 'qrcode.react';
import renderer from '@/lib/investors/investor-brief-html.cjs';
import {
  resolveCanonicalInvestorUrl,
  resolveInvestorContactUrl,
} from '@/lib/investors/investor-brief-route';

const { renderInvestorBriefHtml } = renderer as {
  renderInvestorBriefHtml: (options: {
    canonicalUrl: string;
    platformHref: string;
    platformLabel: string;
    contactUrl: string;
    qrSvg: string;
  }) => string;
};

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const runtimeOrigin = new URL(request.url).origin;
  const canonicalUrl =
    resolveCanonicalInvestorUrl(process.env.NEXT_PUBLIC_INVESTORS_URL, runtimeOrigin) ??
    `${runtimeOrigin}/investors`;
  const contactUrl = resolveInvestorContactUrl(process.env.NEXT_PUBLIC_INVESTOR_CONTACT_URL) ?? '';
  const qrSvg = renderToStaticMarkup(
    createElement(QRCodeSVG, {
      value: canonicalUrl,
      size: 204,
      level: 'Q',
      bgColor: '#FFFFFF',
      fgColor: '#0F172A',
      marginSize: 4,
      title: 'QR-код публичной страницы Syntha',
    })
  );
  const html = renderInvestorBriefHtml({
    canonicalUrl,
    platformHref: '/platform',
    platformLabel: 'Открыть платформу',
    contactUrl,
    qrSvg,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
      ...SECURITY_HEADERS,
    },
  });
}
