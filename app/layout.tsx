import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUNAR — Space Technology Learning Platform",
  description: "Learn space technology — from satellites to rocket propulsion — built for Thai students and space enthusiasts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
