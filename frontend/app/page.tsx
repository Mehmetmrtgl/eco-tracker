"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, LogOut, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import AssetChart from "@/components/dashboard/AssetChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";

interface SummaryData {
  totalAssetsValue: number;
  totalDebtsValue: number;
  netWorth: number;
  pieChartData: { name: string; value: number }[];
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; email: string; id: string } | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]); // Son Hareketler
  const [loading, setLoading] = useState(true);

  // 1. Özet Verileri Çek
  const fetchSummary = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/assets/${userId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Özet veri çekilemedi:", error);
    }
  }, []);

  // 2. Son İşlemleri Çek (YENİ FONKSİYON)
  const fetchRecentTransactions = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/transactions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        // Backend zaten tarihe göre sıralı gönderiyor, biz sadece ilk 5'i alalım
        setRecentTransactions(data.slice(0, 5));
      }
    } catch (error) {
      console.error("İşlemler çekilemedi:", error);
    }
  }, []);

  // Sayfa Yüklenmesi ve Kullanıcı Kontrolü
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (parsedUser?.id) {
      // İki veriyi de paralel çekelim
      Promise.all([
        fetchSummary(parsedUser.id),
        fetchRecentTransactions(parsedUser.id)
      ]).finally(() => setLoading(false));
    }
  }, [router, fetchSummary, fetchRecentTransactions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">
            Hoş geldin, {user.full_name || "Kullanıcı"} 👋
          </h2>
          <p className="text-slate-500">
            Finansal durumunun genel özeti. ({user.email})
          </p>
        </div>
        
        <Button variant="outline" onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut size={16} />
          Çıkış Yap
        </Button>
      </div>
      
      {/* 1. Kısım: Kartlar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Net Varlık" 
          value={summary?.netWorth || 0} 
          icon={Wallet} 
          description={summary ? "Gerçek zamanlı hesaplandı." : "Veri bekleniyor."}
          trend={(summary?.netWorth || 0) > 0 ? "up" : (summary?.netWorth || 0) < 0 ? "down" : "neutral"}
        />
        <StatCard 
          title="Toplam Varlıklar (Brüt)" 
          value={summary?.totalAssetsValue || 0} 
          icon={PiggyBank} 
          description="Nakit ve Yatırımların toplamı."
        />
        <StatCard 
          title="Toplam Borçlar" 
          value={summary?.totalDebtsValue || 0} 
          icon={TrendingDown} 
          description="Kredi ve Kredi Kartı yükümlülükleri."
          trend="down"
        />
        {/* Burayı ileride gerçek aylık akışa bağlayabiliriz, şimdilik işlem sayısını gösterelim */}
        <StatCard 
          title="Son Hareketler" 
          value={recentTransactions.length} 
          icon={TrendingUp} 
          description="Adet işlem kaydı bulundu."
          trend="neutral"
          isCurrency={false}
        />
      </div>

      {/* 2. Kısım: Grafikler ve Son Hareketler Listesi */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Varlık Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AssetChart data={summary?.pieChartData || []} />
          </CardContent>
        </Card>

        {/* --- SON HAREKETLER LİSTESİ (GÜNCELLENDİ) --- */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Son Hareketler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentTransactions.length === 0 ? (
                <p className="text-center text-slate-500 py-4">Henüz işlem kaydı yok.</p>
              ) : (
                recentTransactions.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 mr-4">
                        {/* Gelir ise Yeşil Ok, Gider ise Kırmızı Ok */}
                        {item.type === 'INCOME' ? (
                            <ArrowDownLeft className="h-5 w-5 text-green-600" />
                        ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                        )}
                    </div>
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {item.description || item.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.transaction_date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className={`ml-auto font-medium ${item.type === 'INCOME' ? "text-green-600" : "text-slate-900"}`}>
                      {item.type === 'INCOME' ? "+" : "-"}{formatCurrency(Number(item.amount))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        {/* -------------------------------------------- */}
      </div>
    </div>
  );
}