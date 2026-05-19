import type { Metadata } from "next";
import { Nav, Footer } from "@kosmos/design";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kosmos — Maison de beauté",
  description: "Fragrance, skin, and lipstick. Paris.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
