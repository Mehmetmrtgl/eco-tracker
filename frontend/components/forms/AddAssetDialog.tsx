"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Wallet, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { ASSET_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

// Kart tipinin tanımı
interface Account {
  id: string;
  name: string;
  balance: string | number;
}

export default function AddAssetDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const [accounts, setAccounts] = useState<Account[]>([]); // Hesapları tutacak state

  const [formData, setFormData] = useState({
    typeValue: "",
    customName: "",
    amount: "",
    cost: "",
    date: today,
    owner: "Kendisi",
    accountId: "", 
  });

  // Hesapları çek
// frontend/src/components/forms/AddAssetDialog.tsx

// ... (üst kısımlar aynı) ...

  // Hesapları çek
// frontend/src/components/forms/AddAssetDialog.tsx

// ... (üst kısımlar aynı) ...

  // Hesapları çek
  useEffect(() => {
   if (open) {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            fetch(`http://localhost:4000/accounts/${user.id}`)
                .then(res => res.json())
               .then(data => {
                    
                  const bankAccounts = data.filter((acc: Account) => 
                      acc.name !== 'Elden Nakit' && acc.name !== 'Cüzdanım'
                    );

                    setAccounts(bankAccounts);

                    if (bankAccounts.length > 0) {

                      setFormData(prev => ({ ...prev, accountId: bankAccounts[0].id }));
                     }
                
              });
        }
    }
  }, [open]);

// ... (Geri kalan kod aynı) ...

// ... (Geri kalan kod aynı) ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const selectedAsset = ASSET_TYPES.find(a => a.value === formData.typeValue);
      if (!selectedAsset) return;

      const isOther = formData.typeValue === "other";
      const assetName = isOther ? formData.customName : selectedAsset.label;
      const assetSymbol = isOther 
        ? `other_${formData.customName.toLowerCase().replace(/\s/g, '_')}` 
        : selectedAsset.value;

      const isSelf = formData.owner.trim() === "" || formData.owner === "Kendisi";
      const finalCost = isSelf ? Number(formData.cost) : 0;
      
      const isPhysicalCash = formData.typeValue === 'cash_physical';

      const payload = {
        name: assetName,
        type: selectedAsset.group === "Altın" ? "GOLD" : 
              selectedAsset.group === "Döviz" ? "CURRENCY" : 
              selectedAsset.group === "NAKIT_FIZIKSEL" ? "CASH" : "OTHER", 
        symbol: assetSymbol,
        quantity: Number(formData.amount),
        cost: finalCost, 
        date: formData.date,
        owner: formData.owner || "Kendisi",
        accountId: showAccountSelect ? formData.accountId : null, 
      };

      const res = await fetch(`http://localhost:4000/assets/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({ typeValue: "", customName: "", amount: "", cost: "", date: today, owner: "Kendisi", accountId: "" });
        if (onSuccess) onSuccess();
      } else {
        alert("Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isOtherSelected = formData.typeValue === "other";
  
  // VADELİ MEVDUAT VEYA BANKA VADESİZ İSE HESAP SEÇİMİ GEREKİR
  const showAccountSelect = formData.typeValue === 'deposit' || formData.typeValue === 'cash_bank';
  
  const isLiquid = formData.typeValue === 'cash_physical' || formData.typeValue === 'deposit';
  const isSelf = formData.owner.trim() === "" || formData.owner === "Kendisi";
  const isPhysicalCash = formData.typeValue === 'cash_physical';


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <PlusCircle size={18} /> Yeni Varlık Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Varlık Ekle</DialogTitle>
          <DialogDescription>Portföyüne veya ailene varlık ekle.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Tip Seçimi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tip</Label>
            <div className="col-span-3">
              <Select onValueChange={(val) => setFormData({...formData, typeValue: val})}>
                <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isOtherSelected && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customName" className="text-right text-blue-600 font-bold">Varlık Adı</Label>
              <Input id="customName" placeholder="Örn: Arsa" className="col-span-3" value={formData.customName} onChange={(e) => setFormData({...formData, customName: e.target.value})} required={isOtherSelected} />
            </div>
          )}

          {/* Sahip Seçimi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="owner" className="text-right">Kime Ait?</Label>
            <Input 
              id="owner" 
              placeholder="Örn: Kendisi, Eşi" 
              className="col-span-3"
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
            />
          </div>

          {/* --- HESAP SEÇİMİ (Bankadan/Vadeliden Para Çıkışı/Girişi) --- */}
          {showAccountSelect && isSelf && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-blue-600 font-bold">Hesap</Label>
                <div className="col-span-3">
                    <Select value={formData.accountId} onValueChange={(val) => setFormData({...formData, accountId: val})}>
                        <SelectTrigger>
                            <Wallet size={16} className="mr-2 text-slate-400"/>
                            <SelectValue placeholder="Hesap Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.length === 0 ? (
                                <SelectItem value="none" disabled>Tanımlı hesap yok (Ayarlardan ekleyin)</SelectItem>
                            ) : (
                                accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.name} ({formatCurrency(Number(acc.balance))})
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <p className="text-[10px] text-slate-400 mt-1">Para bu hesaptan düşecektir/eklenecektir.</p>
                </div>
            </div>
          )}

          {/* FİZİKSEL NAKİT BİLGİSİ */}
          {isPhysicalCash && (
             <div className="grid grid-cols-4 gap-4">
                <div className="col-start-2 col-span-3">
                    <p className="text-[11px] text-green-600 bg-green-50 p-2 rounded">
                        Bu tutar doğrudan **Elden Nakit** (Fiziksel Cüzdan) bakiyesine eklenecektir.
                    </p>
                </div>
             </div>
          )}
          {/* ------------------------------------------------------- */}


          {/* Tarih */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Tarih</Label>
            <Input id="date" type="date" className="col-span-3" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
          </div>

          {/* Miktar */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">{isLiquid ? "Tutar" : "Adet/Miktar"}</Label>
            <Input id="amount" type="number" placeholder="0" className="col-span-3" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
          </div>

          {/* Maliyet */}
          {!isLiquid && isSelf && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cost" className="text-right">Birim Fiyat</Label>
                <Input id="cost" type="number" placeholder="TL" className="col-span-3" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? "..." : "Kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}