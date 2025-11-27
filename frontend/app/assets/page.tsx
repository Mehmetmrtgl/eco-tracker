"use client";

import { useEffect, useState } from "react";
import AddAssetDialog from "@/components/forms/AddAssetDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { Coins, Banknote, Landmark, ArrowUpRight, ArrowDownRight, Loader2, Wallet, PieChart, Users, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Asset } from "@/types";
import AssetDetailSheet from "@/components/dashboard/AssetDetailSheet"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RateTicker from "@/components/common/RateTicker"; 
export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]); 
  const [loading, setLoading] = useState(true); 
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [selectedOtherOwner, setSelectedOtherOwner] = useState<string>("");

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

  const handleCardClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsSheetOpen(true);
  };

  useEffect(() => {
    fetchAssets();
  }, [router]);

  // --- HESAPLAMA MANTIĞI ---
  const groupedByOwner = assets.reduce((acc, asset) => {
      const owner = asset.owner || "Kendisi";
      if (!acc[owner]) acc[owner] = 0;
      acc[owner] += Number(asset.total_value);
      return acc;
  }, {} as Record<string, number>);

  const myTotal = groupedByOwner["Kendisi"] || 0; 
  const grandTotal = Object.values(groupedByOwner).reduce((a, b) => a + b, 0);
  const othersTotal = grandTotal - myTotal;

  // Diğer Sahiplerin Listesi ve Filtreleme
  const myAssets = assets.filter(a => !a.owner || a.owner === 'Kendisi');
  const otherAssetsAll = assets.filter(a => a.owner && a.owner !== 'Kendisi');

  const otherOwnersList = Object.keys(groupedByOwner).filter(name => name !== "Kendisi");

  if (otherOwnersList.length > 0 && !selectedOtherOwner) {
      setSelectedOtherOwner(otherOwnersList[0]);
  }

  const displayedOtherAssets = otherAssetsAll.filter(a => a.owner === selectedOtherOwner);
  const currentOtherTotal = groupedByOwner[selectedOtherOwner] || 0;
  // --------------------------

  const getIcon = (type: string) => {
    switch (type) {
      case "GOLD": return <Coins className="h-8 w-8 text-yellow-500 bg-yellow-100 p-1.5 rounded-full" />;
      case "CASH": return <Wallet className="h-8 w-8 text-blue-500 bg-blue-100 p-1.5 rounded-full" />;
      case "CURRENCY": return <Banknote className="h-8 w-8 text-green-500 bg-green-100 p-1.5 rounded-full" />;
      default: return <Landmark className="h-8 w-8 text-indigo-500 bg-indigo-100 p-1.5 rounded-full" />;
    }
  };

  // KART RENDER FONKSİYONU
  const renderAssetCard = (asset: Asset, isOwnerCard: boolean = false) => {
    const isLiquid = asset.type === 'CASH' || asset.symbol === 'deposit';
    const displayName = asset.name; 

    return (
        <Card 
            key={asset.id} 
            className="hover:shadow-md transition-shadow cursor-pointer border-slate-200" 
            onClick={() => handleCardClick(asset)} 
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-3">
                {getIcon(asset.type)}
                <div>
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    {displayName}
                    {isOwnerCard && (
                        <span className="text-[10px] font-normal bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                            {asset.owner}
                        </span>
                    )}
                </CardTitle>
                {!isLiquid && (
                    <p className="text-xs text-slate-500">{Number(asset.quantity)} Adet</p>
                )}
                </div>
            </div>
            </CardHeader>
            <CardContent>
            <div className="mt-4 space-y-2">
                
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-500">
                    {isLiquid ? 'Bakiye' : 'Güncel Değer'}
                    </p>
                    <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(Number(asset.total_value))} 
                    </div>
                </div>
                
                {!isOwnerCard && !isLiquid && (
                    <div className="flex justify-between text-sm pt-1 items-end">
                        <div className="flex flex-col gap-0.5">
                            {/* DÜZELTME BURADA: TOPLAM MALİYET GÖSTERİLİYOR */}
                            <span className="text-[10px] text-slate-400 uppercase">Toplam Maliyet</span>
                            <span className="font-medium text-slate-700">
                                {formatCurrency(Number(asset.avg_cost) * Number(asset.quantity))}
                            </span>
                        </div>
                        {(() => {
                        const cost = Number(asset.avg_cost);
                        const current = Number(asset.current_price);
                        if (cost === 0) return null;
                        const profitRate = ((current - cost) / cost) * 100;
                        const isProfit = profitRate >= 0;
                        return (
                            <div className={`flex items-center font-bold px-2 py-0.5 rounded text-xs ${
                            isProfit ? "bg-green-100 text-green-700" : "bg-red-50 text-red-700"
                            }`}>
                            {isProfit ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
                            %{Math.abs(profitRate).toFixed(2)}
                            </div>
                        );
                        })()}
                    </div>
                )}

                {isOwnerCard && !isLiquid && (
                        <p className="text-xs text-slate-400 pt-1 italic">Değer takibi.</p>
                )}
                {isLiquid && <p className="text-xs text-slate-400 pt-1">Likit varlık.</p>}
            </div>
            </CardContent>
        </Card>
    );
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white shadow-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <PieChart size={200} />
         </div>

         <div className="relative z-10">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Toplam Portföy Değeri</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                {formatCurrency(grandTotal)}
            </h1>
            {/* Alt Kırılımlar */}
            <div className="flex gap-6 mt-4">
                <div>
                    <p className="text-xs text-slate-400 uppercase mb-0.5">Kişisel</p>
                    <p className="font-bold text-green-400 text-lg">{formatCurrency(myTotal)}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase mb-0.5">Diğerleri</p>
                    <p className="font-bold text-indigo-400 text-lg">{formatCurrency(othersTotal)}</p>
                </div>
            </div>
         </div>

         <div className="relative z-10">
             <AddAssetDialog onSuccess={fetchAssets} />
         </div>
      </div>

      {/* 2. KİŞİSEL VARLIKLARIM (ÜST LİSTE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <User className="text-green-600"/> Kişisel Varlıklarım
            </h2>
            <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {formatCurrency(myTotal)}
            </span>
        </div>

        {myAssets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">Henüz kişisel varlığın yok.</div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myAssets.map(asset => renderAssetCard(asset, false))}
            </div>
        )}
      </div>

      {/* 3. DİĞER KİŞİLERİN VARLIKLARI (ALT LİSTE - SEÇMELİ) */}
      {otherOwnersList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
            
            {/* Başlık ve Filtre */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-indigo-600"/> Aile / Diğer Varlıklar
                </h2>
                
                {/* Kişi Seçimi */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Gösterilen Kişi:</span>
                    <Select value={selectedOtherOwner} onValueChange={setSelectedOtherOwner}>
                        <SelectTrigger className="w-[180px] h-9 bg-white">
                            <SelectValue placeholder="Kişi Seç" />
                        </SelectTrigger>
                        <SelectContent>
                            {otherOwnersList.map(name => (
                                <SelectItem key={name} value={name}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Seçilen Kişinin Toplamı */}
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full whitespace-nowrap">
                        {formatCurrency(currentOtherTotal)}
                    </span>
                </div>
            </div>

            {/* Seçilen Kişinin Varlıkları */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedOtherAssets.map(asset => renderAssetCard(asset, true))}
            </div>
            
        </div>
      )}

      <AssetDetailSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        asset={selectedAsset} 
        userId={currentUserId} 
        onUpdate={fetchAssets} 
      />
      <RateTicker />
    </div>
  );
}