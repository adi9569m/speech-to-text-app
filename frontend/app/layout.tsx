import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Speech to Text",
  description: "Speech to Text Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
