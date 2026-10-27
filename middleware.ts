import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Satpam membaca kartu identitas dari Cookie
  const userRole = request.cookies.get('userRole')?.value;
  const userId = request.cookies.get('userId')?.value;

  const url = request.nextUrl.clone();

  // 2. Aturan Jalur VVIP: Panel Admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Jika tidak punya akses ADMIN, tendang kembali ke Beranda
    if (userRole !== 'ADMIN') {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // 3. Aturan Jalur Pribadi: Kelas Saya
  if (request.nextUrl.pathname.startsWith('/my-courses')) {
    // Jika belum login sama sekali, giring ke halaman Login
    if (!userId) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Jika aman, persilakan masuk
  return NextResponse.next();
}

// 4. Daftar area patroli Satpam (Route Matcher)
export const config = {
  matcher: [
    '/admin/:path*',
    '/my-courses/:path*',
  ],
};