import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Cinzel for fantasy display headings — engraved-stone feel
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

// EB Garamond for body / readable serif
const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Eldoria — RPG 3D Fantaisie",
  description:
    "Un RPG fantasy 3D. Explorez le monde d'Eldoria, affrontez des monstres, accomplissez des quêtes et terrassez le Seigneur des Ombres Mordrak.",
  keywords: ["RPG", "jeu 3D", "fantaisie", "Eldoria", "Three.js", "Next.js", "RPG browser"],
  authors: [{ name: "Alessio Innangi" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Eldoria — RPG 3D Fantaisie",
    description: "Explorez, combattez et devenez le héros d'Eldoria.",
    url: "https://github.com/DmzGamingYT/Eldoria",
    siteName: "Eldoria RPG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eldoria — RPG 3D",
    description: "Un RPG fantasy 3D aventure",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${ebGaramond.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
