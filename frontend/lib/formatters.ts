// frontend/src/lib/formatters.ts

export const formatCurrency = (amount: number, decimals: number = 0) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₺0';
  }
  
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: decimals, // <-- BURASI YENİ
    maximumFractionDigits: decimals,
  }).format(amount);
};