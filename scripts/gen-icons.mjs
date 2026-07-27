// Gera os ícones do site a partir do glifo da marca já presente em app/icon.svg.
//
//   app/icon.svg       → reescrito como quadrado (fundo da marca + glifo centralizado)
//   app/favicon.ico    → 16/32/48px, servido em /favicon.ico
//   app/apple-icon.png → 180px, atalho na tela de início do iOS
//
// O favicon precisa ser quadrado: buscadores descartam ou distorcem ícones fora
// de 1:1. O <path> do glifo é sempre relido nas coordenadas originais da marca,
// então rodar o script mais de uma vez não acumula transformações.
//
// Uso: npm run icons:gen

import sharp from "sharp"
import { readFile, writeFile } from "node:fs/promises"

const ICON_SVG = "app/icon.svg"
const BG = "#0b0906" // --color-bg
const CANVAS = 512
const GLYPH_HEIGHT = 0.66 // fração da altura do quadrado ocupada pelo glifo
// Maior primeiro: o Next declara o sizes= do <link> pela primeira entrada do .ico,
// e 48px é o tamanho que os buscadores esperam.
const ICO_SIZES = [48, 32, 16]
const APPLE_SIZE = 180
const DENSITY = 288 // rasteriza em 4x antes de reduzir, para bordas limpas

const glifo = (await readFile(ICON_SVG, "utf8")).match(/<path[^>]*\/>/)?.[0]
if (!glifo) throw new Error(`Nenhum <path> encontrado em ${ICON_SVG}`)

// Mede a área realmente pintada, ignorando o padding do viewBox original.
const SONDA = 600
const ESCALA_SONDA = 2
const sonda = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SONDA} ${SONDA}" width="${SONDA * ESCALA_SONDA}" height="${SONDA * ESCALA_SONDA}">${glifo}</svg>`
const { info } = await sharp(await sharp(Buffer.from(sonda)).png().toBuffer())
  .trim({ threshold: 1 })
  .toBuffer({ resolveWithObject: true })

const tinta = {
  x: -info.trimOffsetLeft / ESCALA_SONDA,
  y: -info.trimOffsetTop / ESCALA_SONDA,
  w: info.width / ESCALA_SONDA,
  h: info.height / ESCALA_SONDA,
}

const escala = (CANVAS * GLYPH_HEIGHT) / tinta.h
const tx = CANVAS / 2 - escala * (tinta.x + tinta.w / 2)
const ty = CANVAS / 2 - escala * (tinta.y + tinta.h / 2)
const arred = (n) => Number(n.toFixed(3))

const quadrado =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">` +
  `<rect width="${CANVAS}" height="${CANVAS}" fill="${BG}"/>` +
  `<g transform="translate(${arred(tx)} ${arred(ty)}) scale(${arred(escala)})">${glifo}</g>` +
  `</svg>`

await writeFile(ICON_SVG, quadrado + "\n")

const rasterizar = (tamanho) =>
  sharp(Buffer.from(quadrado), { density: DENSITY }).resize(tamanho, tamanho).png().toBuffer()

await writeFile("app/apple-icon.png", await rasterizar(APPLE_SIZE))

// .ico com PNGs embutidos (suportado por todos os navegadores atuais).
const imagens = await Promise.all(ICO_SIZES.map(rasterizar))
const cabecalho = Buffer.alloc(6)
cabecalho.writeUInt16LE(0, 0) // reservado
cabecalho.writeUInt16LE(1, 2) // tipo: ícone
cabecalho.writeUInt16LE(imagens.length, 4)

let deslocamento = 6 + imagens.length * 16
const entradas = imagens.map((png, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(ICO_SIZES[i], 0) // largura
  e.writeUInt8(ICO_SIZES[i], 1) // altura
  e.writeUInt8(0, 2) // paleta
  e.writeUInt8(0, 3) // reservado
  e.writeUInt16LE(1, 4) // planos
  e.writeUInt16LE(32, 6) // bits por pixel
  e.writeUInt32LE(png.length, 8)
  e.writeUInt32LE(deslocamento, 12)
  deslocamento += png.length
  return e
})

await writeFile("app/favicon.ico", Buffer.concat([cabecalho, ...entradas, ...imagens]))

console.log(
  `ok — icon.svg ${CANVAS}px quadrado, favicon.ico ${ICO_SIZES.join("/")}px, apple-icon.png ${APPLE_SIZE}px`,
)
