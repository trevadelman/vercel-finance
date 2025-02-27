import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StyleProvider } from '@ant-design/cssinjs';

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vercel Finance - Stock Market Tracking",
  description: "A modern stock market tracking application built with Next.js, React, and Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <StyleProvider hashPriority="high">
          {children}
        </StyleProvider>
      </body>
    </html>
  );
}
