import prisma from "../../lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CreateCoursePage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;

  if (userRole !== "ADMIN") {
    redirect("/");
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: userEmail as string },
  });

  // Fungsi untuk menyimpan data ke database saat tombol Simpan diklik
  async function createCourse(formData: FormData) {
    "use server";
    
    if (!adminUser) return;

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const level = formData.get("level") as string;
    const imageUrl = formData.get("imageUrl") as string;

    await prisma.course.create({
      data: {
        title,
        description,
        level,
        imageUrl: imageUrl || "https://placehold.co/600x400/e0e7ff/4f46e5?text=Gambar+Kursus",
        instructorId: adminUser.id,
      },
    });

    // Otomatis pindah ke halaman katalog setelah berhasil disimpan
    redirect("/courses");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-600">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Kursus Baru</h1>
        <form action={createCourse} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Judul Kursus</label>
            <input type="text" name="title" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Misal: Belajar Python untuk Pemula" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi Singkat</label>
            <textarea name="description" required rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
            <select name="level" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="Pemula">Pemula</option>
              <option value="Menengah">Menengah</option>
              <option value="Mahir">Mahir</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Link Gambar Thumbnail (Opsional)</label>
            <input type="url" name="imageUrl" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="https://..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <a href="/admin" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</a>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium">Simpan Kursus</button>
          </div>
        </form>
      </div>
    </div>
  );
}