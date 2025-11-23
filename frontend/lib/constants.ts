// src/lib/constants.ts
import { LayoutDashboard, Wallet, CreditCard, PieChart, Settings, ArrowRightLeft } from "lucide-react";

export const MENU_ITEMS = [
  { name: "Özet", path: "/", icon: LayoutDashboard },
  { name: "Varlıklar", path: "/assets", icon: Wallet },
  { name: "İşlemler", path: "/transactions", icon: ArrowRightLeft },
  { name: "Borçlar", path: "/debts", icon: CreditCard },
  { name: "Analiz", path: "/analysis", icon: PieChart },
  { name: "Ayarlar", path: "/settings", icon: Settings },
];