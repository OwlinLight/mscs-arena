import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSCS Arena",
  description: "Compare CS master's programs using local data and transparent scoring.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
