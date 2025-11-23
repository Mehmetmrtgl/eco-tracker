"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Örnek veriler (İleride veritabanından gelecek)
const data = [
  { name: "Altın", value: 45000, color: "#EAB308" }, // Sarı
  { name: "Döviz", value: 32000, color: "#22C55E" }, // Yeşil
  { name: "TL Mevduat", value: 15000, color: "#3B82F6" }, // Mavi
  { name: "Hisse Senedi", value: 28000, color: "#6366F1" }, // Mor
];

export default function AssetChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Ortası boş (Donut) olması için
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value)}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}