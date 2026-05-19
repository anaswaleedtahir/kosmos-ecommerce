import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Nav } from "@kosmos/design/nav";
import { Footer } from "@kosmos/design/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kosmos — Maison de beauté",
  description: "Fragrance, skin, and lipstick. Paris.",
};

export const viewport: Viewport = {
  themeColor: "#E8E4D8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  preconnect("https://images.unsplash.com");
  preconnect("https://fonts.googleapis.com");
  preconnect("https://fonts.gstatic.com", { crossOrigin: "anonymous" });
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-paper text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:bg-paper focus:text-ink focus:px-4 focus:py-2 focus:ring-2 focus:ring-ink"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
