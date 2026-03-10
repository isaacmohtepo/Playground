import "./globals.css";
import type { Metadata } from "next";
import { QueryProvider } from "../components/query-provider";
import { TopNav } from "../components/top-nav";

export const metadata: Metadata = {
  title: "CreativeFlow",
  description: "SaaS de revisión visual para agencias"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <TopNav />
          <main>{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
