"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters"; // <-- BU EKSİKTİ, EKLENDİ

export default function AddTransactionDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Form Durumu
  const [type, setType] = useState("EXPENSE"); 
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedCardId, setSelectedCardId] = useState(""); 
  const [selectedAccountId, setSelectedAccountId] = useState("");
  
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(today);

  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Verileri Çek
  useEffect(() => {
    if (open) {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Kartları Çek
        if (paymentMethod === 'CREDIT_CARD') {
            fetch(`http://localhost:4000/debts/${user.id}`)
            .then(res => res.json())
            .then(data => {
                const cards = data.filter((d: any) => d.type === 'CREDIT_CARD' && !d.is_closed);
                setCreditCards(cards);
            });
        }
        
        // Hesapları Çek
        if (paymentMethod === 'CASH') {
            fetch(`http://localhost:4000/accounts/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setAccounts(data);
                if (data.length > 0 && !selectedAccountId) setSelectedAccountId(data[0].id);
            });
        }
      }
    }
  }, [open, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      let finalDesc = desc;
      if (type === 'INCOME' && !finalDesc) finalDesc = category; 

      const payload = {
        amount: Number(amount),
        type: type,
        category: category,
        description: finalDesc,
        date: date,
        paymentMethod: paymentMethod,
        debtId: paymentMethod === 'CREDIT_CARD' ? selectedCardId : null,
        accountId: paymentMethod === 'CASH' ? selectedAccountId : null,
      };

      const res = await fetch(`http://localhost:4000/transactions/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        setAmount(""); setDesc(""); setCategory("");
        if (onSuccess) onSuccess();
      } else {
        alert("Hata oluştu.");
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const categoryList = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><Plus size={18} /> İşlem Ekle</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Yeni İşlem Ekle</DialogTitle></DialogHeader>

        <Tabs defaultValue="EXPENSE" onValueChange={(val) => setType(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="EXPENSE" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">Gider</TabsTrigger>
            <TabsTrigger value="INCOME" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Gelir</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label>Tutar</Label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
            </div>

            {/* Ödeme Yöntemi */}
            <div className="grid gap-2">
                <Label>Ödeme Yöntemi</Label>
                <Select onValueChange={setPaymentMethod} defaultValue="CASH">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Nakit / Banka Hesabı</SelectItem>
                    {type === 'EXPENSE' && <SelectItem value="CREDIT_CARD">Kredi Kartı</SelectItem>}
                  </SelectContent>
                </Select>
            </div>

            {/* HESAP SEÇİMİ (Nakit ise) */}
            {paymentMethod === 'CASH' && (
              <div className="grid gap-2">
                <Label className="text-blue-600">Hangi Hesap?</Label>
                <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
                  <SelectTrigger><SelectValue placeholder="Hesap Seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {accounts.length === 0 ? (
                        <SelectItem value="none" disabled>Hesap Yok</SelectItem>
                    ) : (
                        accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>
                                {acc.name} ({formatCurrency(Number(acc.balance))})
                            </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* KART SEÇİMİ (KK ise) */}
            {type === 'EXPENSE' && paymentMethod === 'CREDIT_CARD' && (
              <div className="grid gap-2">
                <Label className="text-red-600">Hangi Kart?</Label>
                <Select onValueChange={setSelectedCardId} required>
                  <SelectTrigger><SelectValue placeholder="Kart Seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {creditCards.length === 0 ? <SelectItem value="none" disabled>Kayıtlı Kart Yok</SelectItem> : creditCards.map(c => (<SelectItem key={c.id} value={c.id}>{c.bank_name || c.title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {categoryList.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {type === 'EXPENSE' && (
              <div className="grid gap-2">
                <Label>Açıklama</Label>
                <Input placeholder="Örn: Migros alışverişi" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
            )}

            <div className="grid gap-2">
              <Label>Tarih</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <Button type="submit" className={type === "EXPENSE" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
              {type === "EXPENSE" ? "Harcamayı Kaydet" : "Geliri Kaydet"}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}