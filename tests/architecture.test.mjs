import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src")
const readTree = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name)
  return entry.isDirectory() ? readTree(full) : [full]
})

test("la UI no accede directamente a Supabase", () => {
  const uiFiles = readTree(root).filter(file => /\.(jsx?|css)$/.test(file) && !file.includes(`${path.sep}services${path.sep}`))
  const offenders = uiFiles.filter(file => /supabase\.(from|auth)/.test(fs.readFileSync(file, "utf8")))
  assert.deepEqual(offenders.map(file => path.relative(root, file)), [])
})

test("App queda limitado al bootstrap de sesión", () => {
  const source = fs.readFileSync(path.join(root, "App.jsx"), "utf8")
  assert.match(source, /<Login\s*\/>/)
  assert.match(source, /<AdminApp session=\{session\}\s*\/>/)
  assert.doesNotMatch(source, /\.from\(/)
})
