import { NextResponse, type NextRequest } from 'next/server';
import { SERVER_API_BASE_URL } from './lib/config';

// 1. Password-reset emails link to `${FRONTEND_URL}?token=…` (backend/utils/email.js);
//    forward those to the reset page.
// 2. Admin-managed SEO redirects (Admin > SEO > Redirects) for legacy URLs, looked up
//    via the backend. Product URLs resolve their own redirects in the page, and all
//    known routes are excluded by the matcher, so normal browsing never waits on this.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === '/') {
    const token = searchParams.get('token');
    if (token) {
      const url = request.nextUrl.clone();
      url.pathname = '/reset-password';
      url.search = `?token=${encodeURIComponent(token)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Client-side navigations (RSC payload requests) don't need a redirect lookup.
  if (request.method !== 'GET' || request.headers.has('rsc')) return NextResponse.next();

  try {
    const res = await fetch(
      `${SERVER_API_BASE_URL}/redirects/lookup?path=${encodeURIComponent(pathname.toLowerCase())}`,
      { signal: AbortSignal.timeout(1500) },
    );
    if (res.ok) {
      const json = await res.json();
      const to: string | undefined = json?.data?.to;
      const status = json?.data?.statusCode === 302 ? 302 : 301;
      if (to && to !== pathname) {
        return NextResponse.redirect(new URL(to, request.url), status);
      }
    }
  } catch {
    // Backend slow or unreachable — serve the page (or its 404) as usual.
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/|api/|product/|shop|cart|checkout|account|orders|addresses|login|register|forgot-password|reset-password|privacy-policy|terms|sitemap\\.xml|robots\\.txt|icon\\.png|apple-icon\\.png|logo\\.png|favicon\\.ico).+)',
  ],
};
