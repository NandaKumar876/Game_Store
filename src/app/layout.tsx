import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "ORBIT — Your next world awaits",
  description:
    "Discover extraordinary worlds. Explore the ORBIT game store, find your next adventure, and build your collection.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
