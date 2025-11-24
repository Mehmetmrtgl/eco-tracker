"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Loader2, Search, CreditCard, Wallet, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Label } from "@/components/ui/label";
import AddTransactionDialog from "@/components/forms/AddTransactionDialog";
import { formatCurrency } from "@/lib/formatters";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [showCurrentPeriodOnly, setShowCurrentPeriodOnly] = useState(true); // Varsayılan: Sadece bu ay
  const [resetDay, setResetDay] = useState(1); // Kullanıcının hesap kesim günü

  const fetchTransactions = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.push("/login");
        return;
      }
      
      const user = JSON.parse(storedUser);
      
      // Kullanıcının hesap kesim gününü al (Yoksa 1 varsay)
      setResetDay(user.reset_day || 1);

      const res = await fetch(`http://localhost:4000/transactions/${user.id}`);
      
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [router]);

  // --- TARİH HESAPLAMA MANTIĞI ---
  const getStartDate = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11 arası
    const currentYear = today.getFullYear();

    // Varsayılan: Bu ayın 'resetDay'i
    let start = new Date(currentYear, currentMonth, resetDay);

    // Eğer bugün, hesap kesim gününden ÖNCEYSE (örn: Bugün 10'u, Kesim 15'i)
    // O zaman dönem GEÇEN AYIN 15'inde başlamıştır.
    if (currentDay < resetDay) {
      start = new Date(currentYear, currentMonth - 1, resetDay);
    }
    
    start.setHours(0, 0, 0, 0); // Saati sıfırla
    return start;
  };

  // --- FİLTRELEME ---
  const filteredTransactions = transactions.filter(t => {
    // 1. Arama Filtresi (Açıklama veya Kategoriye göre)
    const matchesSearch = 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Tarih Filtresi
    let matchesDate = true;
    if (showCurrentPeriodOnly) {
        const txDate = new Date(t.transaction_date);
        const startDate = getStartDate();
        matchesDate = txDate >= startDate; // Başlangıç tarihinden sonraki işlemler
    }

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const startDateString = getStartDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">İşlemler</h2>
          <p className="text-slate-500">Tüm gelir ve gider hareketlerin.</p>
        </div>
        <AddTransactionDialog onSuccess={fetchTransactions} />
      </div>

      {/* Filtreler Alanı */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
        
        {/* Arama Kutusu */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Harcama veya kategori ara..."
            className="pl-9 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dönem Filtresi Checkbox */}
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-md border border-slate-200 shadow-sm">
            <Checkbox 
                id="periodFilter" 
                checked={showCurrentPeriodOnly}
                onCheckedChange={(checked) => setShowCurrentPeriodOnly(checked as boolean)}
            />
            <Label 
                htmlFor="periodFilter" 
                className="text-sm font-medium text-slate-700 cursor-pointer select-none flex items-center gap-2"
            >
                <Calendar size={14} className="text-slate-400"/>
                Bu Dönemi Göster 
                <span className="text-xs text-slate-400 font-normal">({startDateString}'den beri)</span>
            </Label>
        </div>
      </div>

      {/* Tablo */}
      <Card>
        <CardHeader className="p-0" />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Ödeme Yöntemi</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                    {searchTerm ? "Aradığınız kriterde işlem bulunamadı." : "Bu dönemde henüz işlem yok."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${t.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {t.type === 'INCOME' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                        </div>
                        <span className="text-slate-700">{t.description || "Açıklama yok"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {t.debt_id ? (
                        <div className="flex items-center gap-1.5">
                            <CreditCard size={14} className="text-purple-500"/> 
                            {t.debts?.bank_name || "Kredi Kartı"}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                            <Wallet size={14} className="text-blue-500"/> 
                            Nakit
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                        {new Date(t.transaction_date).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}