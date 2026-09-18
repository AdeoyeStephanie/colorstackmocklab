import type { Metadata } from "next";
import "./globals.css"; //global styling for all pages in the app

export const metadata: Metadata = {
  title: "ColorStack MockLab",
  description: "Book and give mock technical interviews for ColorStack members",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
        {/* your pages get injected inside <body> as `children` */}
      <body>{children}</body> 
    </html>
  );
}