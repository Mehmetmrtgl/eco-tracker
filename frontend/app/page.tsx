import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import AssetChart from "@/components/dashboard/AssetChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-800">Genel Bakış</h2>

      {/* 1. Kısım: Üst Kartlar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Net Varlık" 
          value={120000} 
          icon={Wallet} 
          description="+%12 geçen aydan beri"
          trend="up"
        />
        <StatCard 
          title="Toplam Varlıklar" 
          value={145000} 
          icon={PiggyBank} 
          description="Altın, Döviz, Nakit"
        />
        <StatCard 
          title="Toplam Borçlar" 
          value={25000} 
          icon={TrendingDown} 
          description="Kredi Kartı ve Krediler"
          trend="down"
        />
        <StatCard 
          title="Aylık Net Gelir" 
          value={8500} 
          icon={TrendingUp} 
          description="Bu ay tasarruf edilen"
          trend="up"
        />
      </div>

      {/* 2. Kısım: Grafikler ve Listeler */}
      <div className="grid gap-4 md:grid-cols-7">
        
        {/* Sol Taraf: Varlık Dağılımı (4 birim genişlik) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Varlık Dağılımı</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AssetChart />
          </CardContent>
        </Card>

        {/* Sağ Taraf: Son İşlemler (3 birim genişlik) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Son Hareketler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Örnek İşlem Listesi */}
              {[
                { name: "Market Alışverişi", amount: -1250, date: "Bugün" },
                { name: "Maaş Yatışı", amount: +45000, date: "Dün" },
                { name: "Gram Altın Alımı", amount: -2450, date: "2 Gün Önce" },
                { name: "Kredi Kartı Ödeme", amount: -15000, date: "3 Gün Önce" },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                  <div className={`ml-auto font-medium ${item.amount > 0 ? "text-green-600" : "text-slate-900"}`}>
                    {item.amount > 0 ? "+" : ""}
                    {item.amount} ₺
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}