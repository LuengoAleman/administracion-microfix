import { useState } from "react"
import { AutoInput } from "../components/common/AutoInput.jsx"
import { Empty } from "../components/common/Empty.jsx"
import { FieldGroup } from "../components/common/FieldGroup.jsx"
import { CATS_STOCK } from "../config/catalogs.js"
import { filterStock, isLowStock, stockValue } from "../logic/stock.js"
import { deleteStockItem, saveStockItem, updateStockQuantity } from "../services/stockService.js"
import { C, cardStyle, dangerButtonStyle, ghostButtonStyle, inputStyle, primaryButtonStyle } from "../styles/theme.js"
import { fmtMoney } from "../utils/formatters.js"

export function StockPage({stock,setStock,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",categoria:"",cantidad:0,minimo:2,costo_unitario:0,proveedor:""})
  const [search,setSearch]=useState("")
  const [saving,setSaving]=useState(false)
  const nombres=[...new Set(stock.map(s=>s.nombre).filter(Boolean))]
  async function save(){
    if(!form.nombre){toast("Nombre requerido","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,categoria:form.categoria,cantidad:Number(form.cantidad),minimo:Number(form.minimo),costo_unitario:Number(form.costo_unitario),proveedor:form.proveedor}
    if(form.id){const{data}=await saveStockItem(payload,form.id);if(data)setStock(ss=>ss.map(s=>s.id===form.id?data:s))}
    else{const{data}=await saveStockItem(payload);if(data)setStock(ss=>[data,...ss])}
    setSaving(false);setShow(false);toast("Guardado")
  }
  async function ajustar(id,delta){
    const item=stock.find(s=>s.id===id)
    if(!item)return
    const nueva=Math.max(0,(item.cantidad||0)+delta)
    const{data}=await updateStockQuantity(id,nueva)
    if(data)setStock(ss=>ss.map(s=>s.id===id?data:s))
  }
  async function del(id){
    if(!confirm("Eliminar?"))return
    await deleteStockItem(id)
    setStock(ss=>ss.filter(s=>s.id!==id));toast("Eliminado","warn")
  }
  const filtered=filterStock(stock,search)
  const bajo=stock.filter(isLowStock)
  const valorTotal=stockValue(stock)
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>📦 Stock</div><div style={{fontSize:12,color:C.muted}}>{stock.length} ítems · Valor: {fmtMoney(valorTotal)}</div></div>
        <button style={primaryButtonStyle} onClick={()=>{setForm({id:"",nombre:"",categoria:"",cantidad:0,minimo:2,costo_unitario:0,proveedor:""});setShow(true)}}>+ Agregar ítem</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inputStyle,maxWidth:280,marginBottom:16}}/>
      {bajo.length>0&&<div style={{background:"rgba(255,179,71,.08)",border:"1px solid rgba(255,179,71,.3)",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
        <div style={{fontWeight:700,color:C.warn,marginBottom:8}}>⚠️ Stock bajo — {bajo.length} ítem(s)</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{bajo.map(s=><span key={s.id} style={{fontSize:12,background:"rgba(255,179,71,.12)",color:C.warn,padding:"4px 10px",borderRadius:20}}>{s.nombre} ({s.cantidad})</span>)}</div>
      </div>}
      {show&&(
        <div style={{...cardStyle,marginBottom:16,borderColor:C.accent}}>
          <div style={{fontWeight:700,marginBottom:14}}>Repuesto / insumo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Nombre"><AutoInput value={form.nombre} onChange={v=>setForm(p=>({...p,nombre:v}))} options={nombres} placeholder="ej. Pantalla iPhone 13"/></FieldGroup>
            <FieldGroup label="Categoría"><select value={form.categoria||""} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} style={inputStyle}><option value="">Seleccionar...</option>{CATS_STOCK.map(c=><option key={c}>{c}</option>)}</select></FieldGroup>
            <FieldGroup label="Cantidad"><input type="number" value={form.cantidad||0} onChange={e=>setForm(p=>({...p,cantidad:e.target.value}))} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Mínimo"><input type="number" value={form.minimo||2} onChange={e=>setForm(p=>({...p,minimo:e.target.value}))} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Costo unit. ($)"><input type="number" value={form.costo_unitario||0} onChange={e=>setForm(p=>({...p,costo_unitario:e.target.value}))} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Proveedor"><input value={form.proveedor||""} onChange={e=>setForm(p=>({...p,proveedor:e.target.value}))} style={inputStyle} placeholder="ej. MercadoLibre"/></FieldGroup>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={ghostButtonStyle} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={primaryButtonStyle} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      {filtered.length===0&&<Empty icon="📦" text="Sin ítems de stock"/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
        {filtered.map(s=>{
          const b=isLowStock(s)
          return(
            <div key={s.id} style={{...cardStyle,borderColor:b?"rgba(255,179,71,.4)":C.border}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{s.nombre}</div>{s.categoria&&<div style={{fontSize:11,color:C.muted}}>{s.categoria}</div>}</div>
                {b&&<span style={{fontSize:10,background:"rgba(255,179,71,.15)",color:C.warn,padding:"2px 7px",borderRadius:20}}>⚠️ Bajo</span>}
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
                {s.proveedor&&<div>Prov: {s.proveedor}</div>}
                <div>Unit: {fmtMoney(s.costo_unitario)} · Total: {fmtMoney((s.cantidad||0)*(s.costo_unitario||0))}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <button onClick={()=>ajustar(s.id,-1)} style={{...ghostButtonStyle,padding:"5px 14px",fontSize:18,flexShrink:0}}>−</button>
                <span style={{fontWeight:800,fontSize:24,color:b?C.warn:C.accent,flex:1,textAlign:"center"}}>{s.cantidad}</span>
                <button onClick={()=>ajustar(s.id,1)} style={{...ghostButtonStyle,padding:"5px 14px",fontSize:18,flexShrink:0}}>+</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button style={{...ghostButtonStyle,fontSize:11,padding:"5px 10px",flex:1}} onClick={()=>{setForm({...s});setShow(true)}}>✏️</button>
                <button style={{...dangerButtonStyle,fontSize:11,padding:"5px 10px"}} onClick={()=>del(s.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

}
