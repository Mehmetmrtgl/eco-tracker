"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

// Backend'den gelen veri tipi
interface ChartData {
  name: string;
  value: number;
}

interface AssetChartProps {
  data: ChartData[];
}

// Renk Paleti
const COLORS: Record<string, string> = {
  'Altın': '#EAB308',   // Sarı
  'Döviz': '#22C55E',   // Yeşil
  'Nakit': '#3B82F6',   // Mavi
  'Borsa': '#6366F1',   // Mor
  'Kripto': '#F97316',  // Turuncu
  'Diğer': '#94A3B8',   // Gri
};

export default function AssetChart({ data }: AssetChartProps) {
  
  // Eğer veri yoksa boş durum göster
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
        Henüz varlık verisi yok.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle"/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}