import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppLayout from '@/components/AppLayout';

export const metadata: Metadata = {
  title: 'Special Gift | Interactive Surprise',
  description: 'Unwrap a special interactive 3D gift created just for you.',
  openGraph: {
    title: 'Special Gift | Interactive Surprise',
    description: 'Unwrap a special interactive 3D gift created just for you.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#030712',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,50,190,0.18),rgba(255,255,255,0))] selection:bg-purple-500/30 selection:text-purple-200">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
