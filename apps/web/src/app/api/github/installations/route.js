import { NextResponse } from 'next/server';

/**
 * GET /api/github/installations
 * Proxies the request to the Flowra Engine to list all GitHub App installations.
 * This avoids CORS issues since the call is made server-side.
 */
export async function GET() {
  try {
    let engineUrl = process.env.FLOWRA_ENGINE_URL;
    if (!engineUrl) {
      return NextResponse.json({ error: 'FLOWRA_ENGINE_URL is not configured.' }, { status: 503 });
    }
    // Force IPv4 for local dev
    engineUrl = engineUrl.replace('localhost', '127.0.0.1');

    const response = await fetch(`${engineUrl.replace(/\/$/, '')}/api/github/installations`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Don't cache — always fetch fresh installation list
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Engine error' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('GitHub installations proxy error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
