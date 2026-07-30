import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    service: 'syntha-wholesale-v2',
    status: 'ok',
    legacyDependency: false,
  });
}
