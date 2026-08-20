import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Used on the landing page: Inter for English copy, Hind Siliguri for the
// Bengali headline/subtitle (renders Bengali script far better than the
// Geist fonts used elsewhere in the app, which have no Bengali glyphs).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "New N Islam",
  description: "New N Islam — wholesale cloth shop, Islampur, Old Dhaka",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${hindSiliguri.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
