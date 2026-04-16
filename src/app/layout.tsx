import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "./providers";
import { ClientLayoutElements } from "@/components/layout/client-layout-elements";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') || 'http'
  const baseUrl = `${proto}://${host}`

  return {
    metadataBase: new URL(baseUrl),
    title: "ERMS - Hệ thống Tuyển dụng & Quản lý Nhân sự",
    description: "Nền tảng tuyển dụng hiệu quả kết nối ứng viên và nhà tuyển dụng",
    icons: {
      icon: '/logo2.png',
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      siteName: 'ERMS - Tuyển dụng & Quản lý Nhân sự',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <ClientLayoutElements />
        </Providers>
      </body>
    </html>
  );
}
