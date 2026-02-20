import './globals.css'

export const metadata = {
  title: 'BitSave - Bitcoin-Powered STX Savings Vault',
  description: 'Lock STX, earn rewards, and build on-chain reputation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
