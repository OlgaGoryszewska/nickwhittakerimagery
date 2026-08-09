import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./components/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nickwhittakerimagery.com"),
  title: "Nick Whittaker Imagery",
  description:
    "Nick Whittaker Photography — ocean and water photography based in Auckland, New Zealand. Fine-art prints, commissions, and collaborations.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nick Whittaker Imagery",
  url: "https://www.nickwhittakerimagery.com",
  logo: "https://www.nickwhittakerimagery.com/nick-logo.svg",
  email: "nickjwhittaker@gmail.com",
  telephone: "+64-21-507-507",
  sameAs: ["https://www.instagram.com/nickwhittaker.oceanimagery/"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Whangamata",
    addressCountry: "NZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
