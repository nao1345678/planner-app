import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "900"], variable: "--font-playfair" });
const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-baskerville",
});

export const metadata: Metadata = {
  title: "Planner",
  description: "Mon planner quotidien : tâches, routines, journal et historique.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${baskerville.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <nav className="flex items-center gap-6 border-b border-ink/60 py-3 text-xs uppercase tracking-wide">
            <Link href="/" className="font-display text-sm font-bold">
              Planner
            </Link>
            <Link href="/" className="hover:underline">
              Aujourd&apos;hui
            </Link>
            <Link href="/calendar" className="hover:underline">
              Calendrier
            </Link>
            <Link href="/library" className="hover:underline">
              Répertoire
            </Link>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
