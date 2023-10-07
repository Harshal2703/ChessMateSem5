import './globals.css'



export const metadata = {
  title: 'ChessMate',
  description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
