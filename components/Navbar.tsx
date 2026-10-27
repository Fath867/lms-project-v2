import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Navbar() {
  // 1. Baca identitas pengguna dari brankas Cookie
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("userEmail")?.value;
  const userRole = cookieStore.get("userRole")?.value;

  // SERVER ACTION: Fungsi sapu bersih untuk Logout
  async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("userId");
    cookieStore.delete("userEmail");
    cookieStore.delete("userRole");
    redirect("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      {/* Bagian Kiri: Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600 tracking-tight">
        LMS Pandawa
      </Link>

      {/* Bagian Tengah: Menu Utama */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Beranda</Link>
        <Link href="/courses" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Katalog Kursus</Link>
        
        {/* Menu Kelas Saya hanya muncul kalau sudah login */}
        {userEmail && (
          <Link href="/my-courses" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Kelas Saya</Link>
        )}

        {/* Menu Panel Admin HANYA muncul untuk Sang Admin */}
        {userRole === "ADMIN" && (
          <Link href="/admin" className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
            Panel Admin
          </Link>
        )}
      </div>

      {/* Bagian Kanan: Profil & Tombol Akses */}
      <div className="flex items-center gap-5">
        {userEmail ? (
          <>
            <div className="text-sm text-gray-500 hidden sm:block">
              Halo, <strong className="text-gray-800">{userEmail}</strong>
            </div>
            {/* Tombol Keluar yang benar-benar menghapus memori login */}
            <form action={logout}>
              <button type="submit" className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-red-200 hover:border-red-500 text-sm shadow-sm">
                Keluar
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm transform hover:scale-105">
            Masuk
          </Link>
        )}
      </div>
    </nav>
  );
}