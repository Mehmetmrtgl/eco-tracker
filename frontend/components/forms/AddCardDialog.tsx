"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { BANK_OPTIONS } from "@/lib/constants";

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export default function AddCardDialog({ open, onOpenChange, userId, onSuccess }: AddCardDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newCard, setNewCard] = useState({ 
    bankName: "", alias: "", limit: "", cutoffDay: "1", dueDay: "10" 
  });

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.bankName || !newCard.alias || !newCard.limit) {
        alert("Lütfen gerekli alanları doldurunuz.");
        return;
    }
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:4000/credit-cards/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCard),
        });
        if (res.ok) {
            setNewCard({ bankName: "", alias: "", limit: "", cutoffDay: "1", dueDay: "10" });
            onSuccess();
            onOpenChange(false);
        } else {
            alert("Kart eklenirken hata oluştu.");
        }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Yeni Kredi Kartı Ekle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAddCard} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Banka Adı</Label>
                <Select value={newCard.bankName} onValueChange={(val) => setNewCard({...newCard, bankName: val})}>
                    <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">{BANK_OPTIONS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Kart Rumuzu</Label>
                <Input value={newCard.alias} placeholder="Örn: Bonus" onChange={(e) => setNewCard({...newCard, alias: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
             <Label>Kart Limiti</Label>
             <Input type="number" value={newCard.limit} placeholder="0" onChange={(e) => setNewCard({...newCard, limit: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Kesim Günü</Label>
                <Select value={newCard.cutoffDay} onValueChange={(val) => setNewCard({...newCard, cutoffDay: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">{days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label>Son Ödeme Günü</Label>
                <Select value={newCard.dueDay} onValueChange={(val) => setNewCard({...newCard, dueDay: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">{days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800">
                {loading ? "..." : "Kartı Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}