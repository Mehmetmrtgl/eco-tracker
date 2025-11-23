"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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

export default function AddDebtDialog() {
  const [open, setOpen] = useState(false);

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
        </DialogHeader>

        <form className="grid gap-4 py-4">
          {/* Tip Seçimi */}
          <div className="grid gap-2">
            <Label>Borç Tipi</Label>
            <Select defaultValue="loan">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                <SelectItem value="loan">İhtiyaç/Konut Kredisi</SelectItem>
                <SelectItem value="person">Şahıs Borcu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Başlık */}
          <div className="grid gap-2">
            <Label htmlFor="title">Borç Adı</Label>
            <Input id="title" placeholder="Örn: Garanti Konut Kredisi" />
          </div>

          {/* Toplam Tutar */}
          <div className="grid gap-2">
            <Label htmlFor="total">Toplam Borç Tutarı</Label>
            <Input id="total" type="number" placeholder="Çekilen kredi miktarı" />
          </div>

          {/* Kalan Tutar */}
          <div className="grid gap-2">
            <Label htmlFor="remaining">Güncel Kalan Borç</Label>
            <Input id="remaining" type="number" placeholder="Henüz ödenmemiş kısım" />
          </div>

          {/* Vade Tarihi */}
          <div className="grid gap-2">
            <Label htmlFor="date">Son Ödeme / Bitiş Tarihi</Label>
            <Input id="date" type="date" />
          </div>

          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}