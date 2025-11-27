"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Loader2, Search, CreditCard, Wallet, Calendar, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; 
import { Label } from "@/components/ui/label";
import AddTransactionDialog from "@/components/forms/AddTransactionDialog";
import EditTransactionDialog from "@/components/forms/EditTransactionDialog"; 
import { formatCurrency } from "@/lib/formatters";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtre State'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [showCurrentPeriodOnly, setShowCurrentPeriodOnly] = useState(true);
  const [resetDay, setResetDay] = useState(1);

  // Düzenleme State'leri
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.push("/login");
        return;
      }
      
      const user = JSON.parse(storedUser);
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

  const handleDelete = async (transactionId: string) => {
    if (!confirm("Bu işlemi silmek istediğine emin misin? (Nakit bakiyesi geri alınacaktır)")) return;

    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      const res = await fetch(`http://localhost:4000/transactions/${transactionId}?userId=${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTransactions();
      } else {
        alert("Silinirken hata oluştu.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (tx: any) => {
    setSelectedTx(tx);
    setIsEditOpen(true);
  };

  useEffect(() => {
    fetchTransactions();
  }, [router]);

  const getStartDate = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); 
    const currentYear = today.getFullYear();

    let start = new Date(currentYear, currentMonth, resetDay);

    if (currentDay < resetDay) {
      start = new Date(currentYear, currentMonth - 1, resetDay);
    }
    
    start.setHours(0, 0, 0, 0); 
    return start;
  };

  const filteredTransactions = transactions.filter(t => {
    const categoryName = t.categories?.name || "Diğer";

    const matchesSearch = 
      t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (showCurrentPeriodOnly) {
        const txDate = new Date(t.transaction_date);
        const startDate = getStartDate();
        matchesDate = txDate >= startDate; 
    }

    return matchesSearch && matchesDate;
  });

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const startDateString = getStartDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">İşlemler</h2>
          <p className="text-slate-500">Tüm gelir ve gider hareketlerin.</p>
        </div>
        <AddTransactionDialog onSuccess={fetchTransactions} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
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
                <TableHead className="w-[100px] text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-slate-500">
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
                        {t.categories?.name || "Diğer"}
                      </span>
                    </TableCell>
                    
                    {/* --- ÖDEME YÖNTEMİ (DÜZELTİLEN KISIM) --- */}
                    <TableCell className="text-xs text-slate-500">
                      {t.credit_cards ? (
                        // 1. Yeni Kredi Kartı Sistemi
                        <div className="flex items-center gap-1.5">
                            <CreditCard size={14} className="text-purple-500"/> 
                            {t.credit_cards.alias || t.credit_cards.bank_name}
                        </div>
                      ) : t.debts ? (
                        // 2. Eski Borç Sistemi
                        <div className="flex items-center gap-1.5">
                            <CreditCard size={14} className="text-slate-500"/> 
                            {t.debts.bank_name || "Borç"}
                        </div>
                      ) : (
                        // 3. Nakit
                        <div className="flex items-center gap-1.5">
                            <Wallet size={14} className="text-blue-500"/> 
                            Nakit
                        </div>
                      )}
                    </TableCell>
                    {/* ---------------------------------------- */}

                    <TableCell className="text-slate-500 text-sm">
                        {new Date(t.transaction_date).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-slate-900'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </TableCell>
                    
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEdit(t)}
                            >
                                <Edit2 size={16} />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(t.id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </TableCell>
                    
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditTransactionDialog 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        transaction={selectedTx}
        onSuccess={fetchTransactions}
      />

    </div>
  );
}