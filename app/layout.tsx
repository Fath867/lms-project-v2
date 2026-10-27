import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import Navbar menggunakan cara yang sudah berhasil tadi
import Navbar from "../components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS Pandawa",
  description: "Platform Belajar Online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Navbar akan muncul di semua halaman */}
        <Navbar /> 
        
        {/* Tempat konten halaman berubah-ubah */}
        {children} 
      </body>
    </html>
  );
}