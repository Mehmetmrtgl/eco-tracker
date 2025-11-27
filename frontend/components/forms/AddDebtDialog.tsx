"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, DollarSign, CreditCard, Banknote } from "lucide-react"; // Calendar ikonunu kaldırdık

// Kart tipinin tanımı
interface CreditCard {
  id: string;
  alias: string;
  bank_name: string;
}

interface AddDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  cards?: CreditCard[];
  onSuccess: () => void;
}

export default function AddDebtDialog({ open, onOpenChange, userId, cards, onSuccess }: AddDebtDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    debtType: "credit_card",
    name: "",
    amount: "",
    // dueDate state'i kaldırıldı
  });

  const finalCards = cards || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validasyon: Artık tarih kontrolü yok
    if (!formData.debtType || !formData.name || !formData.amount) {
        alert("Lütfen gerekli alanları doldurunuz.");
        return;
    }
    setLoading(true);

    try {
        let finalTitle = formData.name;
        let finalBankName = null;

        if (formData.debtType === "credit_card") {
            const selectedCard = finalCards.find(c => c.id === formData.name);
            if (selectedCard) {
                finalTitle = selectedCard.alias; 
                finalBankName = selectedCard.bank_name; 
            }
        }

        const payload = {
            title: finalTitle,
            type: formData.debtType.toUpperCase(),
            total_amount: Number(formData.amount),
            due_date: null, // Tarih sorulmadığı için null gönderiyoruz
            bank_name: finalBankName,
            card_id: formData.debtType === "credit_card" ? formData.name : null,
        };
        
        const res = await fetch(`http://localhost:4000/debts/${userId}`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload),
        });

        if (res.ok) {
            onSuccess();
            onOpenChange(false);
            // Formu sıfırla
            setFormData({ debtType: "credit_card", name: "", amount: "" });
        } else {
            const errorData = await res.json();
            alert(`Borç eklenirken bir hata oluştu: ${errorData.message || 'Bilinmeyen Hata'}`);
        }

    } catch (error) { 
        console.error(error); 
        alert("Sunucuya bağlanılamadı.");
    } 
    finally { setLoading(false); }
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ 
        ...prev, 
        debtType: value,
        name: value === "credit_card" && finalCards.length > 0 ? finalCards[0].id : "" 
    }));
  };

  const isCreditCardDebt = formData.debtType === "credit_card";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Yeni Borç Ekle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* 1. Borç Tipi */}
          <div className="space-y-2">
            <Label>Borç Tipi</Label>
            <Select value={formData.debtType} onValueChange={handleTypeChange}>
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="credit_card">Kredi Kartı Borcu</SelectItem>
                    <SelectItem value="loan">Kredi (Bankacılık)</SelectItem>
                    <SelectItem value="other">Diğer (Şahıs, Faturalar vb.)</SelectItem>
                </SelectContent>
            </Select>
          </div>

          {/* 2. İsim/Kart Seçimi */}
          <div className="space-y-2">
            <Label>{isCreditCardDebt ? "Kart Seçimi" : "Borç Adı"}</Label>
            
            {isCreditCardDebt ? (
                <Select 
                    value={formData.name} 
                    onValueChange={(val) => setFormData({...formData, name: val})}
                    disabled={finalCards.length === 0}
                >
                    <SelectTrigger>
                        <CreditCard size={16} className="absolute left-3 text-slate-400" />
                        <SelectValue placeholder={finalCards.length === 0 ? "Tanımlı kartınız yok" : "Kredi Kartı Seçiniz"} className="pl-9"/>
                    </SelectTrigger>
                    <SelectContent>
                        {finalCards.map(card => (
                            <SelectItem key={card.id} value={card.id}>
                                {card.alias} ({card.bank_name})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <div className="relative">
                    <Banknote size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <Input 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        placeholder="Örn: Ev Kredisi, Ahmet'ten Borç" 
                        className="pl-9"
                        required
                    />
                </div>
            )}
          </div>
          
          {/* 3. Sadece Tutar (Vade Tarihi Kaldırıldı) */}
          <div className="space-y-2">
            <Label>Tutar</Label>
            <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <Input 
                    type="number" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0"
                    className="pl-9"
                    required
                />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800">
                {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : "Borcu Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}