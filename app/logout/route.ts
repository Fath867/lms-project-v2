import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"
export async function GET() {
  const cookieStore = await cookies();
  
  // Hapus status login
  cookieStore.delete("userEmail");
  
  // 2. Sapu bersih memori cache halaman beranda
  revalidatePath("/");
  
  // Lemparkan kembali ke beranda
  redirect("/");
}