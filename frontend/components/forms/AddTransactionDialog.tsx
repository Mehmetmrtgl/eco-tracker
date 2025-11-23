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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("expense"); // Varsayılan: Gider

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600">
          <Plus size={18} />
          İşlem Ekle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni İşlem Ekle</DialogTitle>
        </DialogHeader>

        {/* Gelir / Gider Geçişi */}
        <Tabs defaultValue="expense" className="w-full" onValueChange={setType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Gider (Harcama)</TabsTrigger>
            <TabsTrigger value="income">Gelir (Kazanç)</TabsTrigger>
          </TabsList>

          {/* Form Alanı (Her iki durum için de ortak form kullanıyoruz şimdilik) */}
          <form className="grid gap-4 py-4">
            
            {/* Tutar */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Tutar</Label>
              <Input id="amount" type="number" placeholder="0.00" autoFocus />
            </div>

            {/* Kategori */}
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori Seç" />
                </SelectTrigger>
                <SelectContent>
                  {type === "expense" ? (
                    <>
                      <SelectItem value="market">Market & Gıda</SelectItem>
                      <SelectItem value="rent">Kira / Fatura</SelectItem>
                      <SelectItem value="transport">Ulaşım / Benzin</SelectItem>
                      <SelectItem value="fun">Eğlence</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="salary">Maaş</SelectItem>
                      <SelectItem value="freelance">Ek İş / Freelance</SelectItem>
                      <SelectItem value="investment">Yatırım Getirisi</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Açıklama */}
            <div className="grid gap-2">
              <Label htmlFor="desc">Açıklama (Opsiyonel)</Label>
              <Input id="desc" placeholder="Örn: Migros alışverişi" />
            </div>

            {/* Tarih */}
            <div className="grid gap-2">
              <Label htmlFor="date">Tarih</Label>
              <Input id="date" type="date" />
            </div>

            <Button type="submit" className={type === "expense" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
              {type === "expense" ? "Harcamayı Kaydet" : "Geliri Kaydet"}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}