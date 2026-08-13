import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src")
const extensions = ["", ".js", ".jsx", ".css"]
const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(jsx?|css)$/.test(entry.name)) files.push(full)
  }
}
walk(root)

test("todos los imports relativos apuntan a archivos existentes", () => {
  const broken = []
  for (const file of files.filter(f => /\.jsx?$/.test(f))) {
    const source = fs.readFileSync(file, "utf8")
    const regex = /(?:from\s+|import\s+)["'](\.[^"']+)["']/g
    for (const match of source.matchAll(regex)) {
      const base = path.resolve(path.dirname(file), match[1])
      const isExistingProjectSupabase = match[1].endsWith('/supabase.js') && path.basename(base) === 'supabase.js'
      if (!isExistingProjectSupabase && !extensions.some(ext => fs.existsSync(base + ext))) broken.push(`${path.relative(root, file)} -> ${match[1]}`)
    }
  }
  assert.deepEqual(broken, [])
})
