import { Empty } from "../components/common/Empty.jsx"
import { ESTADO_COLOR } from "../config/catalogs.js"
import { getDashboardStats } from "../logic/dashboard.js"
import { C, cardStyle, ghostButtonStyle, badgeStyle } from "../styles/theme.js"
import { fmtMoney, today, waLink } from "../utils/formatters.js"

export function Dashboard({reps,clients,stock,gastos,setTab}){
  const mes=today().slice(0,7)
  const {activas,listos,ingresos,ganancia,stockBajo}=getDashboardStats(reps,clients,stock,gastos,mes)
  const Stat=({icon,val,sub,color,onClick})=>(
    <div onClick={onClick} style={{...cardStyle,cursor:onClick?"pointer":"default",flex:1,minWidth:130,transition:"border-color .2s"}}
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
        <Stat icon="💰" val={fmtMoney(ingresos)} sub="Ingresos del mes" color="#00e5b4" onClick={()=>setTab("finanzas")}/>
        <Stat icon="📈" val={fmtMoney(ganancia)} sub="Ganancia neta" color={ganancia>=0?"#00e5b4":C.danger} onClick={()=>setTab("finanzas")}/>
        <Stat icon="📦" val={stockBajo.length} sub="Stock bajo" color={stockBajo.length>0?C.warn:C.muted} onClick={()=>setTab("stock")}/>
        <Stat icon="👥" val={clients.length} sub="Clientes" color={C.accent2} onClick={()=>setTab("clients")}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16}}>
        <div style={cardStyle}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Órdenes activas</div>
          {activas.length===0&&<Empty icon="🔧" text="Sin órdenes activas"/>}
          {activas.slice(0,7).map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.cliente_nombre||"—"}</div>
                <div style={{fontSize:11,color:C.muted}}>{r.marca} {r.modelo}</div>
              </div>
              <span style={badgeStyle(ESTADO_COLOR[r.estado]||{})}>{r.estado}</span>
            </div>
          ))}
        </div>
        <div style={cardStyle}>
          <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",marginBottom:14}}>Alertas</div>
          {listos.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${C.border}`,fontSize:12}}>
              <span>✅</span>
              <div style={{flex:1}}>{r.cliente_nombre} — {r.marca} {r.modelo} listo</div>
              {r.cliente_tel&&<button style={{...ghostButtonStyle,fontSize:11,padding:"4px 9px",color:"#25d366",borderColor:"#25d366"}}
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
