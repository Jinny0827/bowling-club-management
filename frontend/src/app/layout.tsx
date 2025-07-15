import type { Metadata } from "next";
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '볼링 클럽 관리 시스템',
  description: '볼링장과 클럽, 사용자를 연결하는 통합 관리 시스템',
};

export default function RootLayout({
    children,}: {   children: React.ReactNode; }) {
  return (
      <html lang="ko">
        <body className="bg-gray-50 min-h-screen">
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
  );
}