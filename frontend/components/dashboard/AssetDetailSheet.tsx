import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"; // Button import
import { formatCurrency } from "@/lib/formatters";
import { useEffect, useState } from "react";
import { Loader2, Plus, Minus } from "lucide-react";
import AssetActionDialog from "@/components/forms/AssetActionDialog"; // YENİ
import { Asset } from "@/types"; // Asset tipi lazım

interface AssetDetailSheetProps {
  asset: Asset | null; // Sadece ID değil, tüm asset objesini alalım ki ismini bilelim
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void; // İşlem bitince ana sayfayı yenilemek için
}

export default function AssetDetailSheet({ asset, userId, open, onOpenChange, onUpdate }: AssetDetailSheetProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // İşlem Dialogu için State'ler
  const [actionOpen, setActionOpen] = useState(false);
  const [actionMode, setActionMode] = useState<"BUY" | "SELL">("BUY");

  // Geçmişi Getir
  const fetchHistory = () => {
    if (open && asset && userId) {
      setLoading(true);
      fetch(`http://localhost:4000/assets/${userId}/${asset.id}/history`)
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [open, asset, userId]);

  // İşlem butonuna basılınca
  const handleAction = (mode: "BUY" | "SELL") => {
    setActionMode(mode);
    setActionOpen(true);
  };

  // İşlem başarılı olunca
  const handleSuccess = () => {
    fetchHistory(); // Tabloyu yenile
    onUpdate();     // Ana sayfadaki kartı yenile (Miktar değişti çünkü)
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[500px] flex flex-col h-full">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">{asset?.name}</SheetTitle>
            <SheetDescription>{asset?.quantity} Adet mevcut</SheetDescription>
            
            {/* --- ALIM SATIM BUTONLARI --- */}
            <div className="flex gap-3 mt-4 pb-4 border-b">
              <Button className="flex-1 bg-green-600 hover:bg-green-700 gap-2" onClick={() => handleAction("BUY")}>
                <Plus size={18} /> Ekle (Al)
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 gap-2" onClick={() => handleAction("SELL")}>
                <Minus size={18} /> Satış Yap
              </Button>
            </div>
            {/* --------------------------- */}
          </SheetHeader>

          {/* Geçmiş Tablosu (Scroll edilebilir alan) */}
          <div className="flex-1 overflow-y-auto mt-4">
            <h4 className="text-sm font-semibold mb-3 text-slate-500">İşlem Geçmişi</h4>
            {loading ? (
               <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : history.length === 0 ? (
              <p className="text-center text-slate-500 text-sm">Henüz işlem geçmişi yok.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>İşlem</TableHead>
                    <TableHead>Adet</TableHead>
                    <TableHead className="text-right">Fiyat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(h.transaction_date).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                          h.type === 'BUY' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {h.type === 'BUY' ? 'ALIM' : 'SATIM'}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{Number(h.quantity)}</TableCell>
                      <TableCell className="text-right text-slate-600">{formatCurrency(Number(h.price_per_unit))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* --- İŞLEM PENCERESİ --- */}
      <AssetActionDialog 
        open={actionOpen} 
        onOpenChange={setActionOpen}
        asset={asset}
        mode={actionMode}
        onSuccess={handleSuccess}
      />
    </>
  );
}