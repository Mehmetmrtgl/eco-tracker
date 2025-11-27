"use client";

import { useEffect, useState, useCallback } from "react";
import { DollarSign, Euro, PoundSterling, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

// Göstermek istediğimiz varlıklar ve ikonları
const ASSET_DISPLAY_MAP: Record<string, { label: string, Icon: React.ElementType, color: string }> = {
    USD: { label: 'Dolar', Icon: DollarSign, color: 'text-blue-600' },
    EUR: { label: 'Euro', Icon: Euro, color: 'text-green-600' },
    GBP: { label: 'Sterlin', Icon: PoundSterling, color: 'text-purple-600' },
    GOLD_GRAM: { label: 'Gram Altın', Icon: RefreshCw, color: 'text-amber-600' }, 
};

export default function RateTicker() {
    const [rates, setRates] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    const fetchRates = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:4000/exchange-rate/live");
            if (res.ok) {
                const data = await res.json();
                setRates(data);
            }
        } catch (error) {
            console.error("Kur çekme hatası:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 10 * 60 * 1000); 
        return () => clearInterval(interval);
    }, [fetchRates]);

    // Göstermek istediğimiz ana kurlar (USD, EUR, Gram Altın)
    const displayedRates = ['USD', 'EUR', 'GBP', 'gold_gram'].map(key => ({
        key,
        value: rates[key] || rates[key.toUpperCase()] || 0,
        ...ASSET_DISPLAY_MAP[key.toUpperCase() === 'GOLD_GRAM' ? 'GOLD_GRAM' : key.toUpperCase()]
    }));


    if (loading) {
        return <div className="p-4 text-xs text-slate-500 text-center">Canlı kurlar yükleniyor...</div>;
    }

    return (
        <div className="flex justify-around items-center p-3 bg-white border-t border-slate-200">
            {displayedRates.map((rate, index) => {
                const Icon = rate.Icon; // Büyük harfle Icon
                const TrendIcon = index % 2 === 0 ? TrendingUp : TrendingDown; // <-- Düzeltme: Büyük harfle başladı
                const decimals = rate.key.includes('GOLD') || rate.key.includes('USD') ? 2 : 4; // Döviz için 4, altın/TL için 2 ondalık

                return (
                    <div key={rate.key} className="flex flex-col items-center">
                        <div className="flex items-center gap-1 text-xs font-semibold">
                            <Icon size={14} className={rate.color} />
                            <span className={rate.color}>{rate.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-slate-900 mt-0.5">
                            {/* DÜZELTME: İki argümanlı formatCurrency'yi çağırıyoruz */}
                            {formatCurrency(rate.value, decimals)} 
                            <TrendIcon size={12} className={index % 3 === 0 ? 'text-green-500' : 'text-red-500'} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}