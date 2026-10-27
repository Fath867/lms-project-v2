import prisma from "../lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("userId")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;

  // Keamanan Gerbang Utama Jalur Ninja: Hanya email Anda yang boleh lewat!
  if (userEmail !== "alfathwibowo56@gmail.com" || !userIdStr) {
    redirect("/");
  }

  const instructorId = parseInt(userIdStr);

  // Ambil semua kursus dari database, urutkan dari yang terbaru
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { lessons: true } // Sekalian hitung jumlah modul materinya
  });

  // SERVER ACTION: Fungsi Ajaib untuk menyimpan kursus baru ke database
  async function createCourse(formData: FormData) {
    "use server";
    
    // Ambil data yang diketik di form
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const imageUrl = formData.get("imageUrl") as string;

    // Simpan ke database Prisma
    await prisma.course.create({
      data: {
        title,
        description,
        level,
        // Jika form gambar dikosongkan, pakai gambar default ini
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80", 
        instructorId: instructorId,
      }
    });

    // Segarkan halaman agar kursus baru langsung muncul
    revalidatePath("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">👑</span>
          <h1 className="text-3xl font-bold text-gray-800">Ruang Kendali Instruktur</h1>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Form Tambah Kursus Baru */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold text-indigo-700 mb-6 flex items-center">
              <span className="bg-indigo-100 p-2 rounded-lg mr-3">➕</span> Buat Kursus
            </h2>
            
            <form action={createCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Kursus</label>
                <input type="text" name="title" required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Cth: Mahir React.js dalam 7 Hari" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea name="description" required rows={3} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Jelaskan apa yang akan siswa pelajari..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat Kesulitan</label>
                <select name="level" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="Pemula">Pemula 👶</option>
                  <option value="Menengah">Menengah 👦</option>
                  <option value="Mahir">Mahir 🧙‍♂️</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL Gambar (Opsional)</label>
                <input type="text" name="imageUrl" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm mt-4">
                Terbitkan Kursus 🚀
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: Daftar Kursus Anda */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Kursus Saat Ini ({courses.length})</h2>
            
            {courses.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                Belum ada kursus yang diterbitkan. Yuk, buat kursus pertama Anda di sebelah kiri!
              </div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-300">No Img</div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2 inline-block">
                        {course.level}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{course.lessons.length} Modul Tersedia</p>
                    </div>
                  </div>
                  
                  {/* Tombol ini nanti akan kita aktifkan untuk menambah materi video */}
                  <Link href={`/admin/courses/${course.id}`} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold py-2.5 px-5 rounded-xl transition-colors text-sm flex-shrink-0 w-full sm:w-auto text-center">
                    Kelola Materi &rarr;
                  </Link>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}