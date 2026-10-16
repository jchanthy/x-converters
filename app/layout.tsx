import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Kantumruy_Pro } from 'next/font/google';
import './globals.css'; // Global styles

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const kantumruy = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-khmer',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'XLSX to XML Converter - Convert Excel to XML Online',
  description: 'Professional Excel to XML converter with schema customization, multi-dialect formatting, live preview, and batch export.',
  openGraph: {
    title: 'XLSX to XML Converter - Convert Excel to XML Online',
    description: 'Professional Excel to XML converter with schema customization, multi-dialect formatting, live preview, and batch export.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XLSX to XML Converter',
    description: 'Professional Excel to XML converter with schema customization, multi-dialect formatting, live preview, and batch export.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${kantumruy.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
