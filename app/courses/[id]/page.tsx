import prisma from "../../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const courseId = parseInt(resolvedParams.id);

  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("userId")?.value;
  const userId = userIdStr ? parseInt(userIdStr) : null;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: true,
      lessons: { orderBy: { order: 'asc' } }
    }
  });

  if (!course) {
    return <div className="p-10 text-center text-2xl font-bold text-red-500">Kursus tidak ditemukan!</div>;
  }

  let isEnrolled = false;
  if (userId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } }
    });
    if (enrollment) isEnrolled = true;
  }

  async function enrollCourse() {
    "use server";
    if (!userId) redirect("/login");
    
    await prisma.enrollment.create({
      data: { userId, courseId }
    });
    
    revalidatePath(`/courses/${courseId}`);
    redirect(`/courses/${courseId}/learn`);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-indigo-900 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-indigo-300 hover:text-white mb-6 inline-block font-medium">
            &larr; Kembali ke Beranda
          </Link>
          <div className="mb-4">
            <span className="bg-indigo-700 text-indigo-100 text-sm font-bold px-3 py-1 rounded-full">
              {course.level}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-indigo-200 mb-6">{course.description}</p>
          <p className="text-indigo-300">
            Instruktur: <span className="font-semibold text-white">{course.instructor?.name || "Instruktur"}</span>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Materi yang akan dipelajari:</h2>
          {course.lessons.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada modul materi untuk kelas ini.</p>
          ) : (
            <ul className="space-y-4">
              {course.lessons.map((lesson, idx) => (
                <li key={lesson.id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0">
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-700">{lesson.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full md:w-80 shrink-0">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-8 text-center shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Siap untuk mulai?</h3>
            <p className="text-gray-600 mb-6 text-sm">Akses selamanya ke {course.lessons.length} modul video pembelajaran.</p>
            
            {isEnrolled ? (
              <Link href={`/courses/${courseId}/learn`} className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                Lanjutkan Belajar &rarr;
              </Link>
            ) : (
              <form action={enrollCourse}>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-105 shadow-md">
                  Gabung Kelas Sekarang
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}