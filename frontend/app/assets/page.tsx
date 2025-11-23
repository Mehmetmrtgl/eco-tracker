import AddAssetDialog from "@/components/forms/AddAssetDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Coins, Banknote, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Asset } from "@/types";

// Örnek Dummy Veri (Backend bağlanana kadar)
const assets: Asset[] = [
  { id: "1", name: "Çeyrek Altın", type: "gold", amount: 12, value: 48600, changeRate: 2.4 },
  { id: "2", name: "Amerikan Doları", type: "currency", amount: 1500, value: 48750, changeRate: -0.5 },
  { id: "3", name: "Euro", type: "currency", amount: 500, value: 17500, changeRate: 0.2 },
  { id: "4", name: "Gram Altın", type: "gold", amount: 25, value: 62500, changeRate: 1.1 },
];

export default function AssetsPage() {
  
  // Varlık tipine göre ikon seçen yardımcı fonksiyon
  const getIcon = (type: string) => {
    switch (type) {
      case "gold": return <Coins className="h-8 w-8 text-yellow-500 bg-yellow-100 p-1.5 rounded-full" />;
      case "currency": return <Banknote className="h-8 w-8 text-green-500 bg-green-100 p-1.5 rounded-full" />;
      default: return <Landmark className="h-8 w-8 text-blue-500 bg-blue-100 p-1.5 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Ekleme Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Varlıklarım</h2>
          <p className="text-slate-500">Mevcut yatırımlarını ve nakit durumunu yönet.</p>
        </div>
        <AddAssetDialog />
      </div>

      {/* Varlık Listesi (Grid Yapısı) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                {getIcon(asset.type)}
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">
                    {asset.name}
                  </CardTitle>
                  <p className="text-xs text-slate-500">{asset.amount} Adet</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Toplam Değer</p>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(asset.value)}
                  </div>
                </div>
                
                {/* Değişim Oranı */}
                <div className={`flex items-center text-sm font-medium ${
                  asset.changeRate >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {asset.changeRate >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  %{Math.abs(asset.changeRate)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}