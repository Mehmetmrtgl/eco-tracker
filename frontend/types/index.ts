// src/types/index.ts

export type AssetType = "gold" | "currency" | "stock" | "crypto" | "cash";

export interface Asset {
  id: string;
  name: string;      // Örn: Çeyrek Altın, Amerikan Doları
  type: AssetType;   // Örn: gold
  amount: number;    // Örn: 5 (adet) veya 100 (dolar)
  value: number;     // Örn: 22500 (TL karşılığı)
  changeRate: number; // Örn: +1.5 (Yüzde değişim)
}