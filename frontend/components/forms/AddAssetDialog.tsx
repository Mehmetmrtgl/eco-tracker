"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AddAssetDialog() {
  const [open, setOpen] = useState(false);

  // Form submit olduğunda çalışacak fonksiyon (Şimdilik console'a yazar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form gönderildi!");
    setOpen(false); // Pencereyi kapat
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <PlusCircle size={18} />
          Yeni Varlık Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Varlık Ekle</DialogTitle>
          <DialogDescription>
            Portföyüne yeni bir yatırım aracı veya nakit ekle.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          
          {/* Varlık Tipi Seçimi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tip
            </Label>
            <div className="col-span-3">
                <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="gold_quarter">Çeyrek Altın</SelectItem>
                    <SelectItem value="gold_gram">Gram Altın</SelectItem>
                    <SelectItem value="usd">Amerikan Doları</SelectItem>
                    <SelectItem value="eur">Euro</SelectItem>
                    <SelectItem value="cash">Nakit (TL)</SelectItem>
                </SelectContent>
                </Select>
            </div>
          </div>

          {/* Miktar Girişi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Miktar
            </Label>
            <Input id="amount" type="number" placeholder="Örn: 5" className="col-span-3" />
          </div>

          {/* Maliyet Girişi (Opsiyonel) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cost" className="text-right">
              Maliyet
            </Label>
            <Input id="cost" type="number" placeholder="Alış Fiyatı (TL)" className="col-span-3" />
          </div>

          <DialogFooter>
            <Button type="submit">Kaydet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}