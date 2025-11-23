// src/lib/formatters.ts

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0, // Kuruşları gizle (sade görünüm için)
    maximumFractionDigits: 0,
  }).format(amount);
};