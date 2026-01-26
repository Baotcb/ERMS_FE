import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FloatingMenu } from "@/components/layout/floating-menu";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERMS - Hệ thống Tuyển dụng & Quản lý Nhân sự",
  description: "Nền tảng tuyển dụng hiệu quả kết nối ứng viên và nhà tuyển dụng",
  icons: {
    icon: '/logo2.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <FloatingMenu />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
