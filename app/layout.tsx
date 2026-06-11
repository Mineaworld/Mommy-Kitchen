import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Khmer, Geist } from "next/font/google";
import "./globals.css";
import SwRegister from "@/components/sw-register";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
});

export const metadata: Metadata = {
  title: "ផ្ទះបាយម៉ាក់",
  description: "Visual Khmer recipe app with video guidance",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="km" className={cn(notoSans.variable, notoSansKhmer.variable, "font-sans", geist.variable)}>
      <body className="bg-background text-onBackground font-sans min-h-screen">
        <a href="#main-content" className="absolute -top-[100px] left-3 z-[9999] bg-black text-white rounded-md px-3 py-2 focus:top-3">
          Skip to content
        </a>
        <SwRegister />
        <div id="main-content" className="pb-[90px]">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
};

export default RootLayout;

