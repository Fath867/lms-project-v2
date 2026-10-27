import prisma from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyCoursesPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("userId")?.value;

  // Jika belum login, tendang ke halaman login
  if (!userIdStr) {
    redirect("/login");
  }
  const userId = parseInt(userIdStr);

  // Ambil data pendaftaran (enrollment) milik user ini dari database
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: userId },
    include: {
      course: {
        include: {
          instructor: true,
          lessons: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Ambil data progres materi yang sudah ditandai "Selesai" oleh user ini
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: userId }
  });
  const completedLessonIds = progress.map(p => p.lessonId);

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kelas Saya 📚</h1>
          <p className="text-gray-500 mt-2">Lanjutkan proses belajarmu dan capai target barumu!</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <span className="text-6xl mb-4 block">🌱</span>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Belum ada kelas yang diikuti</h2>
            <p className="text-gray-500 mb-6">Yuk, eksplorasi katalog kursus dan mulai perjalanan belajarmu hari ini.</p>
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
              Cari Kursus Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              // Hitung progres persentase belajar
              const totalLessons = course.lessons.length;
              const completedInThisCourse = course.lessons.filter(lesson => 
                completedLessonIds.includes(lesson.id)
              ).length;
              
              const progressPercentage = totalLessons > 0 
                ? Math.round((completedInThisCourse / totalLessons) * 100) 
                : 0;

              return (
                <Link 
                  href={`/courses/${course.id}`} 
                  key={enrollment.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-300 transition-all flex flex-col h-full group"
                >
                  <div className="flex-1">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-3 inline-block">
                      {course.level}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Oleh: {course.instructor?.name || "Instruktur"}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-600 font-medium mb-1.5">
                      <span>Progres Belajar</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      {completedInThisCourse} dari {totalLessons} Modul Selesai
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}