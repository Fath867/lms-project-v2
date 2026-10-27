import prisma from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  async function authenticateUser(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    if (!email || !name) return;

    // 1. Cek apakah email sudah ada
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // 2. Jika belum, buat akun baru
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email: email, 
          name: name, 
          role: email === "alfathwibowo56@gmail.com" ? "ADMIN" : "STUDENT",
          password: "password_dummy_123" // <-- INI OBATNYA: Menambahkan password dummy
        }
      });
    }

    // 3. Pasang cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id.toString());
    cookieStore.set("userEmail", user.email);
    cookieStore.set("userRole", user.role);

    // 4. Bawa masuk ke beranda
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 w-full max-w-md">
        <Link href="/" className="text-blue-500 hover:underline text-sm font-medium mb-6 inline-block">
          &larr; Kembali ke Beranda
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">LMS Pandawa</h1>
          <p className="text-gray-500">Masuk atau daftar untuk mulai belajar</p>
        </div>

        <form action={authenticateUser} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="Contoh: Budi Santoso" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="budi@example.com" 
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm mt-2">
            Masuk / Daftar Akun &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}