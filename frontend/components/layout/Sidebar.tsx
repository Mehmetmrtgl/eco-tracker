"use client"; // Bu dosya tarayıcıda çalışacak (interaktif)

import Link from "next/link";
import { usePathname } from "next/navigation"; // Hangi URL'deyiz?
import { MENU_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils"; // shadcn class birleştirme aracı

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-white text-slate-900 z-50">
      {/* Logo Alanı */}
      <div className="p-6 border-b flex items-center gap-2">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          F
        </div>
        <span className="font-bold text-xl tracking-tight">FinansApp</span>
      </div>

      {/* Menü Linkleri */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 gap-1 flex flex-col">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm" // Aktifse mavi
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900" // Değilse gri
              )}
            >
              <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Alt Kısım: Kullanıcı Profili (Örnek) */}
      <div className="p-4 border-t bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-300" /> {/* Avatar */}
          <div className="text-sm">
            <p className="font-medium">Kullanıcı Adı</p>
            <p className="text-xs text-slate-500">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}