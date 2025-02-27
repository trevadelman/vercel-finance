import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import AntdProvider from "@/components/providers/AntdProvider";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trend Friendly - Up Only, Until It's Not",
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
        <AntdProvider>
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
