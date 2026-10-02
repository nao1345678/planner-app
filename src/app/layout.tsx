import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planner",
  description: "Mon planner quotidien : tâches, routines, journal et historique.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-stone-100 text-stone-900 antialiased">
        <nav className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center gap-6 px-4 py-3 text-sm">
            <Link href="/" className="font-bold">
              Planner
            </Link>
            <Link href="/" className="text-stone-600 hover:text-stone-900">
              Aujourd&apos;hui
            </Link>
            <Link href="/calendar" className="text-stone-600 hover:text-stone-900">
              Calendrier
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
