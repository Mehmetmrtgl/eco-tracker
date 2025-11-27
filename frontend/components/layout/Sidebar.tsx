"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  // 1. "Ayarlar" dışındaki menü öğelerini al (Ana Liste)
  const mainMenuItems = MENU_ITEMS.filter((item) => item.path !== "/settings");
  
  // 2. Sadece "Ayarlar" öğesini bul (Alt Kısım İçin)
  const settingsItem = MENU_ITEMS.find((item) => item.path === "/settings");

  // Ortak Link Bileşeni (Kod tekrarını önlemek için)
  const SidebarItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Link
        href={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-blue-50 text-blue-700 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
      >
        <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 border-r bg-white text-slate-900 z-50">
      
      {/* Logo Alanı */}
      <div className="p-6 border-b flex items-center justify-center">
        <span className="font-bold text-2xl tracking-tight text-slate-800">FinansApp</span>
      </div>

      {/* Ana Menü (Esnek Alan - Yukarıdaki Boşluğu Doldurur) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 gap-1 flex flex-col">
        {mainMenuItems.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Alt Kısım: Ayarlar (En Alta Sabit) */}
      {settingsItem && (
        <div className="p-3 border-t bg-slate-50/50">
          <SidebarItem item={settingsItem} />
        </div>
      )}

    </aside>
  );
}