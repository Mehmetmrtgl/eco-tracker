"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, LogOut, Loader2, 
  ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus, CreditCard, Landmark, Target 
} from "lucide-react";
import { useRouter } from "next/navigation";
import AssetChart from "@/components/dashboard/AssetChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";

interface SummaryData {
  totalAssetsValue: number;
  myAssetsValue: number;
  otherAssetsValue: number;
  totalDebtsValue: number;
  netWorth: number;
  pieChartData: { name: string; value: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; email: string; id: string } | null>(null);
  
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  const [budgets, setBudgets] = useState<any[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");

  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);

  const fetchSummary = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/assets/${userId}/summary`);
      if (res.ok) setSummary(await res.json());
    } catch (error) { console.error(error); }
  }, []);

  const fetchRecentTransactions = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/transactions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRecentTransactions(data.slice(0, 5));
      }
    } catch (error) { console.error(error); }
  }, []);

  const fetchBudgets = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/budgets/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
        if (data.length > 0 && !selectedBudgetId) setSelectedBudgetId(data[0].id);
      }
    } catch (error) { console.error(error); }
  }, [selectedBudgetId]);

  const fetchCards = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/credit-cards/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data);
        if (data.length > 0 && !selectedCardId) setSelectedCardId(data[0].id);
      }
    } catch (error) { console.error(error); }
  }, [selectedCardId]);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (!token || !storedUser) { router.push("/login"); return; }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (parsedUser?.id) {
      Promise.all([
        fetchSummary(parsedUser.id),
        fetchRecentTransactions(parsedUser.id),
        fetchBudgets(parsedUser.id),
        fetchCards(parsedUser.id)
      ]).finally(() => setLoading(false));
    }
  }, [router, fetchSummary, fetchRecentTransactions, fetchBudgets, fetchCards]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const displayValue = (val: number | undefined) => {
    if (val === undefined) return "...";
    return isPrivacyEnabled ? "••••••" : formatCurrency(val);
  };

  const currentBudget = budgets.find(b => b.id === selectedBudgetId);
  const currentCard = cards.find(c => c.id === selectedCardId);
  
  const budgetPercent = currentBudget ? Math.min(100, Math.round((currentBudget.spent / currentBudget.limit) * 100)) : 0;
  let budgetColor = "bg-green-500";
  if (budgetPercent > 80) budgetColor = "bg-yellow-500";
  if (budgetPercent >= 100) budgetColor = "bg-red-600";

  const cardPercent = currentCard && Number(currentCard.total_limit) > 0
    ? Math.min(100, Math.round((Number(currentCard.current_debt) / Number(currentCard.total_limit)) * 100))
    : 0;

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      
      {/* ÜST BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Selam, {user.full_name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-slate-500">Bugün finansal durumun nasıl?</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsPrivacyEnabled(!isPrivacyEnabled)} className="text-slate-500 hover:text-blue-600">
            {isPrivacyEnabled ? <EyeOff size={20} /> : <Eye size={20} />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 border-red-100">
            <LogOut size={16} className="mr-2" /> Çıkış
          </Button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Landmark size={120} /></div>
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Toplam Varlık (Aile)</p>
              <h1 className="text-4xl font-bold tracking-tight">{displayValue(summary?.totalAssetsValue)}</h1>
            </div>
            <div className="flex gap-8 mt-6">
              <div>
                <div className="flex items-center gap-2 text-slate-300 text-xs mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div> Kişisel Varlık
                </div>
                <p className="text-lg font-semibold">{displayValue(summary?.myAssetsValue)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-300 text-xs mb-1">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div> Diğerleri
                </div>
                <p className="text-lg font-semibold">{displayValue(summary?.otherAssetsValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
            <Card className="flex-1 border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-slate-500 font-medium uppercase">Kişisel Net Durum</p>
                    <h3 className={`text-2xl font-bold mt-1 ${(summary?.netWorth || 0) < 0 ? 'text-red-600' : 'text-slate-800'}`}>
                        {displayValue(summary?.netWorth)}
                    </h3>
                </CardContent>
            </Card>
            <Card className="flex-1 border-l-4 border-l-red-500 shadow-sm">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                    <p className="text-xs text-slate-500 font-medium uppercase">Toplam Borçlar</p>
                    <h3 className="text-2xl font-bold mt-1 text-slate-800">{displayValue(summary?.totalDebtsValue)}</h3>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* HIZLI ERİŞİM */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        <Link href="/assets" className="flex-1"><Button variant="outline" className="w-full justify-start h-12 gap-3 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50"><div className="p-1 bg-blue-100 rounded text-blue-600"><Plus size={16}/></div><span className="text-slate-600">Varlık Ekle</span></Button></Link>
        <Link href="/transactions" className="flex-1"><Button variant="outline" className="w-full justify-start h-12 gap-3 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50"><div className="p-1 bg-green-100 rounded text-green-600"><Plus size={16}/></div><span className="text-slate-600">Harcama Gir</span></Button></Link>
        <Link href="/debts" className="flex-1"><Button variant="outline" className="w-full justify-start h-12 gap-3 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50"><div className="p-1 bg-red-100 rounded text-red-600"><CreditCard size={16}/></div><span className="text-slate-600">Borç Öde</span></Button></Link>
      </div>

      {/* --- ORTA BÖLÜM: 50/50 EŞİT SÜTUNLAR (YENİ YAPI) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        
        {/* SOL KOLON: VARLIK DAĞILIMI (Tek ve Büyük) */}
        <Card className="shadow-sm flex flex-col h-full">
          <CardHeader className="py-4">
            <CardTitle className="text-base font-medium">Varlık Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 relative min-h-[350px]"> {/* Büyük Yükseklik */}
            <div className={`absolute inset-0 ${isPrivacyEnabled ? "blur-sm" : ""}`}>
                {summary?.pieChartData && summary.pieChartData.length > 0 ? (
                    <AssetChart data={summary.pieChartData} />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        Veri yok.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* SAĞ KOLON: KARTLAR VE BÜTÇE (Alt Alta) */}
        <div className="flex flex-col gap-4 h-full">
            
            {/* 1. KARTLARIM WIDGET */}
            <Card className="shadow-sm flex-1 flex flex-col">
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CreditCard size={16} className="text-purple-600"/> Kartlarım
                    </CardTitle>
                    {cards.length > 0 && (
                        <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                            <SelectTrigger className="w-[110px] h-7 text-[10px] px-2"><SelectValue placeholder="Seç" /></SelectTrigger>
                            <SelectContent>
                                {cards.map(c => <SelectItem key={c.id} value={c.id}>{c.alias}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>
                <CardContent className="pb-4 pt-0 flex-1 flex flex-col justify-center">
                    {currentCard ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs text-slate-500">Güncel Borç</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {displayValue(Number(currentCard.current_debt))}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
                                    <span>Limit Kullanımı</span>
                                    <span>%{Math.round((Number(currentCard.current_debt) / Number(currentCard.total_limit)) * 100)}</span>
                                </div>
                                <Progress value={cardPercent} className="h-1.5" indicatorClassName="bg-purple-600" />
                                <p className="text-[10px] text-right text-slate-400 pt-1">
                                    Kalan Limit: {displayValue(Number(currentCard.total_limit) - Number(currentCard.current_debt))}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-xs text-slate-400 mb-1">Kart bulunamadı.</p>
                            <Link href="/settings" className="text-[10px] text-blue-600 hover:underline">Kart Ekle</Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 2. BÜTÇE DURUMU */}
            <Card className="shadow-sm flex-1 flex flex-col">
                <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target size={16} className="text-blue-600"/> Bütçe
                    </CardTitle>
                    {budgets.length > 0 && (
                        <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                            <SelectTrigger className="w-[110px] h-7 text-[10px] px-2"><SelectValue placeholder="Seç" /></SelectTrigger>
                            <SelectContent>
                                {budgets.map(b => <SelectItem key={b.id} value={b.id}>{b.categoryName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>
                <CardContent className="pb-4 pt-0 flex-1 flex flex-col justify-center">
                    {currentBudget ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className={`text-xl font-bold ${budgetPercent >= 100 ? "text-red-600" : "text-slate-900"}`}>
                                    {displayValue(currentBudget.spent)}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    / {displayValue(currentBudget.limit)}
                                </span>
                            </div>
                            <Progress value={budgetPercent} className="h-1.5" indicatorClassName={budgetColor} />
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                <span>{currentBudget.categoryName}</span>
                                <span>%{budgetPercent}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-xs text-slate-400 mb-1">Hedef yok.</p>
                            <Link href="/budgets" className="text-[10px] text-blue-600 hover:underline">Hedef Belirle</Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>

      {/* --- ALT BÖLÜM: SON HAREKETLER --- */}
      <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Son Hareketler</CardTitle>
            <Link href="/transactions" className="text-sm text-blue-600 hover:underline font-medium">Tümünü Gör</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400 text-sm py-8">
                    <p>Henüz işlem kaydı yok.</p>
                    <Link href="/transactions" className="mt-2 text-blue-600 hover:underline">İlk işlemini ekle</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentTransactions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-all group">
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${item.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {item.type === 'INCOME' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 leading-none mb-1 group-hover:text-blue-600">
                                    {item.description || item.category}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {new Date(item.transaction_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                        <div className={`text-base font-bold ${item.type === 'INCOME' ? "text-green-600" : "text-slate-900"}`}>
                        {item.type === 'INCOME' ? "+" : "-"}{displayValue(Number(item.amount))}
                        </div>
                    </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
    </div>
  );
}