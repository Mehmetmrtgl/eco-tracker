"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface UpdateDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  debt: any; // Düzenlenecek borcun bilgileri
}

export default function UpdateDebtDialog({ open, onOpenChange, onSuccess, debt }: UpdateDebtDialogProps) {
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  // Pencere açılınca mevcut değerleri doldur
  useEffect(() => {
    if (debt) {
      setTotalAmount(debt.remaining_amount || debt.total_amount); // Güncel kalanı varsayılan yap
      setMonthlyPayment(debt.monthly_payment || "");
    }
  }, [debt, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/debts/${debt.id}`, {
        method: "PATCH", // Güncelleme isteği
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_amount: Number(totalAmount),
          monthly_payment: Number(monthlyPayment),
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

  const isCreditCard = debt?.type === 'CREDIT_CARD';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Borç Güncelle</DialogTitle>
          <DialogDescription>
            {isCreditCard ? "Yeni ekstre dönemine ait güncel borç bilgisini giriniz." : "Kredi bilgilerini güncelle."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label>Güncel Toplam Borç</Label>
            <Input 
              type="number" 
              value={totalAmount} 
              onChange={(e) => setTotalAmount(e.target.value)} 
              placeholder="Örn: 25000"
            />
            <p className="text-[10px] text-slate-500">Yeni harcamalar dahil toplam borcunuz.</p>
          </div>

          <div className="grid gap-2">
            <Label>{isCreditCard ? "Bu Ayki Ekstre Borcu" : "Yeni Taksit Tutarı"}</Label>
            <Input 
              type="number" 
              value={monthlyPayment} 
              onChange={(e) => setMonthlyPayment(e.target.value)} 
              placeholder="Örn: 5000"
            />
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