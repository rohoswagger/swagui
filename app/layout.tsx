import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://swagui.rohoswagger.com"),
  title: "swagui",
  description:
    "A personal component registry. shadcn-compatible, themed by permutation.",
  // No `icons` key: app/favicon.ico, app/icon.svg and app/apple-icon.png are
  // picked up by file convention. Setting `icons` here would replace that set
  // rather than add to it, dropping the SVG and the touch icon.
  openGraph: {
    title: "swagui",
    description:
      "A personal component registry. shadcn-compatible, themed by permutation.",
    url: "https://swagui.rohoswagger.com",
    siteName: "swagui",
    images: [{ url: "/logo/og.png", width: 1200, height: 630 }],
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
      >
        {children}
      </body>
    </html>
  );
}
