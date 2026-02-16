import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiveCount - Gymnastics Recruiting Platform",
  description: "Find your future in gymnastics. Track your competition scores, build your athlete profile, and connect with coaches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
