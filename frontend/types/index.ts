// frontend/types/index.ts - DÜZELTİLMİŞ VERSİYON

export type AssetType = "GOLD" | "CURRENCY" | "STOCK" | "CRYPTO" | "CASH";

export interface Asset {
  id: string;
  name: string;
  type: string;       
  symbol: string;    
  
  quantity: number | string; 
  avg_cost: number | string;
  
  current_price: number | string; 
  total_value: number | string;   
  
  updated_at?: string;
  created_at?: string; // Diğer tarih alanları için ekleyelim
}