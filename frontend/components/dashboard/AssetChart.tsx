"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AssetChartProps {
  data: ChartData[];
}

const COLORS: Record<string, string> = {
  // --- Varlık Tipleri ---
  'Altın': '#EAB308',   // Sarı
  'Döviz': '#22C55E',   // Yeşil
  'Nakit': '#3B82F6',   // Mavi
  'Borsa': '#6366F1',   // İndigo
  'Kripto': '#F97316',  // Turuncu
  
  // --- Harcama Kategorileri ---
  'KrediKarti': '#1E293B', // (Slate 800 - Koyu Gri)
  'Market': '#F59E0B',      // Turuncu
  'Gida': '#EA580C',        // Koyu Turuncu
  'Restoran': '#BE185D',    // Bordo
  'Eglence': '#8B5CF6',     // Mor
  'Fatura': '#EF4444',      // Kırmızı
  'Benzin': '#DC2626',      // Koyu Kırmızı
  'Ulasim': '#06B6D4',      // Cyan
  'EvcilHayvan': '#A855F7', // Açık Mor
  'Giyim': '#EC4899',       // Pembe
  'Saglik': '#10B981',      // Yeşil
  'Egitim': '#4F46E5',      // İndigo
  'Teknoloji': '#2563EB',   // Mavi
  'Bakim': '#DB2777',       // Fuşya
  'Diger': '#64748B',       // Gri
  
  'Maas': '#22C55E',
  'Yatirim': '#14B8A6',
};

const FALLBACK_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

export default function AssetChart({ data }: AssetChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-slate-400 border-2 border-dashed rounded-lg">
        Henüz veri yok.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full text-xs font-medium">
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
            // --- YÜZDE GÖSTERİMİ (HATA DÜZELTİLDİ) ---
            label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
            labelLine={true}
            // ----------------------------------------
          >
            {data.map((entry, index) => {
              const color = COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
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