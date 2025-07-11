import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Swami Raaji Thase - BAPS Satsang AI Assistant",
  description:
    "Ask questions about BAPS Satsang and receive answers grounded in scripture",
  keywords: ["BAPS", "Satsang", "Spiritual", "AI", "Assistant", "Scripture"],
  authors: [{ name: "Swami Raaji Thase" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1722d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
