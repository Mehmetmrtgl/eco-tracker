"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants"; // Sabitleri çekiyoruz

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: any;
  onSuccess: () => void;
}

export default function EditTransactionDialog({ open, onOpenChange, transaction, onSuccess }: EditTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");

  // Pencere açılınca mevcut verileri doldur
  useEffect(() => {
    if (transaction) {
      setDesc(transaction.description || "");
      // Kategori ismini ilişkili tablodan alıyoruz
      setCategory(transaction.categories?.name || "");
      
      const dateObj = new Date(transaction.transaction_date);
      const formattedDate = dateObj.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      // Backend'e güncelleme isteği at
      const res = await fetch(`http://localhost:4000/transactions/${transaction.id}?userId=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: desc,
          date: date,
          category: category, // Yeni kategoriyi gönderiyoruz
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

  // İşlemin tipine göre doğru listeyi (Gelir/Gider) seç
  const categoryList = transaction?.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>İşlemi Düzenle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Kategori Seçimi */}
          <div className="grid gap-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {categoryList.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Açıklama</Label>
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          
          <div className="grid gap-2">
            <Label>Tarih</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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