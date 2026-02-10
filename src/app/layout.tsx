import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

// Load the fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-[#fafaf9] text-stone-900">
        {children}
      </body>
    </html>
  )
}