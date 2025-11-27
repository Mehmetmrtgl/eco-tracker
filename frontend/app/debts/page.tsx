"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownRight, CreditCard, Landmark, Loader2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AddDebtDialog from "@/components/forms/AddDebtDialog";
import UpdateDebtDialog from "@/components/forms/UpdateDebtDialog";
import PaymentDebtDialog from "@/components/forms/PaymentDebtDialog";
import { formatCurrency } from "@/lib/formatters";

interface Debt {
  id: string;
  title: string;
  type: string;
  total_amount: string | number;
  remaining_amount: string | number;
  due_date: string;
  is_closed: boolean;
  monthly_payment: string | number;
  bank_name?: string;
  recipient_name?: string;
}

export default function DebtsPage() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>([]);
  // YENİ: Kart Listesi State'i
  const [cards, setCards] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isDebtAddOpen, setIsDebtAddOpen] = useState(false); // Dialog State

  // Update & Payment Dialog States
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  const fetchDebts = async (userId: string) => {
      const res = await fetch(`http://localhost:4000/debts/${userId}`);
      if (res.ok) setDebts(await res.json());
  };

  // YENİ: Kartları Çekme Fonksiyonu
  const fetchCards = async (userId: string) => {
      const res = await fetch(`http://localhost:4000/credit-cards/${userId}`);
      if (res.ok) setCards(await res.json());
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) { router.push("/login"); return; }
    
    const user = JSON.parse(storedUser);
    setCurrentUserId(user.id);

    Promise.all([
        fetchDebts(user.id),
        fetchCards(user.id) // <-- Kartları da çek
    ]).finally(() => setLoading(false));

  }, [router]);

  const handlePayment = (debt: Debt) => {
      setPaymentDebt(debt);
      setIsPaymentOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsUpdateOpen(true);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const totalRemainingDebt = debts.reduce((sum, debt) => sum + Number(debt.remaining_amount), 0);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Borç Takibi</h2>
          <p className="text-slate-500">Ödenmemiş tüm yükümlülüklerin.</p>
        </div>
        {/* YENİ BUTON KULLANIMI */}
        <AddDebtDialog 
            open={isDebtAddOpen} 
            onOpenChange={setIsDebtAddOpen}
            userId={currentUserId}
            cards={cards} // <-- Kart listesini gönderiyoruz
            onSuccess={() => fetchDebts(currentUserId)} 
        />
        <Button onClick={() => setIsDebtAddOpen(true)} className="bg-red-600 hover:bg-red-700">Borç Ekle</Button>
      </div>

      <Card className="bg-red-50 border-red-100">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full text-red-600"><ArrowDownRight size={32} /></div>
            <div>
              <p className="text-sm font-medium text-red-600">Toplam Kalan Borç</p>
              <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(totalRemainingDebt)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {debts.length === 0 ? (
        <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed">
          Mevcut aktif borcun bulunmamaktadır.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {debts.map((debt) => {
            const total = Number(debt.total_amount);
            const remaining = Number(debt.remaining_amount);
            const percentPaid = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0;
            const isCreditCard = debt.type === 'CREDIT_CARD';

            return (
              <Card key={debt.id} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    {isCreditCard 
                      ? <CreditCard className="text-purple-600 bg-purple-100 p-1.5 w-8 h-8 rounded-full"/> 
                      : <Landmark className="text-orange-600 bg-orange-100 p-1.5 w-8 h-8 rounded-full"/>
                    }
                    <CardTitle className="text-base font-bold text-slate-800">
                      {debt.bank_name || debt.title}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(debt)} className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <Edit2 size={16} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 font-medium">Toplam Kalan Borç</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(remaining)}</p>
                    </div>
                    <div className="space-y-1 bg-red-50 p-2 rounded-lg border border-red-100 text-right">
                      <p className="text-xs text-red-600 font-bold">{isCreditCard ? "Bu Ayki Ekstre" : "Bu Ayki Taksit"}</p>
                      <p className="text-lg font-bold text-red-700">{formatCurrency(Number(debt.monthly_payment))}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Ana Borç Ödeme Durumu</span>
                      <span>%{percentPaid} ödendi</span>
                    </div>
                    <Progress value={percentPaid} className="h-2 bg-slate-100" />
                    <p className="text-xs text-right text-slate-400 mt-1">
                      Bitiş: {debt.due_date ? new Date(debt.due_date).toLocaleDateString('tr-TR') : 'Belirsiz'}
                    </p>
                  </div>
                  
                  <div className="pt-2">
                      <Button 
                        onClick={() => handlePayment(debt)} 
                        className={`w-full text-white ${Number(debt.monthly_payment) > 0 ? "bg-slate-900 hover:bg-slate-800" : "bg-green-600 hover:bg-green-700"}`}
                      >
                          {Number(debt.monthly_payment) > 0 
                            ? `Bu Ayki Ödemeyi Yap (${formatCurrency(Number(debt.monthly_payment))})`
                            : "Ekstra Ödeme Yap"
                          }
                      </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedDebt && (
        <UpdateDebtDialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen} debt={selectedDebt} onSuccess={() => fetchDebts(currentUserId)} />
      )}
      
      {paymentDebt && (
        <PaymentDebtDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} debt={paymentDebt} onSuccess={() => fetchDebts(currentUserId)} />
      )}
    </div>
  );
}