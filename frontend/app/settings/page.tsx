"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [resetDay, setResetDay] = useState("1");
  const [userId, setUserId] = useState("");

  // Sayfa açılınca mevcut ayarı getir
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      // Eğer kullanıcının kayıtlı bir günü varsa onu, yoksa 1'i seç
      setResetDay(user.reset_day ? String(user.reset_day) : "1");
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_day: Number(resetDay) }),
      });

      if (res.ok) {
        const updatedUser = await res.json(); // Backend güncel user'ı döner
        
        // LocalStorage'ı güncelle ki diğer sayfalar hemen görsün
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.reset_day = updatedUser.reset_day;
            localStorage.setItem("currentUser", JSON.stringify(userObj));
        }
        
        alert("Ayarlar kaydedildi! İşlemler bu tarihe göre sıfırlanacak.");
      } else {
        alert("Kaydedilemedi.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 1'den 31'e kadar gün listesi oluştur
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Ayarlar</h2>
        <p className="text-slate-500">Uygulama tercihlerinizi yönetin.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Hesap Kesim / Maaş Günü</CardTitle>
          <CardDescription>
            Aylık harcamalarınız ve gelirleriniz hangi günde sıfırlansın?
            (Örneğin maaş günü veya kredi kartı kesim tarihi).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Döngü Başlangıç Günü</Label>
            <Select value={resetDay} onValueChange={setResetDay}>
              <SelectTrigger>
                <SelectValue placeholder="Gün Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    Her ayın {day}. günü
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin mr-2" size={18}/> : <Save className="mr-2" size={18}/>}
            Kaydet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}