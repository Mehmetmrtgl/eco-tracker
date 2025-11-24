"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

try {
      const res = await fetch("http://localhost:4000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password_hash: formData.password,
        }),
      });

      const data = await res.json(); // Cevabı JSON olarak al

      // Kontrolü buradaki "status" alanına göre yapıyoruz
      if (data.status === "success") {
        alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
        router.push("/login");
      } else {
        // Backend'den gelen hata mesajını göster
        setError(data.message || "Kayıt başarısız.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-[350px] shadow-lg border-t-4 border-t-green-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-slate-800">Aramıza Katıl</CardTitle>
          <CardDescription className="text-center">Yeni bir hesap oluştur</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input id="fullName" placeholder="Mehmet Han" onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" type="email" placeholder="ornek@email.com" onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" type="password" onChange={handleChange} required />
            </div>

            {error && <div className="text-sm text-red-500 text-center">{error}</div>}

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Kaydediliyor..." : "Kaydol"}
            </Button>

            <div className="mt-4 text-center text-sm text-slate-600">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Giriş Yap
              </Link>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}