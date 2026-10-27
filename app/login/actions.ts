"use server";

import prisma from "../lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; 

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email: email }
  });

  if (!user || user.password !== password) {
    return { error: "Email atau password yang Anda masukkan salah!" };
  }

  const cookieStore = await cookies();
  cookieStore.set("userEmail", user.email);
  cookieStore.set("userRole", user.role);
  
  // ---> INI BARIS YANG DITAMBAHKAN <---
  cookieStore.set("userId", user.id.toString()); 

  revalidatePath("/"); 

  redirect("/");
}