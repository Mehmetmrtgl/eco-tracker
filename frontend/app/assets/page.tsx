"use client";

import { useEffect, useState } from "react";
import AddAssetDialog from "@/components/forms/AddAssetDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Coins, Banknote, Landmark, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Asset } from "@/types";
import AssetDetailSheet from "@/components/dashboard/AssetDetailSheet"; 

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]); 
  const [loading, setLoading] = useState(true); 
  
  // Detay Paneli State'leri
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Verileri Backend'den Çeken Fonksiyon
  const fetchAssets = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.push("/login");
        return;
      }
      
      const user = JSON.parse(storedUser);
      setCurrentUserId(user.id);

      // Backend'e ID ile istek at
      const res = await fetch(`http://localhost:4000/assets/${user.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setAssets(data); 
      }
    } catch (error) {
      console.error("Varlıklar getirilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Karta tıklanınca çalışacak
  const handleCardClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsSheetOpen(true);
  };

  // Sayfa açılınca çalışır
  useEffect(() => {
    fetchAssets();
  }, [router]);

  // Varlık tipine göre ikon seçen yardımcı fonksiyon
  const getIcon = (type: string) => {
    switch (type) {
      case "GOLD": return <Coins className="h-8 w-8 text-yellow-500 bg-yellow-100 p-1.5 rounded-full" />;
      case "CASH": return <Banknote className="h-8 w-8 text-green-500 bg-green-100 p-1.5 rounded-full" />;
      case "CURRENCY": return <Banknote className="h-8 w-8 text-green-500 bg-green-100 p-1.5 rounded-full" />;
      default: return <Landmark className="h-8 w-8 text-blue-500 bg-blue-100 p-1.5 rounded-full" />;
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Üst Başlık ve Ekleme Butonu */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Varlıklarım</h2>
          <p className="text-slate-500">Mevcut yatırımlarını ve nakit durumunu yönet.</p>
        </div>
        
        {/* Ekleme Modalı: İşlem bitince listeyi yenilemesi için fetchAssets'i geçiyoruz */}
        <AddAssetDialog onSuccess={fetchAssets} />
      </div>

      {/* Varlık Listesi */}
      {assets.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed">
          Henüz hiç varlık eklememişsin.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            // Yardımcı değişken: Likit varlık mı? (Nakit veya Vadeli Mevduat)
            const isLiquid = asset.type === 'CASH' || asset.symbol === 'deposit';

            return (
              <Card 
                  key={asset.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => handleCardClick(asset)} 
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    {getIcon(asset.type)}
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">
                        {asset.name}
                      </CardTitle>
                      {/* Likit değilse adet göster, likitse gösterme */}
                      {!isLiquid && (
                          <p className="text-xs text-slate-500">{Number(asset.quantity)} Adet</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-2">
                    
                    {/* 1. Toplam Değer (Ana Rakam) */}
                    <div className="flex justify-between items-center pb-2 border-b">
                        <p className="text-sm font-semibold text-slate-500">
                           {isLiquid ? 'Toplam Bakiye' : 'Güncel Toplam Değer'}
                        </p>
                        <div className="text-2xl font-bold text-slate-900">
                        {/* Eğer Likit ise (Nakit/Vadeli) direkt Miktarı göster, yoksa Hesaplanan Değeri göster */}
                          {formatCurrency(isLiquid ? Number(asset.quantity) : Number(asset.total_value))} 
                        </div>
                    </div>
                    
                    {/* 2. Detaylar (Sadece Likit OLMAYANLAR için) */}
                    {!isLiquid && (
                        <div className="flex justify-between text-sm pt-1 items-end">
                            <div className="flex flex-col gap-1">
                                <div>
                                  <span className="text-xs text-slate-400 block">Ortalama Maliyet</span>
                                  <span className="font-medium">
                                    {formatCurrency(Number(asset.avg_cost))}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-400 block">Anlık Fiyat</span>
                                  <span className="font-medium text-slate-600">
                                    {formatCurrency(Number(asset.current_price))}
                                  </span>
                                </div>
                            </div>

                            {/* Kâr / Zarar Göstergesi */}
                            {(() => {
                               const cost = Number(asset.avg_cost);
                               const current = Number(asset.current_price);
                               if (cost === 0) return null;

                               const profitRate = ((current - cost) / cost) * 100;
                               const isProfit = profitRate >= 0;
                               
                               return (
                                 <div className={`flex items-center font-bold px-2 py-1 rounded-lg text-xs ${
                                   isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                 }`}>
                                   {isProfit ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                                   %{Math.abs(profitRate).toFixed(2)}
                                 </div>
                               );
                            })()}
                        </div>
                    )}
                    
                    {/* Likit Varlık Mesajı */}
                    {isLiquid && (
                      <p className="text-sm text-slate-400 pt-1">Likit Varlık (1 TL = 1 TL)</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* DETAY PANELİ */}
      <AssetDetailSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        asset={selectedAsset}
        userId={currentUserId}
        onUpdate={fetchAssets}
      />
    </div>
  );
}