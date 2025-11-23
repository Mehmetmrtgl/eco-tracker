import AddDebtDialog from "@/components/forms/AddDebtDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { CreditCard, Landmark, AlertCircle } from "lucide-react";

// Örnek Veriler
const debts = [
  { 
    id: 1, 
    title: "Konut Kredisi", 
    type: "loan", 
    total: 1500000, 
    remaining: 850000, 
    dueDate: "2028-05-15" 
  },
  { 
    id: 2, 
    title: "Bonus Kredi Kartı", 
    type: "credit_card", 
    total: 35000, 
    remaining: 12500, 
    dueDate: "2023-11-28" 
  },
  { 
    id: 3, 
    title: "KYK Borcu", 
    type: "loan", 
    total: 45000, 
    remaining: 42000, // Yeni başlamış, çoğu duruyor
    dueDate: "2026-01-01" 
  },
];

export default function DebtsPage() {
  // Toplam Kalan Borç Hesaplama
  const totalDebt = debts.reduce((acc, curr) => acc + curr.remaining, 0);

  return (
    <div className="space-y-6">
      {/* Başlık Alanı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Borçlarım</h2>
          <p className="text-slate-500">Kredi ve borç ödeme planlarını takip et.</p>
        </div>
        <AddDebtDialog />
      </div>

      {/* Özet Kartı */}
      <Card className="bg-red-50 border-red-100">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-red-600">Toplam Kalan Borç</p>
            <h3 className="text-3xl font-bold text-slate-900">{formatCurrency(totalDebt)}</h3>
          </div>
        </CardContent>
      </Card>

      {/* Borç Kartları Listesi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {debts.map((debt) => {
          // Yüzde Hesaplama: (Toplam - Kalan) / Toplam * 100
          const paidAmount = debt.total - debt.remaining;
          const percentPaid = Math.round((paidAmount / debt.total) * 100);

          return (
            <Card key={debt.id} className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {debt.type === 'credit_card' 
                    ? <CreditCard className="text-purple-600 bg-purple-100 p-1.5 w-8 h-8 rounded-full"/> 
                    : <Landmark className="text-orange-600 bg-orange-100 p-1.5 w-8 h-8 rounded-full"/>
                  }
                  <CardTitle className="text-base font-bold text-slate-800">
                    {debt.title}
                  </CardTitle>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                  {debt.type === 'loan' ? 'Kredi' : 'Kart'}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Rakamlar */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400">Kalan</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(debt.remaining)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Toplam</p>
                    <p className="text-sm font-medium text-slate-600">{formatCurrency(debt.total)}</p>
                  </div>
                </div>

                {/* İlerleme Çubuğu */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600 font-medium">Ödenen: %{percentPaid}</span>
                    <span className="text-slate-400">{debt.dueDate} vadeli</span>
                  </div>
                  {/* Progress bar: Ne kadar dolarsa o kadar iyi (borç bitiyor) */}
                  <Progress value={percentPaid} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}