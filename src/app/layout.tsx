import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guia Teotihuacán",
  description:
    "Guía interactiva de las pirámides de Teotihuacán con audio, mapa y rutas personalizadas",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Guia Teotihuacán",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#FAF7F2] text-[#2D2D2D] font-[family-name:var(--font-geist)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
