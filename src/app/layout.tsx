import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoParts Stock - Gestion de Stock Automobile",
  description: "Application de gestion de stock de pièces automobiles avec mode hors-ligne",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
