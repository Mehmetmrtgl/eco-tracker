import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout"; // <--- Yeni bileşenimiz

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finansal Takip Sistemi",
  description: "Kişisel varlık ve borç yönetim uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* Tüm karmaşayı MainLayout yönetiyor artık */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}