import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";

import { cn } from "@/lib/utils";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Community Events Board",
    template: "%s | Community Events Board",
  },
  description:
    "Discover music nights, workshops, food fairs and more happening in your city. Save reminders and design a card for your favourite event.",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, outfit.variable)}>
      <body className="min-h-dvh font-sans">
        {children}
        <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}
