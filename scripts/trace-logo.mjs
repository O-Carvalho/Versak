import { writeFileSync } from "node:fs"
import sharp from "sharp"
import { trace } from "potrace"

const src = process.argv[2] ?? "logo-versak.png"

// Achata o alpha sobre branco (transparente -> branco) para o potrace binarizar corretamente.
const png = await sharp(src).flatten({ background: "#ffffff" }).png().toBuffer()

const svg = await new Promise((resolve, reject) => {
  trace(png, { turdSize: 40, optTolerance: 0.4, threshold: 230, color: "#000000", background: "transparent" }, (err, out) => {
    if (err) reject(err)
    else resolve(out)
  })
})

writeFileSync("scripts/logo-traced.svg", svg)
console.log("Traçado gravado em scripts/logo-traced.svg")
