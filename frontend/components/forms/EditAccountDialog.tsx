"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2, Building2, Wallet } from "lucide-react";

interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any; // Düzenlenecek hesap bilgisi
  userId: string;
  onSuccess: () => void;
}

export default function EditAccountDialog({ open, onOpenChange, account, userId, onSuccess }: EditAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");

  // Pencere açılınca mevcut verileri doldur
  useEffect(() => {
    if (account) {
      setName(account.name || "");
      // Bakiye string veya Decimal gelebilir, stringe çevir
      setBalance(String(account.balance || 0));
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return alert("Hesap adı boş bırakılamaz.");
    setLoading(true);

    try {
      const payload = {
        userId: userId,
        name: name,
        balance: Number(balance),
      };

      const res = await fetch(`http://localhost:4000/accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess(); // Listeyi yenile
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Hesabı Düzenle: {account?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label>Hesap Adı</Label>
            <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Halkbank Maaş" className="pl-9" />
            </div>
          </div>

          <div className="grid gap-2">
             <Label>Başlangıç Bakiyesi (Dikkat: Sadece düzeltmeler için)</Label>
             <div className="relative">
                <Wallet className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" className="pl-9"/>
             </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800">
                {loading ? "..." : "Hesabı Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}