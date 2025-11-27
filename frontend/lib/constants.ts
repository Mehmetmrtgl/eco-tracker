import { LayoutDashboard, Wallet, CreditCard, PieChart, Settings, ArrowRightLeft, Target } from "lucide-react";


export const MENU_ITEMS = [
  { name: "Özet", path: "/", icon: LayoutDashboard },
  { name: "Varlıklar", path: "/assets", icon: Wallet },
  { name: "İşlemler", path: "/transactions", icon: ArrowRightLeft },
  { name: "Borçlar", path: "/debts", icon: CreditCard },
  { name: "Analiz", path: "/analysis", icon: PieChart },
  { name: "Ayarlar", path: "/settings", icon: Settings },
  { name: "Bütçe", path: "/budgets", icon: Target }, 
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
  { value: "cash_physical", label: "Nakit (Cep/Cüzdan)", group: "Nakit" }, 
  { value: "cash_bank", label: "Vadesiz TL (Banka)", group: "Nakit" }, 
  { value: "deposit", label: "Vadeli Mevduat", group: "Yatırım" },
  
  // MANUEL GİRİŞ
  { value: "other", label: "Diğer (Manuel)", group: "Diğer" },
];


// frontend/lib/constants.ts (MEVCUT DOSYAYA EKLENECEK)

// ... ASSET_TYPES Listesinin Bittiği Yerden Sonra Ekle ...

export const DEBT_TYPES = [
    { value: 'CREDIT_CARD', label: 'Kredi Kartı Borcu', group: 'BANK' },
    { value: 'LOAN_CONSUMER', label: 'İhtiyaç Kredisi', group: 'BANK' },
    { value: 'LOAN_HOUSING', label: 'Konut Kredisi', group: 'BANK' },
    { value: 'LOAN_KYK', label: 'KYK Kredisi', group: 'BANK' },
    { value: 'PERSON', label: 'Şahıs Borcu', group: 'PERSON' },
];

export const BANK_OPTIONS = [
    { value: 'Halkbank', label: 'Halkbank' },
    { value: 'Akbank', label: 'Akbank' },
    { value: 'YapiKredi', label: 'Yapı Kredi' },
    { value: 'Ziraat', label: 'Ziraat' },
    { value: 'IsBankasi', label: 'İş Bankası' },
    { value: 'QNB', label: 'QNB Finansbank' },
    { value: 'OTHER', label: 'Diğer' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'Market', label: 'Market Alışverişi' },
  { value: 'Gida', label: 'Gıda / Yemek' }, 
  { value: 'KrediKarti', label: 'Kredi Kartı / Borç' },
  { value: 'Fatura', label: 'Fatura & Kira' },
  { value: 'Benzin', label: 'Benzin / Yakıt' },
  { value: 'Ulasim', label: 'Toplu Taşıma / Taksi' },
  { value: 'EvcilHayvan', label: 'Evcil Hayvan (Pet)' },
  
  { value: 'Eglence', label: 'Eğlence / Aktivite' },
  { value: 'Restoran', label: 'Restoran / Kafe' }, 
  
  { value: 'Giyim', label: 'Giyim & Aksesuar' },
  { value: 'Saglik', label: 'Sağlık & İlaç' },
  { value: 'Teknoloji', label: 'Teknoloji & Elektronik' },
  { value: 'Egitim', label: 'Eğitim / Kurs' },
  { value: 'Bakim', label: 'Kişisel Bakım' },
  { value: 'Diger', label: 'Diğer' },
];

export const INCOME_CATEGORIES = [
  { value: 'Maas', label: 'Maaş' },
  { value: 'EkIs', label: 'Ek İş / Freelance' },
  { value: 'Yatirim', label: 'Yatırım Getirisi' },
  { value: 'KiraGeliri', label: 'Kira Geliri' },
  { value: 'Diger', label: 'Diğer' },
];