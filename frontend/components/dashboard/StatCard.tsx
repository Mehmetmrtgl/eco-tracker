import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  isCurrency?: boolean; // <-- YENİ ÖZELLİK (Opsiyonel)
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  isCurrency = true // Varsayılan olarak HER ZAMAN para birimi gösterir
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">
            {/* Eğer isCurrency false ise normal sayı, true ise TL formatı göster */}
            {isCurrency ? formatCurrency(value) : value}
        </div>
        {description && (
          <p className={`text-xs mt-1 ${
            trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-slate-500"
          }`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}