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
  title: "flood-dash",
  description: "Water level monitoring dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="p-4 border-b bg-white dark:bg-black">
            <h1 className="text-xl font-semibold">flood-dash</h1>
          </header>
          <main className="flex-1 p-4">{children}</main>
          <footer className="p-4 text-sm text-center text-muted-foreground border-t">
            &copy; {new Date().getFullYear()} flood-dash
          </footer>
        </div>
      </body>
    </html>
  );
}
