"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";
import { useState, useEffect } from "react";

interface BudgetFilterDialogProps {
  budgets: any[];
  visibleIds: string[];
  onSave: (ids: string[]) => void;
}

export default function BudgetFilterDialog({ budgets, visibleIds, onSave }: BudgetFilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pencere açılınca mevcut seçimleri yükle
  useEffect(() => {
    if (open) {
      setSelectedIds(visibleIds);
    }
  }, [open, visibleIds]);

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Tetikleyici Buton (Filtre İkonu) */}
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="h-6 w-6 text-slate-400 hover:text-blue-600">
        <Filter size={16} />
      </Button>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Görünecek Hedefleri Seç</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4 max-h-[300px] overflow-y-auto">
          {budgets.length === 0 ? (
            <p className="text-sm text-slate-500 text-center">Henüz bütçe hedefi yok.</p>
          ) : (
            budgets.map((b) => (
              <div key={b.id} className="flex items-center space-x-3 border-b pb-2 last:border-0">
                <Checkbox 
                  id={`filter-${b.id}`} 
                  checked={selectedIds.includes(b.id)}
                  onCheckedChange={(checked) => handleToggle(b.id, checked as boolean)}
                />
                <Label htmlFor={`filter-${b.id}`} className="text-sm font-medium cursor-pointer flex-1">
                  {b.categoryName}
                </Label>
                <span className="text-xs text-slate-400">{b.limit}₺ Limit</span>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button type="submit" onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800">
            Görünümü Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}