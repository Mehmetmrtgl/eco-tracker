import AddTransactionDialog from "@/components/forms/AddTransactionDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Örnek Veriler
const transactions = [
  { id: 1, desc: "Migros Alışveriş", category: "Market", date: "2023-11-23", amount: -1250, type: "expense" },
  { id: 2, desc: "Kasım Maaşı", category: "Maaş", date: "2023-11-01", amount: 45000, type: "income" },
  { id: 3, desc: "Netflix Üyelik", category: "Abonelik", date: "2023-11-20", amount: -199, type: "expense" },
  { id: 4, desc: "Benzin", category: "Ulaşım", date: "2023-11-18", amount: -2400, type: "expense" },
  { id: 5, desc: "Freelance İş", category: "Ek Gelir", date: "2023-11-15", amount: 8500, type: "income" },
];

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      {/* Başlık Alanı */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">İşlemler</h2>
          <p className="text-slate-500">Tüm gelir ve gider hareketlerin.</p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Filtreleme ve Arama Alanı */}
      <div className="flex gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Harcama ara..."
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {/* Tablo Alanı */}
      <Card>
        <CardHeader className="p-0" />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Açıklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                      </div>
                      {t.desc}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                      {t.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{t.date}</TableCell>
                  <TableCell className={`text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                    {t.type === 'income' ? '+' : ''}{formatCurrency(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}