import prisma from "./lib/prisma"; // Memanggil jembatan database
import Link from "next/link"; // Mengimpor komponen Link

export default async function Home() {
  // Mengambil semua data dari tabel Course di database
  const courses = await prisma.course.findMany({
    include: {
      instructor: true, // Perintah untuk sekalian mengambil data profil instruktur
    }
  });

  return (
    <main className="p-10 min-h-screen bg-gray-50 text-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Daftar Kursus LMS</h1>
      
      {/* Membuat sistem grid agar tampilannya responsif (berjejer rapi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link 
            href={`/courses/${course.id}`} 
            key={course.id} 
            className="border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all bg-white block cursor-pointer"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">{course.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{course.description}</p>
            
            <div className="flex justify-between items-center text-xs">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {course.level}
              </span>
              <span className="text-gray-500 font-medium">
                Oleh: {course.instructor.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}