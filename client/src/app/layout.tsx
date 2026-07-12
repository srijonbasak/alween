import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { CartProvider } from "../context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Alween Luxury Perfumes | Authentic Perfume Decants in Bangladesh",
  description: "Experience authentic, premium luxury perfume decants in Bangladesh. Shop inspired creations, custom decant combos, and pre-made fragrance gift sets with fast delivery.",
  keywords: "buy perfume decants bd, authentic perfumes bangladesh, designer fragrance samples, alween perfumes, custom decant combos, long lasting perfume bd",
  openGraph: {
    title: "Alween Luxury Perfumes",
    description: "Premium designer perfume decants in Bangladesh. Authentic high-end fragrances.",
    url: "https://alween.com",
    siteName: "Alween Luxury Scents",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alween Luxury Perfumes",
    description: "Premium designer perfume decants in Bangladesh.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          {children}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
