"use client";

import { useEffect, useState } from "react";
import AddAssetDialog from "@/components/forms/AddAssetDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Coins, Banknote, Landmark, ArrowUpRight, Loader2 } from "lucide-react";
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
          {assets.map((asset) => (
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
                    {/* Nakit için adet gösterme */}
                    {asset.type !== 'CASH' && (
                        <p className="text-xs text-slate-500">{Number(asset.quantity)} Adet</p>
                    )}
                  </div>
                </div>
              </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-2">
          
                  {/* --- 1. Toplam Değer (Ana Rakam) --- */}
                  <div className="flex justify-between items-center pb-2 border-b">
                      <p className="text-sm font-semibold text-slate-500">
                          {asset.type === 'CASH' ? 'Toplam Bakiye' : 'Güncel Toplam Değer'}
                      </p>
                      
                      <div className="text-2xl font-bold text-slate-900">
                          {/* DÜZELTME: total_value'yu Number() ile sar */}
                          {formatCurrency(Number(asset.total_value))} 
                      </div>
                  </div>
                    {/* --- 2. Maliyet & Birim Fiyat Detayı --- */}
                    {asset.type !== 'CASH' && (
                        <div className="flex justify-between text-sm pt-1">
                            <div className="flex flex-col">
                                <p className="text-xs text-slate-400">Ortalama Maliyet</p>
                                <p className="font-medium">
                                  {/* DÜZELTME: avg_cost'u Number() ile sar */}
                                  {formatCurrency(Number(asset.avg_cost))}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-xs text-slate-400">Anlık Birim Fiyat</p>
                                <p className="font-medium text-green-600">
                                  {/* DÜZELTME: current_price'ı Number() ile sar */}
                                  {formatCurrency(Number(asset.current_price))}
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {asset.type === 'CASH' && (
                        <p className="text-sm text-slate-400 pt-1">Likit Varlık (Birim Maliyet: 1 TL)</p>
                    )}
                  </div>
                </CardContent>
            </Card>
          ))}
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