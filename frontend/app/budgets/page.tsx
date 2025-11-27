"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trash2, Target, AlertTriangle, Loader2 } from "lucide-react";
import SetBudgetDialog from "@/components/forms/SetBudgetDialog";
import { formatCurrency } from "@/lib/formatters";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = async () => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      
      const res = await fetch(`http://localhost:4000/budgets/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Bu bütçe hedefini silmek istiyor musunuz?")) return;
    
    try {
        const storedUser = localStorage.getItem("currentUser");
        const user = JSON.parse(storedUser || "{}");
        
        const res = await fetch(`http://localhost:4000/budgets/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.id })
        });

        if (res.ok) fetchBudgets();
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => { fetchBudgets(); }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bütçe Hedefleri</h2>
            <p className="text-slate-500">Harcamalarına sınır koy, tasarruf et.</p>
        </div>
        <SetBudgetDialog onSuccess={fetchBudgets} />
      </div>

      {budgets.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-white rounded-lg border border-dashed">
          Henüz bir bütçe hedefi belirlemedin.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {budgets.map((b) => {
            const percent = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
            const isOverLimit = b.spent > b.limit;
            
            // Renk Belirleme
            let progressColor = "bg-green-500";
            if (percent > 80) progressColor = "bg-yellow-500";
            if (percent >= 100) progressColor = "bg-red-600";

            return (
                <Card key={b.id} className={isOverLimit ? "border-red-200 bg-red-50/30" : "hover:shadow-md transition-shadow"}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <Target size={18} className="text-slate-400"/>
                        {b.categoryName}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                        <Trash2 size={16} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className={isOverLimit ? "text-red-600 font-bold" : "text-slate-900 font-bold"}>
                                {formatCurrency(b.spent)}
                            </span>
                            <span className="text-slate-500 text-xs mt-1">
                                Hedef: {formatCurrency(b.limit)}
                            </span>
                        </div>
                        
                        <Progress value={percent} className={`h-2 ${isOverLimit ? "bg-red-200" : "bg-slate-100"}`} indicatorClassName={progressColor} />
                        
                        <div className="flex justify-between items-center text-xs">
                            <span className={`${percent >= 100 ? "text-red-600 font-bold" : "text-slate-500"}`}>
                                %{percent} Kullanıldı
                            </span>
                            {isOverLimit && (
                                <span className="flex items-center text-red-600 font-bold gap-1">
                                    <AlertTriangle size={12}/> Limit Aşıldı!
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
                </Card>
            );
            })}
        </div>
      )}
    </div>
  );
}