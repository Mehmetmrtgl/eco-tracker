"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Building2, Wallet } from "lucide-react";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export default function AddAccountDialog({ open, onOpenChange, userId, onSuccess }: AddAccountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", balance: "" });

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) {
        alert("Lütfen hesap adını giriniz.");
        return;
    }
    setLoading(true);
    try {
        const res = await fetch(`http://localhost:4000/accounts/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAccount),
        });
        if (res.ok) {
            setNewAccount({ name: "", balance: "" });
            onSuccess();
            onOpenChange(false);
        } else {
            alert("Hata oluştu.");
        }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Yeni Vadesiz Hesap</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleAddAccount} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Hesap Adı</Label>
            <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input 
                    value={newAccount.name} 
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} 
                    placeholder="Örn: İş Bankası Maaş" 
                    className="pl-9"
                />
            </div>
          </div>

          <div className="grid gap-2">
             <Label>Başlangıç Bakiyesi</Label>
             <div className="relative">
                <Wallet className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <Input 
                    type="number" 
                    value={newAccount.balance} 
                    placeholder="0" 
                    onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})} 
                    className="pl-9"
                />
             </div>
             <p className="text-[11px] text-slate-500">Mevcut bakiyenizi giriniz.</p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : "Hesabı Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}