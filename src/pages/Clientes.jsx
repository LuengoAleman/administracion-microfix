import { useState } from "react"
import { Empty } from "../components/common/Empty.jsx"
import { FieldGroup } from "../components/common/FieldGroup.jsx"
import { deleteCliente, saveCliente } from "../services/clientesService.js"
import { C, cardStyle, dangerButtonStyle, ghostButtonStyle, inputStyle, primaryButtonStyle } from "../styles/theme.js"
import { fmtDate, fmtMoney, mailLink, waLink } from "../utils/formatters.js"

export function Clientes({clients,setClients,reps,toast,uid}){
  const [search,setSearch]=useState("")
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",telefono:"",email:"",notas:""})
  const [saving,setSaving]=useState(false)
  async function save(){
    if(!form.nombre){toast("Nombre requerido","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,telefono:form.telefono,email:form.email,notas:form.notas}
    if(form.id){const{data}=await saveCliente(payload,form.id);if(data)setClients(cs=>cs.map(c=>c.id===form.id?data:c))}
    else{const{data}=await saveCliente(payload);if(data)setClients(cs=>[data,...cs])}
    setSaving(false);setShow(false);toast("Cliente guardado")
  }
  async function del(id){
    if(!confirm("Eliminar cliente?"))return
    await deleteCliente(id)
    setClients(cs=>cs.filter(c=>c.id!==id));toast("Eliminado","warn")
  }
  const filtered=clients.filter(c=>!search||[c.nombre,c.telefono,c.email].some(x=>x?.toLowerCase().includes(search.toLowerCase())))
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>👥 Clientes</div><div style={{fontSize:12,color:C.muted}}>{clients.length} registrados</div></div>
        <button style={primaryButtonStyle} onClick={()=>{setForm({id:"",nombre:"",telefono:"",email:"",notas:""});setShow(true)}}>+ Nuevo cliente</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...inputStyle,maxWidth:300,marginBottom:16}}/>
      {show&&(
        <div style={{...cardStyle,marginBottom:16,borderColor:C.accent}}>
          <div style={{fontWeight:700,marginBottom:14}}>{form.id?"Editar":"Nuevo cliente"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FieldGroup label="Nombre"><input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} style={inputStyle} placeholder="Nombre y apellido"/></FieldGroup>
            <FieldGroup label="Teléfono"><input value={form.telefono||""} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))} style={inputStyle} placeholder="1123456789" type="tel"/></FieldGroup>
            <FieldGroup label="Email"><input value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={inputStyle} placeholder="email@..."/></FieldGroup>
          </div>
          <FieldGroup label="Notas"><textarea value={form.notas||""} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} style={{...inputStyle,minHeight:60,resize:"vertical"}}/></FieldGroup>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button style={ghostButtonStyle} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={primaryButtonStyle} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      {filtered.length===0&&<Empty icon="👥" text="Sin clientes registrados"/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(c=>{
          const cReps=reps.filter(r=>r.cliente_id===c.id)
          const lastRep=cReps[0]
          const totalGas=cReps.reduce((a,r)=>a+(r.precio_total||0),0)
          return(
            <div key={c.id} style={cardStyle}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{width:44,height:44,background:"rgba(0,229,180,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.accent,flexShrink:0}}>{c.nombre?.[0]?.toUpperCase()||"?"}</div>
                <div style={{flex:1,minWidth:150}}>
                  <div style={{fontWeight:800,fontSize:15}}>{c.nombre}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.telefono&&<span>📱 {c.telefono}  </span>}{c.email&&<span>📧 {c.email}</span>}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{cReps.length} rep. · Total: {fmtMoney(totalGas)}{lastRep&&<span>  · Última: {fmtDate(lastRep.fecha)}</span>}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {c.telefono&&<button style={{...ghostButtonStyle,fontSize:11,padding:"5px 10px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(c.telefono,`Hola ${c.nombre}! Te escribimos de Microfix. Como estas?`),"_blank")}>📲 WA</button>}
                  {c.telefono&&lastRep&&<button style={{...ghostButtonStyle,fontSize:11,padding:"5px 10px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(c.telefono,`Hola ${c.nombre}! Tu ${lastRep.marca} ${lastRep.modelo} esta listo para retirar en Microfix! ✅`),"_blank")}>📲 Listo</button>}
                  {c.email&&<button style={{...ghostButtonStyle,fontSize:11,padding:"5px 10px"}} onClick={()=>window.open(mailLink(c.email,"Novedades Microfix",`Hola ${c.nombre}!\n\nGracias por confiar en Microfix.\n\nEquipo Microfix`))}>📧</button>}
                  <button style={{...ghostButtonStyle,fontSize:11,padding:"5px 10px"}} onClick={()=>{setForm({...c});setShow(true)}}>✏️</button>
                  <button style={{...dangerButtonStyle,fontSize:11,padding:"5px 10px"}} onClick={()=>del(c.id)}>🗑</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
