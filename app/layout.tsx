import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "두근두근 상팔 - 상팔 미연시",
  description: "상팔의 존잘들과 연애해보세요.",
   openGraph: {
    title: "두근두근 상팔 💕",
    description: "상팔 미연시 게임",
    url: "https://mightysk8.netlify.app",
    siteName: "두근두근 상팔 💕",
    images: [
      {
        url: "https://mightysk8.netlify.app/dugun.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
