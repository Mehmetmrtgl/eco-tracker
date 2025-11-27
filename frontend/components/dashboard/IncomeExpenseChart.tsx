"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface IncomeExpenseChartProps {
  income: number;
  expense: number;
}

export default function IncomeExpenseChart({ income, expense }: IncomeExpenseChartProps) {
  
  const data = [
    { name: "Gelir", value: income, color: "#22C55E" }, // Yeşil
    { name: "Gider", value: expense, color: "#EF4444" }, // Kırmızı
  ];

  if (income === 0 && expense === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
        Veri yok.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full text-xs font-medium">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748B' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `₺${value / 1000}k`} 
            tick={{ fill: '#64748B' }}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            formatter={(value: number) => [formatCurrency(value), "Tutar"]}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}