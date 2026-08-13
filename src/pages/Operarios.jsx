import { useState } from "react"
import { Empty } from "../components/common/Empty.jsx"
import { FieldGroup } from "../components/common/FieldGroup.jsx"
import { deleteOperario, saveOperario } from "../services/operariosService.js"
import { C, cardStyle, dangerButtonStyle, ghostButtonStyle, inputStyle, primaryButtonStyle } from "../styles/theme.js"
import { waLink } from "../utils/formatters.js"

export function Operarios({ops,setOps,reps,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",telefono:"",email:"",rol:"Técnico"})
  const [saving,setSaving]=useState(false)
  async function save(){
    if(!form.nombre||!form.telefono){toast("Nombre y teléfono requeridos","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,telefono:form.telefono,email:form.email,rol:form.rol}
    if(form.id){const{data}=await saveOperario(payload,form.id);if(data)setOps(os=>os.map(o=>o.id===form.id?data:o))}
    else{const{data}=await saveOperario(payload);if(data)setOps(os=>[data,...os])}
    setSaving(false);setShow(false);toast("Operario guardado")
  }
  async function del(id){
    if(!confirm("Eliminar operario?"))return
    await deleteOperario(id)
    setOps(os=>os.filter(o=>o.id!==id));toast("Eliminado","warn")
  }
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>🧑‍🔧 Operarios</div><div style={{fontSize:12,color:C.muted}}>{ops.length} registrados</div></div>
        <button style={primaryButtonStyle} onClick={()=>{setForm({id:"",nombre:"",telefono:"",email:"",rol:"Técnico"});setShow(true)}}>+ Agregar</button>
      </div>
      {show&&(
        <div style={{...cardStyle,marginBottom:16,borderColor:C.accent3}}>
          <div style={{fontWeight:700,marginBottom:14}}>Operario</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Nombre"><input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} style={inputStyle} placeholder="Nombre"/></FieldGroup>
            <FieldGroup label="WhatsApp (sin 0 ni 15)"><input value={form.telefono||""} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))} style={inputStyle} placeholder="1145678901" type="tel"/></FieldGroup>
            <FieldGroup label="Email"><input value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inputStyle} placeholder="email@..."/></FieldGroup>
            <FieldGroup label="Rol"><select value={form.rol} onChange={e=>setForm(p=>({...p,rol:e.target.value}))} style={inputStyle}>{["Técnico","Técnico Jefe","Recepción","Asistente"].map(r=><option key={r}>{r}</option>)}</select></FieldGroup>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={ghostButtonStyle} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={primaryButtonStyle} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      {ops.length===0&&<Empty icon="🧑‍🔧" text="Sin operarios. Agregá el equipo Microfix."/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
        {ops.map(o=>{
          const asig=reps.filter(r=>r.operario_id===o.id&&r.estado!=="Entregado"&&r.estado!=="Sin solución")
          return(
            <div key={o.id} style={{...cardStyle,borderColor:"rgba(123,97,255,.3)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,background:"rgba(123,97,255,.15)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.accent3}}>{o.nombre?.[0]?.toUpperCase()||"?"}</div>
                <div><div style={{fontWeight:800,fontSize:15}}>{o.nombre}</div><div style={{fontSize:12,color:C.accent3}}>{o.rol}</div></div>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>📱 {o.telefono||"—"}{o.email&&<><br/>📧 {o.email}</>}</div>
              <div style={{fontSize:12,padding:"8px 12px",background:"rgba(123,97,255,.07)",borderRadius:7,border:"1px solid rgba(123,97,255,.2)",marginBottom:12}}>{asig.length} tarea(s) activa(s)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {o.telefono&&<button style={{...ghostButtonStyle,fontSize:11,padding:"6px 11px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(o.telefono,`Hola ${o.nombre}! Recordatorio Microfix: tenes ${asig.length} tarea(s) activa(s) asignada(s).`),"_blank")}>📲 Notificar</button>}
                <button style={{...ghostButtonStyle,fontSize:11,padding:"6px 11px"}} onClick={()=>{setForm({...o});setShow(true)}}>✏️ Editar</button>
                <button style={{...dangerButtonStyle,fontSize:11,padding:"6px 11px"}} onClick={()=>del(o.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

}
