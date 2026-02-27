import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const arabicFont = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-arabic",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "مصحف | القرآن الكريم",
  description: "تطبيق القرآن الكريم - القراءة والتراويح والأذكار وأوقات الصلاة",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "مصحف",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1419",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${arabicFont.variable} antialiased`}>
        <ThemeProvider>
          <main className="min-h-screen pb-20">{children}</main>
          <Navbar />
        </ThemeProvider>
      </body>
    </html>
  );
}
