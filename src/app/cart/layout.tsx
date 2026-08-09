import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart — Nick Whittaker Imagery",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
