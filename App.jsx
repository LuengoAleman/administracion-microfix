import { useState, useEffect, useCallback } from "react"
import { supabase } from "./supabase.js"

const ESTADOS = ["Ingresado","Diagnosticando","En reparación","Listo","Entregado","Sin solución"]
const ESTADO_COLOR = {
  "Ingresado":      {bg:"rgba(122,128,153,.15)",text:"#9aa0b8",border:"rgba(122,128,153,.3)"},
  "Diagnosticando": {bg:"rgba(255,179,71,.12)", text:"#ffb347",border:"rgba(255,179,71,.35)"},
  "En reparación":  {bg:"rgba(123,97,255,.12)", text:"#7b61ff",border:"rgba(123,97,255,.35)"},
  "Listo":          {bg:"rgba(0,229,180,.12)",  text:"#00e5b4",border:"rgba(0,229,180,.35)"},
  "Entregado":      {bg:"rgba(0,200,120,.1)",   text:"#00c878",border:"rgba(0,200,120,.3)"},
  "Sin solución":   {bg:"rgba(255,77,109,.12)", text:"#ff4d6d",border:"rgba(255,77,109,.35)"},
}
const TIPO_REP = ["Cambio de pantalla","Cambio de vidrio","Batería","Conector de carga","Cámara","Auricular/Micrófono","Placa / Componentes","Recuperación de datos","Software","Otro"]
const MARCAS   = ["Apple","Samsung","Motorola","Xiaomi","LG","Huawei","Nokia","OPPO","Realme","Otro"]
const CATS_STOCK = ["Pantallas","Vidrios","Baterías","Conectores","Cámaras","Herramientas","Insumos","Otros"]
const CATS_GASTO = ["Repuesto","Herramienta","Insumo","Alquiler","Servicios","Publicidad","Otro"]

const C = {
  bg:"#0b0e14",surface:"#161a22",surface2:"#1c2030",border:"#252b3b",
  accent:"#00e5b4",accent2:"#ff6b35",accent3:"#7b61ff",
  text:"#e8ecf4",muted:"#7a8099",danger:"#ff4d6d",warn:"#ffb347",
}
const iSt = {background:"#0b0e14",border:"1px solid #252b3b",borderRadius:7,color:"#e8ecf4",fontFamily:"inherit",fontSize:13,padding:"9px 12px",outline:"none",width:"100%",boxSizing:"border-box"}
const card = {background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20}
const btnP = {background:C.accent,color:"#0b0e14",border:"none",borderRadius:7,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}
const btnG = {background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 16px",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}
const btnD = {background:"transparent",border:`1px solid ${C.danger}`,borderRadius:7,padding:"7px 13px",color:C.danger,fontSize:12,cursor:"pointer",fontFamily:"inherit"}
const lbl  = {fontSize:12,color:C.muted,fontWeight:600,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:".5px"}
const bdg  = c=>({display:"inline-flex",alignItems:"center",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:c.bg,color:c.text,border:`1px solid ${c.border}`})

const fmt$ = n=>`$${Number(n||0).toLocaleString("es-AR")}`
const fmtDate = d=>d?new Date(d+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"2-digit"}):"—"
const today = ()=>new Date().toISOString().slice(0,10)
const waLink = (p,m)=>`https://wa.me/549${p.replace(/\D/g,"")}?text=${encodeURIComponent(m)}`
const mailLink = (e,s,b)=>`mailto:${e}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`

function useToast(){
  const [toasts,setToasts]=useState([])
  const add=useCallback((msg,type="ok")=>{
    const id=Date.now()
    setToasts(t=>[...t,{id,msg,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),2800)
  },[])
  return {toasts,add}
}

function AutoInput({value,onChange,options=[],placeholder,type="text"}){
  const [show,setShow]=useState(false)
  const f=options.filter(o=>o?.toLowerCase().includes((value||"").toLowerCase())&&o.toLowerCase()!==(value||"").toLowerCase())
  return(
    <div style={{position:"relative"}}>
      <input type={type} value={value||""} placeholder={placeholder} style={iSt}
        onChange={e=>onChange(e.target.value)}
        onFocus={()=>setShow(true)} onBlur={()=>setTimeout(()=>setShow(false),150)}/>
      {show&&f.length>0&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#1e2330",border:"1px solid #2a2f3e",borderRadius:8,zIndex:50,maxHeight:150,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,.5)"}}>
          {f.slice(0,6).map(o=>(
            <div key={o} onMouseDown={()=>onChange(o)}
              style={{padding:"9px 12px",cursor:"pointer",fontSize:13,color:"#e8ecf4",borderBottom:"1px solid #2a2f3e"}}
              onMouseEnter={e=>e.target.style.background="#2a2f3e"}
              onMouseLeave={e=>e.target.style.background=""}>{o}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function FG({label:l,children}){return <div style={{display:"flex",flexDirection:"column",gap:5}}><span style={lbl}>{l}</span>{children}</div>}
function Empty({icon,text}){return <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}><div style={{fontSize:36,marginBottom:10}}>{icon}</div><div style={{fontSize:13}}>{text}</div></div>}

// ── LOGIN ──────────────────────────────────────────────────────────
function Login(){
  const [email,setEmail]=useState("")
  const [pass,setPass]=useState("")
  const [err,setErr]=useState("")
  const [loading,setLoading]=useState(false)
  async function go(e){
    e.preventDefault();setLoading(true);setErr("")
    const{error}=await supabase.auth.signInWithPassword({email,password:pass})
    if(error)setErr("Usuario o contraseña incorrectos.")
    setLoading(false)
  }
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{...card,width:"100%",maxWidth:380,borderColor:C.accent}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:60,height:60,background:C.accent,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:24,color:"#0b0e14",margin:"0 auto 14px"}}>MX</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:"-.5px"}}>Microfix Admin</div>
          <div style={{fontSize:13,color:C.muted,marginTop:4}}>Plataforma de gestión</div>
        </div>
        <form onSubmit={go} style={{display:"flex",flexDirection:"column",gap:14}}>
          <FG label="Email"><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={iSt} placeholder="tu@email.com" required autoFocus/></FG>
          <FG label="Contraseña"><input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={iSt} placeholder="••••••••" required/></FG>
          {err&&<div style={{color:C.danger,fontSize:13,textAlign:"center"}}>{err}</div>}
          <button type="submit" style={{...btnP,width:"100%",padding:"12px",marginTop:4}} disabled={loading}>{loading?"Ingresando...":"Ingresar"}</button>
        </form>
      </div>
    </div>
  )
}

// ── ROOT ──────────────────────────────────────────────────────────
export default function App(){
  const [session,setSession]=useState(undefined)
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session))
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>setSession(s))
    return()=>subscription.unsubscribe()
  },[])
  if(session===undefined)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:14}}>Cargando...</div>
  if(!session)return <Login/>
  return <AdminApp session={session}/>
}

// ── ADMIN ─────────────────────────────────────────────────────────
function AdminApp({session}){
  const [tab,setTab]=useState("dashboard")
  const {toasts,add:toast}=useToast()
  const [reps,setReps]=useState([])
  const [clients,setClients]=useState([])
  const [ops,setOps]=useState([])
  const [stock,setStock]=useState([])
  const [gastos,setGastos]=useState([])
  const [loading,setLoading]=useState(true)
  const uid=session.user.id

  useEffect(()=>{
    async function load(){
      setLoading(true)
      const[r,cl,op,st,ga]=await Promise.all([
        supabase.from("reparaciones").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
        supabase.from("clientes").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
        supabase.from("operarios").select("*").eq("user_id",uid),
        supabase.from("stock").select("*").eq("user_id",uid),
        supabase.from("gastos").select("*").eq("user_id",uid).order("fecha",{ascending:false}),
      ])
      setReps(r.data||[]);setClients(cl.data||[]);setOps(op.data||[])
      setStock(st.data||[]);setGastos(ga.data||[])
      setLoading(false)
    }
    load()
  },[uid])

  const clientNames=[...new Set(clients.map(c=>c.nombre).filter(Boolean))]
  const clientPhones=[...new Set(clients.map(c=>c.telefono).filter(Boolean))]
  const deviceModels=[...new Set(reps.map(r=>r.modelo).filter(Boolean))]
  const deviceBrands=[...new Set([...MARCAS,...reps.map(r=>r.marca).filter(Boolean)])]
  const repTypes=[...new Set([...TIPO_REP,...reps.map(r=>r.tipo).filter(Boolean)])]

  const shared={reps,setReps,clients,setClients,ops,setOps,stock,setStock,gastos,setGastos,
    clientNames,clientPhones,deviceModels,deviceBrands,repTypes,toast,uid}

  const TABS=[
    {id:"dashboard",icon:"⚡",label:"Dashboard"},
    {id:"reps",icon:"🔧",label:"Reparaciones"},
    {id:"clients",icon:"👥",label:"Clientes"},
    {id:"ops",icon:"🧑‍🔧",label:"Operarios"},
    {id:"stock",icon:"📦",label:"Stock"},
    {id:"finanzas",icon:"💰",label:"Finanzas"},
  ]

  if(loading)return <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:14}}>Cargando datos...</div>

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"system-ui,'Segoe UI',sans-serif",fontSize:14}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:100,height:52}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:32,height:32,background:C.accent,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#0b0e14"}}>MX</div>
          <div style={{fontWeight:800,fontSize:15,letterSpacing:"-.4px",display:"none"}}>Microfix</div>
        </div>
        <div style={{display:"flex",gap:2,overflowX:"auto",flex:1,scrollbarWidth:"none"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{...btnG,whiteSpace:"nowrap",padding:"6px 12px",fontSize:12,
                ...(tab===t.id?{background:C.surface2,color:C.accent,borderColor:C.accent}:{})}}>
              <span style={{marginRight:4}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{fontSize:11,color:C.muted,flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
          <span style={{display:"none"}}>{session.user.email}</span>
          <button onClick={()=>supabase.auth.signOut()} style={{...btnD,fontSize:11,padding:"5px 10px"}}>Salir</button>
        </div>
      </div>
      <div style={{padding:20,maxWidth:1300,margin:"0 auto"}}>
        {tab==="dashboard"&&<Dashboard {...shared} setTab={setTab}/>}
        {tab==="reps"&&<Reparaciones {...shared}/>}
        {tab==="clients"&&<Clientes {...shared}/>}
        {tab==="ops"&&<Operarios {...shared}/>}
        {tab==="stock"&&<StockPage {...shared}/>}
        {tab==="finanzas"&&<Finanzas {...shared}/>}
      </div>
      <div style={{position:"fixed",bottom:20,right:20,display:"flex",flexDirection:"column",gap:8,zIndex:999}}>
        {toasts.map(t=>(
          <div key={t.id} style={{background:t.type==="ok"?C.accent:t.type==="err"?C.danger:C.warn,color:"#0b0e14",padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:700,boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
            {t.msg}
          </div>
        ))}
      </div>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:#2a2f3e;border-radius:4px}input::placeholder,textarea::placeholder{color:#4a5068}select option{background:#1e2330}input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.4)}`}</style>
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function Dashboard({reps,clients,stock,gastos,setTab}){
  const activas=reps.filter(r=>r.estado!=="Entregado"&&r.estado!=="Sin solución")
  const listos=reps.filter(r=>r.estado==="Listo")
  const mes=today().slice(0,7)
  const ingresos=reps.filter(r=>r.fecha?.startsWith(mes)&&r.estado==="Entregado").reduce((a,r)=>a+(r.precio_total||0),0)
  const costoRep=reps.filter(r=>r.fecha?.startsWith(mes)).reduce((a,r)=>a+(r.costo_pieza||0),0)
  const totalGas=gastos.filter(g=>g.fecha?.startsWith(mes)).reduce((a,g)=>a+(g.monto||0),0)
  const ganancia=ingresos-costoRep-totalGas
  const stockBajo=stock.filter(s=>(s.cantidad||0)<=(s.minimo||2))
  const Stat=({icon,val,sub,color,onClick})=>(
    <div onClick={onClick} style={{...card,cursor:onClick?"pointer":"default",flex:1,minWidth:130,transition:"border-color .2s"}}
      onMouseEnter={e=>onClick&&(e.currentTarget.style.borderColor=color)}
      onMouseLeave={e=>onClick&&(e.currentTarget.style.borderColor=C.border)}>
      <div style={{fontSize:22,marginBottom:4}}>{icon}</div>
      <div style={{fontSize:26,fontWeight:800,color,lineHeight:1}}>{val}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase",letterSpacing:".5px"}}>{sub}</div>
    </div>
  )
  return(
    <div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,letterSpacing:"-.5px"}}>Buenos días, <span style={{color:C.accent}}>José</span> 👋</div>
        <div style={{fontSize:12,color:C.muted,marginTop:2}}>{new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"})}</div>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        <Stat icon="🔧" val={activas.length} sub="En proceso" color={C.accent3} onClick={()=>setTab("reps")}/>
        <Stat icon="✅" val={listos.length} sub="Listas p/ entregar" color={C.accent} onClick={()=>setTab("reps")}/>
        <Stat icon="💰" val={fmt$(ingresos)} sub="Ingresos del mes" color="#00e5b4" onClick={()=>setTab("finanzas")}/>
        <Stat icon="📈" val={fmt$(ganancia)} sub="Ganancia neta" color={ganancia>=0?"#00e5b4":C.danger} onClick={()=>setTab("finanzas")}/>
        <Stat icon="📦" val={stockBajo.length} sub="Stock bajo" color={stockBajo.length>0?C.warn:C.muted} onClick={()=>setTab("stock")}/>
        <Stat icon="👥" val={clients.length} sub="Clientes" color={C.accent2} onClick={()=>setTab("clients")}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
        <div style={card}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Órdenes activas</div>
          {activas.length===0&&<Empty icon="🔧" text="Sin órdenes activas"/>}
          {activas.slice(0,7).map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.cliente_nombre||"—"}</div>
                <div style={{fontSize:11,color:C.muted}}>{r.marca} {r.modelo}</div>
              </div>
              <span style={bdg(ESTADO_COLOR[r.estado]||{})}>{r.estado}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Alertas</div>
          {listos.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span>✅</span>
              <div style={{flex:1}}>{r.cliente_nombre} — {r.marca} {r.modelo} listo</div>
              {r.cliente_tel&&<button style={{...btnG,fontSize:11,padding:"4px 9px",color:"#25d366",borderColor:"#25d366"}}
                onClick={()=>window.open(waLink(r.cliente_tel,`Hola ${r.cliente_nombre}! Tu ${r.marca} ${r.modelo} esta listo para retirar en Microfix! ✅🔧`),"_blank")}>📲</button>}
            </div>
          ))}
          {stockBajo.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span>⚠️</span><div style={{flex:1,color:C.warn}}>Stock bajo: {s.nombre} ({s.cantidad} unid.)</div>
            </div>
          ))}
          {listos.length===0&&stockBajo.length===0&&<Empty icon="🎉" text="Todo en orden"/>}
        </div>
      </div>
    </div>
  )
}

// ── REPARACIONES ──────────────────────────────────────────────────
function Reparaciones({reps,setReps,clients,setClients,ops,clientNames,clientPhones,deviceModels,deviceBrands,repTypes,toast,uid}){
  const empty={nro_orden:"",cliente_nombre:"",cliente_tel:"",cliente_email:"",cliente_id:"",marca:"",modelo:"",tipo:"",descripcion:"",estado:"Ingresado",operario_id:"",costo_pieza:0,precio_mo:0,precio_total:0,fecha:today(),notas:""}
  const [form,setForm]=useState(empty)
  const [editId,setEditId]=useState(null)
  const [show,setShow]=useState(false)
  const [filterE,setFE]=useState("Todos")
  const [search,setSearch]=useState("")
  const [saving,setSaving]=useState(false)
  const nextNro=()=>`ORD-${String(reps.length+1).padStart(4,"0")}`
  function openNew(){setForm({...empty,nro_orden:nextNro(),fecha:today()});setEditId(null);setShow(true)}
  function openEdit(r){setForm({...r});setEditId(r.id);setShow(true)}
  function f(k,v){
    setForm(p=>{
      const n={...p,[k]:v}
      if(k==="cliente_nombre"){
        const found=clients.find(c=>c.nombre?.toLowerCase()===v.toLowerCase())
        if(found){n.cliente_tel=found.telefono||"";n.cliente_email=found.email||"";n.cliente_id=found.id}
      }
      if(k==="costo_pieza"||k==="precio_mo"){
        const cp=k==="costo_pieza"?Number(v):Number(n.costo_pieza)
        const mo=k==="precio_mo"?Number(v):Number(n.precio_mo)
        n.precio_total=cp+mo
      }
      return n
    })
  }
  async function save(){
    if(!form.cliente_nombre||!form.modelo||!form.tipo){toast("Completá cliente, modelo y tipo","err");return}
    setSaving(true)
    let cId=form.cliente_id
    const existing=clients.find(c=>c.nombre?.toLowerCase()===form.cliente_nombre.toLowerCase())
    if(!existing){
      const{data:nc}=await supabase.from("clientes").insert({user_id:uid,nombre:form.cliente_nombre,telefono:form.cliente_tel,email:form.cliente_email}).select().single()
      if(nc){setClients(cs=>[nc,...cs]);cId=nc.id}
    }else{cId=existing.id}
    const payload={...form,user_id:uid,cliente_id:cId,costo_pieza:Number(form.costo_pieza),precio_mo:Number(form.precio_mo),precio_total:Number(form.precio_total)}
    if(editId){
      const{data}=await supabase.from("reparaciones").update(payload).eq("id",editId).select().single()
      if(data)setReps(rs=>rs.map(r=>r.id===editId?data:r))
    }else{
      const{data}=await supabase.from("reparaciones").insert(payload).select().single()
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
    const{data}=await supabase.from("reparaciones").update({estado}).eq("id",id).select().single()
    if(data){
      setReps(rs=>rs.map(r=>r.id===id?data:r))
      if(estado==="Listo"&&data.cliente_tel)window.open(waLink(data.cliente_tel,`Hola ${data.cliente_nombre}! Tu ${data.marca} ${data.modelo} esta listo para retirar en Microfix! ✅`),"_blank")
      toast(`Estado cambiado a: ${estado}`)
    }
  }
  async function del(id){
    if(!confirm("Eliminar esta orden?"))return
    await supabase.from("reparaciones").delete().eq("id",id)
    setReps(rs=>rs.filter(r=>r.id!==id));toast("Eliminada","warn")
  }
  const filtered=reps.filter(r=>{
    const mE=filterE==="Todos"||r.estado===filterE
    const mQ=!search||[r.cliente_nombre,r.modelo,r.marca,r.nro_orden,r.tipo].some(x=>x?.toLowerCase().includes(search.toLowerCase()))
    return mE&&mQ
  })
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:800}}>🔧 Reparaciones</div>
          <div style={{fontSize:12,color:C.muted}}>{reps.length} órdenes · {reps.filter(r=>r.estado!=="Entregado"&&r.estado!=="Sin solución").length} activas</div>
        </div>
        <button style={btnP} onClick={openNew}>+ Nueva orden</button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...iSt,maxWidth:260}}/>
        {["Todos",...ESTADOS].map(e=>(
          <button key={e} onClick={()=>setFE(e)} style={{...btnG,fontSize:12,padding:"6px 12px",...(filterE===e?{borderColor:C.accent,color:C.accent}:{})}}>{e}</button>
        ))}
      </div>
      {show&&(
        <div style={{...card,marginBottom:20,borderColor:C.accent}}>
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>{editId?"Editar":"Nueva orden"} <span style={{color:C.accent}}>{form.nro_orden}</span></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Cliente"><AutoInput value={form.cliente_nombre} onChange={v=>f("cliente_nombre",v)} options={clientNames} placeholder="Nombre completo"/></FG>
            <FG label="Teléfono"><AutoInput value={form.cliente_tel} onChange={v=>f("cliente_tel",v)} options={clientPhones} placeholder="1123456789" type="tel"/></FG>
            <FG label="Email"><input value={form.cliente_email||""} onChange={e=>f("cliente_email",e.target.value)} style={iSt} placeholder="email@..."/></FG>
            <FG label="Fecha"><input type="date" value={form.fecha||""} onChange={e=>f("fecha",e.target.value)} style={iSt}/></FG>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Marca"><AutoInput value={form.marca} onChange={v=>f("marca",v)} options={deviceBrands} placeholder="ej. Samsung"/></FG>
            <FG label="Modelo"><AutoInput value={form.modelo} onChange={v=>f("modelo",v)} options={deviceModels} placeholder="ej. Galaxy A54"/></FG>
            <FG label="Tipo"><AutoInput value={form.tipo} onChange={v=>f("tipo",v)} options={repTypes} placeholder="Tipo de reparación"/></FG>
            <FG label="Estado"><select value={form.estado} onChange={e=>f("estado",e.target.value)} style={iSt}>{ESTADOS.map(e=><option key={e}>{e}</option>)}</select></FG>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Costo repuesto ($)"><input type="number" value={form.costo_pieza||0} onChange={e=>f("costo_pieza",e.target.value)} style={iSt}/></FG>
            <FG label="Mano de obra ($)"><input type="number" value={form.precio_mo||0} onChange={e=>f("precio_mo",e.target.value)} style={iSt}/></FG>
            <FG label="Total a cobrar ($)"><input type="number" value={form.precio_total||0} onChange={e=>f("precio_total",e.target.value)} style={{...iSt,borderColor:C.accent,color:C.accent,fontWeight:700}}/></FG>
            <FG label="Operario"><select value={form.operario_id||""} onChange={e=>f("operario_id",e.target.value)} style={iSt}><option value="">Sin asignar</option>{ops.map(o=><option key={o.id} value={o.id}>{o.nombre}</option>)}</select></FG>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
            <FG label="Descripción del problema"><textarea value={form.descripcion||""} onChange={e=>f("descripcion",e.target.value)} style={{...iSt,minHeight:70,resize:"vertical"}} placeholder="Qué reporta el cliente..."/></FG>
            <FG label="Notas internas"><textarea value={form.notas||""} onChange={e=>f("notas",e.target.value)} style={{...iSt,minHeight:70,resize:"vertical"}} placeholder="Observaciones del técnico..."/></FG>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnG} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={btnP} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar orden"}</button>
          </div>
        </div>
      )}
      {filtered.length===0&&<Empty icon="🔧" text="Sin órdenes que coincidan"/>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(r=>{
          const op=ops.find(o=>o.id===r.operario_id)
          const st=ESTADO_COLOR[r.estado]||{}
          return(
            <div key={r.id} style={{...card,borderLeft:`3px solid ${st.border||C.border}`}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:180}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontWeight:800,fontSize:14}}>{r.nro_orden}</span>
                    <span style={bdg(st)}>{r.estado}</span>
                    {op&&<span style={{fontSize:11,color:C.accent3,background:"rgba(123,97,255,.1)",padding:"2px 8px",borderRadius:20}}>👤 {op.nombre}</span>}
                  </div>
                  <div style={{fontWeight:700,fontSize:15}}>{r.cliente_nombre||"—"}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{r.marca} {r.modelo} · {r.tipo}</div>
                  {r.descripcion&&<div style={{fontSize:12,color:C.muted,marginTop:4,fontStyle:"italic"}}>"{r.descripcion.slice(0,80)}{r.descripcion.length>80?"...":""}"</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:22,fontWeight:800,color:C.accent}}>{fmt$(r.precio_total)}</div>
                  <div style={{fontSize:11,color:C.muted}}>Rep: {fmt$(r.costo_pieza)} · MO: {fmt$(r.precio_mo)}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(r.fecha)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`,flexWrap:"wrap"}}>
                <select value={r.estado} onChange={e=>changeEstado(r.id,e.target.value)} style={{...iSt,maxWidth:180,padding:"6px 10px",fontSize:12}}>
                  {ESTADOS.map(e=><option key={e}>{e}</option>)}
                </select>
                <button style={{...btnG,fontSize:12,padding:"6px 12px"}} onClick={()=>openEdit(r)}>✏️ Editar</button>
                {r.cliente_tel&&<button style={{...btnG,fontSize:12,padding:"6px 12px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(r.cliente_tel,`Hola ${r.cliente_nombre}! Novedades de tu ${r.marca} ${r.modelo} en Microfix: *${r.estado}*`),"_blank")}>📲 WA</button>}
                {r.cliente_email&&<button style={{...btnG,fontSize:12,padding:"6px 12px"}} onClick={()=>window.open(mailLink(r.cliente_email,`Microfix - ${r.nro_orden}`,`Hola ${r.cliente_nombre},\n\nOrden: ${r.nro_orden}\nDispositivo: ${r.marca} ${r.modelo}\nEstado actual: ${r.estado}\n\nEquipo Microfix`))}>📧 Mail</button>}
                <button style={{...btnD,marginLeft:"auto"}} onClick={()=>del(r.id)}>Eliminar</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── CLIENTES ──────────────────────────────────────────────────────
function Clientes({clients,setClients,reps,toast,uid}){
  const [search,setSearch]=useState("")
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",telefono:"",email:"",notas:""})
  const [saving,setSaving]=useState(false)
  async function save(){
    if(!form.nombre){toast("Nombre requerido","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,telefono:form.telefono,email:form.email,notas:form.notas}
    if(form.id){const{data}=await supabase.from("clientes").update(payload).eq("id",form.id).select().single();if(data)setClients(cs=>cs.map(c=>c.id===form.id?data:c))}
    else{const{data}=await supabase.from("clientes").insert(payload).select().single();if(data)setClients(cs=>[data,...cs])}
    setSaving(false);setShow(false);toast("Cliente guardado")
  }
  async function del(id){
    if(!confirm("Eliminar cliente?"))return
    await supabase.from("clientes").delete().eq("id",id)
    setClients(cs=>cs.filter(c=>c.id!==id));toast("Eliminado","warn")
  }
  const filtered=clients.filter(c=>!search||[c.nombre,c.telefono,c.email].some(x=>x?.toLowerCase().includes(search.toLowerCase())))
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>👥 Clientes</div><div style={{fontSize:12,color:C.muted}}>{clients.length} registrados</div></div>
        <button style={btnP} onClick={()=>{setForm({id:"",nombre:"",telefono:"",email:"",notas:""});setShow(true)}}>+ Nuevo cliente</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...iSt,maxWidth:300,marginBottom:16}}/>
      {show&&(
        <div style={{...card,marginBottom:16,borderColor:C.accent}}>
          <div style={{fontWeight:700,marginBottom:14}}>{form.id?"Editar":"Nuevo cliente"}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Nombre"><input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} style={iSt} placeholder="Nombre y apellido"/></FG>
            <FG label="Teléfono"><input value={form.telefono||""} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))} style={iSt} placeholder="1123456789" type="tel"/></FG>
            <FG label="Email"><input value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={iSt} placeholder="email@..."/></FG>
          </div>
          <FG label="Notas"><textarea value={form.notas||""} onChange={e=>setForm(p=>({...p,notas:e.target.value}))} style={{...iSt,minHeight:60,resize:"vertical"}}/></FG>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button style={btnG} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={btnP} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
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
            <div key={c.id} style={card}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                <div style={{width:44,height:44,background:"rgba(0,229,180,.12)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.accent,flexShrink:0}}>{c.nombre?.[0]?.toUpperCase()||"?"}</div>
                <div style={{flex:1,minWidth:150}}>
                  <div style={{fontWeight:800,fontSize:15}}>{c.nombre}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{c.telefono&&<span>📱 {c.telefono}  </span>}{c.email&&<span>📧 {c.email}</span>}</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>{cReps.length} rep. · Total: {fmt$(totalGas)}{lastRep&&<span>  · Última: {fmtDate(lastRep.fecha)}</span>}</div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {c.telefono&&<button style={{...btnG,fontSize:11,padding:"5px 10px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(c.telefono,`Hola ${c.nombre}! Te escribimos de Microfix. Como estas?`),"_blank")}>📲 WA</button>}
                  {c.telefono&&lastRep&&<button style={{...btnG,fontSize:11,padding:"5px 10px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(c.telefono,`Hola ${c.nombre}! Tu ${lastRep.marca} ${lastRep.modelo} esta listo para retirar en Microfix! ✅`),"_blank")}>📲 Listo</button>}
                  {c.email&&<button style={{...btnG,fontSize:11,padding:"5px 10px"}} onClick={()=>window.open(mailLink(c.email,"Novedades Microfix",`Hola ${c.nombre}!\n\nGracias por confiar en Microfix.\n\nEquipo Microfix`))}>📧</button>}
                  <button style={{...btnG,fontSize:11,padding:"5px 10px"}} onClick={()=>{setForm({...c});setShow(true)}}>✏️</button>
                  <button style={{...btnD,fontSize:11,padding:"5px 10px"}} onClick={()=>del(c.id)}>🗑</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── OPERARIOS ────────────────────────────────────────────────────
function Operarios({ops,setOps,reps,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",telefono:"",email:"",rol:"Técnico"})
  const [saving,setSaving]=useState(false)
  async function save(){
    if(!form.nombre||!form.telefono){toast("Nombre y teléfono requeridos","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,telefono:form.telefono,email:form.email,rol:form.rol}
    if(form.id){const{data}=await supabase.from("operarios").update(payload).eq("id",form.id).select().single();if(data)setOps(os=>os.map(o=>o.id===form.id?data:o))}
    else{const{data}=await supabase.from("operarios").insert(payload).select().single();if(data)setOps(os=>[data,...os])}
    setSaving(false);setShow(false);toast("Operario guardado")
  }
  async function del(id){
    if(!confirm("Eliminar operario?"))return
    await supabase.from("operarios").delete().eq("id",id)
    setOps(os=>os.filter(o=>o.id!==id));toast("Eliminado","warn")
  }
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>🧑‍🔧 Operarios</div><div style={{fontSize:12,color:C.muted}}>{ops.length} registrados</div></div>
        <button style={btnP} onClick={()=>{setForm({id:"",nombre:"",telefono:"",email:"",rol:"Técnico"});setShow(true)}}>+ Agregar</button>
      </div>
      {show&&(
        <div style={{...card,marginBottom:16,borderColor:C.accent3}}>
          <div style={{fontWeight:700,marginBottom:14}}>Operario</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Nombre"><input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} style={iSt} placeholder="Nombre"/></FG>
            <FG label="WhatsApp (sin 0 ni 15)"><input value={form.telefono||""} onChange={e=>setForm(p=>({...p,telefono:e.target.value}))} style={iSt} placeholder="1145678901" type="tel"/></FG>
            <FG label="Email"><input value={form.email||""} onChange={e=>setForm(p=>({...p,email:e.target.value}))} style={iSt} placeholder="email@..."/></FG>
            <FG label="Rol"><select value={form.rol} onChange={e=>setForm(p=>({...p,rol:e.target.value}))} style={iSt}>{["Técnico","Técnico Jefe","Recepción","Asistente"].map(r=><option key={r}>{r}</option>)}</select></FG>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnG} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={btnP} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      {ops.length===0&&<Empty icon="🧑‍🔧" text="Sin operarios. Agregá el equipo Microfix."/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:12}}>
        {ops.map(o=>{
          const asig=reps.filter(r=>r.operario_id===o.id&&r.estado!=="Entregado"&&r.estado!=="Sin solución")
          return(
            <div key={o.id} style={{...card,borderColor:"rgba(123,97,255,.3)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,background:"rgba(123,97,255,.15)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:C.accent3}}>{o.nombre?.[0]?.toUpperCase()||"?"}</div>
                <div><div style={{fontWeight:800,fontSize:15}}>{o.nombre}</div><div style={{fontSize:12,color:C.accent3}}>{o.rol}</div></div>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>📱 {o.telefono||"—"}{o.email&&<><br/>📧 {o.email}</>}</div>
              <div style={{fontSize:12,padding:"8px 12px",background:"rgba(123,97,255,.07)",borderRadius:7,border:"1px solid rgba(123,97,255,.2)",marginBottom:12}}>{asig.length} tarea(s) activa(s)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {o.telefono&&<button style={{...btnG,fontSize:11,padding:"6px 11px",color:"#25d366",borderColor:"#25d366"}} onClick={()=>window.open(waLink(o.telefono,`Hola ${o.nombre}! Recordatorio Microfix: tenes ${asig.length} tarea(s) activa(s) asignada(s).`),"_blank")}>📲 Notificar</button>}
                <button style={{...btnG,fontSize:11,padding:"6px 11px"}} onClick={()=>{setForm({...o});setShow(true)}}>✏️ Editar</button>
                <button style={{...btnD,fontSize:11,padding:"6px 11px"}} onClick={()=>del(o.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── STOCK ────────────────────────────────────────────────────────
function StockPage({stock,setStock,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",nombre:"",categoria:"",cantidad:0,minimo:2,costo_unitario:0,proveedor:""})
  const [search,setSearch]=useState("")
  const [saving,setSaving]=useState(false)
  const nombres=[...new Set(stock.map(s=>s.nombre).filter(Boolean))]
  async function save(){
    if(!form.nombre){toast("Nombre requerido","err");return}
    setSaving(true)
    const payload={user_id:uid,nombre:form.nombre,categoria:form.categoria,cantidad:Number(form.cantidad),minimo:Number(form.minimo),costo_unitario:Number(form.costo_unitario),proveedor:form.proveedor}
    if(form.id){const{data}=await supabase.from("stock").update(payload).eq("id",form.id).select().single();if(data)setStock(ss=>ss.map(s=>s.id===form.id?data:s))}
    else{const{data}=await supabase.from("stock").insert(payload).select().single();if(data)setStock(ss=>[data,...ss])}
    setSaving(false);setShow(false);toast("Guardado")
  }
  async function ajustar(id,delta){
    const item=stock.find(s=>s.id===id)
    if(!item)return
    const nueva=Math.max(0,(item.cantidad||0)+delta)
    const{data}=await supabase.from("stock").update({cantidad:nueva}).eq("id",id).select().single()
    if(data)setStock(ss=>ss.map(s=>s.id===id?data:s))
  }
  async function del(id){
    if(!confirm("Eliminar?"))return
    await supabase.from("stock").delete().eq("id",id)
    setStock(ss=>ss.filter(s=>s.id!==id));toast("Eliminado","warn")
  }
  const filtered=stock.filter(s=>!search||s.nombre?.toLowerCase().includes(search.toLowerCase())||s.categoria?.toLowerCase().includes(search.toLowerCase()))
  const bajo=stock.filter(s=>(s.cantidad||0)<=(s.minimo||2))
  const valorTotal=stock.reduce((a,s)=>a+(s.cantidad||0)*(s.costo_unitario||0),0)
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>📦 Stock</div><div style={{fontSize:12,color:C.muted}}>{stock.length} ítems · Valor: {fmt$(valorTotal)}</div></div>
        <button style={btnP} onClick={()=>{setForm({id:"",nombre:"",categoria:"",cantidad:0,minimo:2,costo_unitario:0,proveedor:""});setShow(true)}}>+ Agregar ítem</button>
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar..." style={{...iSt,maxWidth:280,marginBottom:16}}/>
      {bajo.length>0&&<div style={{background:"rgba(255,179,71,.08)",border:"1px solid rgba(255,179,71,.3)",borderRadius:10,padding:"12px 16px",marginBottom:16}}>
        <div style={{fontWeight:700,color:C.warn,marginBottom:8}}>⚠️ Stock bajo — {bajo.length} ítem(s)</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{bajo.map(s=><span key={s.id} style={{fontSize:12,background:"rgba(255,179,71,.12)",color:C.warn,padding:"4px 10px",borderRadius:20}}>{s.nombre} ({s.cantidad})</span>)}</div>
      </div>}
      {show&&(
        <div style={{...card,marginBottom:16,borderColor:C.accent}}>
          <div style={{fontWeight:700,marginBottom:14}}>Repuesto / insumo</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:12}}>
            <FG label="Nombre"><AutoInput value={form.nombre} onChange={v=>setForm(p=>({...p,nombre:v}))} options={nombres} placeholder="ej. Pantalla iPhone 13"/></FG>
            <FG label="Categoría"><select value={form.categoria||""} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} style={iSt}><option value="">Seleccionar...</option>{CATS_STOCK.map(c=><option key={c}>{c}</option>)}</select></FG>
            <FG label="Cantidad"><input type="number" value={form.cantidad||0} onChange={e=>setForm(p=>({...p,cantidad:e.target.value}))} style={iSt}/></FG>
            <FG label="Mínimo"><input type="number" value={form.minimo||2} onChange={e=>setForm(p=>({...p,minimo:e.target.value}))} style={iSt}/></FG>
            <FG label="Costo unit. ($)"><input type="number" value={form.costo_unitario||0} onChange={e=>setForm(p=>({...p,costo_unitario:e.target.value}))} style={iSt}/></FG>
            <FG label="Proveedor"><input value={form.proveedor||""} onChange={e=>setForm(p=>({...p,proveedor:e.target.value}))} style={iSt} placeholder="ej. MercadoLibre"/></FG>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <button style={btnG} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={btnP} onClick={save} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      {filtered.length===0&&<Empty icon="📦" text="Sin ítems de stock"/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:10}}>
        {filtered.map(s=>{
          const b=(s.cantidad||0)<=(s.minimo||2)
          return(
            <div key={s.id} style={{...card,borderColor:b?"rgba(255,179,71,.4)":C.border}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontWeight:700,fontSize:14}}>{s.nombre}</div>{s.categoria&&<div style={{fontSize:11,color:C.muted}}>{s.categoria}</div>}</div>
                {b&&<span style={{fontSize:10,background:"rgba(255,179,71,.15)",color:C.warn,padding:"2px 7px",borderRadius:20}}>⚠️ Bajo</span>}
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>
                {s.proveedor&&<div>Prov: {s.proveedor}</div>}
                <div>Unit: {fmt$(s.costo_unitario)} · Total: {fmt$((s.cantidad||0)*(s.costo_unitario||0))}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <button onClick={()=>ajustar(s.id,-1)} style={{...btnG,padding:"5px 14px",fontSize:18,flexShrink:0}}>−</button>
                <span style={{fontWeight:800,fontSize:24,color:b?C.warn:C.accent,flex:1,textAlign:"center"}}>{s.cantidad}</span>
                <button onClick={()=>ajustar(s.id,1)} style={{...btnG,padding:"5px 14px",fontSize:18,flexShrink:0}}>+</button>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button style={{...btnG,fontSize:11,padding:"5px 10px",flex:1}} onClick={()=>{setForm({...s});setShow(true)}}>✏️</button>
                <button style={{...btnD,fontSize:11,padding:"5px 10px"}} onClick={()=>del(s.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── FINANZAS ──────────────────────────────────────────────────────
function Finanzas({reps,gastos,setGastos,toast,uid}){
  const [show,setShow]=useState(false)
  const [form,setForm]=useState({id:"",concepto:"",monto:0,fecha:today(),categoria:"Repuesto"})
  const [mes,setMes]=useState(today().slice(0,7))
  const [saving,setSaving]=useState(false)
  const mesReps=reps.filter(r=>r.fecha?.startsWith(mes))
  const ingresos=mesReps.filter(r=>r.estado==="Entregado").reduce((a,r)=>a+(r.precio_total||0),0)
  const costoRep=mesReps.reduce((a,r)=>a+(r.costo_pieza||0),0)
  const mesGas=gastos.filter(g=>g.fecha?.startsWith(mes))
  const totalGas=mesGas.reduce((a,g)=>a+(g.monto||0),0)
  const ganB=ingresos-costoRep
  const ganN=ingresos-costoRep-totalGas
  async function saveGasto(){
    if(!form.concepto||!form.monto){toast("Completá concepto y monto","err");return}
    setSaving(true)
    const payload={user_id:uid,concepto:form.concepto,monto:Number(form.monto),fecha:form.fecha,categoria:form.categoria}
    if(form.id){const{data}=await supabase.from("gastos").update(payload).eq("id",form.id).select().single();if(data)setGastos(gs=>gs.map(g=>g.id===form.id?data:g))}
    else{const{data}=await supabase.from("gastos").insert(payload).select().single();if(data)setGastos(gs=>[data,...gs])}
    setSaving(false);setShow(false);toast("Gasto registrado")
  }
  async function delGasto(id){await supabase.from("gastos").delete().eq("id",id);setGastos(gs=>gs.filter(g=>g.id!==id))}
  const KPI=(label,val,color,sub)=>(
    <div style={{...card,textAlign:"center",flex:1,minWidth:130}}>
      <div style={{fontSize:24,fontWeight:800,color,lineHeight:1}}>{fmt$(val)}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:4,textTransform:"uppercase",letterSpacing:".5px"}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>}
    </div>
  )
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800}}>💰 Finanzas</div></div>
        <input type="month" value={mes} onChange={e=>setMes(e.target.value)} style={{...iSt,width:"auto",padding:"7px 12px"}}/>
        <button style={btnP} onClick={()=>{setForm({id:"",concepto:"",monto:0,fecha:today(),categoria:"Repuesto"});setShow(true)}}>+ Gasto</button>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {KPI("Ingresos cobrados",ingresos,"#00e5b4",`${mesReps.filter(r=>r.estado==="Entregado").length} entregas`)}
        {KPI("Costo repuestos",costoRep,C.warn)}
        {KPI("Otros gastos",totalGas,C.danger,`${mesGas.length} ítems`)}
        {KPI("Ganancia bruta",ganB,ganB>=0?"#00e5b4":C.danger)}
        {KPI("Ganancia neta",ganN,ganN>=0?"#00e5b4":C.danger,"Total real")}
      </div>
      {show&&(
        <div style={{...card,marginBottom:16,borderColor:C.accent2}}>
          <div style={{fontWeight:700,marginBottom:14}}>Registrar gasto</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
            <FG label="Concepto"><input value={form.concepto} onChange={e=>setForm(p=>({...p,concepto:e.target.value}))} style={iSt} placeholder="ej. Pantalla iPhone OLED"/></FG>
            <FG label="Monto ($)"><input type="number" value={form.monto||0} onChange={e=>setForm(p=>({...p,monto:e.target.value}))} style={iSt}/></FG>
            <FG label="Fecha"><input type="date" value={form.fecha} onChange={e=>setForm(p=>({...p,fecha:e.target.value}))} style={iSt}/></FG>
            <FG label="Categoría"><select value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} style={iSt}>{CATS_GASTO.map(c=><option key={c}>{c}</option>)}</select></FG>
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:12}}>
            <button style={btnG} onClick={()=>setShow(false)}>Cancelar</button>
            <button style={{background:C.accent2,color:"#0b0e14",border:"none",borderRadius:7,padding:"10px 18px",fontWeight:700,fontSize:13,cursor:"pointer"}} onClick={saveGasto} disabled={saving}>{saving?"Guardando...":"Guardar"}</button>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={card}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Reparaciones del mes</div>
          {mesReps.length===0&&<Empty icon="📋" text="Sin reparaciones este mes"/>}
          {mesReps.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span style={bdg(ESTADO_COLOR[r.estado]||{})}>{r.estado}</span>
              <div style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.cliente_nombre} · {r.marca} {r.modelo}</div>
              <div style={{color:"#00e5b4",fontWeight:700,flexShrink:0}}>{fmt$(r.precio_total)}</div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Gastos del mes</div>
          {mesGas.length===0&&<Empty icon="💸" text="Sin gastos este mes"/>}
          {mesGas.map(g=>(
            <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <div style={{flex:1}}><div style={{fontWeight:600}}>{g.concepto}</div><div style={{color:C.muted}}>{g.categoria} · {fmtDate(g.fecha)}</div></div>
              <div style={{color:C.danger,fontWeight:700,flexShrink:0}}>{fmt$(g.monto)}</div>
              <button style={{...btnD,fontSize:10,padding:"3px 8px"}} onClick={()=>delGasto(g.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
