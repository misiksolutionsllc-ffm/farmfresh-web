'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { cn } from '@/lib/utils';
import { Settings, DollarSign, Truck, Percent, Shield, AlertTriangle, ToggleLeft, ToggleRight, Database, Trash2, Users, Package, TrendingUp, Plus, Check, X, FileText, Zap, Crown, Lock } from 'lucide-react';
function fmt(n:number){return`$${n.toFixed(2)}`}

export function PlatformSettings() {
  const { db, dispatch } = useAppStore();
  const s = db.settings;
  const [saved, setSaved] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDisc, setNewDisc] = useState('');
  const [newType, setNewType] = useState<'percent'|'flat'|'free_delivery'>('percent');
  const [showAdd, setShowAdd] = useState(false);
  const [showNuke, setShowNuke] = useState(false);

  const save = (key: keyof typeof s, value: number|boolean) => { dispatch({type:'UPDATE_SETTING',key,value}); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  return (
    <div className="space-y-6 max-w-4xl">
      {saved && <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-fade-in"><Check className="w-4 h-4 text-emerald-400"/><span className="text-sm text-emerald-400 font-medium">Saved</span></div>}

      {/* Maintenance */}
      <div className={cn('p-6 rounded-2xl border transition-all', s.maintenanceMode?'bg-red-500/[0.04] border-red-500/20':'bg-white/[0.02] border-white/[0.06]')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center',s.maintenanceMode?'bg-red-500/15':'bg-white/[0.04]')}><AlertTriangle className={cn('w-6 h-6',s.maintenanceMode?'text-red-400 animate-pulse':'text-slate-500')}/></div>
            <div><h3 className="font-bold text-white text-lg">Maintenance Mode</h3><p className="text-sm text-slate-500">Lock platform for all users</p></div>
          </div>
          <button onClick={()=>save('maintenanceMode',!s.maintenanceMode)} className="p-2 hover:bg-white/5 rounded-xl">{s.maintenanceMode?<ToggleRight className="w-12 h-7 text-red-400"/>:<ToggleLeft className="w-12 h-7 text-slate-600"/>}</button>
        </div>
        {s.maintenanceMode && <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/10"><p className="text-xs text-red-400 font-mono">⚠️ PLATFORM LOCKED</p></div>}
      </div>

      {/* Fees */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-400"/></div><div><h3 className="font-bold text-white text-lg">Fee Configuration</h3><p className="text-sm text-slate-500">Changes apply to new orders</p></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Slider label="Platform Fee" desc="% of order subtotal" value={s.platformFeePercent} min={0} max={100} step={0.5} display={`${s.platformFeePercent}%`} color="#10B981" onChange={v=>save('platformFeePercent',v)} example={`$50 order → ${fmt(50*s.platformFeePercent/100)} fee`}/>
          <Slider label="Delivery Base Fee" desc="Flat fee per delivery" value={s.deliveryBaseFee} min={0} max={20} step={0.49} display={fmt(s.deliveryBaseFee)} color="#3B82F6" onChange={v=>save('deliveryBaseFee',v)} example="Charged once per order"/>
          <Slider label="Tax Rate" desc="Sales tax %" value={s.taxRate*100} min={0} max={15} step={0.25} display={`${(s.taxRate*100).toFixed(2)}%`} color="#F59E0B" onChange={v=>save('taxRate',v/100)} example={`$50 order → ${fmt(50*s.taxRate)} tax`}/>
          <Slider label="Membership Price" desc="Monthly consumer sub" value={s.membershipPrice} min={0} max={500} step={1} display={`${fmt(s.membershipPrice)}/mo`} color="#8B5CF6" onChange={v=>save('membershipPrice',v)} example="Premium = free delivery + discounts"/>
        </div>
        {/* Preview */}
        <div className="mt-6 p-4 bg-surface-900/50 rounded-xl border border-white/[0.04]">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Revenue Preview — $50 Order</div>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[['$50.00','Subtotal','text-white'],[fmt(50*s.platformFeePercent/100),`Fee (${s.platformFeePercent}%)`,'text-emerald-400'],[fmt(s.deliveryBaseFee),'Delivery','text-blue-400'],[fmt(50*s.taxRate),`Tax (${(s.taxRate*100).toFixed(1)}%)`,'text-amber-400']].map(([v,l,c])=>(
              <div key={l as string}><div className={cn('text-lg font-bold font-mono',c)}>{v}</div><div className="text-[10px] text-slate-600">{l}</div></div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between"><span className="text-sm text-slate-400">Customer pays</span><span className="text-xl font-bold text-white font-mono">{fmt(50+50*s.platformFeePercent/100+s.deliveryBaseFee+50*s.taxRate)}</span></div>
        </div>
      </div>

      {/* Promos */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Zap className="w-5 h-5 text-violet-400"/></div><div><h3 className="font-bold text-white text-lg">Promo Codes</h3><p className="text-sm text-slate-500">{db.promos.filter(p=>p.active).length} active</p></div></div>
          <button onClick={()=>setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400 text-sm font-medium hover:bg-violet-500/15"><Plus className="w-4 h-4"/>Add</button>
        </div>
        {showAdd && <div className="mb-5 p-4 bg-surface-900/50 rounded-xl border border-white/[0.04] space-y-3 animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            <input value={newCode} onChange={e=>setNewCode(e.target.value.toUpperCase())} placeholder="CODE" className="px-3 py-2.5 bg-[#0a0f1e] border border-white/[0.06] rounded-xl text-white text-sm font-mono uppercase focus:outline-none focus:border-violet-500/30"/>
            <input value={newDisc} onChange={e=>setNewDisc(e.target.value)} placeholder="Amount" type="number" className="px-3 py-2.5 bg-[#0a0f1e] border border-white/[0.06] rounded-xl text-white text-sm font-mono focus:outline-none"/>
            <select value={newType} onChange={e=>setNewType(e.target.value as any)} className="px-3 py-2.5 bg-[#0a0f1e] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none"><option value="percent">% Off</option><option value="flat">$ Off</option><option value="free_delivery">Free Delivery</option></select>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>{if(newCode&&newDisc){dispatch({type:'ADD_PROMO',payload:{code:newCode.replace(/\s/g,''),discount:parseFloat(newDisc)||0,type:newType,label:newType==='percent'?`${newDisc}% Off`:newType==='flat'?`$${newDisc} Off`:'Free Delivery',active:true}});setNewCode('');setNewDisc('');setShowAdd(false)}}} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold">Create</button>
            <button onClick={()=>setShowAdd(false)} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 text-sm">Cancel</button>
          </div>
        </div>}
        <div className="space-y-2">
          {db.promos.length===0?<p className="text-center py-8 text-slate-500 text-sm">No promo codes</p>:db.promos.map(p=>(
            <div key={p.code} className="flex items-center justify-between p-3 rounded-xl bg-surface-900/30 border border-white/[0.03] hover:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 font-mono font-bold text-sm text-violet-400">{p.code}</span>
                <div><div className="text-sm text-white">{p.label}</div><div className="text-xs text-slate-500">{p.usedCount} uses{p.minOrder?` • Min $${p.minOrder}`:''}</div></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-full',p.active?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400')}>{p.active?'Active':'Off'}</span>
                <button onClick={()=>dispatch({type:'UPDATE_PROMO',code:p.code,updates:{active:!p.active}})} className="p-1.5 rounded-lg hover:bg-white/5">
                  {p.active?<ToggleRight className="w-5 h-5 text-emerald-400"/>:<ToggleLeft className="w-5 h-5 text-slate-600"/>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center"><Crown className="w-5 h-5 text-orange-400"/></div><div><h3 className="font-bold text-white text-lg">Farmer Subscription Plans</h3></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {db.subscriptionPlans.map(p=>(
            <div key={p.id} className={cn('p-4 rounded-xl border',p.popular?'bg-orange-500/[0.04] border-orange-500/20':'bg-surface-900/30 border-white/[0.04]')}>
              {p.popular&&<div className="text-[9px] font-bold text-orange-400 uppercase mb-2">Most Popular</div>}
              <h4 className="font-bold text-white">{p.name}</h4>
              <div className="flex items-baseline gap-1 mt-1"><span className="text-2xl font-bold text-white">{p.monthlyPrice===0?'Free':`$${p.monthlyPrice}`}</span>{p.monthlyPrice>0&&<span className="text-xs text-slate-500">/mo</span>}</div>
              {p.yearlyPrice>0&&<div className="text-xs text-emerald-400 mt-1">${p.yearlyPrice}/yr (save {Math.round((1-p.yearlyPrice/(p.monthlyPrice*12))*100)}%)</div>}
              <div className="mt-3 space-y-1">{p.features.slice(0,4).map(f=><div key={f} className="flex items-center gap-1.5 text-xs text-slate-400"><Check className="w-3 h-3 text-emerald-400 flex-shrink-0"/>{f}</div>)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Database className="w-5 h-5 text-red-400"/></div><div><h3 className="font-bold text-white text-lg">Platform Data</h3></div></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[{l:'Users',v:db.users.length,c:'#3B82F6',I:Users},{l:'Products',v:db.products.length,c:'#EA580C',I:Package},{l:'Orders',v:db.orders.length,c:'#10B981',I:TrendingUp},{l:'Reviews',v:db.reviews.length,c:'#F59E0B',I:FileText}].map(x=>{const I=x.I;return(
            <div key={x.l} className="p-3 rounded-xl bg-surface-900/30 border border-white/[0.04] text-center"><I className="w-4 h-4 mx-auto mb-1" style={{color:x.c}}/><div className="text-xl font-bold text-white font-mono">{x.v}</div><div className="text-[10px] text-slate-600">{x.l}</div></div>
          )})}
        </div>
        {showNuke?<div className="p-4 bg-red-500/[0.04] border border-red-500/20 rounded-xl animate-fade-in"><p className="text-sm text-red-400 font-bold mb-2">⚠️ Delete ALL orders, deliveries, transactions, reviews?</p><div className="flex gap-2"><button onClick={()=>{dispatch({type:'NUKE_DATA'});setShowNuke(false)}} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold">Confirm</button><button onClick={()=>setShowNuke(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-slate-400 text-sm">Cancel</button></div></div>
        :<button onClick={()=>setShowNuke(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5 w-full"><Trash2 className="w-4 h-4"/>Reset Data</button>}
      </div>
      <p className="text-center pb-8 text-[10px] text-slate-700">MISIKSOLUTIONS LLC • Mission Control v2.0</p>
    </div>
  );
}

function Slider({label,desc,value,min,max,step,display,color,onChange,example}:{label:string;desc:string;value:number;min:number;max:number;step:number;display:string;color:string;onChange:(v:number)=>void;example:string}) {
  return (
    <div className="p-4 bg-surface-900/30 rounded-xl border border-white/[0.04]">
      <span className="font-semibold text-white text-sm">{label}</span>
      <p className="text-xs text-slate-500 mb-3">{desc}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-600">{min}</span>
        <span className="text-2xl font-bold font-mono" style={{color}}>{display}</span>
        <span className="text-xs text-slate-600">{max}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{background:`linear-gradient(to right,${color} 0%,${color} ${((value-min)/(max-min))*100}%,rgba(255,255,255,0.05) ${((value-min)/(max-min))*100}%,rgba(255,255,255,0.05) 100%)`}}/>
      <p className="text-[10px] text-slate-600 mt-2">{example}</p>
    </div>
  );
}
