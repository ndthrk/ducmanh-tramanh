import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Dancing_Script, Lora } from 'next/font/google';
import './globals.css';

const vietnam = Be_Vietnam_Pro({ variable: '--font-vietnam', subsets: ['latin', 'vietnamese'], weight: ['300', '400', '500', '600'] });
const script = Dancing_Script({ variable: '--font-script', subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'] });
const serif = Lora({ variable: '--font-serif', subsets: ['latin', 'vietnamese'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ducmanh-tramanh.vercel.app'),
  title: 'Đức Mạnh & Trâm Anh — 24.10.2026',
  description: 'Trân trọng kính mời bạn đến chung vui trong lễ thành hôn của Đức Mạnh và Trâm Anh.',
  openGraph: {
    url: 'https://ducmanh-tramanh.vercel.app/',
    title: 'Đức Mạnh & Trâm Anh',
    description: 'Trân trọng kính mời bạn đến chung vui ngày 24.10.2026.',
    type: 'website',
    locale: 'vi_VN',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Thiệp cưới Đức Mạnh và Trâm Anh' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Đức Mạnh & Trâm Anh',
    description: 'Trân trọng kính mời bạn đến chung vui ngày 24.10.2026.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body className={`${vietnam.variable} ${script.variable} ${serif.variable}`}>{children}</body></html>;
}
