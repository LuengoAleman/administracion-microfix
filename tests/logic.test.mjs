import test from "node:test"
import assert from "node:assert/strict"
import { getDashboardStats } from "../src/logic/dashboard.js"
import { filterRepairs, nextOrderNumber, updateRepairForm } from "../src/logic/reparaciones.js"
import { filterStock, isLowStock, stockValue } from "../src/logic/stock.js"
import { getFinanceStats } from "../src/logic/finanzas.js"
import { fmtMoney, waLink } from "../src/utils/formatters.js"

test("numeración de orden conserva formato", () => assert.equal(nextOrderNumber(8), "ORD-0009"))

test("seleccionar cliente completa contacto", () => {
  const current = { cliente_nombre: "", cliente_tel: "", cliente_email: "", cliente_id: "" }
  const clients = [{ id: "c1", nombre: "Ana", telefono: "111", email: "a@b.com" }]
  assert.deepEqual(updateRepairForm(current, "cliente_nombre", "Ana", clients), { cliente_nombre: "Ana", cliente_tel: "111", cliente_email: "a@b.com", cliente_id: "c1" })
})

test("costo + mano de obra recalculan total", () => {
  const updated = updateRepairForm({ costo_pieza: 100, precio_mo: 50, precio_total: 0 }, "precio_mo", "75")
  assert.equal(updated.precio_total, 175)
})

test("filtro de reparaciones combina estado y texto", () => {
  const reps = [
    { estado: "Listo", cliente_nombre: "Ana", modelo: "A54", marca: "Samsung", nro_orden: "ORD-0001", tipo: "Batería" },
    { estado: "Ingresado", cliente_nombre: "Luis", modelo: "G32", marca: "Motorola", nro_orden: "ORD-0002", tipo: "Software" },
  ]
  assert.equal(filterRepairs(reps, "Listo", "ana").length, 1)
  assert.equal(filterRepairs(reps, "Ingresado", "ana").length, 0)
})

test("dashboard conserva cálculos originales", () => {
  const reps = [
    { estado: "Entregado", fecha: "2026-08-01", precio_total: 1000, costo_pieza: 300 },
    { estado: "Listo", fecha: "2026-08-02", precio_total: 900, costo_pieza: 200 },
  ]
  const result = getDashboardStats(reps, [{ id: 1 }], [{ cantidad: 1, minimo: 2 }], [{ fecha: "2026-08-03", monto: 100 }], "2026-08")
  assert.equal(result.ingresos, 1000)
  assert.equal(result.costoRep, 500)
  assert.equal(result.ganancia, 400)
  assert.equal(result.activas.length, 1)
  assert.equal(result.stockBajo.length, 1)
})

test("finanzas conserva ingreso, costos y ganancia", () => {
  const reps = [{ estado: "Entregado", fecha: "2026-08-01", precio_total: 1000, costo_pieza: 250 }]
  const gastos = [{ fecha: "2026-08-02", monto: 100 }]
  const stats = getFinanceStats(reps, gastos, "2026-08")
  assert.equal(stats.gananciaBruta, 750)
  assert.equal(stats.gananciaNeta, 650)
})

test("stock conserva mínimo, filtro y valuación", () => {
  const stock = [{ nombre: "Batería A54", categoria: "Baterías", cantidad: 2, minimo: 2, costo_unitario: 500 }]
  assert.equal(isLowStock(stock[0]), true)
  assert.equal(stockValue(stock), 1000)
  assert.equal(filterStock(stock, "a54").length, 1)
})

test("formatos y enlace WA", () => {
  assert.match(fmtMoney(1200), /^\$.*1[.\s]?200$/)
  assert.match(waLink("11 2345-6789", "Hola"), /^https:\/\/wa\.me\/5491123456789\?text=Hola$/)
})
