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
  title: "Eldoria — 3D RPG Adventure",
  description:
    "A 3D fantasy RPG. Explore the world of Eldoria, battle monsters, complete quests, and defeat the Shadow Lord Mordrak.",
  keywords: ["RPG", "3D game", "fantasy", "Eldoria", "Three.js", "Next.js"],
  authors: [{ name: "Z.ai" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Eldoria — 3D RPG Adventure",
    description: "Explore, battle, and become the hero of Eldoria.",
    url: "https://chat.z.ai",
    siteName: "Eldoria RPG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eldoria — 3D RPG",
    description: "A 3D fantasy RPG adventure",
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
