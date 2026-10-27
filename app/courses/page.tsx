import prisma from "../lib/prisma";
import Link from "next/link";

export default async function CoursesCatalogPage() {
  // Mengambil semua kelas untuk ditampilkan di halaman /courses
  const courses = await prisma.course.findMany({
    include: { instructor: true }
  });

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Katalog Semua Kursus</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id} className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all bg-white block">
              <h2 className="text-xl font-bold mb-2 text-gray-900">{course.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="text-xs text-gray-500 font-medium">Oleh: {course.instructor?.name || "Instruktur"}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}