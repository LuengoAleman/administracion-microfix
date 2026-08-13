import { useState } from "react"
import { Empty } from "../components/common/Empty.jsx"
import { FieldGroup } from "../components/common/FieldGroup.jsx"
import { CATS_GASTO, ESTADO_COLOR } from "../config/catalogs.js"
import { getFinanceStats } from "../logic/finanzas.js"
import { deleteGasto, saveGasto as saveGastoRecord } from "../services/gastosService.js"
import { C, cardStyle, dangerButtonStyle, inputStyle, primaryButtonStyle, badgeStyle } from "../styles/theme.js"
import { fmtDate, fmtMoney, today } from "../utils/formatters.js"

export function Finanzas({reps,gastos,setGastos,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",concepto:"",monto:0,fecha:today(),categoria:"Repuesto"})
  const [mes,setMes]=useState(today().slice(0,7))
  const [saving,setSaving]=useState(false)
  const {mesReps,mesGas,ingresos,costoRep,totalGas,gananciaBruta:ganB,gananciaNeta:ganN}=getFinanceStats(reps,gastos,mes)
  async function saveGasto(){
    if(!form.concepto||!form.monto){toast("Completá concepto y monto","err");return}
    setSaving(true)
    const payload={user_id:uid,concepto:form.concepto,monto:Number(form.monto),fecha:form.fecha,categoria:form.categoria}
    if(form.id){const{data}=await saveGastoRecord(payload,form.id);if(data)setGastos(gs=>gs.map(g=>g.id===form.id?data:g))}
    else{const{data}=await saveGastoRecord(payload);if(data)setGastos(gs=>[data,...gs])}
    setSaving(false);setShow(false);toast("Gasto registrado")
  }
  async function delGasto(id){await deleteGasto(id);setGastos(gs=>gs.filter(g=>g.id!==id))}
  const KPI=(label,val,color,sub)=>(
    <div style={{...cardStyle,textAlign:"center",flex:1,minWidth:130}}>
      <div style={{fontSize:24,fontWeight:800,color,lineHeight:1}}>{fmtMoney(val)}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase",letterSpacing:".5px"}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>}
    </div>
  )
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>💰 Finanzas</div></div>
        <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{...inputStyle,width:"auto",padding:"7px 12px"}}/>
        <button style={primaryButtonStyle} onClick={()=>{setForm({id:"",concepto:"",monto:0,fecha:today(),categoria:"Repuesto"});setShow(true)}}>+ Gasto</button>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {KPI("Ingresos cobrados",ingresos,"#00e5b4",`${mesReps.filter(r=>r.estado==="Entregado").length} entregas`)}
        {KPI("Costo repuestos",costoRep,C.warn)}
        {KPI("Otros gastos",totalGas,C.danger,`${mesGas.length} ítems`)}
        {KPI("Ganancia bruta",ganB,ganB>=0?"#00e5b4":C.danger)}
        {KPI("Ganancia neta",ganN,ganN>=0?"#00e5b4":C.danger,"Total real")}
      </div>
      {show&&(
        <div style={{...cardStyle,marginBottom:16,borderColor:C.accent2}}>
          <div style={{fontWeight:700,marginBottom:14}}>Registrar gasto</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            <FieldGroup label="Concepto"><input value={form.concepto} onChange={e=>setForm(p=>({...p,concepto:e.target.value}))} style={inputStyle} placeholder="ej. Pantalla iPhone OLED"/></FieldGroup>
            <FieldGroup label="Monto ($)"><input type="number" value={form.monto||0} onChange={e=>setForm(p=>({...p,monto:e.target.value}))} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Fecha"><input type="date" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Categoría"><select value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} style={inputStyle}>{CATS_GASTO.map(c=><option key={c}>{c}</option>)}</select></FieldGroup>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button style={ghostButtonStyle} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={{background:C.accent2,color:"#0b0e14",border:"none",borderRadius:7,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={cardStyle}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Reparaciones del mes</div>
          {mesReps.length===0&&<Empty icon="📋" text="Sin reparaciones este mes"/>}
          {mesReps.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span style={badgeStyle(ESTADO_COLOR[r.estado]||{})}>{r.estado}</span>
              <div style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.cliente_nombre} · {r.marca} {r.modelo}</div>
              <div style={{color:"#00e5b4",fontWeight:700,flexShrink:0}}>{fmtMoney(r.precio_total)}</div>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Gastos del mes</div>
          {mesGas.length===0&&<Empty icon="💸" text="Sin gastos este mes"/>}
          {mesGas.map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <div style={{flex:1}}><div style={{fontWeight:600}}>{g.concepto}</div><div style={{color:C.muted}}>{g.categoria} · {fmtDate(g.fecha)}</div></div>
              <div style={{color:C.danger,fontWeight:700,flexShrink:0}}>{fmtMoney(g.monto)}</div>
              <button style={{...dangerButtonStyle,fontSize:10,padding:"3px 8px"}} onClick={()=>delGasto(g.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
