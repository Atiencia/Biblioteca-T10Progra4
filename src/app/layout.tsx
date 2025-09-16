import './globals.css';
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Biblioteca',
  description: 'reseñas de libros',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-white-900">
        <header className="border-b bg-gradient-to-r from-blue-600 to-blue-400 shadow-md">
          <div className="mx-auto max-w-5xl px-4 py-4 font-bold text-xl text-white tracking-wide flex items-center justify-between">
            <span>Biblioteca</span>
          </div>
        </header>
  <nav className="mx-auto max-w-5xl px-4 py-4 flex gap-6 items-center text-gray-800 bg-white">
          <Link className="hover:text-blue-600 transition-colors font-medium" href="/">Inicio</Link>
          <Link className="hover:text-blue-600 transition-colors font-medium" href="/login">Login</Link>
          <Link className="hover:text-blue-600 transition-colors font-medium" href="/register">Registro</Link>
          <Link className="hover:text-blue-600 transition-colors font-medium" href="/profiile">Perfil</Link>
          <form action="/api/auth/logout" method="POST" className="inline">
            <button type="submit" className="ml-2 px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-colors">Logout</button>
          </form>
        </nav>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
