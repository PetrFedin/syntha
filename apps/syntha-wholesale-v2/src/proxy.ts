import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { workspaceSections } from '@/shared/navigation';

const workspaceSlugs = new Set<string>(workspaceSections.map((section) => section.id));
const platformPaths = new Set<string>(['api', 'favicon.ico', 'robots.txt', 'sitemap.xml']);

function notFoundDocument(pathname: string): string {
  const escapedPath = pathname.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Раздел не найден · Syntha Wholesale</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #0b0b0d; color: #f5f5f1; }
    main { width: min(620px, 100%); padding: clamp(28px, 6vw, 56px); border: 1px solid #2b2b30; border-radius: 24px; background: #121215; box-shadow: 0 24px 80px rgb(0 0 0 / 35%); }
    small { color: #d7ff54; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 14px 0 12px; font-size: clamp(32px, 8vw, 64px); line-height: .95; letter-spacing: -.055em; }
    p { margin: 0; color: #aaaab2; line-height: 1.65; }
    code { display: inline-block; margin-top: 18px; padding: 8px 10px; border-radius: 8px; background: #0b0b0d; color: #d7ff54; }
    a { min-height: 44px; margin-top: 24px; padding: 12px 18px; display: inline-flex; align-items: center; border-radius: 10px; background: #d7ff54; color: #0b0b0d; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <small>404 · Workspace boundary</small>
    <h1>Раздел не найден</h1>
    <p>Маршрут не входит в канонический Syntha Wholesale workspace.</p>
    <code>${escapedPath}</code><br />
    <a href="/">На dashboard</a>
  </main>
</body>
</html>`;
}

export function proxy(request: NextRequest): Response {
  const segment = request.nextUrl.pathname.slice(1);
  const known = workspaceSlugs.has(segment) || platformPaths.has(segment) || segment.includes('.');

  if (known) return NextResponse.next();

  return new Response(request.method === 'HEAD' ? null : notFoundDocument(request.nextUrl.pathname), {
    status: 404,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'text/html; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
  });
}

export const config = {
  matcher: '/:section',
};
