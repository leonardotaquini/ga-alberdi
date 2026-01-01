import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/hooks/use-cart"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Catálogo de Productos - Informática GA",
  description: "Catálogo completo de productos electrónicos con precios en múltiples monedas",
  generator: "leotaquini",
  icons: {
    icon: [
      {
        url: "/2.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/2.svg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/2.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/2.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
