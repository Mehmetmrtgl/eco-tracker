import { LayoutDashboard, Wallet, CreditCard, PieChart, Settings, ArrowRightLeft } from "lucide-react";


export const MENU_ITEMS = [
  { name: "Özet", path: "/", icon: LayoutDashboard },
  { name: "Varlıklar", path: "/assets", icon: Wallet },
  { name: "İşlemler", path: "/transactions", icon: ArrowRightLeft },
  { name: "Borçlar", path: "/debts", icon: CreditCard },
  { name: "Analiz", path: "/analysis", icon: PieChart },
  { name: "Ayarlar", path: "/settings", icon: Settings },
];

export const ASSET_TYPES = [
  // ALTINLAR
  { value: "gold_full", label: "Tam Altın", group: "Altın" },
  { value: "gold_half", label: "Yarım Altın", group: "Altın" },
  { value: "gold_quarter", label: "Çeyrek Altın", group: "Altın" },
  { value: "gold_gram", label: "Gram Külçe", group: "Altın" },
  
  // DÖVİZLER
  { value: "usd", label: "Dolar", group: "Döviz" },
  { value: "eur", label: "Euro", group: "Döviz" },
  { value: "gbp", label: "Sterlin", group: "Döviz" },
  
  // NAKİT & MEVDUAT
  { value: "cash_try", label: "Nakit (TL)", group: "Nakit" },
  { value: "deposit", label: "Vadeli Mevduat", group: "Yatırım" },
  
  // MANUEL GİRİŞ
  { value: "other", label: "Diğer (Manuel)", group: "Diğer" },
];