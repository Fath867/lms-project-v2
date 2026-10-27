import prisma from "../../lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function ManageCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id);

  // Keamanan Jalur Ninja: Hanya email Anda yang boleh lewat!
  const cookieStore = await cookies();
  const userEmail = cookieStore.get("userEmail")?.value;
  if (userEmail !== "alfathwibowo56@gmail.com") redirect("/");

  // Ambil data kursus beserta semua materinya
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { lessons: { orderBy: { order: "asc" } } }
  });

  if (!course) {
    return <div className="p-10 text-center text-2xl font-bold text-red-500">Kursus tidak ditemukan!</div>;
  }

  // SERVER ACTION: Fungsi menyimpan materi baru
  async function createLesson(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const content = formData.get("content") as string;
    const order = parseInt(formData.get("order") as string);

    await prisma.lesson.create({
      data: { title, videoUrl, content, order, courseId }
    });
    revalidatePath(`/admin/courses/${courseId}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-indigo-600 hover:underline mb-6 inline-block font-medium">
          &larr; Kembali ke Panel Admin
        </Link>
        
        <div className="bg-indigo-900 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <span className="bg-indigo-700 text-indigo-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Mode Edit Kursus
          </span>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-indigo-200">{course.description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form Tambah Materi Baru */}
          <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold text-emerald-700 mb-6 flex items-center">
              <span className="bg-emerald-100 p-2 rounded-lg mr-3">🎬</span> Tambah Modul
            </h2>
            
            <form action={createLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Modul</label>
                <input type="text" name="title" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Cth: Instalasi Next.js" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link YouTube</label>
                <input type="text" name="videoUrl" required className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi/Teks (Opsional)</label>
                <textarea name="content" rows={3} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Catatan untuk siswa..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan Video (Angka)</label>
                <input type="number" name="order" required defaultValue={course.lessons.length + 1} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm mt-4 transition-all">
                Simpan Modul
              </button>
            </form>
          </div>

          {/* Daftar Materi yang Sudah Ada */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Modul ({course.lessons.length})</h2>
            
            {course.lessons.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
                Belum ada materi. Silakan buat modul pertama di sebelah kiri!
              </div>
            ) : (
              course.lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg flex-shrink-0">
                      {lesson.order}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{lesson.title}</h3>
                      <a href={lesson.videoUrl || "#"} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline">
                        Lihat Video
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}