import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./components/CartContext";
import { BASE_URL } from "@/app/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Nick Whittaker Imagery";
const SITE_DESCRIPTION =
  "Nick Whittaker Photography — ocean and water photography based in Auckland, New Zealand. Fine-art prints, commissions, and collaborations.";
const DEFAULT_OG_IMAGE = `${BASE_URL}/Waves/nick-whittaker-ocean-photography-azure-breaking-wave.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: SITE_TITLE,
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE, alt: "Ocean and water photography by Nick Whittaker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nick Whittaker Imagery",
  url: BASE_URL,
  logo: `${BASE_URL}/nick-logo.svg`,
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
