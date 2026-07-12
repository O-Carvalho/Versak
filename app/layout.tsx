import type { Metadata } from "next"
import { Oswald, Inter } from "next/font/google"
import { MotionConfig } from "motion/react"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { buildMetadata, organizationJsonLd } from "@/lib/seo"
import { site } from "@/content/site"
import "@/theme/tokens.css"

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  ...buildMetadata({ titulo: site.nome }),
  metadataBase: new URL(site.url),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
