import path from 'node:path';
import type { NextConfig } from 'next';

const rootDir = process.cwd();
const isE2e =
  process.env.E2E === 'true' || process.env.NEXT_PUBLIC_DISABLE_FONTS === '1';

const appFontsAlias = path.join(
  rootDir,
  isE2e ? 'src/lib/app-fonts.e2e.ts' : 'src/lib/app-fonts.prod.ts'
);
const appFontsAliasRelative = isE2e
  ? './src/lib/app-fonts.e2e.ts'
  : './src/lib/app-fonts.prod.ts';

const nextConfig: NextConfig = {
  /** Изолированная сборка: `NEXT_DIST_DIR=.next-isolated npm run build` (не пересекается с `next dev` в `.next`). */
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  /** Investor demo flags — server bundles read at process start (.env.local + inline npm scripts). */
  env: {
    WORKSHOP2_INVESTOR_DEMO_MODE: process.env.WORKSHOP2_INVESTOR_DEMO_MODE,
    WORKSHOP2_UNIT_TESTS_PASSING: process.env.WORKSHOP2_UNIT_TESTS_PASSING,
    /** Platform Core — middleware (Edge) читает только из next.config.env + .env* */
    NEXT_PUBLIC_PLATFORM_CORE_MODE: process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE,
    NEXT_PUBLIC_PLATFORM_CORE_STRICT: process.env.NEXT_PUBLIC_PLATFORM_CORE_STRICT,
  },
  /** Turbopack (`dev:fast`) — относительный alias (absolute ломает resolve в 15.3). */
  turbopack: {
    resolveAlias: {
      '@/lib/app-fonts': appFontsAliasRelative,
    },
  },
  webpack: (config, { dev, isServer }) => {
    /** E2E: stub шрифтов без Google Fonts fetch — стабильный cold compile в Playwright. */
    config.resolve ??= {};
    config.resolve.alias ??= {};
    (config.resolve.alias as Record<string, string>)['@/lib/app-fonts'] = appFontsAlias;

    /** Длинная первая компиляция layout-клиента в dev иначе даёт ChunkLoadError (timeout). */
    if (dev && !isServer && config.output && typeof config.output === 'object') {
      (config.output as { chunkLoadTimeout?: number }).chunkLoadTimeout = 300_000;
    }
    return config;
  },
  experimental: {
    /** Меньше модулей в dev/SSR — ниже RAM и время компиляции */
    optimizePackageImports: [
      'lucide-react',
      '@mui/material',
      'date-fns',
      'recharts',
      'framer-motion',
      'react-resizable-panels',
    ],
  },
  // Rewrite /data/products.json → API для демо (когда файл отсутствует)
  async rewrites() {
    return [
      { source: '/data/products.json', destination: '/api/demo/products' },
    ];
  },
  async redirects() {
    return [
      { source: '/Syntha', destination: '/brand/organization', permanent: false },
      { source: '/syntha', destination: '/brand/organization', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/embed/runway/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ];
  },
  // Пока `npm run typecheck` не зелёный, Next не валит сборку. CI: `.github/workflows/synth-1-full-ci.yml` (монорепо).
  // Когда ошибок tsc не останется — поставьте ignoreBuildErrors: false.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // picsum.photos often redirects to fastly.picsum.photos
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
    // Настройки для лучшей обработки изображений
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

function withOptionalBundleAnalyzer(config: NextConfig): NextConfig {
  if (process.env.ANALYZE !== 'true') return config;
  try {
    // Optional devDependency — см. npm run analyze:bundle
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bundleAnalyzer = require('@next/bundle-analyzer') as (opts: {
      enabled: boolean;
    }) => (cfg: NextConfig) => NextConfig;
    return bundleAnalyzer({ enabled: true })(config);
  } catch {
    console.warn('[analyze] @next/bundle-analyzer not installed — run: npm i -D @next/bundle-analyzer');
    return config;
  }
}

export default withOptionalBundleAnalyzer(nextConfig);

    
