"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { BANK_OPTIONS } from "@/lib/constants";

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: any;
  onSuccess: () => void;
}

export default function EditCardDialog({ open, onOpenChange, card, onSuccess }: EditCardDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bankName: "",
    alias: "",
    limit: "",
    cutoffDay: "1",
    dueDay: "10"
  });

  // Pencere açılınca mevcut verileri doldur
  useEffect(() => {
    if (card) {
      setFormData({
        bankName: card.bank_name || "",
        alias: card.alias || "",
        limit: String(card.total_limit || ""),
        cutoffDay: String(card.cutoff_day || "1"),
        dueDay: String(card.due_day || "10")
      });
    }
  }, [card, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      // Backend'e güncelleme isteği (PATCH)
      const res = await fetch(`http://localhost:4000/credit-cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bankName: formData.bankName,
          alias: formData.alias,
          limit: Number(formData.limit),
          cutoffDay: Number(formData.cutoffDay),
          dueDay: Number(formData.dueDay),
        }),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess();
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kart Bilgilerini Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label>Banka Adı</Label>
            <Select value={formData.bankName} onValueChange={(val) => setFormData({...formData, bankName: val})}>
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {BANK_OPTIONS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Kart Rumuzu</Label>
            <Input value={formData.alias} onChange={(e) => setFormData({...formData, alias: e.target.value})} />
          </div>

          <div className="grid gap-2">
             <Label>Kart Limiti</Label>
             <Input type="number" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Kesim Günü</Label>
                <Select value={formData.cutoffDay} onValueChange={(val) => setFormData({...formData, cutoffDay: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {days.map((d) => <SelectItem key={d} value={String(d)}>{d}.</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label>Son Ödeme</Label>
                <Select value={formData.dueDay} onValueChange={(val) => setFormData({...formData, dueDay: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {days.map((d) => <SelectItem key={d} value={String(d)}>{d}.</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
                {loading ? "..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}