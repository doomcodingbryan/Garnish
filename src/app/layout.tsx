import type { Metadata } from "next";
import { Inter, Newsreader, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DevModeBanner } from "@/components/DevModeBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garnish",
  description:
    "A marketplace where restaurants find creators to elevate their marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DevModeBanner />
        {children}
      </body>
    </html>
  );
}
