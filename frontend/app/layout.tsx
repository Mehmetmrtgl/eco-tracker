import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finansal Takip Sistemi",
  description: "Kişisel varlık ve borç yönetim uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <div className="flex min-h-screen">
          {/* Masaüstü Sidebar (Mobilde gizli) */}
          <Sidebar />

          {/* Ana İçerik Alanı */}
          <div className="flex-1 md:ml-64 flex flex-col">
            {/* Mobil Header (Masaüstünde gizli) */}
            <MobileNav />

            {/* Sayfa İçerikleri Buraya Gelecek */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}