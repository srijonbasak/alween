import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import { CartProvider } from "../context/CartContext";

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
  title: "Alween Fragrance | Luxury Decants & Custom Blending Enterprise",
  description: "Experience premium, high-end luxury decant fragrances in Bangladesh. Discover master formula keys, custom Discovery Box builders, and automated geolocation checkouts.",
  keywords: "perfume, decants, luxury fragrance, custom combo builder, Alween Fragrance, Bangladesh",
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
        </CartProvider>
      </body>
    </html>
  );
}
