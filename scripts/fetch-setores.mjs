import { mkdir, writeFile } from "node:fs/promises"
import sharp from "sharp"

const BASE = "https://images.unsplash.com"
const QUERY = "?w=640&h=960&fit=crop&q=72"

// slug -> [id principal, id fallback] (todos verificados HTTP 200 em 2026-07-10)
const SETORES = [
  ["industria", "photo-1565043666747-69f6646db940", "photo-1504328345606-18bbc8c9d7d1"],
  ["engenharia", "photo-1581092160562-40aa08e78837", "photo-1581092160562-40aa08e78837"],
  ["agronegocio", "photo-1500937386664-56d1dfef3854", "photo-1625246333195-78d9c38ad449"],
  ["construcao", "photo-1541888946425-d81bb19240f5", "photo-1503387762-592deb58ef4e"],
  ["logistica", "photo-1601584115197-04ecc0da31d7", "photo-1553413077-190dd305871c"],
  ["comercio", "photo-1441986300917-64674bd600d8", "photo-1556742049-0cfed4f6a45d"],
  ["saude", "photo-1519494026892-80bbd2d6fd0d", "photo-1538108149393-fbbd81895907"],
  ["servicos", "photo-1497215728101-856f4ea42174", "photo-1521737604893-d14cc237f11d"],
  ["tecnologia", "photo-1518770660439-4636190af475", "photo-1526374965328-7f61d4dc18c5"],
]

async function fetchBuffer(id) {
  const res = await fetch(`${BASE}/${id}${QUERY}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

await mkdir("public/setores", { recursive: true })
for (const [slug, id, fallback] of SETORES) {
  let buf
  try {
    buf = await fetchBuffer(id)
  } catch (e) {
    console.warn(`${slug}: principal falhou (${e.message}); tentando fallback`)
    buf = await fetchBuffer(fallback)
  }
  const out = await sharp(buf).resize(640, 960, { fit: "cover" }).webp({ quality: 72 }).toBuffer()
  await writeFile(`public/setores/${slug}.webp`, out)
  console.log(`${slug}.webp — ${(out.length / 1024).toFixed(0)} KB`)
}
console.log("OK: 9 imagens em public/setores/")
