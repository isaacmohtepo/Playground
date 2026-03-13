import "./globals.css";
import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "../components/query-provider";
import { TopNav } from "../components/top-nav";
import { ToastProvider } from "../components/toast-provider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "CreativeFlow",
  description: "SaaS de revision visual para agencias"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-[var(--font-body)]`}>
        <QueryProvider>
          <ToastProvider>
            <TopNav />
            <main>{children}</main>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
