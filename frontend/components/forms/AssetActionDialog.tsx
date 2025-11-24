"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Asset } from "@/types";

interface AssetActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  mode: "BUY" | "SELL"; // Alım mı Satım mı?
  onSuccess: () => void;
}

export default function AssetActionDialog({ open, onOpenChange, asset, mode, onSuccess }: AssetActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    amount: "",
    cost: "", // Satış fiyatı veya Alış maliyeti
    date: today,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset) return;
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      const user = JSON.parse(storedUser || "{}");

      const payload = {
        name: asset.name,
        type: asset.type,
        symbol: asset.symbol,
        quantity: Number(formData.amount),
        cost: Number(formData.cost),
        date: formData.date,
        transactionType: mode, // Backend'e ne yapacağımızı söylüyoruz
      };

      const res = await fetch(`http://localhost:4000/assets/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormData({ amount: "", cost: "", date: today });
        onOpenChange(false);
        onSuccess(); // Listeleri yenile
      } else {
        const errorData = await res.json();
        alert("Hata: " + (errorData.message || "İşlem başarısız"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "BUY" ? `${asset?.name} Al` : `${asset?.name} Sat`;
  const colorClass = mode === "BUY" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === "BUY" ? "Portföyüne ekleme yap." : "Portföyünden çıkış yap."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tarih</Label>
            <Input type="date" className="col-span-3" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Miktar</Label>
            <Input type="number" className="col-span-3" placeholder="Adet" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{mode === "BUY" ? "Alış Fiyatı" : "Satış Fiyatı"}</Label>
            <Input type="number" className="col-span-3" placeholder="Birim Fiyat (TL)" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} required />
          </div>

          <DialogFooter>
            <Button type="submit" className={colorClass} disabled={loading}>
              {loading ? "İşleniyor..." : (mode === "BUY" ? "Alımı Onayla" : "Satışı Onayla")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}