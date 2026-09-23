import { useState } from "react"
import { AutoInput } from "../components/common/AutoInput.jsx"
import { Empty } from "../components/common/Empty.jsx"
import { FieldGroup } from "../components/common/FieldGroup.jsx"
import { ESTADOS, ESTADO_COLOR } from "../config/catalogs.js"
import { EMPTY_REPARACION, filterRepairs, nextOrderNumber, updateRepairForm } from "../logic/reparaciones.js"
import { createCliente } from "../services/clientesService.js"
import { deleteReparacion, saveReparacion, updateEstado } from "../services/reparacionesService.js"
import { C, cardStyle, dangerButtonStyle, ghostButtonStyle, inputStyle, primaryButtonStyle, badgeStyle } from "../styles/theme.js"
import { fmtDate, fmtMoney, mailLink, today, waLink } from "../utils/formatters.js"

export function Reparaciones({reps,setReps,clients,setClients,ops,clientNames,clientPhones,deviceModels,deviceBrands,repTypes,toast,uid}){
  const empty={...EMPTY_REPARACION,fecha:today()}
  const [form,setForm]=useState(empty)
  const [editId,setEditId]=useState(null)
  const [show,setShow]=useState(false)
  const [filterE,setFE]=useState("Todos")
  const [search,setSearch]=useState("")
  const [saving,setSaving]=useState(false)
  const nextNro=()=>nextOrderNumber(reps.length)
  function openNew(){setForm({...empty,nro_orden:nextNro(),fecha:today()});setEditId(null);setShow(true)}
  function openEdit(r){setForm({...r});setEditId(r.id);setShow(true)}
  function f(k,v){ setForm(current=>updateRepairForm(current,k,v,clients)) }
  async function save(){
    if(!form.cliente_nombre||!form.modelo||!form.tipo){toast("Completá cliente, modelo y tipo","err");return}
    setSaving(true)
    let cId=form.cliente_id
    const existing=clients.find(c=>c.nombre?.toLowerCase()===form.cliente_nombre.toLowerCase())
    if(!existing){
      const{data:nc}=await createCliente({user_id:uid,nombre:form.cliente_nombre,telefono:form.cliente_tel,email:form.cliente_email})
      if(nc){setClients(cs=>[nc,...cs]);cId=nc.id}
    }else{cId=existing.id}
    const payload={...form,user_id:uid,cliente_id:cId,costo_pieza:Number(form.costo_pieza),precio_mo:Number(form.precio_mo),precio_total:Number(form.precio_total)}
    if(editId){
      const{data}=await saveReparacion(payload,editId)
      if(data)setReps(rs=>rs.map(r=>r.id===editId?data:r))
    }else{
      const{data}=await saveReparacion(payload)
      if(data){
        setReps(rs=>[data,...rs])
        if(form.operario_id){
          const op=ops.find(o=>o.id===form.operario_id)
          if(op?.telefono)window.open(waLink(op.telefono,`Hola ${op.nombre}! Nueva tarea Microfix:\n${form.nro_orden} - ${form.cliente_nombre}\n${form.marca} ${form.modelo} - ${form.tipo}`),"_blank")
        }
      }
    }
    setSaving(false);setShow(false);toast(editId?"Orden actualizada":"Orden ingresada")
  }
  async function changeEstado(id,estado){
    const{data}=await updateEstado(id,estado)
    if(data){
      setReps(rs=>rs.map(r=>r.id===id?data:r))
      if(estado==="Listo"&&data.cliente_tel)window.open(waLink(data.cliente_tel,`Hola ${data.cliente_nombre}! Tu ${data.marca} ${data.modelo} esta listo para retirar en Microfix! ✅`),"_blank")
      toast(`Estado cambiado a: ${estado}`)
    }
  }
  async function del(id){
    if(!confirm("Eliminar esta orden?"))return
    await deleteReparacion(id)
    setReps(rs=>rs.filter(r=>r.id!==id));toast("Eliminada","warn")
  }
  const filtered=filterRepairs(reps,filterE,search)
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:800}}>🔧 Reparaciones</div>
          <div style={{fontSize:12,color:C.muted}}>{reps.length} órdenes · {reps.filter(r=>r.estado!=="Entregado"&&r.estado!=="Sin solución").length} activas</div>
        </div>
        <button style={primaryButtonStyle} onClick={openNew}>+ Nueva orden</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inputStyle,maxWidth:260}}/>
        {["Todos",...ESTADOS].map(e=>(
          <button key={e} onClick={()=>setFE(e)} style={{...ghostButtonStyle,fontSize:12,padding:"6px 12px",...(filterE===e?{borderColor:C.accent,color:C.accent}:{})}}>{e}</button>
        ))}
      </div>
      {show&&(
        <div style={{...cardStyle,marginBottom:20,borderColor:C.accent}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>{editId?"Editar":"Nueva orden"} <span style={{color:C.accent}}>{form.nro_orden}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Cliente"><AutoInput value={form.cliente_nombre} onChange={v=>f("cliente_nombre",v)} options={clientNames} placeholder="Nombre completo"/></FieldGroup>
            <FieldGroup label="Teléfono"><AutoInput value={form.cliente_tel} onChange={v=>f("cliente_tel",v)} options={clientPhones} placeholder="1123456789" type="tel"/></FieldGroup>
            <FieldGroup label="Email"><input value={form.cliente_email||""} onChange={e=>f("cliente_email",e.target.value)} style={inputStyle} placeholder="email@..."/></FieldGroup>
            <FieldGroup label="Fecha"><input type="date" value={form.fecha||""} onChange={e=>f("fecha",e.target.value)} style={inputStyle}/></FieldGroup>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Marca"><AutoInput value={form.marca} onChange={v=>f("marca",v)} options={deviceBrands} placeholder="ej. Samsung"/></FieldGroup>
            <FieldGroup label="Modelo"><AutoInput value={form.modelo} onChange={v=>f("modelo",v)} options={deviceModels} placeholder="ej. Galaxy A54"/></FieldGroup>
            <FieldGroup label="Tipo"><AutoInput value={form.tipo} onChange={v=>f("tipo",v)} options={repTypes} placeholder="Tipo de reparación"/></FieldGroup>
            <FieldGroup label="Estado"><select value={form.estado} onChange={e=>f("estado",e.target.value)} style={inputStyle}>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></FieldGroup>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Costo repuesto ($)"><input type="number" value={form.costo_pieza||0} onChange={e=>f("costo_pieza",e.target.value)} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Mano de obra ($)"><input type="number" value={form.precio_mo||0} onChange={e=>f("precio_mo",e.target.value)} style={inputStyle}/></FieldGroup>
            <FieldGroup label="Total a cobrar ($)"><input type="number" value={form.precio_total||0} onChange={e=>f("precio_total",e.target.value)} style={{...inputStyle,borderColor:C.accent,color:C.accent,fontWeight:700}}/></FieldGroup>
            <FieldGroup label="Operario"><select value={form.operario_id||""} onChange={e=>f("operario_id",e.target.value)} style={inputStyle}><option value="">Sin asignar</option>{ops.map(o=><option key={o.id} value={o.id}>{o.nombre}</option>)}</select></FieldGroup>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <FieldGroup label="Descripción del problema"><textarea value={form.descripcion||""} onChange={e=>f("descripcion",e.target.value)} style={{...inputStyle,minHeight:70,resize:"vertical"}} placeholder="Qué reporta el cliente..."/></FieldGroup>
            <FieldGroup label="Notas internas"><textarea value={form.notas||""} onChange={e=>f("notas",e.target.value)} style={{...inputStyle,minHeight:70,resize:"vertical"}} placeholder="Observaciones del técnico..."/></FieldGroup>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={ghostButtonStyle} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={primaryButtonStyle} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar orden"}</button>
          </div>
        </div>
      )}
      {filtered.length===0&&<Empty icon="🔧" text="Sin órdenes que coincidan"/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(r=>{
          const op=ops.find(o=>o.id===r.operario_id)
          const st=ESTADO_COLOR[r.estado]||{}
          return(
            <div key={r.id} style={{...cardStyle,borderLeft:`3px solid ${st.border||C.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,fontSize:14}}>{r.nro_orden}</span>
                    <span style={badgeStyle(st)}>{r.estado}</span>
                    {op&&<span style={{fontSize:11,color:C.accent3,background:"rgba(123,97,255,.1)",padding:"2px 8px",borderRadius:20}}>👤 {op.nombre}</span>}
                  </div>
                  <div style={{fontWeight:700,fontSize:15}}>{r.cliente_nombre||"—"}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{r.marca} {r.modelo} · {r.tipo}</div>
                  {r.descripcion&&<div style={{fontSize:12,color:C.muted,marginTop:4,fontStyle:"italic"}}>"{r.descripcion.slice(0,80)}{r.descripcion.length>80?"...":""}"</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:800,color:C.accent}}>{fmtMoney(r.precio_total)}</div>
                  <div style={{fontSize:11,color:C.muted}}>Rep: {fmtMoney(r.costo_pieza)} · MO: {fmtMoney(r.precio_mo)}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(r.fecha)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`,flexWrap:"wrap"}}>
                <select value={r.estado} onChange={e=>changeEstado(r.id,e.target.value)} style={{...inputStyle,maxWidth:180,padding:"6px 10px",fontSize:12}}>
                  {ESTADOS.map(e=><option key={e}>{e}</option>)}
                </select>
                <button style={{...ghostButtonStyle,fontSize:12,padding:"6px 12px"}} onClick={()=>openEdit(r)}>✏️ Editar</button>
                {r.cliente_tel&&<button style={{...ghostButtonStyle,fontSize:12,padding:"6px 12px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(r.cliente_tel,`Hola ${r.cliente_nombre}! Novedades de tu ${r.marca} ${r.modelo} en Microfix: *${r.estado}*`),"_blank")}>📲 WA</button>}
                {r.cliente_email&&<button style={{...ghostButtonStyle,fontSize:12,padding:"6px 12px"}} onClick={()=>window.open(mailLink(r.cliente_email,`Microfix - ${r.nro_orden}`,`Hola ${r.cliente_nombre},\n\nOrden: ${r.nro_orden}\nDispositivo: ${r.marca} ${r.modelo}\nEstado actual: ${r.estado}\n\nEquipo Microfix`))}>📧 Mail</button>}
                <button style={{...dangerButtonStyle,marginLeft:"auto"}} onClick={()=>del(r.id)}>Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
