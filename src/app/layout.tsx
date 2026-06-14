import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nicolaas Earley — Training",
  description:
    "A personal endurance training command center: HYROX countdown, training load, zones, records and live sessions.",
};

export const viewport: Viewport = {
  themeColor: "#0a1014",
  colorScheme: "dark",
};

/* Runs before paint: hides reveal elements only when motion is allowed, so
   there is no flash and content stays visible with no JS / reduced motion. */
const motionBootstrap = `(function(){try{if(!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){document.documentElement.classList.add('reveal-ready');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
        <MotionProvider />
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
