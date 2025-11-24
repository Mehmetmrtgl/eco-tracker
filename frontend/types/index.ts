
export type AssetType = "gold" | "currency" | "stock" | "crypto" | "cash";

export interface Asset {
  id: string;
  name: string;      // Örn: Çeyrek Altın
  type: AssetType;   // Örn: gold
  amount: number;    // Örn: 5 (adet)
  value: number;     // Örn: 22500 (TL karşılığı)
  changeRate: number; // Örn: 1.5 (Yüzde değişim)
}