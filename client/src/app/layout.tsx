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
  metadataBase: new URL('https://alween.com'),
  title: "Alween Luxury Perfumes | Authentic Perfume Decants in Bangladesh",
  description: "Shop perfume decants and full bottles in Bangladesh. Order custom combos and pre-made fragrance sets.",
  keywords: "buy perfume decants bd, authentic perfumes bangladesh, designer fragrance samples, alween perfumes, custom decant combos, long lasting perfume bd",
  openGraph: {
    title: "Alween Luxury Perfumes",
    description: "Perfume decants and full bottles in Bangladesh.",
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: 'Alween Luxury Perfumes',
    url: 'https://alween.com',
    image: 'https://alween.com/logo.png',
    description: 'Premium luxury perfume decants in Bangladesh.',
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, Mobile Banking',
    priceRange: '৳৳',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BD',
      addressLocality: 'Dhaka',
    },
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vod-progressive.akamaized.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://f.vimeocdn.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://vod-progressive.akamaized.net" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <CartProvider>
          {children}
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
