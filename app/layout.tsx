import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bizxthai.com - B2B Liquidity Ecosystem",
  description: "แพลตฟอร์มพันธมิตรธุรกิจและการจัดสรรทรัพยากรที่เหลือใช้",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
