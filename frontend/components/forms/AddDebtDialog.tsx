"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { DEBT_TYPES, BANK_OPTIONS } from "@/lib/constants"; 

export default function AddDebtDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '', // Şahıs borçları için kullanılır
    type: 'CREDIT_CARD',
    bankName: '', 
    recipientName: '', 
    totalAmount: '',
    monthlyPayment: '', 
    dueDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const isP2P = formData.type === 'PERSON';
      const isBankDebt = formData.type !== 'PERSON';

      // OTOMATİK BAŞLIK MANTIĞI
      // Eğer Banka ise başlık = Banka Adı (Örn: Akbank)
      // Eğer Şahıs ise başlık = Girilen Açıklama (Örn: Altın Borcu)
      let finalTitle = formData.title;
      if (isBankDebt) {
          // Banka seçilmediyse varsayılan bir isim koyalım
          finalTitle = formData.bankName || "Banka Borcu"; 
      }

      const payload = {
        title: finalTitle, 
        type: formData.type,
        total_amount: Number(formData.totalAmount),
        due_date: formData.dueDate || null,
        monthly_payment: isBankDebt ? Number(formData.monthlyPayment) : 0,
        bank_name: isBankDebt ? formData.bankName : null,
        recipient_name: isP2P ? formData.recipientName : null,
      };

      const res = await fetch(`http://localhost:4000/debts/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({ title: '', type: 'CREDIT_CARD', bankName: '', recipientName: '', totalAmount: '', monthlyPayment: '', dueDate: '' });
        onSuccess();
      } else {
        const errorData = await res.json();
        alert(`Hata: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const selectedGroup = DEBT_TYPES.find(d => d.value === formData.type)?.group;
  const showBankSelect = selectedGroup === 'BANK';
  const showRecipient = selectedGroup === 'PERSON';
  const showMonthly = selectedGroup === 'BANK' || selectedGroup === 'CREDIT_CARD';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <PlusCircle size={18} />
          Borç Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Borç / Kredi Ekle</DialogTitle>
          <DialogDescription>Borç bilgilerini girin.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* 1. Borç Tipi */}
          <div className="grid gap-2">
            <Label>Borç Tipi</Label>
            <Select onValueChange={(val) => setFormData({...formData, type: val})} defaultValue={formData.type}>
              <SelectTrigger> <SelectValue placeholder="Seçiniz..." /> </SelectTrigger>
              <SelectContent>
                {DEBT_TYPES.map(d => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          
          {/* 2A. BANKA SEÇİMİ (Banka ise sadece bu çıkar) */}
          {showBankSelect && (
            <div className="grid gap-2">
              <Label>Banka</Label>
              <Select onValueChange={(val) => setFormData({...formData, bankName: val})}>
                <SelectTrigger> <SelectValue placeholder="Banka Seçiniz" /> </SelectTrigger>
                <SelectContent>
                  {BANK_OPTIONS.map(b => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* 2B. ŞAHIS İSE: Kime? */}
          {showRecipient && (
            <div className="grid gap-2">
              <Label htmlFor="recipientName">Borç Verilen/Alınan Kişi</Label>
              <Input id="recipientName" placeholder="Örn: Ahmet Yılmaz" onChange={(e) => setFormData({...formData, recipientName: e.target.value})} required={showRecipient} />
            </div>
          )}

          {/* 3. AÇIKLAMA (SADECE ŞAHIS İSE GÖSTER) */}
          {showRecipient && (
            <div className="grid gap-2">
                <Label htmlFor="title">Açıklama</Label>
                <Input id="title" placeholder="Örn: Altın borcu" onChange={(e) => setFormData({...formData, title: e.target.value})} required={showRecipient} />
            </div>
          )}

          {/* 4. Toplam Borç */}
          <div className="grid gap-2">
            <Label htmlFor="totalAmount">Toplam Borç (Anapara)</Label>
            <Input id="totalAmount" type="number" placeholder="200000" onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} required />
          </div>
          
          {/* 5. Aylık Taksit / Ekstre */}
          {showMonthly && (
            <div className="grid gap-2">
              <Label htmlFor="monthlyPayment">{formData.type === 'CREDIT_CARD' ? "Bu Ayki Ekstre Borcu" : "Aylık Taksit Tutarı"}</Label>
              <Input id="monthlyPayment" type="number" placeholder="5000" onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})} required />
            </div>
          )}

          {/* 6. Bitiş Tarihi */}
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Bitiş Tarihi</Label>
            <Input id="dueDate" type="date" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Borcu Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}