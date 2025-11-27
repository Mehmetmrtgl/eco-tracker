"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Wallet, Plus, CreditCard, Trash2, Edit2, CalendarClock, Zap, Calendar, Landmark, Building2, Settings as SettingsIcon } from "lucide-react";
import { BANK_OPTIONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import EditCardDialog from "@/components/forms/EditCardDialog"; 
import AddCardDialog from "@/components/forms/AddCardDialog";
import AddAccountDialog from "@/components/forms/AddAccountDialog";


export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  
  // STATE'LER
  const [resetDay, setResetDay] = useState("1");
  const [salaryDay, setSalaryDay] = useState("1");
  const [salaryAmount, setSalaryAmount] = useState("");

  const [cards, setCards] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [selectedCardToEdit, setSelectedCardToEdit] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
      
      setResetDay(user.reset_day ? String(user.reset_day) : "1");
      setSalaryDay(user.salary_day ? String(user.salary_day) : "1");
      setSalaryAmount(user.salary_amount ? String(user.salary_amount) : "");

      fetchCards(user.id);
      fetchAccounts(user.id);
    }
  }, []);

  const fetchCards = async (uid: string) => {
    try {
      const res = await fetch(`http://localhost:4000/credit-cards/${uid}`);
      if (res.ok) setCards(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchAccounts = async (uid: string) => {
    try {
      const res = await fetch(`http://localhost:4000/accounts/${uid}`);
      if (res.ok) setAccounts(await res.json());
    } catch (error) { console.error(error); }
  };

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            reset_day: Number(resetDay),
            salary_day: Number(salaryDay),
            salary_amount: Number(salaryAmount)
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
            const userObj = JSON.parse(storedUser);
            userObj.reset_day = updatedUser.reset_day;
            userObj.salary_day = updatedUser.salary_day;
            userObj.salary_amount = updatedUser.salary_amount;
            localStorage.setItem("currentUser", JSON.stringify(userObj));
        }
        alert("Ayarlar kaydedildi.");
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleDeleteCard = async (cardId: string) => {
    if(!confirm("Bu kartı silmek istediğine emin misin?")) return;
    try {
        const res = await fetch(`http://localhost:4000/credit-cards/${cardId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }) 
        });
        if (res.ok) fetchCards(userId);
    } catch (error) { console.error(error); }
  };

  const handleDeleteAccount = async (id: string) => {
    if(!confirm("Hesabı silmek istediğine emin misin?")) return;
    try {
        const res = await fetch(`http://localhost:4000/accounts/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }) 
        });
        if(res.ok) fetchAccounts(userId);
    } catch (error) { console.error(error); }
  };

  const handleTriggerSalary = async () => {
    if (!confirm("Bu ayki maaş tutarı eklenecek. Onaylıyor musun?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}/trigger-salary`, { method: "POST" });
      if (res.ok) alert("Maaş eklendi!");
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleEditCard = (card: any) => {
      setSelectedCardToEdit(card);
      setIsEditOpen(true);
  };
  
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Ayarlar</h2>
        <p className="text-slate-500">Sistemi kişiselleştirin ve finansal araçlarınızı yönetin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* --- SOL KOLON: GENEL AYARLAR & OTOMASYON (5 Birim) --- */}
        <div className="lg:col-span-5">
            {/* TEK BİRLEŞİK KART - Sabit Yükseklik: 600px */}
            <Card className="border-slate-200 shadow-sm h-[600px] flex flex-col">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                        <SettingsIcon size={20} className="text-slate-500"/> Genel ve Otomasyon
                    </CardTitle>
                    <CardDescription>Tercihlerinizi ve otomatik işlemleri buradan yönetin.</CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-8 flex-1 overflow-y-auto">
                    
                    {/* BÖLÜM 1: MAAŞ OTOMASYONU */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                             <Label className="text-xs font-bold text-green-700 uppercase flex items-center gap-1"><Zap size={14}/> Maaş Otomasyonu</Label>
                             <Button variant="ghost" size="sm" onClick={handleTriggerSalary} className="h-6 text-[10px] text-green-600 hover:bg-green-50 hover:text-green-700">Şimdi Tetikle</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Yatış Günü</Label>
                                <Select value={salaryDay} onValueChange={setSalaryDay}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[200px]">{days.map((d) => <SelectItem key={d} value={String(d)}>{d}. Gün</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Tutar (Net)</Label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <Input type="number" value={salaryAmount} onChange={(e) => setSalaryAmount(e.target.value)} placeholder="0" className="pl-9 h-9"/>
                                </div>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">Belirlenen günde bu tutar otomatik olarak "Nakit Cüzdanı"na eklenir.</p>
                    </div>

                    {/* BÖLÜM 2: GENEL TERCİHLER */}
                    <div className="space-y-4">
                        <div className="pb-2 border-b border-slate-100">
                            <Label className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1"><Calendar size={14}/> Analiz Döngüsü</Label>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Sıfırlama Günü</Label>
                            <Select value={resetDay} onValueChange={setResetDay}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent className="max-h-[200px]">{days.map((d) => <SelectItem key={d} value={String(d)}>Her ayın {d}. günü</SelectItem>)}</SelectContent>
                            </Select>
                            <p className="text-[11px] text-slate-400 leading-tight">Analiz ve grafikler her ay bu güne göre hesaplanır.</p>
                        </div>
                    </div>

                </CardContent>
                
                <div className="p-6 border-t bg-slate-50/50 mt-auto">
                    <Button onClick={handleSaveGeneral} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800">
                        {loading ? <Loader2 className="animate-spin mr-2" size={16}/> : <Save className="mr-2" size={16}/>}
                        Tüm Ayarları Kaydet
                    </Button>
                </div>
            </Card>
        </div>

        {/* --- SAĞ KOLON: CÜZDAN YÖNETİMİ (7 Birim) --- */}
        <div className="lg:col-span-7">
            <Tabs defaultValue="cards" className="w-full h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-10">
                    <TabsTrigger value="cards">Kredi Kartları</TabsTrigger>
                    <TabsTrigger value="accounts">Vadesiz Hesaplar</TabsTrigger>
                </TabsList>

                {/* KARTLAR SEKME İÇERİĞİ - Sabit Yükseklik: 600px (Header+Tabs farkı düşünülerek ayarlandı) */}
                <TabsContent value="cards" className="mt-0">
                    <Card className="border-slate-200 shadow-sm flex flex-col h-[560px]"> 
                        <CardHeader className="pb-4 border-b bg-white">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="text-purple-600" size={20}/> Kart Yönetimi</CardTitle>
                                <Button size="sm" onClick={() => setIsAddCardOpen(true)} className="h-8 bg-purple-600 hover:bg-purple-700 gap-1 text-xs"><Plus size={14}/> Yeni Ekle</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                            <div className="p-5 space-y-3">
                                {cards.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-lg bg-white">
                                        <Landmark size={40} className="mx-auto mb-2 opacity-20"/>
                                        <p className="text-sm">Henüz kart eklenmemiş.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                        {cards.map((c) => (
                                            <div key={c.id} className="relative group rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all p-4 bg-white">
                                                <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><Landmark size={60} /></div>
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shadow-sm"><CreditCard size={16} /></div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.bank_name}</p>
                                                                <h3 className="font-bold text-slate-800 text-sm">{c.alias}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditCard(c)} className="h-6 w-6 text-slate-400 hover:text-blue-600"><Edit2 size={12}/></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCard(c.id)} className="h-6 w-6 text-slate-400 hover:text-red-600"><Trash2 size={12}/></Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end border-t border-slate-100 pt-2 mt-2">
                                                        <span className="text-sm font-bold text-slate-700">{formatCurrency(Number(c.total_limit))}</span>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                            <span>Kesim: <b>{c.cutoff_day}</b></span>
                                                            <span>S.Öd: <b>{c.due_day}</b></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* HESAPLAR SEKME İÇERİĞİ */}
                {/* HESAPLAR SEKME İÇERİĞİ (Sadece Banka Hesapları) */}
                <TabsContent value="accounts" className="mt-0">
                    <Card className="border-slate-200 shadow-sm flex flex-col h-[560px]">
                        <CardHeader className="pb-4 border-b bg-white">
                             <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-lg"><Building2 className="text-blue-600" size={20}/> Vadesiz Hesaplar</CardTitle>
                                <Button size="sm" onClick={() => setIsAddAccountOpen(true)} className="h-8 bg-blue-600 hover:bg-blue-700 gap-1 text-xs"><Plus size={14}/> Hesap Ekle</Button>
                             </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar">
                            <div className="p-5 space-y-3">
                                {/* Elden Nakit/Cüzdanım hariç diğer hesapları filtrele */}
                                {accounts.filter(acc => acc.name !== 'Elden Nakit' && acc.name !== 'Cüzdanım').length === 0 ? (
                                    <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-lg bg-white">
                                        <Wallet size={40} className="mx-auto mb-2 opacity-20"/>
                                        <p className="text-sm">Henüz bir banka hesabı eklenmemiş.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-1">
                                        {accounts
                                            .filter(acc => acc.name !== 'Elden Nakit' && acc.name !== 'Cüzdanım')
                                            .map((acc) => (
                                            <div key={acc.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Building2 size={20} /></div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800">{acc.name}</h3>
                                                        <p className="text-xs text-slate-500">Vadesiz TL Hesabı</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-slate-900">{formatCurrency(Number(acc.balance))}</span>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(acc.id)} className="h-8 w-8 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50"><Trash2 size={16}/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
      </div>

      {/* DIALOGLAR */}
      <AddCardDialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen} userId={userId} onSuccess={() => fetchCards(userId)} />
      <AddAccountDialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen} userId={userId} onSuccess={() => fetchAccounts(userId)} />
      <EditCardDialog open={isEditOpen} onOpenChange={setIsEditOpen} card={selectedCardToEdit} onSuccess={() => fetchCards(userId)} />
    </div>
  );
}