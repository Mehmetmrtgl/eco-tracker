"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { ASSET_TYPES } from "@/lib/constants";

export default function AddAssetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    typeValue: "",
    customName: "", // "Diğer" seçilirse kullanılacak isim
    amount: "",
    cost: "",
    date: today,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const selectedAsset = ASSET_TYPES.find(a => a.value === formData.typeValue);
      if (!selectedAsset) return;

      // --- MANTIK KURULUMU ---
      // Eğer "Diğer" seçildiyse ismi kullanıcıdan al, yoksa listeden al.
      const isOther = formData.typeValue === "other";
      
      const assetName = isOther ? formData.customName : selectedAsset.label;
      
      // Eğer "Diğer" ise sembolü benzersiz yapmalıyız ki diğerleriyle birleşmesin.
      // Örn: "other_antika_saat" gibi.
      // Standart varlıklarda ise sembol sabittir (örn: gold_quarter).
      const assetSymbol = isOther 
        ? `other_${formData.customName.toLowerCase().replace(/\s/g, '_')}` 
        : selectedAsset.value;

      const payload = {
        name: assetName,
        type: selectedAsset.group === "Altın" ? "GOLD" : 
              selectedAsset.group === "Döviz" ? "CURRENCY" : 
              selectedAsset.group === "Nakit" ? "CASH" : "OTHER",
        symbol: assetSymbol,
        quantity: Number(formData.amount),
        cost: Number(formData.cost),
        date: formData.date,
      };

      const res = await fetch(`http://localhost:4000/assets/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        // Formu sıfırla
        setFormData({ typeValue: "", customName: "", amount: "", cost: "", date: today });
        if (onSuccess) onSuccess();
      } else {
        alert("Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // "Diğer" seçili mi kontrolü
  const isOtherSelected = formData.typeValue === "other";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <PlusCircle size={18} />
          Yeni Varlık Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Varlık Ekle</DialogTitle>
          <DialogDescription>Listeden seç veya manuel ekle.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Tip Seçimi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tip</Label>
            <div className="col-span-3">
              <Select onValueChange={(val) => setFormData({...formData, typeValue: val})}>
                <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- ÖZEL İSİM ALANI (Sadece "Diğer" seçilince çıkar) --- */}
          {isOtherSelected && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customName" className="text-right text-blue-600 font-bold">Varlık Adı</Label>
              <Input 
                id="customName" 
                placeholder="Örn: Antika Saat, Arsa" 
                className="col-span-3 border-blue-200 focus-visible:ring-blue-500"
                value={formData.customName}
                onChange={(e) => setFormData({...formData, customName: e.target.value})}
                required={isOtherSelected} // Sadece bu modda zorunlu
              />
            </div>
          )}

          {/* Tarih */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Tarih</Label>
            <Input 
              id="date" type="date" className="col-span-3"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          {/* Miktar */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Miktar</Label>
            <Input 
              id="amount" type="number" placeholder="0" className="col-span-3"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
          </div>

          {/* Maliyet */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">Birim Fiyat</Label>
            <Input 
              id="cost" type="number" placeholder="TL" className="col-span-3"
              value={formData.cost}
              onChange={(e) => setFormData({...formData, cost: e.target.value})}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "..." : "Kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}