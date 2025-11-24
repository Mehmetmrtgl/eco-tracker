"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Sidebar'ın GİZLENMESİ gereken sayfalar
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Eğer giriş/kayıt sayfasındaysak, menüleri koyma, sadece içeriği bas
  if (isAuthPage) {
    return <main className="h-full w-full">{children}</main>;
  }

  // Diğer sayfalarda standart yapıyı koru
  return (
    <div className="flex min-h-screen">
      {/* Masaüstü Sidebar */}
      <Sidebar />

      {/* İçerik Alanı */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Mobil Header */}
        <MobileNav />

        {/* Sayfa İçerikleri */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}