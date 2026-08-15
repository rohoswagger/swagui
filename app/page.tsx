import { Suspense } from "react"
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Manrope,
  Plus_Jakarta_Sans,
} from "next/font/google"

import { PreviewClient } from "./_preview/preview-client"
import "./_preview/preview.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" })
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
})
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })
// SOFT and WONK are Fraunces' own axes; driving them off their defaults is the
// point of choosing it, so they are set here rather than left at 0.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
})

export default function Home() {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable} ${jakarta.variable} ${jetbrains.variable} ${instrument.variable} ${manrope.variable} ${fraunces.variable}`}
    >
      <Suspense>
        <PreviewClient />
      </Suspense>
    </div>
  )
}
