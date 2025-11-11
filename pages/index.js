import React, { useState, useEffect } from 'react';
import { COUNTRIES } from '../data/countries';

function currencyFor(name){ const m={'India':'₹','Germany':'€','United States':'$','United Kingdom':'£','Canada':'$','Japan':'¥','United Arab Emirates':'د.إ'}; return m[name]||'$'; }
function code(name){ const m={'India':'IN','Germany':'DE','United States':'US','United Kingdom':'GB','Canada':'CA','Japan':'JP','United Arab Emirates':'AE'}; return m[name]||'IN'; }
function estCosts(x){ const i=x?.cost_index||100; const r=x?.rent_index||100; return {rent:Math.round(900*(r/100)),food:Math.round(280*(i/100)),transport:Math.round(55*(i/100)),utilities:Math.round(70*(i/100)),internet:30,healthcare:45,insurance:22,entertainment:85,misc:65}; }
function estTax(country,annual){ const t={'India':0.15,'Germany':0.25,'United States':0.18,'United Kingdom':0.2,'Canada':0.18,'United Arab Emirates':0}; return Math.round(annual*(t[country]??0.2)); }

export default function Home(){
  const [mode,setMode]=useState('work');
  const [from,setFrom]=useState('India');
  const [to,setTo]=useState('Germany');
  const [salary,setSalary]=useState(1000000);
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{run();},[]);
  async function run(){
    setLoading(true);
    try{
      const [f,t,fx]=await Promise.all([
        fetch(`/api/costs?country=${encodeURIComponent(from)}`).then(r=>r.json()),
        fetch(`/api/costs?country=${encodeURIComponent(to)}`).then(r=>r.json()),
        fetch(`/api/exchange?from=${code(from)}&to=${code(to)}`).then(r=>r.json())
      ]);
      const costsFrom=estCosts(f), costsTo=estCosts(t);
      const taxFrom=estTax(from,salary);
      const ppp=Number((f.cost_index/Math.max(1,t.cost_index)).toFixed(2));
      const totalMonthlyFrom=Object.values(costsFrom).reduce((a,b)=>a+b,0)+Math.round(taxFrom/12);
      const netMonthlyFrom=Math.round((salary-taxFrom)/12);
      const disposable=netMonthlyFrom-(totalMonthlyFrom-Math.round(taxFrom/12));
      setData({fx:fx.rate,ppp,costsFrom,costsTo,taxFrom,totalMonthlyFrom,netMonthlyFrom,disposable});
    } finally{ setLoading(false); }
  }

  return (
    <div className="container">
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(180deg,#F3D389,#D1A954)',display:'grid',placeItems:'center',color:'#111',fontWeight:900}}>W</div>
          <div><div style={{fontWeight:800}}>WorldWorth</div><div style={{fontSize:12,opacity:.7}}>Your money, globally</div></div>
        </div>
        <nav style={{display:'flex',gap:12}}><a className="btn" href="/compare/india-vs-germany">Compare</a><a className="btn" href="/contact">Contact</a></nav>
      </header>

      <section className="card" style={{marginTop:18,padding:22}}>
        <h1 style={{fontSize:40,margin:0}}>Know your <span className="gtext">real salary power</span> — anywhere.</h1>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
          {['work','tourist','study','immigration','remote','investment','currency'].map(m=>(
            <button key={m} className={`pill ${mode===m?'active':''}`} onClick={()=>setMode(m)}>{m}</button>
          ))}
        </div>
      </section>

      <section className="card golden" style={{marginTop:18,padding:16}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <select value={from} onChange={e=>setFrom(e.target.value)} className="card" style={{padding:'10px 12px'}}>
            {COUNTRIES.map(c=><option key={c.code} value={c.name}>{c.emoji} {c.name}</option>)}
          </select>
          <span style={{opacity:.6}}>→</span>
          <select value={to} onChange={e=>setTo(e.target.value)} className="card" style={{padding:'10px 12px'}}>
            {COUNTRIES.map(c=><option key={c.code} value={c.name}>{c.emoji} {c.name}</option>)}
          </select>
          <input type="number" value={salary} onChange={e=>setSalary(Number(e.target.value||0))} className="card" style={{padding:'10px 12px'}}/>
          <button className="btn gold" onClick={run}>Recalculate</button>
        </div>

        {loading && <div style={{marginTop:12,opacity:.7}}>Calculating…</div>}

        {data && (<div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginTop:14}}>
          <div className="kpi card"><div className="label">PPP Multiplier</div><div className="value gtext">{data.ppp}×</div></div>
          <div className="kpi card"><div className="label">Net Monthly (From)</div><div className="value">₹{data.netMonthlyFrom.toLocaleString()}</div></div>
          <div className="kpi card"><div className="label">Disposable (From)</div><div className="value" style={{color:'var(--success)'}}>₹{data.disposable.toLocaleString()}</div></div>
        </div>)}

        {data && (<div className="grid" style={{gridTemplateColumns:'1fr 1fr',marginTop:14}}>
          <div className="card" style={{padding:12}}>
            <h4 style={{margin:0}}>{from} monthly</h4>
            <Table rows={data.costsFrom} currency="₹" tax={Math.round(data.taxFrom/12)} total={data.totalMonthlyFrom}/>
          </div>
          <div className="card" style={{padding:12}}>
            <h4 style={{margin:0}}>{to} monthly</h4>
            <Table rows={data.costsTo} currency={currencyFor(to)} tax={Math.round(estTax(to, salary)/12)} total={Object.values(data.costsTo).reduce((a,b)=>a+b,0)+Math.round(estTax(to,salary)/12)}/>
          </div>
        </div>)}
      </section>
    </div>
  );
}
function Table({rows,currency,tax,total}){ const e=Object.entries(rows); return (
  <table><tbody>
    {e.map(([k,v])=><tr key={k}><td style={{opacity:.75}}>{k[0].toUpperCase()+k.slice(1)}</td><td style={{textAlign:'right',fontWeight:700}}>{currency}{Number(v).toLocaleString()}</td></tr>)}
    <tr><td>Taxes (monthly eq.)</td><td style={{textAlign:'right',fontWeight:700}}>{currency}{tax.toLocaleString()}</td></tr>
    <tr><td><strong>Total monthly</strong></td><td style={{textAlign:'right',fontWeight:800}}>{currency}{total.toLocaleString()}</td></tr>
  </tbody></table>
);}
