// components/ui/count-up.tsx
"use client"

import { useEffect, useRef } from "react"
import { animate, useInView, useMotionValue, useMotionValueEvent } from "motion/react"

export function CountUp({ value, duration = 1.4 }: { value: string; duration?: number }) {
  const match = value.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const motionValue = useMotionValue(0)

  const prefix = match?.[1] ?? ""
  const rawNumber = match?.[2] ?? "0"
  const numeric = parseFloat(rawNumber.replace(",", "."))
  const suffix = match?.[3] ?? ""
  const decimals = rawNumber.includes(",") || rawNumber.includes(".") ? 1 : 0

  useEffect(() => {
    if (!isInView) return
    const controls = animate(motionValue, numeric, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [isInView, numeric, duration, motionValue])

  useMotionValueEvent(motionValue, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`
    }
  })

  if (!match) {
    return <span>{value}</span>
  }

  return (
    <span ref={ref}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  )
}
