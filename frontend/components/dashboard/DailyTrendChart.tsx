"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"; // <-- ReferenceLine eklendi
import { formatCurrency } from "@/lib/formatters";

interface DailyTrendChartProps {
  data: { date: string; amount: number }[];
  avgDailyBudget: number; 
}

export default function DailyTrendChart({ data, avgDailyBudget }: DailyTrendChartProps) { // <-- PROP alındı
  
  // Eğer bütçe limit çizgisi 0 ise göstermeyelim
  const showBudgetLine = avgDailyBudget > 0;

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
        Bu dönemde trend verisi yok.
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <div className="h-[300px] w-full text-xs font-medium">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fill: '#64748B' }}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(val) => `₺${val/1000}k`} 
            domain={[0, 'auto']} // Y ekseni 0'dan başlasın
            tick={{ fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), "Harcama"]}
            labelFormatter={(label) => formatDate(label)}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />

          {/* KIRMIZI BÜTÇE ÇİZGİSİ */}
          {showBudgetLine && (
            <ReferenceLine 
                y={avgDailyBudget} // <-- Hesaplanan günlük bütçe değeri
                stroke="#FF0000" // Kırmızı
                strokeDasharray="5 5" 
                label={{ value: 'Günlük Limit', position: 'top', fill: '#FF0000', fontSize: 10 }}
            />
          )}

          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorAmount)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}