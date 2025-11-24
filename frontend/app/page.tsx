"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/dashboard/StatCard";
import AssetChart from "@/components/dashboard/AssetChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SummaryData {
  totalAssetsValue: number;
  totalDebtsValue: number;
  netWorth: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ full_name: string; email: string; id: string } | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Veri Çekme Fonksiyonu
  const fetchSummary = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/assets/${userId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      } else {
        console.error("Özet veri çekilemedi.");
      }
    } catch (error) {
      console.error("Sunucuya bağlanılamadı:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Yüklenme ve Kullanıcı Kontrolü
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Veri varsa API'ı çağır
    if (parsedUser?.id) {
      fetchSummary(parsedUser.id);
    }
  }, [router, fetchSummary]); // fetchSummary'yi bağımlılık olarak ekledik

  // Çıkış Yapma Fonksiyonu
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
      
      {/* 1. Kısım: GERÇEK VERİ KARTLARI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Net Varlık */}
          <StatCard 
            title="Net Varlık" 
            value={summary?.netWorth || 0} // <-- Value fix (Önceki düzeltme)
            icon={Wallet} 
            description={summary ? "Hesaplama gerçek verilerle yapıldı." : "Varlık veya borç bulunamadı."}
            
            // TREND FIX: Eğer summary null ise, netWorth'ü 0 kabul et
            trend={(summary?.netWorth || 0) > 0 ? "up" : (summary?.netWorth || 0) < 0 ? "down" : "neutral"}
          />
        {/* Toplam Varlıklar (Brüt) */}
        <StatCard 
          title="Toplam Varlıklar (Brüt)" 
          value={summary?.totalAssetsValue || 0} // <-- HATA ÇÖZÜMÜ BURADA
          icon={PiggyBank} 
          description="Nakit ve Yatırımların toplamı."
        />
        {/* Toplam Borç */}
        <StatCard 
          title="Toplam Borçlar" 
          value={summary?.totalDebtsValue || 0} // <-- HATA ÇÖZÜMÜ BURADA
          icon={TrendingDown} 
          description="Kredi ve Kredi Kartı yükümlülükleri."
          trend="down"
        />
        {/* Aylık Net Akış (Mock) */}
        <StatCard 
          title="Aylık Net Akış (Mock)" 
          value={8500} 
          icon={TrendingUp} 
          description="Harcama takibi yapılınca gerçek veri gelecek."
          trend="up"
        />
    </div>

      {/* 2. Kısım: Grafikler ve Listeler */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Varlık Dağılımı (Mock)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AssetChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Son Hareketler (Mock)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <p className="text-center py-5 text-slate-500">İşlem modülü bitince burası da canlanacak.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}