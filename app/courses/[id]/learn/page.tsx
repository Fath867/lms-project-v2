import prisma from "../../../lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export default async function LearnPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ lessonId?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const courseId = parseInt(resolvedParams.id);
  
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("userId")?.value;
  if (!userIdStr) redirect("/login");
  const userId = parseInt(userIdStr);

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } }
  });
  if (!enrollment) redirect(`/courses/${courseId}`);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: { orderBy: { order: 'asc' } }
    }
  });

  if (!course || course.lessons.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border">
          <span className="text-5xl block mb-4">🚧</span>
          <h1 className="text-2xl font-bold text-gray-800">Materi Belum Tersedia</h1>
          <p className="text-gray-500 mt-2 mb-6">Instruktur belum menambahkan modul untuk kursus ini.</p>
          <Link href={`/courses/${courseId}`} className="text-indigo-600 font-medium hover:underline">
            &larr; Kembali ke Detail Kursus
          </Link>
        </div>
      </div>
    );
  }

  const currentLessonId = resolvedSearchParams.lessonId 
    ? parseInt(resolvedSearchParams.lessonId) 
    : course.lessons[0].id;
    
  const currentLesson = course.lessons.find(l => l.id === currentLessonId) || course.lessons[0];
  const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
  const nextLesson = course.lessons[currentIndex + 1];

  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId, lesson: { courseId } },
    select: { lessonId: true }
  });
  const completedLessonIds = completedLessons.map(p => p.lessonId);
  const isCompleted = completedLessonIds.includes(currentLesson.id);

  async function markAsComplete() {
    "use server";
    try {
      await prisma.lessonProgress.create({
        data: { userId, lessonId: currentLesson.id }
      });
      revalidatePath(`/courses/${courseId}/learn`);
    } catch (error) {
    }
  }

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const youtubeId = currentLesson.videoUrl ? getYouTubeId(currentLesson.videoUrl) : null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      
      {/* SIDEBAR: Daftar Materi */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen sticky top-0">
        <div className="p-6 border-b border-gray-200 bg-indigo-900 text-white">
          <Link href={`/courses/${courseId}`} className="text-indigo-300 hover:text-white text-sm mb-3 inline-block transition-colors">
            &larr; Kembali
          </Link>
          <h2 className="font-bold text-lg line-clamp-2">{course.title}</h2>
          
          <div className="mt-4 bg-indigo-950 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${(completedLessonIds.length / course.lessons.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-indigo-300 mt-2">
            {completedLessonIds.length} dari {course.lessons.length} selesai
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {course.lessons.map((lesson, index) => {
              const isActive = lesson.id === currentLesson.id;
              const isDone = completedLessonIds.includes(lesson.id);

              return (
                <li key={lesson.id}>
                  <Link 
                    href={`/courses/${courseId}/learn?lessonId=${lesson.id}`}
                    className={`flex items-start p-4 hover:bg-gray-50 transition-colors ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="mt-1 mr-3 flex-shrink-0">
                      {isDone ? (
                        <span className="text-emerald-500 text-lg">✅</span>
                      ) : (
                        <span className="text-gray-300 text-lg">⭕</span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 block mb-1">Modul {index + 1}</span>
                      <h3 className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {lesson.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* KONTEN UTAMA: Pemutar Video & Detail */}
      <div className="flex-1 flex flex-col h-auto md:h-screen overflow-y-auto">
        <div className="bg-black w-full aspect-video">
          {youtubeId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
              <span className="text-5xl mb-2">🎬</span>
              <p>Video tidak tersedia untuk modul ini.</p>
            </div>
          )}
        </div>

        <div className="p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{currentLesson.title}</h1>
          
          <div className="prose prose-indigo max-w-none mb-10 text-gray-700">
            {currentLesson.content || "Tidak ada deskripsi tambahan untuk modul ini."}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!isCompleted ? (
              <form action={markAsComplete}>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-all transform hover:scale-105 flex items-center"
                >
                  <span className="mr-2">✔️</span> Tandai Selesai
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 px-6 rounded-xl flex items-center">
                <span className="mr-2">✅</span> Modul Selesai
              </div>
            )}

            {nextLesson && (
              <Link 
                href={`/courses/${courseId}/learn?lessonId=${nextLesson.id}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-sm transition-colors flex items-center"
              >
                Materi Selanjutnya <span className="ml-2">&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}