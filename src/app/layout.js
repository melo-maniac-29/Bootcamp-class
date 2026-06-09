import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "Circuitron Bootcamp Platform",
  description: "IEEE Gamified Learning",
};

export default function RootLayout({ children }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-white dark:bg-[#0a0a0a] text-black dark:text-white flex flex-col min-h-screen`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConvexClientProvider>
              <div className="flex-1 flex flex-col">{children}</div>
            </ConvexClientProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
