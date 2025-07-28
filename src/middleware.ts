import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/proxy', request.url));
  }
  return NextResponse.next();
}

// Optionally, specify the matcher if you want to limit middleware to certain paths
// export const config = {
//   matcher: ['/'],
// }; 