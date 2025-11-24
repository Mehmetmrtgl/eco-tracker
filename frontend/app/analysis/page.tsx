"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, PiggyBank, Loader2, Calendar } from "lucide-react";
import AssetChart from "@/components/dashboard/AssetChart"; 
import StatCard from "@/components/dashboard/StatCard";
import { useRouter } from "next/navigation";

export default function AnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // TARİH HESAPLAMA MANTIĞI
  const calculateDateRange = (resetDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Varsayılan: Bu ayın kesim günü
    let start = new Date(currentYear, currentMonth, resetDay);

    // Eğer bugün kesim gününden önceyse (örn: Bugün 5'i, Kesim 15'i), dönem geçen ay başlamıştır
    if (currentDay < resetDay) {
      start = new Date(currentYear, currentMonth - 1, resetDay);
    }
    
    // Bitiş tarihi: Başlangıçtan 1 ay sonrası
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    return {
        start: start.toISOString(),
        end: end.toISOString()
    };
  };

  const fetchAnalysis = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) { 
        router.push("/login"); 
        return; 
      }
      
      const user = JSON.parse(storedUser);
      // Hesap kesim gününü al (Yoksa 1)
      const ranges = calculateDateRange(user.reset_day || 1);
      setDateRange(ranges);

      // Backend'e tarihleri gönder
      const res = await fetch(
        `http://localhost:4000/transactions/${user.id}/analysis?start=${ranges.start}&end=${ranges.end}`
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
  }, [router]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  // Tarihleri okunabilir formata çevir
  const readableStart = new Date(dateRange.start).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' });
  const readableEnd = new Date(dateRange.end).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      
      {/* Başlık ve Tarih */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Harcama Analizi</h2>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Calendar size={16} />
            <span>Bu Dönem: <b>{readableStart}</b> - <b>{readableEnd}</b></span>
        </div>
      </div>

      {/* 1. ÖZET KARTLARI */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Toplam Gelir" 
          value={data?.totalIncome || 0} 
          icon={TrendingUp} 
          trend="up"
        />
        <StatCard 
          title="Toplam Gider" 
          value={data?.totalExpense || 0} 
          icon={TrendingDown} 
          trend="down"
        />
        <StatCard 
          title="Net Tasarruf" 
          value={data?.netSavings || 0} 
          icon={PiggyBank} 
          description={data?.netSavings > 0 ? "Tebrikler, artıdasınız!" : "Dikkat, eksidesiniz."}
          trend={data?.netSavings >= 0 ? "up" : "down"}
        />
      </div>

      {/* 2. GRAFİKLER */}
      <div className="grid gap-4 md:grid-cols-2">
        
        {/* Harcama Dağılımı Pastası */}
        <Card>
          <CardHeader>
            <CardTitle>Harcama Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.expenseChart && data.expenseChart.length > 0 ? (
                <AssetChart data={data.expenseChart} />
            ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
                    Bu dönemde harcama yok.
                </div>
            )}
          </CardContent>
        </Card>

        {/* Kategori Detay Listesi */}
        <Card>
            <CardHeader>
                <CardTitle>Kategori Detayları</CardTitle>
            </CardHeader>
            <CardContent>
                {data?.expenseChart && data.expenseChart.length > 0 ? (
                    <div className="space-y-4">
                        <p className="text-slate-600 text-sm">
                            En çok harcama yapılan kategori: <b className="text-slate-900">{data.expenseChart[0]?.name}</b>
                        </p>
                        <div className="space-y-2">
                            {data.expenseChart.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm border-b pb-2">
                                    <span className="font-medium text-slate-700">{item.name}</span>
                                    <span className="font-bold text-slate-900">{item.value} ₺</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Veri bulunamadı.</p>
                )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
