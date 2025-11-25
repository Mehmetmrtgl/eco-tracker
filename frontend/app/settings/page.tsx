"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, CalendarClock, Wallet } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // GENEL AYARLAR STATE
  const [resetDay, setResetDay] = useState("1");
  
  // MAAŞ AYARLARI STATE
  const [salaryDay, setSalaryDay] = useState("1");
  const [salaryAmount, setSalaryAmount] = useState("");

  // KART AYARLARI STATE
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [cardSettings, setCardSettings] = useState({
    cutoffDay: "1",
    dueDay: "10"
  });

  // Sayfa Yüklenince Verileri Çek
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      
      // Mevcut ayarları doldur
      setResetDay(user.reset_day ? String(user.reset_day) : "1");
      setSalaryDay(user.salary_day ? String(user.salary_day) : "1");
      setSalaryAmount(user.salary_amount ? String(user.salary_amount) : "");

      // Kullanıcının Kredi Kartlarını Çek
      fetch(`http://localhost:4000/debts/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const creditCards = data.filter((d: any) => d.type === 'CREDIT_CARD' && !d.is_closed);
          setCards(creditCards);
        });
    }
  }, []);

  // Kart seçilince ayarları doldur
  useEffect(() => {
    if (selectedCardId) {
      const card = cards.find(c => c.id === selectedCardId);
      if (card) {
        setCardSettings({
            cutoffDay: card.cutoff_day ? String(card.cutoff_day) : "1",
            dueDay: card.payment_due_day ? String(card.payment_due_day) : "10"
        });
      }
    }
  }, [selectedCardId, cards]);

  // GENEL AYARLARI KAYDET (MAAŞ DAHİL)
  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            reset_day: Number(resetDay),
            salary_day: Number(salaryDay),
            salary_amount: Number(salaryAmount)
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.reset_day = updatedUser.reset_day;
            userObj.salary_day = updatedUser.salary_day;
            userObj.salary_amount = updatedUser.salary_amount;
            localStorage.setItem("currentUser", JSON.stringify(userObj));
        }
        alert("Ayarlar ve Maaş bilgisi kaydedildi!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSalary = async () => {
    if (!confirm("Bu ayki maaş tutarı Nakit Cüzdanı'na eklenecek. Onaylıyor musun?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}/trigger-salary`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Maaş başarıyla eklendi!");
      } else {
        alert("Hata oluştu.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  // KART AYARLARINI KAYDET
  const handleSaveCard = async () => {
    if (!selectedCardId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/debts/${selectedCardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            cutoff_day: Number(cardSettings.cutoffDay),
            payment_due_day: Number(cardSettings.dueDay)
        }),
      });

      if (res.ok) {
        alert("Kart ayarları güncellendi!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Ayarlar</h2>
        <p className="text-slate-500">Uygulama tercihlerinizi ve otomasyonu yönetin.</p>
      </div>

      <Tabs defaultValue="general" className="w-full max-w-3xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Genel & Maaş</TabsTrigger>
          <TabsTrigger value="cards">Kart Ayarlarım</TabsTrigger>
        </TabsList>

        {/* --- SEKME 1: GENEL & MAAŞ --- */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Otomatik Gelir</CardTitle>
              <CardDescription>Maaş gününü ve tutarını girerek her ay otomatik eklenmesini sağlayın.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* MAAŞ BLOĞU */}
<div className="space-y-3 border-b pb-4">
                
                {/* --- DÜZELTME BURADA: Başlık ve Butonu tek bir satıra aldık --- */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 font-medium">
                        <Wallet size={18} /> Maaş Ayarları
                    </div>
                    
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleTriggerSalary}
                        className="text-xs h-8 border-green-200 text-green-700 hover:bg-green-50"
                    >
                        Bu Ayı Şimdi Ekle
                    </Button>
                </div>
                {/* ------------------------------------------------------------- */}

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Maaş Günü</Label>
                        <Select value={salaryDay} onValueChange={setSalaryDay}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Tutar (Net)</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                value={salaryAmount} 
                                onChange={(e) => setSalaryAmount(e.target.value)} 
                                placeholder="0" 
                                className="pl-8"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">₺</span>
                        </div>
                    </div>
                </div>
                
              </div>

              {/* DÖNGÜ AYARI */}
              <div className="grid gap-2">
                <Label>Analiz Sıfırlama Günü</Label>
                <Select value={resetDay} onValueChange={setResetDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {days.map((d) => <SelectItem key={d} value={String(d)}>Her ayın {d}. günü</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500">Grafikler ve özetler bu güne göre hesaplanır.</p>
              </div>

              <Button onClick={handleSaveGeneral} disabled={loading} className="bg-blue-600 hover:bg-blue-700 mt-2 w-full">
                {loading ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save className="mr-2" size={18}/>}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SEKME 2: KART AYARLARI --- */}
        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle>Kredi Kartı Yapılandırması</CardTitle>
              <CardDescription>Her kartın kesim ve son ödeme tarihini belirleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label>Düzenlenecek Kartı Seçin</Label>
                <Select value={selectedCardId} onValueChange={setSelectedCardId}>
                  <SelectTrigger><SelectValue placeholder="Kart Seçiniz" /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {cards.length === 0 ? (
                        <SelectItem value="none" disabled>Kayıtlı Kredi Kartı Yok</SelectItem>
                    ) : (
                        cards.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.bank_name || c.title} (Limit: {c.total_amount}₺)
                            </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCardId && (
                  <div className="space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-md">
                        <CalendarClock size={20} />
                        <span className="text-sm font-medium">Bu tarihler hatırlatıcılar için kullanılacaktır.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Hesap Kesim Günü</Label>
                            <Select value={cardSettings.cutoffDay} onValueChange={(val) => setCardSettings({...cardSettings, cutoffDay: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Son Ödeme Günü</Label>
                            <Select value={cardSettings.dueDay} onValueChange={(val) => setCardSettings({...cardSettings, dueDay: val})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}
                            </SelectContent>
                            </Select>
                        </div>
                      </div>
                      <Button onClick={handleSaveCard} disabled={loading} className="bg-slate-900 hover:bg-slate-800 w-full">
                        {loading ? "..." : "Kartı Güncelle"}
                      </Button>
                  </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}