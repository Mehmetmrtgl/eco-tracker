"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // shadcn bileşenleri
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { MENU_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // Menü açık mı kapalı mı?

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 border-b bg-white sticky top-0 z-50">
      <div className="font-bold text-lg">FinansApp</div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 border-b font-bold text-xl">FinansApp</div>
          <nav className="flex flex-col gap-1 p-4">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)} // Linke tıklayınca menüyü kapat
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-600"
                  )}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}