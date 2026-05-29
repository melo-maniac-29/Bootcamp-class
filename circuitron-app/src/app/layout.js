import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'IEEE Bootcamp — Student Portal',
  description: 'Student learning platform for IEEE Bootcamps',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0F19',
};

export default function RootLayout({ children }) {
  return (
    // Added suppressHydrationWarning to handle third-party browser attributes smoothly
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>

      <body suppressHydrationWarning className="antialiased bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}