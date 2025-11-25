"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
      
    </aside>
  );
}