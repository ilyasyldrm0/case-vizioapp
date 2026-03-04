import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vizio Social",
  description: "Team-based social platform by Vizio Ventures",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <style>{`
          :root {
            --font-syne: ${syne.style.fontFamily};
            --font-mono: ${dmMono.style.fontFamily};
          }
        `}</style>
      </head>
      <body className="bg-[#0a0a0a] text-[#f0ede6] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}