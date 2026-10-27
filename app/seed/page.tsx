import prisma from "../lib/prisma";
import Link from "next/link";

export default async function SeedPage() {
  // Cek apakah sudah ada materi di kursus ID 1
  const existingLesson = await prisma.lesson.findFirst({
    where: { courseId: 1 }
  });

  if (!existingLesson) {
    // Jika belum ada, buatkan satu!
    await prisma.lesson.create({
      data: {
        title: "Modul 1: Pengenalan Next.js (Jalur Ninja)",
        videoUrl: "https://www.youtube.com/watch?v=Sklc_fQBmcs",
        content: "Selamat datang di kelas Next.js! Ini materi yang berhasil disuntikkan lewat kode. Tonton videonya sampai habis!",
        order: 1,
        courseId: 1, // Memasukkan ke kursus ID 1
      }
    });

    return (
      <div className="p-10 text-center mt-20">
        <h1 className="text-3xl font-bold text-emerald-600 mb-4">Materi Berhasil Disuntikkan! 🎉</h1>
        <Link href="/courses/1/learn" className="text-blue-600 underline text-xl">
          Klik di sini untuk kembali ke Ruang Belajar
        </Link>
      </div>
    );
  }

  return (
    <div className="p-10 text-center mt-20">
      <h1 className="text-3xl font-bold text-indigo-600 mb-4">Materi Sudah Ada di Database! 👍</h1>
      <Link href="/courses/1/learn" className="text-blue-600 underline text-xl">
        Klik di sini untuk kembali ke Ruang Belajar
      </Link>
    </div>
  );
}