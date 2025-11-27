"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, Loader2, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssetChart from "@/components/dashboard/AssetChart"; 
import StatCard from "@/components/dashboard/StatCard";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import DailyTrendChart from "@/components/dashboard/DailyTrendChart";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatters";

// Dönem Seçenekleri
const PERIOD_OPTIONS = [
    { value: 'CURRENT_CYCLE', label: 'Bu Dönem (Kesim)' },
    { value: 'LAST_MONTH', label: 'Geçen Ay (Takvim)' },
    { value: 'LAST_3_MONTHS', label: 'Son 3 Ay' },
    { value: 'THIS_YEAR', label: 'Bu Yıl' },
];

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // FİLTRE STATE'LERİ
  const [chartMode, setChartMode] = useState("CATEGORY"); 
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("CURRENT_CYCLE"); // YENİ: Tarih Filtresi
  const [cards, setCards] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // --- TARİH HESAPLAMA MOTORU ---
  const calculateDateRange = (resetDay: number, period: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'CURRENT_CYCLE') {
        // Kullanıcının hesap kesim gününe göre
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        start = new Date(currentYear, currentMonth, resetDay);
        if (currentDay < resetDay) {
            start = new Date(currentYear, currentMonth - 1, resetDay);
        }
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);

    } else if (period === 'LAST_MONTH') {
        // Geçen Takvim Ayı (1'inden 30'una)
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0); // Ayın son günü
        end.setHours(23, 59, 59);

    } else if (period === 'LAST_3_MONTHS') {
        start = new Date(today);
        start.setMonth(today.getMonth() - 3);
        end = new Date(today);

    } else if (period === 'THIS_YEAR') {
        start = new Date(today.getFullYear(), 0, 1); // 1 Ocak
        end = new Date(today.getFullYear(), 11, 31); // 31 Aralık
    }

    return { start: start.toISOString(), end: end.toISOString() };
  };

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) { router.push("/login"); return; }
      
      const user = JSON.parse(storedUser);
      
      // Seçilen periyoda göre tarihleri hesapla
      const ranges = calculateDateRange(user.reset_day || 1, periodFilter);
      setDateRange(ranges);

      if (cards.length === 0) {
          const cardsRes = await fetch(`http://localhost:4000/debts/${user.id}`);
          if (cardsRes.ok) {
              const cardsData = await cardsRes.json();
              setCards(cardsData.filter((d: any) => d.type === 'CREDIT_CARD'));
          }
      }

      const res = await fetch(
        `http://localhost:4000/transactions/${user.id}/analysis?start=${ranges.start}&end=${ranges.end}&source=${sourceFilter}`
      );
      
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [router, sourceFilter, periodFilter]); // Period değişince yeniden çek

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading && !data) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const readableStart = new Date(dateRange.start).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' });
  const readableEnd = new Date(dateRange.end).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' });

  const currentChartData = chartMode === 'CATEGORY' ? data?.expenseChart : data?.paymentMethodChart;
  const currentChartTitle = chartMode === 'CATEGORY' ? 'Kategori Detayları' : 'Ödeme Yöntemi Detayları';

  // Yüzdelik Değişim Metni Oluşturucu
  const getTrendText = (percent: number) => {
      if (!percent) return "Önceki veri yok";
      const direction = percent > 0 ? "artış" : "azalış";
      return `Geçen döneme göre %${Math.abs(percent).toFixed(1)} ${direction}`;
  };

  return (
    <div className="space-y-6">
      
      {/* BAŞLIK VE TARİH SEÇİCİ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Harcama Analizi</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Calendar size={16} />
                <span>Gösterilen: <b>{readableStart}</b> - <b>{readableEnd}</b></span>
            </div>
        </div>

        {/* DÖNEM SEÇİCİ */}
        <div className="w-full md:w-[200px]">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Dönem Seç" />
                </SelectTrigger>
                <SelectContent>
                    {PERIOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* ÖZET KARTLARI (Yüzdeli) */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
            title="Toplam Gelir" 
            value={data?.totalIncome || 0} 
            icon={TrendingUp} 
            trend={data?.percentages?.income > 0 ? "up" : "down"}
            description={getTrendText(data?.percentages?.income)}
        />
        <StatCard 
            title="Toplam Gider" 
            value={data?.totalExpense || 0} 
            icon={TrendingDown} 
            trend={data?.percentages?.expense > 0 ? "down" : "up"} // Gider artarsa kötüdür (down rengi kırmızı olsun diye)
            description={getTrendText(data?.percentages?.expense)}
        />
        <StatCard 
            title="Net Tasarruf" 
            value={data?.netSavings || 0} 
            icon={PiggyBank} 
            trend={data?.percentages?.savings > 0 ? "up" : "down"}
            description={getTrendText(data?.percentages?.savings)}
        />
      </div>

      {/* --- ANA GRAFİKLER --- */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* SOL: Gelir vs Gider */}
        <Card className="h-[450px] flex flex-col">
          <CardHeader>
            <CardTitle>Gelir / Gider Dengesi</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4">
            <IncomeExpenseChart 
                income={data?.totalIncome || 0} 
                expense={data?.totalExpense || 0} 
            />
          </CardContent>
        </Card>

        {/* SAĞ: Harcama Dağılımı */}
        <Card className="h-[450px] flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <CardTitle>Harcama Dağılımı</CardTitle>
                <Tabs defaultValue="CATEGORY" onValueChange={setChartMode} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="CATEGORY" className="text-xs">Kategori</TabsTrigger>
                        <TabsTrigger value="METHOD" className="text-xs">Ödeme</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {chartMode === 'CATEGORY' && (
                <div className="h-10 mb-2 flex justify-end items-center">
                    <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-slate-400"/>
                                <SelectValue placeholder="Filtrele" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tüm Harcamalar</SelectItem>
                            <SelectItem value="CASH">Sadece Nakit</SelectItem>
                            {cards.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.bank_name || c.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="flex-1 w-full relative min-h-0"> 
                {currentChartData && currentChartData.length > 0 ? (
                    <AssetChart data={currentChartData} />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg text-sm">
                        Veri yok.
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* TREND GRAFİĞİ */}
      <Card>
        <CardHeader>
            <CardTitle>Günlük Harcama Trendi</CardTitle>
        </CardHeader>
        <CardContent>
            <DailyTrendChart data={data?.dailyTrend || []} />
        </CardContent>
      </Card>

      {/* DETAY LİSTESİ */}
      <Card>
        <CardHeader>
            <CardTitle>{currentChartTitle}</CardTitle>
        </CardHeader>
        <CardContent>
            {currentChartData && currentChartData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentChartData.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-slate-500 text-center py-4">Veri bulunamadı.</p>
            )}
        </CardContent>
      </Card>

    </div>
  );
}