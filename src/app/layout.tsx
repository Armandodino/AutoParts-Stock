/**
 * Fichier de configuration principal de l'application
 * Définit les polices, les métadonnées et le thème
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

// Configuration de la police principale
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Configuration de la police monospace (pour le code)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Métadonnées de l'application (titre, description, etc.)
export const metadata: Metadata = {
  title: "AutoParts Stock",
  description: "Application de gestion de stock de pièces automobiles. Gestion des produits, ventes, achats et fournisseurs.",
  keywords: ["pièces auto", "gestion stock", "inventaire", "automobile", "ventes", "achats"],
};

// Composant racine de l'application
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Fournisseur de thème (mode clair/sombre) */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Composant pour afficher les notifications toast */}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
