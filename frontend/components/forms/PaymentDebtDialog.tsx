"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/formatters";

interface PaymentDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  debt: any; // Ödeme yapılacak borç
}

export default function PaymentDebtDialog({ open, onOpenChange, onSuccess, debt }: PaymentDebtDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  // Pencere açılınca varsayılan olarak "Aylık Taksit" tutarını getir
  useEffect(() => {
    if (debt) {
      // Eğer aylık ödeme tanımlıysa onu getir, yoksa kalan borcun tamamını öner
      const suggestion = Number(debt.monthly_payment) > 0 
        ? debt.monthly_payment 
        : debt.remaining_amount;
      setAmount(suggestion);
    }
  }, [debt, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend'e PATCH isteği atıyoruz
      const res = await fetch(`http://localhost:4000/debts/${debt.id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentAmount: Number(amount),
        }),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess(); // Listeyi yenile
      } else {
        const err = await res.json();
        alert("Ödeme başarısız: " + err.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Ödeme Yap</DialogTitle>
          <DialogDescription>
            Ödeme tutarı <b>Nakit Cüzdanı</b>'ndan düşülecektir.
            <br/>
            <span className="text-xs text-slate-500">Mevcut Borç: {debt ? formatCurrency(Number(debt.remaining_amount)) : 0}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label>Ödenecek Tutar</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Örn: 5000"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "İşleniyor..." : "Ödemeyi Onayla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}